import { GameState, Achievement, Transaction, DailyTask, DailyTracking, MilestoneState, GameNotification } from '@/types/game';
import { SHOP_ITEMS } from '@/data/shopItems';
import { selectDailyTasks, calculateLevel, DAILY_TASK_POOL, MILESTONES, checkMilestone, DEFAULT_DAILY_TRACKING, LifetimeCounters } from '@/data/tasks';

export const ACHIEVEMENT_REWARD = 10;

export const MEAL_WINDOWS = [
  { name: 'breakfast' as const, start: 420, end: 540 },
  { name: 'lunch' as const, start: 720, end: 840 },
  { name: 'dinner' as const, start: 1080, end: 1200 },
];

export type MealName = 'breakfast' | 'lunch' | 'dinner';
export type MealsEatenToday = { breakfast: boolean; lunch: boolean; dinner: boolean };

/** Returns the meal name if gameTime falls within a meal window, or null. */
export function getMealForTime(gameTime: number): MealName | null {
  for (const meal of MEAL_WINDOWS) {
    if (gameTime >= meal.start && gameTime < meal.end) {
      return meal.name;
    }
  }
  return null;
}

/** Returns meal names whose windows were crossed (end boundary passed) between oldTime and newTime, and weren't eaten. */
export function getSkippedMeals(
  oldTime: number,
  newTime: number,
  mealsEaten: MealsEatenToday
): MealName[] {
  const skipped: MealName[] = [];
  for (const meal of MEAL_WINDOWS) {
    // The meal window's end was crossed if oldTime < end <= newTime
    // Also handle midnight wrap: if newTime < oldTime, we wrapped around
    const crossed = newTime >= oldTime
      ? oldTime < meal.end && newTime >= meal.end
      : oldTime < meal.end || newTime >= meal.end;
    if (crossed && !mealsEaten[meal.name]) {
      skipped.push(meal.name);
    }
  }
  return skipped;
}
export const MAX_TRANSACTIONS = 200;

export const clampStat = (value: number): number => Math.max(0, Math.min(100, value));

export const appendTransaction = (transactions: Transaction[], newTransaction: Transaction): Transaction[] => {
  const updated = [...transactions, newTransaction];
  if (updated.length > MAX_TRANSACTIONS) {
    return updated.slice(updated.length - MAX_TRANSACTIONS);
  }
  return updated;
};

/** Unlock an achievement in the array and return [updatedAchievements, moneyEarned]. */
export function unlockAchievementInList(
  achievements: Achievement[],
  achievementId: string
): [Achievement[], number] {
  const achievement = achievements.find(entry => entry.id === achievementId);
  if (!achievement || achievement.unlocked) return [achievements, 0];
  return [
    achievements.map(entry =>
      entry.id === achievementId ? { ...entry, unlocked: true, unlockedAt: Date.now() } : entry
    ),
    ACHIEVEMENT_REWARD,
  ];
}

export function ensureDailyTracking(state: GameState): DailyTracking {
  const today = new Date().toDateString();
  if (state.dailyTracking && state.dailyTracking.date === today) {
    return state.dailyTracking;
  }
  return { ...DEFAULT_DAILY_TRACKING, date: today };
}

export function ensureDailyTasks(state: GameState): DailyTask[] {
  const today = new Date().toDateString();
  if (state.dailyTasks.length > 0 && state.dailyTracking?.date === today) {
    return state.dailyTasks;
  }
  const taskIds = selectDailyTasks(today);
  const now = Date.now();
  return taskIds.map(id => {
    const taskDef = DAILY_TASK_POOL.find(definition => definition.id === id);
    const timed = !!(taskDef?.timeLimitMinutes);
    const timerExpiresAt = timed && taskDef ? now + taskDef.timeLimitMinutes * 60 * 1000 : null;
    return { id, progress: 0, completed: false, claimed: false, timed, timerExpiresAt };
  });
}

export function ensureMilestones(state: GameState): MilestoneState[] {
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

export function addXpToPet(state: GameState, xpAmount: number): GameState {
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
      id: crypto.randomUUID(),
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

export function checkAllMilestones(state: GameState): GameState {
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

      let description = `${milestoneDef.name}: +${milestoneDef.xpReward} XP, +$${milestoneDef.moneyReward}`;

      // Handle item rewards
      if (milestoneDef.itemRewards && milestoneDef.itemRewards.length > 0) {
        const newInventory = [...resultState.inventory];
        let itemsAddedCount = 0;

        milestoneDef.itemRewards.forEach(itemId => {
          const shopItem = SHOP_ITEMS.find(entry => entry.id === itemId);
          if (shopItem) {
            const existingItemIndex = newInventory.findIndex(entry => entry.id === itemId);
            if (existingItemIndex >= 0) {
              newInventory[existingItemIndex] = {
                ...newInventory[existingItemIndex],
                quantity: newInventory[existingItemIndex].quantity + 1
              };
            } else {
              newInventory.push({ ...shopItem, quantity: 1 });
            }
            itemsAddedCount++;
          }
        });

        resultState = {
          ...resultState,
          inventory: newInventory
        };

        if (itemsAddedCount > 0) {
          description += `, +${itemsAddedCount} Items!`;
        }
      }

      resultState = {
        ...resultState,
        money: resultState.money + milestoneDef.moneyReward,
      };

      const notification: GameNotification = {
        id: crypto.randomUUID(),
        type: 'milestone',
        title: 'Milestone Complete!',
        description: description,
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
