import { GameState, PetStats, Transaction, GameNotification, DailyTracking, PERSONALITY_MODIFIERS, GROWTH_THRESHOLDS } from '@/types/game';
import { selectDailyTasks, calculateLevel, DAILY_TASK_POOL, DEFAULT_DAILY_TRACKING } from '@/data/tasks';
import { GameAction } from '@/context/game/types';
import { initialState } from '@/context/game/types';
import {
  clampStat,
  unlockAchievementInList,
  ensureDailyTracking,
  ensureDailyTasks,
  ensureMilestones,
  addXpToPet,
  checkAllMilestones,
  appendTransaction,
} from '@/context/game/helpers';

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CREATE_PET': {

      const [updatedAchievements, reward] = unlockAchievementInList(state.achievements, 'first-pet');
      const newState = {
        ...state,
        pet: action.payload,
        gameStarted: true,
        money: state.money + reward,
        achievements: updatedAchievements,
      };
      return newState;
    }

    case 'UPDATE_STATS': {
      if (!state.pet) return state;
      const oldHealth = state.pet.stats.health;
      const newStats = { ...state.pet.stats };
      Object.entries(action.payload).forEach(([key, value]) => {
        if (value !== undefined) {
          newStats[key as keyof PetStats] = clampStat(newStats[key as keyof PetStats] + value);
        }
      });

      // Check survivor achievement: recovered from health crisis (health went from <20 to >50)
      let achievements = state.achievements;
      let achievementMoney = 0;
      if (oldHealth < 20 && newStats.health >= 50) {
        const [updated, reward] = unlockAchievementInList(achievements, 'survivor');
        achievements = updated;
        achievementMoney += reward;
      }

      return {
        ...state,
        pet: { ...state.pet, stats: newStats },
        achievements,
        money: state.money + achievementMoney,
      };
    }

    case 'ADD_MONEY': {
      let newMoney = state.money + action.payload;
      let achievements = state.achievements;
      if (newMoney >= 500) {
        const [updated, reward] = unlockAchievementInList(achievements, 'rich');
        achievements = updated;
        newMoney += reward;
      }
      return { ...state, money: newMoney, achievements };
    }

    case 'SPEND_MONEY': {
      const { amount, category, description } = action.payload;
      const transaction: Transaction = {
        id: crypto.randomUUID(),
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
        transactions: appendTransaction(state.transactions, transaction),
      };
    }

    case 'ADD_TRANSACTION': {
      return {
        ...state,
        transactions: appendTransaction(state.transactions, action.payload),
      };
    }

    case 'ADD_TO_INVENTORY': {
      const existing = state.inventory.find(item => item.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          inventory: state.inventory.map(item =>
            item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return {
        ...state,
        inventory: [...state.inventory, { ...action.payload, quantity: 1 }],
      };
    }

    case 'USE_ITEM': {
      const item = state.inventory.find(inventoryItem => inventoryItem.id === action.payload);
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
          .map(inventoryItem => inventoryItem.id === action.payload ? { ...inventoryItem, quantity: inventoryItem.quantity - 1 } : inventoryItem)
          .filter(inventoryItem => inventoryItem.quantity > 0),
      };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      const [updatedAchievements, reward] = unlockAchievementInList(state.achievements, action.payload);
      return {
        ...state,
        money: state.money + reward,
        achievements: updatedAchievements,
      };
    }

    case 'TRIGGER_EVENT': {
      return { ...state, currentEvent: action.payload };
    }

    case 'CLEAR_EVENT': {
      const discount = action.payload?.discount;
      return {
        ...state,
        currentEvent: null,
        ...(discount !== undefined && discount > state.activeShopDiscount
          ? { activeShopDiscount: discount }
          : {}),
      };
    }

    case 'UPDATE_CARE_STREAK': {
      const today = new Date().toDateString();
      if (state.lastCareDate === today) return state;

      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = state.lastCareDate === yesterday ? state.careStreak + 1 : 1;

      let achievements = state.achievements;
      let achievementMoney = 0;
      if (newStreak >= 3) {
        const [updated, reward] = unlockAchievementInList(achievements, 'streak-3');
        achievements = updated;
        achievementMoney += reward;
      }
      if (newStreak >= 7) {
        const [updated, reward] = unlockAchievementInList(achievements, 'streak-7');
        achievements = updated;
        achievementMoney += reward;
      }

      // Also reset daily tasks if it's a new day
      const dailyTracking = ensureDailyTracking({ ...state, lastCareDate: today });
      const dailyTasks = ensureDailyTasks({ ...state, dailyTracking });

      const newState = {
        ...state,
        careStreak: newStreak,
        lastCareDate: today,
        totalDaysPlayed: state.totalDaysPlayed + (state.lastCareDate !== today ? 1 : 0),
        money: state.money + achievementMoney,
        achievements,
        dailyTracking,
        dailyTasks,
        dailyBonusClaimed: state.dailyTracking?.date === today ? state.dailyBonusClaimed : false,
      };

      return checkAllMilestones(newState);
    }

    case 'CHECK_GROWTH': {
      if (!state.pet) return state;

      let newStage = state.pet.stage;
      let achievements = state.achievements;
      let achievementMoney = 0;
      let notifications = [...state.notifications];

      if (state.pet.experience >= GROWTH_THRESHOLDS.adult && state.pet.stage !== 'adult') {
        newStage = 'adult';
        const [updated, reward] = unlockAchievementInList(achievements, 'adult-stage');
        achievements = updated;
        achievementMoney += reward;
        const notification: GameNotification = {
          id: crypto.randomUUID(),
          type: 'milestone',
          title: 'Evolution: Adult Stage!',
          description: `${state.pet.name} has reached their final form! They are now fully grown.`,
          icon: '🌟',
          read: false,
          timestamp: Date.now(),
        };
        notifications = [notification, ...notifications].slice(0, 50);
      } else if (state.pet.experience >= GROWTH_THRESHOLDS.teen && state.pet.stage === 'baby') {
        newStage = 'teen';
        const [updated, reward] = unlockAchievementInList(achievements, 'teen-stage');
        achievements = updated;
        achievementMoney += reward;
        const notification: GameNotification = {
          id: crypto.randomUUID(),
          type: 'milestone',
          title: 'Evolution: Teen Stage!',
          description: `${state.pet.name} is growing up! They've entered the teen stage.`,
          icon: '⭐',
          read: false,
          timestamp: Date.now(),
        };
        notifications = [notification, ...notifications].slice(0, 50);
      }

      const stats = state.pet.stats;
      if (Object.values(stats).every(v => v >= 90)) {
        const [updated, reward] = unlockAchievementInList(achievements, 'perfect-stats');
        achievements = updated;
        achievementMoney += reward;
      }

      return {
        ...state,
        money: state.money + achievementMoney,
        pet: { ...state.pet, stage: newStage },
        achievements,
        notifications,
      };
    }

    case 'DECAY_STATS': {
      if (!state.pet) return state;

      const personality = state.pet.personality;
      const modifiers = PERSONALITY_MODIFIERS[personality];

      const decay: Partial<PetStats> = {
        hunger: -2 + (modifiers.hunger || 0),
        happiness: -2 + (modifiers.happiness || 0),
        energy: -1 + (modifiers.energy || 0),
        cleanliness: -2 + (modifiers.cleanliness || 0),
        health: state.pet.stats.hunger < 20 || state.pet.stats.cleanliness < 20 ? -3 : -1,
      };

      const newStats = { ...state.pet.stats };
      Object.entries(decay).forEach(([key, value]) => {
        if (value !== undefined) {
          newStats[key as keyof PetStats] = clampStat(newStats[key as keyof PetStats] + value);
        }
      });

      // Check for pet death condition:
      // hunger < 20, happiness < 20, energy < 10, cleanliness < 10, health < 20
      const isDead =
        newStats.hunger < 20 &&
        newStats.happiness < 20 &&
        newStats.energy < 10 &&
        newStats.cleanliness < 10 &&
        newStats.health < 20;

      if (isDead) {
        return {
          ...state,
          pet: { ...state.pet, stats: newStats, lastCaredAt: Date.now() },
          petDead: true,
        };
      }

      return {
        ...state,
        pet: { ...state.pet, stats: newStats, lastCaredAt: Date.now() },
      };
    }

    case 'LOAD_GAME': {
      const loadedState = {
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
        activeShopDiscount: action.payload.activeShopDiscount || 0,
        lifetimeCounters: {
          totalFeeds: 0,
          totalPlays: 0,
          totalGamesWon: 0,
          weeksUnderBudget: 0,
          ...(action.payload.lifetimeCounters || {}),
        },
        petAsleep: action.payload.petAsleep || false,
        lastSleepDate: action.payload.lastSleepDate || '',
        petDead: action.payload.petDead || false,
        tutorialCompleted: action.payload.tutorialCompleted ?? (action.payload.gameStarted ? true : false),
        dailyGameRewards: action.payload.dailyGameRewards || {},
        gameTime: action.payload.gameTime || 7 * 60,
      } as GameState;
      // Migrate old pets: add gender and equippedAccessories if missing
      if (loadedState.pet) {
        if (!loadedState.pet.gender) {
          loadedState.pet = { ...loadedState.pet, gender: 'neutral' };
        }
        if (!loadedState.pet.equippedAccessories) {
          loadedState.pet = { ...loadedState.pet, equippedAccessories: {} };
        }
      }
      // Migration: ensure dailyTasks have timed fields
      if (loadedState.dailyTasks) {
        loadedState.dailyTasks = loadedState.dailyTasks.map(task => ({
          ...task,
          timed: task.timed ?? false,
          timerExpiresAt: task.timerExpiresAt ?? null,
        }));
      }
      return loadedState;
    }

    case 'RESET_WEEKLY_BUDGET': {
      // Track weeks under budget for budget-hero achievement
      const wasUnderBudget = state.weeklySpent <= state.weeklyBudget;
      const counters = state.lifetimeCounters || { totalFeeds: 0, totalPlays: 0, totalGamesWon: 0, weeksUnderBudget: 0 };
      const updatedWeeksUnderBudget = wasUnderBudget ? (counters.weeksUnderBudget || 0) + 1 : 0;

      let achievements = state.achievements;
      let achievementMoney = 0;
      if (updatedWeeksUnderBudget >= 3) {
        const [updated, reward] = unlockAchievementInList(achievements, 'budget-hero');
        achievements = updated;
        achievementMoney += reward;
      }

      return {
        ...state,
        weeklySpent: 0,
        lifetimeCounters: { ...counters, weeksUnderBudget: updatedWeeksUnderBudget },
        achievements,
        money: state.money + achievementMoney,
      };
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
        id: crypto.randomUUID(),
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

    case 'CLEAR_NOTIFICATIONS': {
      return {
        ...state,
        notifications: [],
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
        id: crypto.randomUUID(),
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
      const now = Date.now();
      return {
        ...state,
        dailyTasks: taskIds.map(id => {
          const taskDef = DAILY_TASK_POOL.find(definition => definition.id === id);
          const timed = !!(taskDef?.timeLimitMinutes);
          const timerExpiresAt = timed && taskDef ? now + taskDef.timeLimitMinutes * 60 * 1000 : null;
          return { id, progress: 0, completed: false, claimed: false, timed, timerExpiresAt };
        }),
        dailyTracking: { ...DEFAULT_DAILY_TRACKING, date: today },
        dailyBonusClaimed: false,
        activeShopDiscount: 0, // Reset discount for new day
        milestones: ensureMilestones(state),
      };
    }

    case 'EXPIRE_TIMED_TASK': {
      const expiredTaskId = action.payload;
      const taskDef = DAILY_TASK_POOL.find(definition => definition.id === expiredTaskId);
      const notification: GameNotification = {
        id: crypto.randomUUID(),
        type: 'alert',
        title: 'Task Expired!',
        description: `Time's up! "${taskDef?.name || 'Timed task'}" has been removed.`,
        icon: '⏰',
        read: false,
        timestamp: Date.now(),
      };
      return {
        ...state,
        dailyTasks: state.dailyTasks.filter(task => task.id !== expiredTaskId),
        notifications: [notification, ...state.notifications].slice(0, 50),
      };
    }

    case 'CHECK_MILESTONES': {
      return checkAllMilestones(state);
    }

    case 'ADD_XP': {
      return addXpToPet(state, action.payload);
    }

    case 'CLAIM_DAILY_TASK': {
      const taskId = action.payload;
      const task = state.dailyTasks.find(task => task.id === taskId);
      if (!task || !task.completed || task.claimed) return state;
      const taskDef = DAILY_TASK_POOL.find(definition => definition.id === taskId);
      if (!taskDef) return state;

      let claimState = addXpToPet(state, taskDef.xpReward);

      // Handle Discount Reward
      if (taskDef.rewardType === 'discount' && taskDef.discountValue) {
        claimState = {
          ...claimState,
          activeShopDiscount: taskDef.discountValue,
        };
        // Add notification for discount
        const notification: GameNotification = {
          id: crypto.randomUUID(),
          type: 'milestone', // or 'reward'
          title: 'Discount Activated!',
          description: `You've earned a ${taskDef.discountValue}% discount in the shop for today!`,
          icon: '🏷️',
          read: false,
          timestamp: Date.now(),
        };
        claimState = {
          ...claimState,
          notifications: [notification, ...claimState.notifications].slice(0, 50),
        };
      }

      claimState = {
        ...claimState,
        dailyTasks: claimState.dailyTasks.map(dailyTask =>
          dailyTask.id === taskId ? { ...dailyTask, claimed: true } : dailyTask
        ),
      };
      return claimState;
    }

    case 'INCREMENT_LIFETIME_COUNTER': {
      const { counter, amount = 1 } = action.payload;
      const counters = state.lifetimeCounters || { totalFeeds: 0, totalPlays: 0, totalGamesWon: 0, weeksUnderBudget: 0 };
      const updatedCounters = {
        ...counters,
        [counter]: (counters[counter] || 0) + amount,
      };

      // Check minigame-master achievement (win 10 mini-games)
      let achievements = state.achievements;
      let achievementMoney = 0;
      if (counter === 'totalGamesWon' && updatedCounters.totalGamesWon >= 10) {
        const [updated, reward] = unlockAchievementInList(achievements, 'minigame-master');
        achievements = updated;
        achievementMoney += reward;
      }
      // Check budget-hero achievement (stay under budget for 3 weeks)
      if (counter === 'weeksUnderBudget' && updatedCounters.weeksUnderBudget >= 3) {
        const [updated, reward] = unlockAchievementInList(achievements, 'budget-hero');
        achievements = updated;
        achievementMoney += reward;
      }

      return {
        ...state,
        lifetimeCounters: updatedCounters,
        achievements,
        money: state.money + achievementMoney,
      };
    }

    case 'EQUIP_ACCESSORY': {
      if (!state.pet) return state;
      const { slot, accessoryId } = action.payload;
      return {
        ...state,
        pet: {
          ...state.pet,
          equippedAccessories: {
            ...state.pet.equippedAccessories,
            [slot]: accessoryId,
          },
        },
      };
    }

    case 'UNEQUIP_ACCESSORY': {
      if (!state.pet) return state;
      const unequipSlot = action.payload;
      const updatedAccessories = { ...state.pet.equippedAccessories };
      delete updatedAccessories[unequipSlot];
      return {
        ...state,
        pet: {
          ...state.pet,
          equippedAccessories: updatedAccessories,
        },
      };
    }

    case 'PUT_PET_TO_SLEEP': {
      if (!state.pet) return state;
      const today = new Date().toDateString();
      // Already slept today
      if (state.lastSleepDate === today) return state;

      // Apply sleep effects: boost energy, happiness, cleanliness, health; reduce hunger
      const newStats = { ...state.pet.stats };
      newStats.energy = clampStat(newStats.energy + 15);
      newStats.happiness = clampStat(newStats.happiness + 8);
      newStats.cleanliness = clampStat(newStats.cleanliness + 5);
      newStats.health = clampStat(newStats.health + 5);
      newStats.hunger = clampStat(newStats.hunger - 10); // Gets a little hungry while sleeping

      return {
        ...state,
        pet: { ...state.pet, stats: newStats },
        petAsleep: true,
        lastSleepDate: today,
      };
    }

    case 'WAKE_PET_UP': {
      return {
        ...state,
        petAsleep: false,
      };
    }

    case 'COMPLETE_TUTORIAL': {
      return {
        ...state,
        tutorialCompleted: true,
      };
    }

    case 'RESTART_TUTORIAL': {
      return {
        ...state,
        tutorialCompleted: false,
      };
    }

    case 'CLAIM_GAME_REWARD': {
      const { gameId, amount } = action.payload;
      const today = new Date().toDateString();

      // Double check if already claimed (though UI should prevent this)
      if (state.dailyGameRewards[gameId] === today) {
        return state;
      }

      let achievements = state.achievements;
      // You could add specific achievements for earning game money here if needed

      return {
        ...state,
        money: state.money + amount,
        dailyGameRewards: {
          ...state.dailyGameRewards,
          [gameId]: today
        },
        transactions: appendTransaction(state.transactions, {
          id: crypto.randomUUID(),
          type: 'income',
          category: 'earnings',
          amount,
          description: 'Mini-game reward',
          timestamp: Date.now(),
        }),
      };
    }

    case 'UPDATE_GAME_TIME': {
      return {
        ...state,
        gameTime: action.payload,
      };
    }

    default:
      return state;
  }
}
