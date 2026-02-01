import { DailyTaskDef, MilestoneDef, DailyTracking, GameState } from '@/types/game';

// ── Daily Task Pool (12 tasks, 5 selected per day) ──────────────────────

export const DAILY_TASK_POOL: DailyTaskDef[] = [
  // Easy tasks (target low, common actions)
  { id: 'feed-3', name: 'Hungry Helper', description: 'Feed your pet 3 times', icon: '🍖', trackingKey: 'feedCount', target: 3, xpReward: 15, difficulty: 'easy' },
  { id: 'play-2', name: 'Playtime Pal', description: 'Play with your pet 2 times', icon: '🎾', trackingKey: 'playCount', target: 2, xpReward: 15, difficulty: 'easy' },
  { id: 'clean-2', name: 'Squeaky Clean', description: 'Clean your pet 2 times', icon: '🧼', trackingKey: 'cleanCount', target: 2, xpReward: 15, difficulty: 'easy' },
  { id: 'rest-2', name: 'Nap Time', description: 'Let your pet rest 2 times', icon: '😴', trackingKey: 'restCount', target: 2, xpReward: 15, difficulty: 'easy' },
  { id: 'use-item-2', name: 'Item User', description: 'Use 2 items from inventory', icon: '🎁', trackingKey: 'itemsUsed', target: 2, xpReward: 15, difficulty: 'easy' },
  { id: 'game-1', name: 'Game On', description: 'Play 1 mini-game', icon: '🎮', trackingKey: 'gamesPlayed', target: 1, xpReward: 15, difficulty: 'easy' },
  // Hard tasks (higher targets) - these are timed with 10-minute limits
  { id: 'feed-5', name: 'Master Chef', description: 'Feed your pet 5 times', icon: '👨‍🍳', trackingKey: 'feedCount', target: 5, xpReward: 15, difficulty: 'hard', timeLimitMinutes: 10 },
  { id: 'play-4', name: 'Fun Machine', description: 'Play with your pet 4 times', icon: '🎪', trackingKey: 'playCount', target: 4, xpReward: 15, difficulty: 'hard', timeLimitMinutes: 10 },
  { id: 'buy-3', name: 'Shopping Spree', description: 'Buy 3 items from the shop', icon: '🛒', trackingKey: 'itemsBought', target: 3, xpReward: 15, difficulty: 'hard', timeLimitMinutes: 10 },
  { id: 'spend-50', name: 'Big Spender', description: 'Spend $50 today', icon: '💸', trackingKey: 'moneySpent', target: 50, xpReward: 15, difficulty: 'hard', timeLimitMinutes: 10 },
  { id: 'game-3', name: 'Arcade Star', description: 'Play 3 mini-games', icon: '⭐', trackingKey: 'gamesPlayed', target: 3, xpReward: 15, difficulty: 'hard', timeLimitMinutes: 10 },
  { id: 'vet-1', name: 'Health Check', description: 'Take your pet to the vet', icon: '🏥', trackingKey: 'vetCount', target: 1, xpReward: 15, difficulty: 'easy' },
];

// ── Milestones (12, in 3 tiers) ─────────────────────────────────────────

export const MILESTONES: MilestoneDef[] = [
  // Tier 1 — Beginner
  { id: 'ms-feed-10', name: 'Well Fed', description: 'Feed your pet 10 times total', icon: '🍖', tier: 1, xpReward: 50, moneyReward: 10, checkFn: 'feedCount10' },
  { id: 'ms-play-10', name: 'Best Friend', description: 'Play with your pet 10 times', icon: '🎾', tier: 1, xpReward: 50, moneyReward: 10, checkFn: 'playCount10' },
  { id: 'ms-level-3', name: 'Rising Star', description: 'Reach level 3', icon: '⭐', tier: 1, xpReward: 50, moneyReward: 15, checkFn: 'level3' },
  { id: 'ms-streak-3', name: 'Consistent Carer', description: 'Achieve a 3-day care streak', icon: '🔥', tier: 1, xpReward: 50, moneyReward: 10, checkFn: 'streak3' },
  // Tier 2 — Intermediate
  { id: 'ms-feed-50', name: 'Gourmet Pet', description: 'Feed your pet 50 times total', icon: '👨‍🍳', tier: 2, xpReward: 100, moneyReward: 25, checkFn: 'feedCount50' },
  { id: 'ms-play-50', name: 'Play Champion', description: 'Play with your pet 50 times', icon: '🏅', tier: 2, xpReward: 100, moneyReward: 25, checkFn: 'playCount50' },
  { id: 'ms-level-5', name: 'Veteran Owner', description: 'Reach level 5', icon: '🌟', tier: 2, xpReward: 100, moneyReward: 30, checkFn: 'level5' },
  { id: 'ms-streak-7', name: 'Dedicated Carer', description: 'Achieve a 7-day care streak', icon: '💪', tier: 2, xpReward: 100, moneyReward: 25, checkFn: 'streak7' },
  // Tier 3 — Expert
  { id: 'ms-feed-100', name: 'Feeding Legend', description: 'Feed your pet 100 times total', icon: '🏆', tier: 3, xpReward: 200, moneyReward: 50, checkFn: 'feedCount100' },
  { id: 'ms-play-100', name: 'Play Legend', description: 'Play 100 times total', icon: '👑', tier: 3, xpReward: 200, moneyReward: 50, checkFn: 'playCount100' },
  { id: 'ms-level-10', name: 'Master Owner', description: 'Reach level 10', icon: '💎', tier: 3, xpReward: 200, moneyReward: 75, checkFn: 'level10' },
  { id: 'ms-streak-14', name: 'Unwavering Carer', description: 'Achieve a 14-day care streak', icon: '🔥', tier: 3, xpReward: 200, moneyReward: 50, checkFn: 'streak14' },
];

// ── Seeded random daily task selection ────────────────────────────────────

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return () => {
    hash = (hash * 1664525 + 1013904223) | 0;
    return ((hash >>> 0) / 4294967296);
  };
}

export function selectDailyTasks(date: string): string[] {
  const random = seededRandom(date);
  const pool = [...DAILY_TASK_POOL];
  const selected: string[] = [];

  for (let i = 0; i < 5 && pool.length > 0; i++) {
    const index = Math.floor(random() * pool.length);
    selected.push(pool[index].id);
    pool.splice(index, 1);
  }

  return selected;
}

// ── Level calculation ─────────────────────────────────────────────────────

export function calculateLevel(totalXp: number): { level: number; currentXp: number; xpForNext: number } {
  let level = 1;
  let xpRemaining = totalXp;

  while (xpRemaining >= 30 * level) {
    xpRemaining -= 30 * level;
    level++;
  }

  return {
    level,
    currentXp: xpRemaining,
    xpForNext: 30 * level,
  };
}

// ── Milestone check functions ─────────────────────────────────────────────

// Cumulative counters tracked across the lifetime of the game are stored
// separately from DailyTracking. We derive milestone checks from GameState.
// The milestone checks use lifetime counters stored in GameState.

export interface LifetimeCounters {
  totalFeeds: number;
  totalPlays: number;
}

export function checkMilestone(checkFn: string, state: GameState, lifetimeCounters: LifetimeCounters): boolean {
  const level = state.pet ? calculateLevel(state.pet.experience).level : 1;
  const streak = state.careStreak;

  switch (checkFn) {
    case 'feedCount10': return lifetimeCounters.totalFeeds >= 10;
    case 'feedCount50': return lifetimeCounters.totalFeeds >= 50;
    case 'feedCount100': return lifetimeCounters.totalFeeds >= 100;
    case 'playCount10': return lifetimeCounters.totalPlays >= 10;
    case 'playCount50': return lifetimeCounters.totalPlays >= 50;
    case 'playCount100': return lifetimeCounters.totalPlays >= 100;
    case 'level3': return level >= 3;
    case 'level5': return level >= 5;
    case 'level10': return level >= 10;
    case 'streak3': return streak >= 3;
    case 'streak7': return streak >= 7;
    case 'streak14': return streak >= 14;
    default: return false;
  }
}

// ── Default daily tracking ────────────────────────────────────────────────

export const DEFAULT_DAILY_TRACKING: DailyTracking = {
  date: '',
  feedCount: 0,
  playCount: 0,
  cleanCount: 0,
  restCount: 0,
  vetCount: 0,
  itemsBought: 0,
  moneySpent: 0,
  gamesPlayed: 0,
  highScore: 0,
  itemsUsed: 0,
};
