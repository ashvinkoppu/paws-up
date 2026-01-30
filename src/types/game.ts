// Game Types for Paws & Prosper

export type Species = 'dog' | 'cat' | 'rabbit' | 'hamster';
export type Personality = 'playful' | 'calm' | 'curious' | 'lazy';
export type GrowthStage = 'baby' | 'teen' | 'adult';
export type PetColor = 'golden' | 'cream' | 'gray' | 'brown' | 'white' | 'black' | 'orange';

export interface PetStats {
  hunger: number; // 0-100
  happiness: number; // 0-100
  energy: number; // 0-100
  cleanliness: number; // 0-100
  health: number; // 0-100
}

export interface Pet {
  id: string;
  name: string;
  species: Species;
  color: PetColor;
  personality: Personality;
  stage: GrowthStage;
  stats: PetStats;
  experience: number;
  level: number;
  createdAt: number;
  lastCaredAt: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'toy' | 'grooming' | 'medicine' | 'accessory';
  tier: 'basic' | 'standard' | 'deluxe';
  effects: Partial<PetStats>;
  icon: string;
}

export interface InventoryItem extends ShopItem {
  quantity: number;
}

export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  category: string;
  amount: number;
  description: string;
  timestamp: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface RandomEvent {
  id: string;
  title: string;
  description: string;
  type: 'emergency' | 'discount' | 'sickness' | 'broken' | 'reward' | 'opportunity';
  choices: EventChoice[];
}

export interface EventChoice {
  text: string;
  cost?: number;
  effects?: Partial<PetStats>;
  moneyEffect?: number;
  message: string;
}

// Daily task definition (the pool template)
export interface DailyTaskDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  trackingKey: string;
  target: number;
  xpReward: number;
  difficulty: 'easy' | 'hard';
}

// Active daily task instance (in game state)
export interface DailyTask {
  id: string;
  progress: number;
  completed: boolean;
}

// Milestone definition
export interface MilestoneDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 1 | 2 | 3;
  xpReward: number;
  moneyReward: number;
  checkFn: string;
}

// Milestone state (in game state)
export interface MilestoneState {
  id: string;
  completed: boolean;
  completedAt?: number;
}

// Task tracking counters (reset daily)
export interface DailyTracking {
  date: string;
  feedCount: number;
  playCount: number;
  cleanCount: number;
  restCount: number;
  vetCount: number;
  itemsBought: number;
  moneySpent: number;
  gamesPlayed: number;
  highScore: number;
  itemsUsed: number;
}

export type NotificationType = 'achievement' | 'alert' | 'purchase' | 'event' | 'milestone' | 'levelup';

export interface GameNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  icon: string;
  read: boolean;
  timestamp: number;
}

export interface GameState {
  pet: Pet | null;
  money: number;
  weeklyBudget: number;
  weeklySpent: number;
  inventory: InventoryItem[];
  transactions: Transaction[];
  achievements: Achievement[];
  notifications: GameNotification[];
  careStreak: number;
  lastCareDate: string;
  totalDaysPlayed: number;
  gameStarted: boolean;
  currentEvent: RandomEvent | null;
  highScores: Record<string, number>;
  dailyTasks: DailyTask[];
  dailyTracking: DailyTracking;
  milestones: MilestoneState[];
  dailyBonusClaimed: boolean;
  lifetimeCounters: {
    totalFeeds: number;
    totalPlays: number;
  };
}

// Personality modifiers
export const PERSONALITY_MODIFIERS: Record<Personality, Partial<Record<keyof PetStats, number>>> = {
  playful: { energy: -2, happiness: 1 }, // Loses energy faster, gains happiness easier
  calm: { hunger: -0.5, energy: -0.5 }, // Gets hungry slower, loses energy slower
  curious: { happiness: -1, cleanliness: -1 }, // Needs more stimulation, gets dirty faster
  lazy: { energy: 0.5, hunger: -1 }, // Regains energy faster, gets hungry slower
};

// Growth stage thresholds
export const GROWTH_THRESHOLDS = {
  baby: 0,
  teen: 100,
  adult: 300,
};

// XP needed to reach a given level: 50 * level
export const XP_PER_LEVEL = (level: number): number => 50 * level;
