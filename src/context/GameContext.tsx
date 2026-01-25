import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, Pet, PetStats, Transaction, Achievement, RandomEvent, InventoryItem, PERSONALITY_MODIFIERS, GROWTH_THRESHOLDS } from '@/types/game';
import { INITIAL_ACHIEVEMENTS } from '@/data/achievements';
import { getRandomEvent } from '@/data/events';
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
  careStreak: 0,
  lastCareDate: '',
  totalDaysPlayed: 0,
  gameStarted: false,
  currentEvent: null,
  highScores: {},
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
  | { type: 'DECAY_STATS' };

const clampStat = (value: number): number => Math.max(0, Math.min(100, value));

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

      return {
        ...state,
        pet: { ...state.pet, stats: newStats, experience: state.pet.experience + 5 },
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

      return {
        ...state,
        careStreak: newStreak,
        lastCareDate: today,
        totalDaysPlayed: state.totalDaysPlayed + (state.lastCareDate !== today ? 1 : 0),
        achievements,
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

      // Check for perfect stats achievement
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
        hunger: -3 + (modifiers.hunger || 0),
        happiness: -2 + (modifiers.happiness || 0),
        energy: -1 + (modifiers.energy || 0),
        cleanliness: -2 + (modifiers.cleanliness || 0),
        health: state.pet.stats.hunger < 20 || state.pet.stats.cleanliness < 20 ? -3 : -0.5,
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
        // Ensure nested objects are merged correctly if needed, but for top-level new fields like highScores,
        // spreading payload after initialState is enough IF payload doesn't have the key.
        // If payload has the key but it's undefined (unlikely from JSON), the spread might need care,
        // but typically JSON.parse won't have the key if it wasn't there.
        // However, deeper merge for highScores might be safer if we add more keys later.
        highScores: {
          ...initialState.highScores,
          ...(action.payload.highScores || {}),
        },
      };
    }

    case 'RESET_WEEKLY_BUDGET': {
      return { ...state, weeklySpent: 0 };
    }

    case 'UPDATE_HIGH_SCORE': {
      const { gameId, score } = action.payload;
      const currentHigh = state.highScores[gameId];
      // Update if no score exists yet OR if new score is higher
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

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
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
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Auto-save on state changes
  useEffect(() => {
    if (state.gameStarted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Stat decay timer
  useEffect(() => {
    if (!state.pet) return;
    const interval = setInterval(() => {
      dispatch({ type: 'DECAY_STATS' });
      dispatch({ type: 'CHECK_GROWTH' });
      
      // Random event chance (5% every minute)
      if (Math.random() < 0.05) {
        dispatch({ type: 'TRIGGER_EVENT', payload: getRandomEvent() });
      }
    }, 60000); // Every minute

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
    return true;
  };

  const addToInventory = (item: InventoryItem) => {
    dispatch({ type: 'ADD_TO_INVENTORY', payload: item });
  };

  const useItem = (itemId: string) => {
    dispatch({ type: 'USE_ITEM', payload: itemId });
    dispatch({ type: 'UPDATE_CARE_STREAK' });
  };

  const unlockAchievement = (achievementId: string) => {
    const achievement = state.achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievementId });
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
      feed: { stats: { hunger: 20 }, exp: 5, message: `${state.pet.name} enjoyed a quick snack!` },
      play: { stats: { happiness: 25, energy: -15 }, exp: 10, message: `${state.pet.name} had so much fun playing!` },
      rest: { stats: { energy: 30, happiness: 5 }, exp: 3, message: `${state.pet.name} had a refreshing rest!` },
      clean: { stats: { cleanliness: 25, happiness: -5 }, exp: 5, message: `${state.pet.name} is squeaky clean now!` },
      vet: { stats: { health: 20 }, exp: 5, message: `${state.pet.name} got a health checkup!` },
    };

    const actionData = actions[action];
    updateStats(actionData.stats);
    
    if (state.pet) {
      dispatch({
        type: 'UPDATE_STATS',
        payload: {},
      });
    }

    toast({
      title: "✨ Action Complete!",
      description: actionData.message,
    });
  };

  const updateHighScore = (gameId: string, score: number) => {
    dispatch({ type: 'UPDATE_HIGH_SCORE', payload: { gameId, score } });
  };

  return (
    <GameContext.Provider
      value={{
        state,
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
