import React, { createContext, useReducer, useEffect, useState, ReactNode, useCallback, useRef, useMemo } from 'react';
import { GameState, Pet, PetStats, InventoryItem, DailyTracking, AccessorySlot, ActionLogEntry } from '@/types/game';
import { getRandomEvent } from '@/data/events';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { GameContextType, ActionFeedbackEvent, initialState } from '@/context/game/types';
import { gameReducer } from '@/context/game/reducer';
import { clampStat, ACHIEVEMENT_REWARD } from '@/context/game/helpers';

export const GameContext = createContext<GameContextType | undefined>(undefined);

// Play window schedule: [startMinute, endMinute]
const PLAY_WINDOW_RANGES: [number, number][] = [
  [610, 630],   // Morning Play: 10:10 AM - 10:30 AM
  [780, 800],   // Afternoon Play: 1:00 PM - 1:20 PM
  [1050, 1070], // Evening Play: 5:30 PM - 5:50 PM
];

/** Returns 0, 1, or 2 if inside a play window, or -1 if not. */
const getActivePlayWindowIndex = (gameMinutes: number): number => {
  for (let i = 0; i < PLAY_WINDOW_RANGES.length; i++) {
    const [start, end] = PLAY_WINDOW_RANGES[i];
    if (gameMinutes >= start && gameMinutes < end) return i;
  }
  return -1;
};

const initGame = (initial: GameState): GameState => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('guestGameState');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load guest save', e);
      }
    }
  }
  return initial;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState, initGame);
  const [lastActionFeedback, setLastActionFeedback] = useState<ActionFeedbackEvent | null>(null);
  const [isPlayingMiniGame, setIsPlayingMiniGame] = useState(false);
  const isPlayingMiniGameRef = useRef(isPlayingMiniGame);
  const hasPendingSaveRef = useRef(false);
  const stateRef = useRef(state);
  const cloudSaveLoadedRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    isPlayingMiniGameRef.current = isPlayingMiniGame;
  }, [isPlayingMiniGame]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Warn user about unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasPendingSaveRef.current && stateRef.current.gameStarted) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Debounced auto-save to Supabase
  useEffect(() => {
    if (!state.gameStarted || !cloudSaveLoadedRef.current) {
      return;
    }

    hasPendingSaveRef.current = true;

    const timeout = setTimeout(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (state.isGuestMode && state.gameStarted) {
          localStorage.setItem('guestGameState', JSON.stringify(state));
        }
        hasPendingSaveRef.current = false;
        return;
      }

      // Ensure profile exists before saving (required for foreign key constraint)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!existingProfile) {
        const { error: profileError } = await supabase.from('profiles').upsert(
          {
            id: session.user.id,
            display_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url || null,
          },
          { onConflict: 'id' }
        );

        if (profileError) {
          console.error('Auto-save: Failed to create profile', profileError.message);
          hasPendingSaveRef.current = false;
          return;
        }
      }

      const { error } = await supabase.from('game_saves').upsert(
        {
          user_id: session.user.id,
          save_data: state,
          version: 1,
        },
        { onConflict: 'user_id' },
      );

      if (error) {
        console.error('Auto-save failed:', error.message);
        toast({
          title: 'Auto-save failed',
          description: 'Your progress could not be saved. Check your connection.',
          variant: 'destructive',
        });
      }

      hasPendingSaveRef.current = false;
    }, 2000);

    return () => clearTimeout(timeout);
  }, [state]);

  // Initialize daily tasks and milestones on load
  useEffect(() => {
    if (state.gameStarted && state.pet) {
      const today = new Date().toDateString();
      if (!state.dailyTracking?.date || state.dailyTracking.date !== today || state.dailyTasks.length === 0) {
        dispatch({ type: 'RESET_DAILY_TASKS' });
      }
      if (!state.milestones || state.milestones.length === 0) {
        dispatch({ type: 'CHECK_MILESTONES' });
      }
    }
  }, [state.gameStarted, state.pet?.id]);

  // Stat decay timer
  useEffect(() => {
    if (!state.pet) return;
    const interval = setInterval(() => {
      dispatch({ type: 'DECAY_STATS' });
      dispatch({ type: 'CHECK_GROWTH' });

      // Random event chance (5% every interval) - but not during mini-games
      if (Math.random() < 0.05 && !isPlayingMiniGameRef.current) {
        dispatch({ type: 'TRIGGER_EVENT', payload: getRandomEvent() });
      }
    }, 180000);

    return () => clearInterval(interval);
  }, [state.pet]);
  const createPet = (petData: Omit<Pet, 'id' | 'stats' | 'experience' | 'level' | 'equippedAccessories' | 'createdAt' | 'lastCaredAt'>) => {
    const newPet: Pet = {
      ...petData,
      id: crypto.randomUUID(),
      // Initialize all stats at 50/100 for a more challenging start
      stats: {
        hunger: 50,
        happiness: 50,
        energy: 50,
        cleanliness: 50,
        health: 50,
      },
      experience: 0,
      level: 1,
      equippedAccessories: {},
      createdAt: Date.now(),
      lastCaredAt: Date.now(),
    };
    dispatch({ type: 'CREATE_PET', payload: newPet });
    cloudSaveLoadedRef.current = true;
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'milestone', title: 'Welcome to the family!', description: `${newPet.name} has been adopted!`, icon: '🎉' } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'achievement', title: 'Achievement Unlocked!', description: 'New Best Friend', icon: '🏆' } });
    dispatch({ type: 'GENERATE_TOMORROW_REWARD' }); // Initialize daily loop
    toast({
      title: "🎉 Welcome to the family!",
      description: `${newPet.name} has been adopted!`,
    });
  };

  const updateStats = (stats: Partial<PetStats>) => {
    dispatch({ type: 'UPDATE_STATS', payload: stats });
    dispatch({ type: 'UPDATE_CARE_STREAK' });
  };

  const addMoney = (amount: number, description = 'Earned money') => {
    dispatch({ type: 'ADD_MONEY', payload: amount });
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: crypto.randomUUID(),
        type: 'income',
        category: 'earnings',
        amount,
        description,
        timestamp: Date.now(),
      },
    });
  };

  const spendMoney = (amount: number, category: string, description: string): boolean => {
    if (state.money < amount) {
      toast({
        title: "❌ Not enough money!",
        description: `You need $${amount} but only have $${state.money.toFixed(2)}`,
        variant: "destructive",
      });
      return false;
    }
    dispatch({ type: 'SPEND_MONEY', payload: { amount, category, description } });
    // Track spending for daily tasks
    dispatch({ type: 'TRACK_ACTION', payload: { key: 'moneySpent', amount } });
    dispatch({ type: 'TRACK_ACTION', payload: { key: 'itemsBought' } });
    dispatch({ type: 'CHECK_MILESTONES' });
    return true;
  };

  const addToInventory = (item: InventoryItem) => {
    dispatch({ type: 'ADD_TO_INVENTORY', payload: item });
  };

  const consumeItem = (itemId: string) => {
    const item = state.inventory.find(inventoryItem => inventoryItem.id === itemId);
    dispatch({ type: 'USE_ITEM', payload: itemId });
    dispatch({ type: 'UPDATE_CARE_STREAK' });
    // Track item usage for daily tasks
    dispatch({ type: 'TRACK_ACTION', payload: { key: 'itemsUsed' } });

    if (item && state.pet) {
      // Track category-specific daily task counters
      const categoryTrackingMap: Record<string, { key: keyof DailyTracking; counter?: 'totalFeeds' | 'totalPlays' }> = {
        hunger: { key: 'feedCount', counter: 'totalFeeds' },
        happiness: { key: 'playCount', counter: 'totalPlays' },
        cleanliness: { key: 'cleanCount' },
        health: { key: 'vetCount' },
        energy: { key: 'restCount' },
      };

      const categoryTracking = categoryTrackingMap[item.category];
      if (categoryTracking) {
        dispatch({ type: 'TRACK_ACTION', payload: { key: categoryTracking.key } });
        if (categoryTracking.counter) {
          dispatch({ type: 'INCREMENT_LIFETIME_COUNTER', payload: { counter: categoryTracking.counter } });
        }
      }

      // Log the action for the activity log
      const statChanges: Partial<PetStats> = {};
      if (item.effects.hunger) statChanges.hunger = item.effects.hunger;
      if (item.effects.happiness) statChanges.happiness = item.effects.happiness;
      if (item.effects.energy) statChanges.energy = item.effects.energy;
      if (item.effects.cleanliness) statChanges.cleanliness = item.effects.cleanliness;
      if (item.effects.health) statChanges.health = item.effects.health;
      addActionLog(`Used ${item.name}`, `on ${state.pet.name}`, item.icon || '📦', Object.keys(statChanges).length > 0 ? statChanges : undefined);

      if (item.effects.hunger) {
        const newHunger = clampStat(state.pet.stats.hunger + item.effects.hunger);
        setLastActionFeedback({
          action: 'feed',
          category: item.category,
          statName: 'hunger',
          statValue: newHunger,
          itemIcon: item.icon,
          itemName: item.name,
          timestamp: Date.now(),
        });
      } else {
        setLastActionFeedback({
          action: 'use-item',
          category: item.category,
          itemIcon: item.icon,
          itemName: item.name,
          timestamp: Date.now(),
        });
      }
    }
    dispatch({ type: 'CHECK_MILESTONES' });
  };

  const unlockAchievement = (achievementId: string) => {
    const achievement = state.achievements.find(entry => entry.id === achievementId);
    if (achievement && !achievement.unlocked) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievementId });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'achievement', title: 'Achievement Unlocked!', description: `${achievement.name} — +$${ACHIEVEMENT_REWARD} reward!`, icon: '🏆' } });
      toast({
        title: `🏆 Achievement Unlocked!`,
        description: `${achievement.name} — +$${ACHIEVEMENT_REWARD} reward!`,
      });
    }
  };

  const triggerRandomEvent = () => {
    dispatch({ type: 'TRIGGER_EVENT', payload: getRandomEvent() });
  };

  const handleEventChoice = (choiceIndex: number) => {
    const event = state.currentEvent;
    if (!event) return;

    const choice = event.choices[choiceIndex];

    if (choice.cost) {
      if (!spendMoney(choice.cost, 'event', event.title)) {
        return;
      }
    }

    if (choice.effects) {
      updateStats(choice.effects);
    }

    if (choice.moneyEffect) {
      addMoney(choice.moneyEffect, event.title);
    }

    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'event', title: event.title, description: choice.message, icon: '⚡' } });
    toast({
      title: event.title,
      description: choice.message,
    });

    dispatch({
      type: 'CLEAR_EVENT',
      payload: choice.discountEffect ? { discount: choice.discountEffect } : undefined,
    });
  };

  const updateCareStreak = () => {
    dispatch({ type: 'UPDATE_CARE_STREAK' });
  };

  const saveGame = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Ensure profile exists before saving (required for foreign key constraint)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!existingProfile) {
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: session.user.id,
          display_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url || null,
        },
        { onConflict: 'id' }
      );

      if (profileError) {
        toast({ title: 'Save failed', description: 'Could not create user profile', variant: 'destructive' });
        return;
      }
    }

    const { error } = await supabase.from('game_saves').upsert(
      {
        user_id: session.user.id,
        save_data: state,
        version: 1,
      },
      { onConflict: 'user_id' },
    );

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Game Saved!', description: 'Your progress has been saved to the cloud.' });
    }
  };

  const loadGameFromCloud = useCallback((saveData: GameState) => {
    dispatch({ type: 'LOAD_GAME', payload: saveData });
    cloudSaveLoadedRef.current = true;
  }, []);

  const resetGame = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('game_saves').delete().eq('user_id', session.user.id);
    }
    dispatch({ type: 'LOAD_GAME', payload: initialState });
    toast({ title: 'Game Reset', description: 'Starting fresh!' });
  };

  const performAction = (action: 'feed' | 'play' | 'rest' | 'clean' | 'vet') => {
    if (!state.pet) return;

    // Check if we have daily actions remaining
    if (state.dailyActionsRemaining <= 0) {
      toast({
        title: "❌ No actions left!",
        description: "Your pet needs rest. Come back tomorrow!",
        variant: "destructive",
      });
      return;
    }

    // Soft Failure: Disobedient pets may refuse to play
    if (state.petBehavior === 'disobedient' && action === 'play' && Math.random() < 0.3) {
      dispatch({ type: 'USE_DAILY_ACTION' }); // Consumes action as penalty
      toast({
        title: "😤 Pet Refused!",
        description: `${state.pet.name} is feeling disobedient and refuses to play!`,
        variant: "destructive",
      });
      return;
    }
    
    // Soft Warning: Sad/Grumpy pets give less rewards
    if ((state.petBehavior === 'sad' || state.petBehavior === 'grumpy') && action === 'play') {
       toast({
        title: "😔 Not interested...",
        description: `${state.pet.name} is ${state.petBehavior} and won't play as much.`,
      });
      // Logic for reduced stats is handled in reducer
    }

    const actions: Record<string, { stats: Partial<PetStats>; exp: number; message: string }> = {
      feed: { stats: { hunger: 0 }, exp: 0, message: '' },
      play: { stats: { happiness: 8, energy: -10 }, exp: 8, message: `${state.pet.name} had fun playing!` },
      rest: { stats: { energy: 12, happiness: 2 }, exp: 2, message: `${state.pet.name} had a rest!` },
      clean: { stats: { cleanliness: 8, happiness: -5 }, exp: 4, message: `${state.pet.name} is clean now!` },
      vet: { stats: { health: 8 }, exp: 4, message: `${state.pet.name} got a health checkup!` },
    };

    // Actions that require inventory items
    const inventoryActions: Record<string, { category: string; emptyTitle: string; emptyDescription: string; successIcon: string; successTitle: string }> = {
      feed: { category: 'hunger', emptyTitle: '❌ No food in inventory!', emptyDescription: 'Buy food from the Shop to feed your pet.', successIcon: '🍖', successTitle: `Fed ${state.pet.name}!` },
      play: { category: 'happiness', emptyTitle: '❌ No toys in inventory!', emptyDescription: 'Buy toys from the Shop to play with your pet.', successIcon: '🎾', successTitle: `Played with ${state.pet.name}!` },
      rest: { category: 'energy', emptyTitle: '❌ No energy items in inventory!', emptyDescription: 'Buy energy items from the Shop to rest your pet.', successIcon: '😴', successTitle: `${state.pet.name} had a rest!` },
      clean: { category: 'cleanliness', emptyTitle: '❌ No cleaning supplies in inventory!', emptyDescription: 'Buy cleaning supplies from the Shop to clean your pet.', successIcon: '🧼', successTitle: `${state.pet.name} is clean now!` },
      vet: { category: 'health', emptyTitle: '❌ No health items in inventory!', emptyDescription: 'Buy health items from the Shop to heal your pet.', successIcon: '💊', successTitle: `${state.pet.name} got a health checkup!` },
    };

    const inventoryAction = inventoryActions[action];
    if (inventoryAction) {
      const item = state.inventory.find(item => item.category === inventoryAction.category && item.quantity > 0);
      if (item) {
        consumeItem(item.id);
        toast({
          title: `${inventoryAction.successIcon} ${inventoryAction.successTitle}`,
          description: `Used ${item.name} from your inventory.`,
        });
      } else {
        toast({
          title: inventoryAction.emptyTitle,
          description: inventoryAction.emptyDescription,
          variant: "destructive",
        });
        return;
      }
    }

    const actionData = actions[action];

    // Track the action for daily tasks
    const trackingMap: Record<string, keyof DailyTracking> = {
      play: 'playCount',
      rest: 'restCount',
      clean: 'cleanCount',
      vet: 'vetCount',
    };
    if (trackingMap[action]) {
      dispatch({ type: 'TRACK_ACTION', payload: { key: trackingMap[action] } });
    }

    // Track lifetime plays for milestones
    if (action === 'play') {
      dispatch({ type: 'INCREMENT_LIFETIME_COUNTER', payload: { counter: 'totalPlays' } });

      // Play window bonus
      const windowIndex = getActivePlayWindowIndex(stateRef.current.gameTime);
      if (windowIndex !== -1 && !stateRef.current.playWindowsSatisfied[windowIndex]) {
        dispatch({ type: 'SATISFY_PLAY_WINDOW', payload: windowIndex });
        const bonusStats: Partial<PetStats> = { happiness: 5, energy: -5, cleanliness: -5 };
        dispatch({ type: 'UPDATE_STATS', payload: bonusStats });
        addActionLog('Play Window Bonus', 'Played during scheduled play time!', '🎮', bonusStats);
      }
    }

    dispatch({ type: 'USE_DAILY_ACTION' }); // Consume an action point
    dispatch({ type: 'CHECK_MILESTONES' });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'milestone', title: 'Action Complete!', description: actionData.message, icon: '✨' } });
    toast({
      title: "✨ Action Complete!",
      description: actionData.message,
    });
  };

  const updateHighScore = (gameId: string, score: number) => {
    dispatch({ type: 'UPDATE_HIGH_SCORE', payload: { gameId, score } });
  };

  const markNotificationsRead = () => {
    dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const trackGamePlayed = (gameId?: string, won = true) => {
    dispatch({ type: 'TRACK_ACTION', payload: { key: 'gamesPlayed' } });

    if (gameId) {
      const keyMap: Record<string, keyof DailyTracking> = {
        'catch': 'catchGamePlayed',
        'memory': 'memoryGamePlayed',
        'quiz': 'quizGamePlayed',
        'whack': 'whackGamePlayed'
      };

      const trackingKey = keyMap[gameId];
      if (trackingKey) {
        dispatch({ type: 'TRACK_ACTION', payload: { key: trackingKey } });
      }
    }

    if (won) {
      dispatch({ type: 'INCREMENT_LIFETIME_COUNTER', payload: { counter: 'totalGamesWon' } });
    }

    // Play window bonus for mini-game completion
    const windowIndex = getActivePlayWindowIndex(stateRef.current.gameTime);
    if (windowIndex !== -1 && !stateRef.current.playWindowsSatisfied[windowIndex]) {
      dispatch({ type: 'SATISFY_PLAY_WINDOW', payload: windowIndex });
      const bonusStats: Partial<PetStats> = { happiness: 5, energy: -5, cleanliness: -5 };
      dispatch({ type: 'UPDATE_STATS', payload: bonusStats });
      addActionLog('Play Window Bonus', 'Mini-game during scheduled play time!', '🎮', bonusStats);
    }

    dispatch({ type: 'CHECK_MILESTONES' });
  };

  const claimDailyBonus = () => {
    dispatch({ type: 'CLAIM_DAILY_BONUS' });
  };

  const claimDailyTask = (taskId: string) => {
    dispatch({ type: 'CLAIM_DAILY_TASK', payload: taskId });
  };

  const equipAccessory = (slot: AccessorySlot, accessoryId: string) => {
    dispatch({ type: 'EQUIP_ACCESSORY', payload: { slot, accessoryId } });
  };

  const unequipAccessory = (slot: AccessorySlot) => {
    dispatch({ type: 'UNEQUIP_ACCESSORY', payload: slot });
  };

  const putPetToSleep = () => {
    const today = new Date().toDateString();
    if (state.lastSleepDate === today) {
      toast({
        title: "😴 Already rested today",
        description: `${state.pet?.name || 'Your pet'} already had their nightly sleep!`,
      });
      return;
    }
    dispatch({ type: 'PUT_PET_TO_SLEEP' });
    dispatch({ type: 'TRACK_ACTION', payload: { key: 'restCount' } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'milestone', title: 'Good Night!', description: `${state.pet?.name || 'Your pet'} is sleeping soundly. 💤`, icon: '🌙' } });
    toast({
      title: "🌙 Good Night!",
      description: `${state.pet?.name || 'Your pet'} is now sleeping. Stats restored!`,
    });
  };

  const wakePetUp = () => {
    dispatch({ type: 'WAKE_PET_UP' });
    toast({
      title: "☀️ Good Morning!",
      description: `${state.pet?.name || 'Your pet'} is awake and ready for the day!`,
    });
  };

  const completeTutorial = () => {
    dispatch({ type: 'COMPLETE_TUTORIAL' });
  };

  const restartTutorial = () => {
    dispatch({ type: 'RESTART_TUTORIAL' });
    toast({
      title: "Tutorial Restarted",
      description: "The tutorial will now guide you through the game features again.",
    });
  };

  const expireTimedTask = (taskId: string) => {
    dispatch({ type: 'EXPIRE_TIMED_TASK', payload: taskId });
    toast({
      title: "⏰ Task Expired!",
      description: `Time ran out! The timed task has been removed.`,
      variant: "destructive",
    });
  };

  const claimGameReward = (gameId: string, amount: number): boolean => {
    const today = new Date().toDateString();
    if (state.dailyGameRewards[gameId] === today) {
      return false;
    }
    dispatch({ type: 'CLAIM_GAME_REWARD', payload: { gameId, amount } });
    return true;
  };

  const setGuestMode = useCallback((isGuest: boolean) => {
    dispatch({ type: 'SET_GUEST_MODE', payload: isGuest });
    if (isGuest) {
      cloudSaveLoadedRef.current = true; // Allow local saves in guest mode
      toast({
        title: "🎮 Guest Mode",
        description: "Your progress will be saved locally only.",
      });
    }
  }, []);

  const useDailyAction = useCallback((): boolean => {
    if (state.dailyActionsRemaining <= 0) {
      toast({
        title: "❌ No actions left!",
        description: "Come back tomorrow for more actions.",
        variant: "destructive",
      });
      return false;
    }
    dispatch({ type: 'USE_DAILY_ACTION' });
    return true;
  }, [state.dailyActionsRemaining]);

  const initWeeklyGoals = useCallback(() => {
    dispatch({ type: 'INIT_WEEKLY_GOALS' });
  }, []);

  const claimWeeklyGoal = useCallback((goalId: string) => {
    dispatch({ type: 'CLAIM_WEEKLY_GOAL', payload: goalId });
    toast({
      title: "🎯 Weekly Goal Complete!",
      description: "Reward claimed successfully!",
    });
  }, []);

  const claimTomorrowReward = useCallback(() => {
    if (state.tomorrowReward) {
      dispatch({ type: 'CLAIM_TOMORROW_REWARD' });
      toast({
        title: "🎁 Welcome Back!",
        description: `You received your comeback reward!`,
      });
    }
  }, [state.tomorrowReward]);

  const addActionLog = useCallback((action: string, description: string, icon: string, statChanges?: Partial<PetStats>) => {
    const logEntry: ActionLogEntry = {
      id: crypto.randomUUID(),
      action,
      description,
      icon,
      timestamp: Date.now(),
      gameTime: stateRef.current.gameTime,
      statChanges: statChanges as Partial<PetStats> | undefined,
    };
    dispatch({ type: 'ADD_ACTION_LOG', payload: logEntry });
  }, []);

  const updateGameTime = useCallback((minutes: number) => {
    dispatch({ type: 'UPDATE_GAME_TIME', payload: minutes });
  }, []);

  const penalizeMissedPlayWindow = useCallback((index: number) => {
    dispatch({ type: 'PENALIZE_MISSED_PLAY_WINDOW', payload: index });
  }, []);

  const resetPlayWindows = useCallback(() => {
    dispatch({ type: 'RESET_PLAY_WINDOWS' });
  }, []);

  // Ensure daily reward loop is active for existing saves
  React.useEffect(() => {
    if (state.gameStarted && !state.tomorrowReward) {
      dispatch({ type: 'GENERATE_TOMORROW_REWARD' });
    }
  }, [state.gameStarted, state.tomorrowReward]);

  return (
    <GameContext.Provider
      value={{
        state,
        lastActionFeedback,
        isPlayingMiniGame,
        setIsPlayingMiniGame,
        createPet,
        updateStats,
        addMoney,
        spendMoney,
        addToInventory,
        consumeItem,
        unlockAchievement,
        triggerRandomEvent,
        handleEventChoice,
        updateCareStreak,
        saveGame,
        loadGameFromCloud,
        resetGame,
        performAction,
        updateHighScore,
        markNotificationsRead,
        clearNotifications,
        trackGamePlayed,
        claimDailyBonus,
        claimDailyTask,
        expireTimedTask,
        equipAccessory,
        unequipAccessory,
        putPetToSleep,
        wakePetUp,
        completeTutorial,
        restartTutorial,
        claimGameReward,
        updateGameTime,
        // New feature functions
        setGuestMode,
        useDailyAction,
        initWeeklyGoals,
        claimWeeklyGoal,
        claimTomorrowReward,
        addActionLog,
        penalizeMissedPlayWindow,
        resetPlayWindows,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
