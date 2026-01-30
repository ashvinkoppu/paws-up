import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
import { GameState, Pet, PetStats, Transaction, Achievement, RandomEvent, InventoryItem, GameNotification, PERSONALITY_MODIFIERS, GROWTH_THRESHOLDS, DailyTask, DailyTracking, MilestoneState } from '@/types/game';
import { INITIAL_ACHIEVEMENTS } from '@/data/achievements';
import { getRandomEvent } from '@/data/events';
import { selectDailyTasks, calculateLevel, DAILY_TASK_POOL, MILESTONES, checkMilestone, DEFAULT_DAILY_TRACKING, LifetimeCounters } from '@/data/tasks';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'paws-and-prosper-save';

const initialState: GameState = {
  pet: null,
  money: 100,
  weeklyBudget: 150,
  weeklySpent: 0,
  inventory: [],
  transactions: [],
  achievements: INITIAL_ACHIEVEMENTS,
  notifications: [],
  careStreak: 0,
  lastCareDate: '',
  totalDaysPlayed: 0,
  gameStarted: false,
  currentEvent: null,
  highScores: {},
  dailyTasks: [],
  dailyTracking: { ...DEFAULT_DAILY_TRACKING },
  milestones: [],
  dailyBonusClaimed: false,
  lifetimeCounters: { totalFeeds: 0, totalPlays: 0 },
};

type GameAction =
  | { type: 'CREATE_PET'; payload: Pet }
  | { type: 'UPDATE_STATS'; payload: Partial<PetStats> }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_MONEY'; payload: number }
  | { type: 'SPEND_MONEY'; payload: { amount: number; category: string; description: string } }
  | { type: 'ADD_TO_INVENTORY'; payload: InventoryItem }
  | { type: 'USE_ITEM'; payload: string }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'TRIGGER_EVENT'; payload: RandomEvent }
  | { type: 'CLEAR_EVENT' }
  | { type: 'UPDATE_CARE_STREAK' }
  | { type: 'CHECK_GROWTH' }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'RESET_WEEKLY_BUDGET' }
  | { type: 'UPDATE_HIGH_SCORE'; payload: { gameId: string; score: number } }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<GameNotification, 'id' | 'read' | 'timestamp'> }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'DECAY_STATS' }
  | { type: 'TRACK_ACTION'; payload: { key: keyof DailyTracking; amount?: number } }
  | { type: 'CLAIM_DAILY_BONUS' }
  | { type: 'RESET_DAILY_TASKS' }
  | { type: 'CHECK_MILESTONES' }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'INCREMENT_LIFETIME_COUNTER'; payload: { counter: 'totalFeeds' | 'totalPlays'; amount?: number } };

const clampStat = (value: number): number => Math.max(0, Math.min(100, value));

function ensureDailyTracking(state: GameState): DailyTracking {
  const today = new Date().toDateString();
  if (state.dailyTracking && state.dailyTracking.date === today) {
    return state.dailyTracking;
  }
  return { ...DEFAULT_DAILY_TRACKING, date: today };
}

function ensureDailyTasks(state: GameState): DailyTask[] {
  const today = new Date().toDateString();
  if (state.dailyTasks.length > 0 && state.dailyTracking?.date === today) {
    return state.dailyTasks;
  }
  const taskIds = selectDailyTasks(today);
  return taskIds.map(id => ({ id, progress: 0, completed: false }));
}

function ensureMilestones(state: GameState): MilestoneState[] {
  if (state.milestones && state.milestones.length > 0) {
    // Add any new milestones that might have been added to MILESTONES
    const existingIds = new Set(state.milestones.map(milestone => milestone.id));
    const missing = MILESTONES
      .filter(milestone => !existingIds.has(milestone.id))
      .map(milestone => ({ id: milestone.id, completed: false }));
    return [...state.milestones, ...missing];
  }
  return MILESTONES.map(milestone => ({ id: milestone.id, completed: false }));
}

function addXpToPet(state: GameState, xpAmount: number): GameState {
  if (!state.pet || xpAmount <= 0) return state;

  const oldLevel = calculateLevel(state.pet.experience).level;
  const newExperience = state.pet.experience + xpAmount;
  const { level: newLevel } = calculateLevel(newExperience);
  const leveledUp = newLevel > oldLevel;

  let newState: GameState = {
    ...state,
    pet: { ...state.pet, experience: newExperience, level: newLevel },
  };

  if (leveledUp) {
    newState = {
      ...newState,
      money: newState.money + 25,
    };
    // Add level-up notification
    const notification: GameNotification = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      type: 'levelup',
      title: `Level Up! Level ${newLevel}`,
      description: `Your pet reached level ${newLevel}! +$25 bonus!`,
      icon: '🎉',
      read: false,
      timestamp: Date.now(),
    };
    newState = {
      ...newState,
      notifications: [notification, ...newState.notifications].slice(0, 50),
    };
  }

  return newState;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CREATE_PET': {
      const newState = {
        ...state,
        pet: action.payload,
        gameStarted: true,
        achievements: state.achievements.map(a =>
          a.id === 'first-pet' ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
        ),
      };
      return newState;
    }

    case 'UPDATE_STATS': {
      if (!state.pet) return state;
      const newStats = { ...state.pet.stats };
      Object.entries(action.payload).forEach(([key, value]) => {
        if (value !== undefined) {
          newStats[key as keyof PetStats] = clampStat(newStats[key as keyof PetStats] + value);
        }
      });
      return {
        ...state,
        pet: { ...state.pet, stats: newStats },
      };
    }

    case 'ADD_MONEY': {
      const newMoney = state.money + action.payload;
      let achievements = state.achievements;
      if (newMoney >= 500) {
        achievements = achievements.map(a =>
          a.id === 'rich' && !a.unlocked ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
        );
      }
      return { ...state, money: newMoney, achievements };
    }

    case 'SPEND_MONEY': {
      const { amount, category, description } = action.payload;
      const transaction: Transaction = {
        id: Date.now().toString(),
        type: 'expense',
        category,
        amount,
        description,
        timestamp: Date.now(),
      };
      return {
        ...state,
        money: state.money - amount,
        weeklySpent: state.weeklySpent + amount,
        transactions: [...state.transactions, transaction],
      };
    }

    case 'ADD_TRANSACTION': {
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };
    }

    case 'ADD_TO_INVENTORY': {
      const existing = state.inventory.find(i => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          inventory: state.inventory.map(i =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        ...state,
        inventory: [...state.inventory, { ...action.payload, quantity: 1 }],
      };
    }

    case 'USE_ITEM': {
      const item = state.inventory.find(i => i.id === action.payload);
      if (!item || item.quantity <= 0 || !state.pet) return state;

      const newStats = { ...state.pet.stats };
      Object.entries(item.effects).forEach(([key, value]) => {
        if (value !== undefined) {
          newStats[key as keyof PetStats] = clampStat(newStats[key as keyof PetStats] + value);
        }
      });

      // Grant 5 XP for using items
      const newExperience = state.pet.experience + 5;
      const { level: newLevel } = calculateLevel(newExperience);

      return {
        ...state,
        pet: { ...state.pet, stats: newStats, experience: newExperience, level: newLevel },
        inventory: state.inventory
          .map(i => i.id === action.payload ? { ...i, quantity: i.quantity - 1 } : i)
          .filter(i => i.quantity > 0),
      };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      return {
        ...state,
        achievements: state.achievements.map(a =>
          a.id === action.payload && !a.unlocked ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
        ),
      };
    }

    case 'TRIGGER_EVENT': {
      return { ...state, currentEvent: action.payload };
    }

    case 'CLEAR_EVENT': {
      return { ...state, currentEvent: null };
    }

    case 'UPDATE_CARE_STREAK': {
      const today = new Date().toDateString();
      if (state.lastCareDate === today) return state;

      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = state.lastCareDate === yesterday ? state.careStreak + 1 : 1;

      let achievements = state.achievements;
      if (newStreak >= 3) {
        achievements = achievements.map(a =>
          a.id === 'streak-3' && !a.unlocked ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
        );
      }
      if (newStreak >= 7) {
        achievements = achievements.map(a =>
          a.id === 'streak-7' && !a.unlocked ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
        );
      }

      // Also reset daily tasks if it's a new day
      const dailyTracking = ensureDailyTracking({ ...state, lastCareDate: today });
      const dailyTasks = ensureDailyTasks({ ...state, dailyTracking });

      return {
        ...state,
        careStreak: newStreak,
        lastCareDate: today,
        totalDaysPlayed: state.totalDaysPlayed + (state.lastCareDate !== today ? 1 : 0),
        achievements,
        dailyTracking,
        dailyTasks,
        dailyBonusClaimed: state.dailyTracking?.date === today ? state.dailyBonusClaimed : false,
      };
    }

    case 'CHECK_GROWTH': {
      if (!state.pet) return state;

      let newStage = state.pet.stage;
      let achievements = state.achievements;

      if (state.pet.experience >= GROWTH_THRESHOLDS.adult && state.pet.stage !== 'adult') {
        newStage = 'adult';
        achievements = achievements.map(a =>
          a.id === 'adult-stage' && !a.unlocked ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
        );
      } else if (state.pet.experience >= GROWTH_THRESHOLDS.teen && state.pet.stage === 'baby') {
        newStage = 'teen';
        achievements = achievements.map(a =>
          a.id === 'teen-stage' && !a.unlocked ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
        );
      }

      const stats = state.pet.stats;
      if (Object.values(stats).every(v => v >= 90)) {
        achievements = achievements.map(a =>
          a.id === 'perfect-stats' && !a.unlocked ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
        );
      }

      return {
        ...state,
        pet: { ...state.pet, stage: newStage },
        achievements,
      };
    }

    case 'DECAY_STATS': {
      if (!state.pet) return state;

      const personality = state.pet.personality;
      const modifiers = PERSONALITY_MODIFIERS[personality];

      const decay: Partial<PetStats> = {
        hunger: -8 + (modifiers.hunger || 0),
        happiness: -6 + (modifiers.happiness || 0),
        energy: -5 + (modifiers.energy || 0),
        cleanliness: -6 + (modifiers.cleanliness || 0),
        health: state.pet.stats.hunger < 20 || state.pet.stats.cleanliness < 20 ? -8 : -2,
      };

      const newStats = { ...state.pet.stats };
      Object.entries(decay).forEach(([key, value]) => {
        if (value !== undefined) {
          newStats[key as keyof PetStats] = clampStat(newStats[key as keyof PetStats] + value);
        }
      });

      return {
        ...state,
        pet: { ...state.pet, stats: newStats, lastCaredAt: Date.now() },
      };
    }

    case 'LOAD_GAME': {
      return {
        ...initialState,
        ...action.payload,
        notifications: action.payload.notifications || initialState.notifications,
        highScores: {
          ...initialState.highScores,
          ...(action.payload.highScores || {}),
        },
        // Migration: ensure new fields exist for old saves
        dailyTasks: action.payload.dailyTasks || [],
        dailyTracking: action.payload.dailyTracking || { ...DEFAULT_DAILY_TRACKING },
        milestones: action.payload.milestones || [],
        dailyBonusClaimed: action.payload.dailyBonusClaimed || false,
        lifetimeCounters: action.payload.lifetimeCounters || { totalFeeds: 0, totalPlays: 0 },
      } as GameState;
    }

    case 'RESET_WEEKLY_BUDGET': {
      return { ...state, weeklySpent: 0 };
    }

    case 'UPDATE_HIGH_SCORE': {
      const { gameId, score } = action.payload;
      const currentHigh = state.highScores[gameId];
      if (currentHigh === undefined || score > currentHigh) {
        return {
          ...state,
          highScores: {
            ...state.highScores,
            [gameId]: score,
          },
        };
      }
      return state;
    }

    case 'ADD_NOTIFICATION': {
      const notification: GameNotification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        read: false,
        timestamp: Date.now(),
      };
      return {
        ...state,
        notifications: [notification, ...state.notifications].slice(0, 50),
      };
    }

    case 'MARK_NOTIFICATIONS_READ': {
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
      };
    }

    case 'TRACK_ACTION': {
      const { key, amount = 1 } = action.payload;
      const tracking = ensureDailyTracking(state);
      const newTracking = {
        ...tracking,
        [key]: (tracking[key] as number) + amount,
      };

      // Check daily tasks for completion
      let dailyTasks = ensureDailyTasks({ ...state, dailyTracking: newTracking });
      let resultState: GameState = { ...state, dailyTracking: newTracking, dailyTasks };

      dailyTasks = dailyTasks.map(task => {
        if (task.completed) return task;
        const taskDef = DAILY_TASK_POOL.find(definition => definition.id === task.id);
        if (!taskDef) return task;
        const currentProgress = newTracking[taskDef.trackingKey as keyof DailyTracking] as number;
        const completed = currentProgress >= taskDef.target;
        if (completed && !task.completed) {
          // Grant XP for completing daily task
          resultState = addXpToPet(resultState, taskDef.xpReward);
        }
        return {
          ...task,
          progress: Math.min(currentProgress, taskDef.target),
          completed,
        };
      });

      return { ...resultState, dailyTasks };
    }

    case 'CLAIM_DAILY_BONUS': {
      if (state.dailyBonusClaimed) return state;
      const allComplete = state.dailyTasks.length > 0 && state.dailyTasks.every(task => task.completed);
      if (!allComplete) return state;

      let resultState = addXpToPet(state, 30);
      resultState = {
        ...resultState,
        money: resultState.money + 20,
        dailyBonusClaimed: true,
      };
      const notification: GameNotification = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        type: 'milestone',
        title: 'Daily Bonus Claimed!',
        description: 'All daily tasks complete! +30 XP, +$20',
        icon: '🎁',
        read: false,
        timestamp: Date.now(),
      };
      return {
        ...resultState,
        notifications: [notification, ...resultState.notifications].slice(0, 50),
      };
    }

    case 'RESET_DAILY_TASKS': {
      const today = new Date().toDateString();
      const taskIds = selectDailyTasks(today);
      return {
        ...state,
        dailyTasks: taskIds.map(id => ({ id, progress: 0, completed: false })),
        dailyTracking: { ...DEFAULT_DAILY_TRACKING, date: today },
        dailyBonusClaimed: false,
        milestones: ensureMilestones(state),
      };
    }

    case 'CHECK_MILESTONES': {
      const milestones = ensureMilestones(state);
      const counters: LifetimeCounters = state.lifetimeCounters || { totalFeeds: 0, totalPlays: 0 };
      let resultState = { ...state };

      const updatedMilestones = milestones.map(milestone => {
        if (milestone.completed) return milestone;
        const milestoneDef = MILESTONES.find(definition => definition.id === milestone.id);
        if (!milestoneDef) return milestone;

        const passed = checkMilestone(milestoneDef.checkFn, resultState, counters);
        if (passed) {
          resultState = addXpToPet(resultState, milestoneDef.xpReward);
          resultState = {
            ...resultState,
            money: resultState.money + milestoneDef.moneyReward,
          };
          const notification: GameNotification = {
            id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
            type: 'milestone',
            title: 'Milestone Complete!',
            description: `${milestoneDef.name}: +${milestoneDef.xpReward} XP, +$${milestoneDef.moneyReward}`,
            icon: milestoneDef.icon,
            read: false,
            timestamp: Date.now(),
          };
          resultState = {
            ...resultState,
            notifications: [notification, ...resultState.notifications].slice(0, 50),
          };
          return { ...milestone, completed: true, completedAt: Date.now() };
        }
        return milestone;
      });

      return { ...resultState, milestones: updatedMilestones };
    }

    case 'ADD_XP': {
      return addXpToPet(state, action.payload);
    }

    case 'INCREMENT_LIFETIME_COUNTER': {
      const { counter, amount = 1 } = action.payload;
      const counters = state.lifetimeCounters || { totalFeeds: 0, totalPlays: 0 };
      return {
        ...state,
        lifetimeCounters: {
          ...counters,
          [counter]: (counters[counter] || 0) + amount,
        },
      };
    }

    default:
      return state;
  }
}

export interface ActionFeedbackEvent {
  action: string;
  category?: string;
  statName?: string;
  statValue?: number;
  itemIcon?: string;
  itemName?: string;
  timestamp: number;
}

interface GameContextType {
  state: GameState;
  lastActionFeedback: ActionFeedbackEvent | null;
  isPlayingMiniGame: boolean;
  setIsPlayingMiniGame: (playing: boolean) => void;
  createPet: (pet: Omit<Pet, 'id' | 'stats' | 'experience' | 'level' | 'createdAt' | 'lastCaredAt'>) => void;
  updateStats: (stats: Partial<PetStats>) => void;
  addMoney: (amount: number, description?: string) => void;
  spendMoney: (amount: number, category: string, description: string) => boolean;
  addToInventory: (item: InventoryItem) => void;
  useItem: (itemId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  triggerRandomEvent: () => void;
  handleEventChoice: (choiceIndex: number) => void;
  updateCareStreak: () => void;
  saveGame: () => void;
  loadGame: () => boolean;
  resetGame: () => void;
  performAction: (action: 'feed' | 'play' | 'rest' | 'clean' | 'vet') => void;
  updateHighScore: (gameId: string, score: number) => void;
  markNotificationsRead: () => void;
  trackGamePlayed: () => void;
  claimDailyBonus: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [lastActionFeedback, setLastActionFeedback] = useState<ActionFeedbackEvent | null>(null);
  const [isPlayingMiniGame, setIsPlayingMiniGame] = useState(false);

  // Auto-save on state changes
  useEffect(() => {
    if (state.gameStarted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
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

      // Random event chance (5% every minute) - but not during mini-games
      if (Math.random() < 0.05 && !isPlayingMiniGame) {
        dispatch({ type: 'TRIGGER_EVENT', payload: getRandomEvent() });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [state.pet]);

  const createPet = (petData: Omit<Pet, 'id' | 'stats' | 'experience' | 'level' | 'createdAt' | 'lastCaredAt'>) => {
    const newPet: Pet = {
      ...petData,
      id: Date.now().toString(),
      stats: {
        hunger: 80,
        happiness: 80,
        energy: 80,
        cleanliness: 80,
        health: 100,
      },
      experience: 0,
      level: 1,
      createdAt: Date.now(),
      lastCaredAt: Date.now(),
    };
    dispatch({ type: 'CREATE_PET', payload: newPet });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'milestone', title: 'Welcome to the family!', description: `${newPet.name} has been adopted!`, icon: '🎉' } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'achievement', title: 'Achievement Unlocked!', description: 'New Best Friend', icon: '🏆' } });
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
        id: Date.now().toString(),
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

  const useItem = (itemId: string) => {
    const item = state.inventory.find(i => i.id === itemId);
    dispatch({ type: 'USE_ITEM', payload: itemId });
    dispatch({ type: 'UPDATE_CARE_STREAK' });
    // Track item usage for daily tasks
    dispatch({ type: 'TRACK_ACTION', payload: { key: 'itemsUsed' } });

    if (item && state.pet) {
      // Track feed if food item
      if (item.effects.hunger) {
        dispatch({ type: 'TRACK_ACTION', payload: { key: 'feedCount' } });
        dispatch({ type: 'INCREMENT_LIFETIME_COUNTER', payload: { counter: 'totalFeeds' } });
      }

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
    const achievement = state.achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievementId });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'achievement', title: 'Achievement Unlocked!', description: achievement.name, icon: '🏆' } });
      toast({
        title: `🏆 Achievement Unlocked!`,
        description: achievement.name,
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

    dispatch({ type: 'CLEAR_EVENT' });
  };

  const updateCareStreak = () => {
    dispatch({ type: 'UPDATE_CARE_STREAK' });
  };

  const saveGame = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    toast({
      title: "💾 Game Saved!",
      description: "Your progress has been saved.",
    });
  };

  const loadGame = (): boolean => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        dispatch({ type: 'LOAD_GAME', payload: parsedState });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const resetGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'LOAD_GAME', payload: initialState });
    toast({
      title: "🔄 Game Reset",
      description: "Starting fresh!",
    });
  };

  const performAction = (action: 'feed' | 'play' | 'rest' | 'clean' | 'vet') => {
    if (!state.pet) return;

    const actions: Record<string, { stats: Partial<PetStats>; exp: number; message: string }> = {
      feed: { stats: { hunger: 0 }, exp: 0, message: '' },
      play: { stats: { happiness: 15, energy: -10 }, exp: 8, message: `${state.pet.name} had fun playing!` },
      rest: { stats: { energy: 20, happiness: 3 }, exp: 2, message: `${state.pet.name} had a rest!` },
      clean: { stats: { cleanliness: 15, happiness: -5 }, exp: 4, message: `${state.pet.name} is clean now!` },
      vet: { stats: { health: 15 }, exp: 4, message: `${state.pet.name} got a health checkup!` },
    };

    // Feed requires food items from inventory
    if (action === 'feed') {
      const foodItem = state.inventory.find(item => item.category === 'food' && item.quantity > 0);
      if (foodItem) {
        useItem(foodItem.id);
        toast({
          title: "🍖 Fed " + state.pet.name + "!",
          description: `Used ${foodItem.name} from your inventory.`,
        });
      } else {
        toast({
          title: "❌ No food in inventory!",
          description: "Buy food from the Shop to feed your pet.",
          variant: "destructive",
        });
      }
      return;
    }

    const actionData = actions[action];
    updateStats(actionData.stats);

    // Grant XP for the action (fixing the XP bug - exp was defined but never added)
    if (actionData.exp > 0) {
      dispatch({ type: 'ADD_XP', payload: actionData.exp });
    }

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
    }

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

  const trackGamePlayed = () => {
    dispatch({ type: 'TRACK_ACTION', payload: { key: 'gamesPlayed' } });
    dispatch({ type: 'CHECK_MILESTONES' });
  };

  const claimDailyBonus = () => {
    dispatch({ type: 'CLAIM_DAILY_BONUS' });
  };

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
        useItem,
        unlockAchievement,
        triggerRandomEvent,
        handleEventChoice,
        updateCareStreak,
        saveGame,
        loadGame,
        resetGame,
        performAction,
        updateHighScore,
        markNotificationsRead,
        trackGamePlayed,
        claimDailyBonus,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
