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
  category: 'hunger' | 'happiness' | 'cleanliness' | 'health' | 'energy' | 'accessory' | 'room_theme';
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
  discountEffect?: number;
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
  rewardType?: 'xp' | 'discount';
  discountValue?: number; // Percentage (e.g., 10 for 10% off)
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
  itemRewards?: string[];
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
  catchGamePlayed: number;
  memoryGamePlayed: number;
  quizGamePlayed: number;
  whackGamePlayed: number;
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

// Pet behavior/mood state for soft failure
export type PetBehavior = 'normal' | 'sluggish' | 'disobedient' | 'sad' | 'grumpy' | 'playful' | 'excited';

// Action log entry
export interface ActionLogEntry {
  id: string;
  timestamp: number;
  gameTime: number;
  action: string;
  description: string;
  statChanges?: Partial<PetStats>;
  icon: string;
}

// Weekly goal tracking
export interface WeeklyGoal {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'health' | 'streak' | 'savings' | 'care';
  target: number;
  currentValue: number;
  startDate: string;
  daysCompleted: number; // Days the goal was met
  completed: boolean;
  reward: { xp: number; money: number };
}

// Collection item (owned cosmetics, toys, etc.)
export interface CollectionItem {
  id: string;
  name: string;
  category: 'toy' | 'outfit' | 'room_theme' | 'decoration';
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  passiveEffect?: { stat: keyof PetStats; bonus: number };
  obtainedAt: number;
  equipped?: boolean;
}

// Tomorrow reward for comeback incentive
export interface TomorrowReward {
  available: boolean;
  type: 'money' | 'item' | 'xp' | 'discount';
  value: number;
  description: string;
  claimedDate?: string;
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
  activeShopDiscount: number; // Percentage discount (0-100)
  lifetimeCounters: {
    totalFeeds: number;
    totalPlays: number;
    totalGamesWon: number;
    weeksUnderBudget: number;
  };
  petAsleep: boolean;
  lastSleepDate: string;
  petDead: boolean;
  tutorialCompleted: boolean;
  dailyGameRewards: Record<string, string>;
  gameTime: number; // Minutes from 00:00 (0-1439)
  mealsEatenToday: { breakfast: boolean; lunch: boolean; dinner: boolean };
  playWindowsSatisfied: boolean[];
  // New features
  isGuestMode: boolean; // Playing without an account
  dailyActionsRemaining: number; // Limited actions per day (adds pressure)
  dailyActionsMax: number; // Maximum actions per day
  lastActionResetDate: string; // When actions were last reset
  petBehavior: PetBehavior; // Current pet mood/behavior
  actionLog: ActionLogEntry[]; // Recent action history
  weeklyGoals: WeeklyGoal[]; // Weekly challenge goals
  weeklyGoalProgress: Record<string, string[]>; // Maps goal.id → array of toDateString() values for days the goal was met
  collection: CollectionItem[]; // Owned collectibles
  activeRoomTheme: string | null; // Currently active room theme
  tomorrowReward: TomorrowReward | null; // Comeback incentive
  lastDayRecap: { summary: string; moodScore: number; date: string } | null;
}

// Personality modifiers
export const PERSONALITY_MODIFIERS: Record<Personality, Partial<Record<keyof PetStats, number>>> = {
  playful: { energy: -2, happiness: 1 }, // Loses energy faster, gains happiness easier
  calm: { hunger: -0.5, energy: -0.5 }, // Gets hungry slower, loses energy slower
  curious: { happiness: -1, cleanliness: -1 }, // Needs more stimulation, gets dirty faster
  lazy: { energy: 0.5, hunger: -1 }, // Regains energy faster, gets hungry slower
};

// Growth stage thresholds (level-based)
export const GROWTH_THRESHOLDS = {
  baby: 0,
  teen: 3,
  adult: 5,
};

// XP needed to reach a given level: 15 * level
export const XP_PER_LEVEL = (level: number): number => 15 * level;

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
