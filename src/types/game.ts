// Game Types for Paws Up

export type Species = 'dog' | 'cat' | 'rabbit' | 'hamster';
export type Personality = 'playful' | 'calm' | 'curious' | 'lazy';
export type GrowthStage = 'baby' | 'teen' | 'adult';
export type PetGender = 'male' | 'female' | 'neutral';
export type PetColor = 'blue' | 'green' | 'brown' | 'gray' | 'pink' | 'purple' | 'peach' | 'white' | 'yellow' | 'teal' | 'golden' | 'cream';
export type AccessorySlot = 'head' | 'neck' | 'body' | 'tag';

export interface EquippedAccessories {
  head?: string;
  neck?: string;
  body?: string;
  tag?: string;
}

export interface AccessoryDef {
  id: string;
  name: string;
  emoji: string;
  slot: AccessorySlot;
  genderFilter: 'male' | 'female' | 'both';
  price: number;
  tier: 'basic' | 'standard' | 'deluxe';
  description: string;
  condition?: {
    stat: keyof PetStats;
    min: number;
  };
}

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
  gender: PetGender;
  color: PetColor;
  personality: Personality;
  stage: GrowthStage;
  stats: PetStats;
  experience: number;
  level: number;
  equippedAccessories: EquippedAccessories;
  createdAt: number;
  lastCaredAt: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'hunger' | 'happiness' | 'cleanliness' | 'health' | 'energy' | 'accessory';
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
  timeLimitMinutes?: number;
}

// Active daily task instance (in game state)
export interface DailyTask {
  id: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  timed: boolean;
  timerExpiresAt: number | null;
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
  petAsleep: boolean;
  lastSleepDate: string;
  petDead: boolean;
  tutorialCompleted: boolean;
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
  teen: 50,
  adult: 150,
};

// XP needed to reach a given level: 30 * level
export const XP_PER_LEVEL = (level: number): number => 30 * level;

// Gender-based color palettes
export const GENDER_COLORS: Record<PetGender, { color: PetColor; name: string; hex: string }[]> = {
  male: [
    { color: 'blue', name: 'Blue', hex: '#5B8FB9' },
    { color: 'green', name: 'Green', hex: '#6B8E6B' },
    { color: 'brown', name: 'Brown', hex: '#8B6F5C' },
    { color: 'gray', name: 'Gray', hex: '#8B9A8E' },
  ],
  female: [
    { color: 'pink', name: 'Pink', hex: '#E8A0BF' },
    { color: 'purple', name: 'Purple', hex: '#B08BBF' },
    { color: 'peach', name: 'Peach', hex: '#F5C6AA' },
    { color: 'white', name: 'White', hex: '#FAF8F5' },
  ],
  neutral: [
    { color: 'yellow', name: 'Yellow', hex: '#E8D44D' },
    { color: 'teal', name: 'Teal', hex: '#5FABA1' },
    { color: 'golden', name: 'Golden', hex: '#D4A574' },
    { color: 'cream', name: 'Cream', hex: '#F5E6D3' },
  ],
};
