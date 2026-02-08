import { GameState, PetStats, Transaction, GameNotification, DailyTracking, PERSONALITY_MODIFIERS, GROWTH_THRESHOLDS, PetBehavior, ActionLogEntry, WeeklyGoal } from '@/types/game';
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
      const newItem = action.payload;
      const existingItemIndex = state.inventory.findIndex(item => item.id === newItem.id);

      // Check if this item is new to collection
      let newCollection = [...state.collection];
      const isInCollection = state.collection.some(item => item.id === newItem.id);
      
      if (!isInCollection) {
        // Map inventory category to collection category
        let collectionCategory: 'toy' | 'outfit' | 'room_theme' | 'decoration' = 'decoration';
        if (newItem.category === 'accessory') collectionCategory = 'outfit';
        else if (newItem.category === 'happiness') collectionCategory = 'toy';
        else if (newItem.category === 'room_theme' as string) collectionCategory = 'room_theme';

        // Map tier/price to rarity
        let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
        if (newItem.tier === 'deluxe' || newItem.price > 500) rarity = 'epic';
        else if (newItem.tier === 'standard' || newItem.price > 200) rarity = 'rare';

        newCollection.push({
          id: newItem.id,
          name: newItem.name,
          category: collectionCategory,
          icon: newItem.icon,
          description: newItem.description,
          rarity,
          obtainedAt: Date.now(),
        });
      }

      let newInventory;
      if (existingItemIndex > -1) {
        newInventory = [...state.inventory];
        newInventory[existingItemIndex] = {
          ...newInventory[existingItemIndex],
          quantity: newInventory[existingItemIndex].quantity + newItem.quantity,
        };
      } else {
        newInventory = [...state.inventory, newItem];
      }

      return {
        ...state,
        inventory: newInventory,
        collection: newCollection,
      };
    }

    case 'USE_ITEM': {
      const item = state.inventory.find(inventoryItem => inventoryItem.id === action.payload);
      const pet = state.pet;
      if (!item || item.quantity <= 0 || !pet) return state;

      // Soft Failure: Calculate effectiveness based on pet behavior
      let effectiveness = 1;
      const behavior = state.petBehavior;

      // Toys (happiness items) are less effective if pet is in a bad mood
      if (item.category === 'happiness') {
        if (behavior === 'sad') effectiveness = 0.5;
        else if (behavior === 'grumpy') effectiveness = 0.6;
        else if (behavior === 'sluggish') effectiveness = 0.7;
      }
      
      // Grooming (cleanliness items) is less effective if pet is grumpy
      if (item.category === 'cleanliness' && behavior === 'grumpy') {
         effectiveness = 0.8;
      }

      const newStats = { ...pet.stats };
      Object.entries(item.effects).forEach(([key, value]) => {
        // Cast to keyof PetStats is safe because effects are Partial<PetStats>
        const statKey = key as keyof PetStats;
        if (value !== undefined) {
          // Apply effectiveness only to positive changes
          const change = value > 0 ? value * effectiveness : value;
          newStats[statKey] = clampStat(newStats[statKey] + change);
        }
      });

      // Grant 5 XP for using items
      const newExperience = pet.experience + 5;
      const { level: newLevel } = calculateLevel(newExperience);

      return {
        ...state,
        pet: { ...pet, stats: newStats, experience: newExperience, level: newLevel },
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

      // Reset daily actions for the new day
      const dailyActionsRemaining = state.dailyActionsMax;

      // Make tomorrow reward available if it exists
      let tomorrowReward = state.tomorrowReward;
      if (tomorrowReward && !tomorrowReward.available && tomorrowReward.claimedDate !== today) {
        tomorrowReward = { ...tomorrowReward, available: true };
      }

      const newState = {
        ...state,
        careStreak: newStreak,
        lastCareDate: today,
        totalDaysPlayed: state.totalDaysPlayed + 1, // Increment days played
        money: state.money + achievementMoney,
        achievements,
        dailyTracking,
        dailyTasks,
        dailyActionsRemaining, // Reset actions
        tomorrowReward,
        // Reset daily bonus claim status
        dailyBonusClaimed: false, 
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

      // Base decay - affected by personality and current behavior
      let decayMultiplier = 1;
      // Sluggish/sad pets decay slower (they're conserving energy)
      if (state.petBehavior === 'sluggish' || state.petBehavior === 'sad') {
        decayMultiplier = 0.7;
      }

      const decay: Partial<PetStats> = {
        hunger: (-2 + (modifiers.hunger || 0)) * decayMultiplier,
        happiness: (-2 + (modifiers.happiness || 0)) * decayMultiplier,
        energy: (-1 + (modifiers.energy || 0)) * decayMultiplier,
        cleanliness: (-2 + (modifiers.cleanliness || 0)) * decayMultiplier,
        // Health drops faster when hunger or cleanliness is critically low
        health: state.pet.stats.hunger < 30 || state.pet.stats.cleanliness < 30 ? -3 : -1,
      };

      const newStats = { ...state.pet.stats };
      Object.entries(decay).forEach(([key, value]) => {
        if (value !== undefined) {
          newStats[key as keyof PetStats] = clampStat(newStats[key as keyof PetStats] + value);
        }
      });

      // Calculate new behavior based on stats
      const avgStats = Object.values(newStats).reduce((sum, v) => sum + v, 0) / 5;
      const lowestStat = Math.min(...Object.values(newStats));
      
      let newBehavior: PetBehavior = 'normal';
      if (lowestStat < 10) {
        newBehavior = 'sad';
      } else if (lowestStat < 20) {
        newBehavior = 'grumpy';
      } else if (newStats.energy < 25) {
        newBehavior = 'sluggish';
      } else if (newStats.happiness < 30) {
        newBehavior = 'disobedient';
      } else if (avgStats >= 80 && newStats.happiness >= 80) {
        newBehavior = 'excited';
      } else if (avgStats >= 60) {
        newBehavior = 'playful';
      }

      // SOFT FAILURE: Pet only dies after EXTREME, prolonged neglect
      // All stats must be critically low (< 5) for death to occur
      // This is MUCH harder to trigger than before
      const isCriticallyNeglected =
        newStats.hunger < 5 &&
        newStats.happiness < 5 &&
        newStats.energy < 5 &&
        newStats.cleanliness < 5 &&
        newStats.health < 5;

      if (isCriticallyNeglected) {
        return {
          ...state,
          pet: { ...state.pet, stats: newStats, lastCaredAt: Date.now() },
          petDead: true,
          petBehavior: 'sad',
        };
      }

      // Add warning notifications for low stats
      let notifications = state.notifications;
      if (lowestStat < 15 && lowestStat >= 5) {
        const lowStatName = Object.entries(newStats).find(([, v]) => v === lowestStat)?.[0];
        const existingWarning = notifications.find(n => 
          n.type === 'alert' && n.title === 'Pet Needs Attention!' && 
          Date.now() - n.timestamp < 60000 // Within last minute
        );
        
        if (!existingWarning && lowStatName) {
          const warning: GameNotification = {
            id: crypto.randomUUID(),
            type: 'alert',
            title: 'Pet Needs Attention!',
            description: `${state.pet.name}'s ${lowStatName} is critically low. They're feeling ${newBehavior}.`,
            icon: '⚠️',
            read: false,
            timestamp: Date.now(),
          };
          notifications = [warning, ...notifications].slice(0, 50);
        }
      }

      return {
        ...state,
        pet: { ...state.pet, stats: newStats, lastCaredAt: Date.now() },
        petBehavior: newBehavior,
        notifications,
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
          ...(action.payload.lifetimeCounters || { totalFeeds: 0, totalPlays: 0, totalGamesWon: 0, weeksUnderBudget: 0 }),
        },
        petAsleep: action.payload.petAsleep || false,
        lastSleepDate: action.payload.lastSleepDate || '',
        petDead: action.payload.petDead || false,
        tutorialCompleted: action.payload.tutorialCompleted ?? (action.payload.gameStarted ? true : false),
        dailyGameRewards: action.payload.dailyGameRewards || {},
        gameTime: action.payload.gameTime || 7 * 60,
        // New feature migrations
        isGuestMode: action.payload.isGuestMode || false,
        dailyActionsRemaining: action.payload.dailyActionsRemaining ?? 15,
        dailyActionsMax: action.payload.dailyActionsMax ?? 15,
        lastActionResetDate: action.payload.lastActionResetDate || '',
        petBehavior: action.payload.petBehavior || 'normal',
        actionLog: action.payload.actionLog || [],
        weeklyGoals: action.payload.weeklyGoals || [],
        weeklyGoalProgress: action.payload.weeklyGoalProgress || {},
        collection: action.payload.collection || [],
        activeRoomTheme: action.payload.activeRoomTheme || null,
        tomorrowReward: action.payload.tomorrowReward || null,
        lastDayRecap: action.payload.lastDayRecap || null,
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
          const timerExpiresAt = timed && taskDef ? now + (taskDef.timeLimitMinutes ?? 0) * 60 * 1000 : null;
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

    // === NEW FEATURE REDUCERS ===

    case 'SET_GUEST_MODE': {
      return {
        ...state,
        isGuestMode: action.payload,
      };
    }

    case 'USE_DAILY_ACTION': {
      if (state.dailyActionsRemaining <= 0) return state;
      return {
        ...state,
        dailyActionsRemaining: state.dailyActionsRemaining - 1,
      };
    }

    case 'RESET_DAILY_ACTIONS': {
      const today = new Date().toDateString();
      if (state.lastActionResetDate === today) return state;
      return {
        ...state,
        dailyActionsRemaining: state.dailyActionsMax,
        lastActionResetDate: today,
      };
    }

    case 'UPDATE_PET_BEHAVIOR': {
      if (!state.pet) return state;
      const stats = state.pet.stats;
      const avgStats = Object.values(stats).reduce((sum, v) => sum + v, 0) / 5;
      const lowestStat = Math.min(...Object.values(stats));
      
      let behavior: PetBehavior = 'normal';
      
      // Priority-based behavior assignment
      if (lowestStat < 10) {
        behavior = 'sad';
      } else if (lowestStat < 20) {
        behavior = 'grumpy';
      } else if (stats.energy < 25) {
        behavior = 'sluggish';
      } else if (stats.happiness < 30) {
        behavior = 'disobedient';
      } else if (avgStats >= 80 && stats.happiness >= 80) {
        behavior = 'excited';
      } else if (avgStats >= 60) {
        behavior = 'playful';
      }
      
      return {
        ...state,
        petBehavior: behavior,
      };
    }

    case 'ADD_ACTION_LOG': {
      const newLog = [action.payload, ...state.actionLog].slice(0, 50); // Keep last 50 entries
      return {
        ...state,
        actionLog: newLog,
      };
    }

    case 'INIT_WEEKLY_GOALS': {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Sunday
      const weekStartStr = weekStart.toDateString();
      
      // Check if we already have goals for this week
      if (state.weeklyGoals.length > 0 && state.weeklyGoals[0].startDate === weekStartStr) {
        return state;
      }
      
      // Generate new weekly goals
      const newGoals: WeeklyGoal[] = [
        {
          id: 'weekly-health-80',
          name: 'Healthy Week',
          description: 'Keep health above 80% for 7 days',
          icon: '❤️',
          type: 'health',
          target: 80,
          currentValue: state.pet?.stats.health ?? 0,
          startDate: weekStartStr,
          daysCompleted: 0,
          completed: false,
          reward: { xp: 100, money: 50 },
        },
        {
          id: 'weekly-streak-7',
          name: 'Care Champion',
          description: 'Maintain a 7-day care streak',
          icon: '🔥',
          type: 'streak',
          target: 7,
          currentValue: state.careStreak,
          startDate: weekStartStr,
          daysCompleted: 0,
          completed: false,
          reward: { xp: 150, money: 75 },
        },
        {
          id: 'weekly-budget',
          name: 'Budget Master',
          description: 'Stay under budget for the week',
          icon: '💰',
          type: 'savings',
          target: state.weeklyBudget,
          currentValue: state.weeklySpent,
          startDate: weekStartStr,
          daysCompleted: 0,
          completed: false,
          reward: { xp: 100, money: 100 },
        },
      ];
      
      return {
        ...state,
        weeklyGoals: newGoals,
        weeklyGoalProgress: {},
      };
    }

    case 'UPDATE_WEEKLY_GOALS': {
      if (state.weeklyGoals.length === 0) return state;
      
      const today = new Date().toDateString();
      const updatedGoals = state.weeklyGoals.map(goal => {
        if (goal.completed) return goal;
        
        let currentValue = goal.currentValue;
        let daysCompleted = goal.daysCompleted;
        
        switch (goal.type) {
          case 'health':
            currentValue = state.pet?.stats.health ?? 0;
            // Check if today's health met the target
            const todayProgress = state.weeklyGoalProgress[goal.id] || [];
            if (!todayProgress.includes(today as unknown as number) && currentValue >= goal.target) {
              daysCompleted++;
            }
            break;
          case 'streak':
            currentValue = state.careStreak;
            daysCompleted = Math.min(currentValue, 7);
            break;
          case 'savings':
            currentValue = state.weeklySpent;
            break;
        }
        
        const completed = goal.type === 'savings' 
          ? currentValue <= goal.target && state.totalDaysPlayed % 7 === 0
          : daysCompleted >= 7;
        
        return { ...goal, currentValue, daysCompleted, completed };
      });
      
      return {
        ...state,
        weeklyGoals: updatedGoals,
      };
    }

    case 'CLAIM_WEEKLY_GOAL': {
      const goalId = action.payload;
      const goal = state.weeklyGoals.find(g => g.id === goalId);
      if (!goal || !goal.completed) return state;
      
      const updatedGoals = state.weeklyGoals.filter(g => g.id !== goalId);
      const resultState = addXpToPet(state, goal.reward.xp);
      
      const notification: GameNotification = {
        id: crypto.randomUUID(),
        type: 'milestone',
        title: 'Weekly Goal Complete!',
        description: `${goal.name} — +${goal.reward.xp} XP, +$${goal.reward.money}`,
        icon: '🎯',
        read: false,
        timestamp: Date.now(),
      };
      
      return {
        ...resultState,
        weeklyGoals: updatedGoals,
        money: resultState.money + goal.reward.money,
        notifications: [notification, ...resultState.notifications].slice(0, 50),
      };
    }

    case 'ADD_TO_COLLECTION': {
      const existing = state.collection.find(item => item.id === action.payload.id);
      if (existing) return state;
      
      return {
        ...state,
        collection: [...state.collection, action.payload],
      };
    }

    case 'SET_ROOM_THEME': {
      return {
        ...state,
        activeRoomTheme: action.payload,
      };
    }

    case 'GENERATE_TOMORROW_REWARD': {
      const today = new Date().toDateString();
      if (state.tomorrowReward?.claimedDate === today) return state;
      
      // Generate a random reward type
      const rewardTypes: Array<'money' | 'xp' | 'discount'> = ['money', 'xp', 'discount'];
      const type = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
      
      let value = 0;
      let description = '';
      
      switch (type) {
        case 'money':
          value = 15 + Math.floor(Math.random() * 20);
          description = `$${value} bonus cash`;
          break;
        case 'xp':
          value = 20 + Math.floor(Math.random() * 30);
          description = `${value} XP boost`;
          break;
        case 'discount':
          value = 10 + Math.floor(Math.random() * 15);
          description = `${value}% shop discount`;
          break;
      }
      
      return {
        ...state,
        tomorrowReward: {
          available: true,
          type,
          value,
          description,
        },
      };
    }

    case 'CLAIM_TOMORROW_REWARD': {
      if (!state.tomorrowReward?.available) return state;
      
      const today = new Date().toDateString();
      const reward = state.tomorrowReward;
      
      let resultState = { ...state };
      
      switch (reward.type) {
        case 'money':
          resultState.money += reward.value;
          break;
        case 'xp':
          resultState = addXpToPet(resultState, reward.value);
          break;
        case 'discount':
          resultState.activeShopDiscount = Math.max(resultState.activeShopDiscount, reward.value);
          break;
      }
      
      const notification: GameNotification = {
        id: crypto.randomUUID(),
        type: 'milestone',
        title: 'Welcome Back!',
        description: `You claimed: ${reward.description}`,
        icon: '🎁',
        read: false,
        timestamp: Date.now(),
      };
      
      return {
        ...resultState,
        tomorrowReward: { ...reward, available: false, claimedDate: today },
        notifications: [notification, ...resultState.notifications].slice(0, 50),
      };
    }

    case 'GENERATE_DAY_RECAP': {
      if (!state.pet) return state;
      
      const today = new Date().toDateString();
      if (state.lastDayRecap?.date === today) return state;
      
      const stats = state.pet.stats;
      const avgStats = Object.values(stats).reduce((sum, v) => sum + v, 0) / 5;
      const lowestStat = Math.min(...Object.values(stats));
      
      let moodScore = Math.round(avgStats);
      let summary = '';
      
      if (lowestStat < 20) {
        summary = `${state.pet.name} had a rough day and needs more attention. Some stats got critically low.`;
        moodScore = Math.round(lowestStat);
      } else if (avgStats >= 80) {
        summary = `${state.pet.name} had an amazing day! Thriving and full of energy.`;
      } else if (avgStats >= 60) {
        summary = `${state.pet.name} had a good day. Well cared for and content.`;
      } else if (avgStats >= 40) {
        summary = `${state.pet.name} had an okay day, but could use more attention tomorrow.`;
      } else {
        summary = `${state.pet.name} felt a bit neglected today. Try to care for them more tomorrow.`;
      }
      
      return {
        ...state,
        lastDayRecap: {
          summary,
          moodScore,
          date: today,
        },
      };
    }

    default:
      return state;
  }
}
