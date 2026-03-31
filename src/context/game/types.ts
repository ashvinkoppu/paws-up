/**
 * Game Context Types - central type definitions for the game state layer.
 *
 * Contains:
 * - `initialState`          - default values used when no save data exists.
 * - `GameAction`            - discriminated union of every reducer action.
 * - `ActionFeedbackEvent`   - lightweight data object surfaced by the UI
 *                             layer after the player performs an action.
 * - `GameContextType`       - shape of the React context value consumed
 *                             by `useGame()`.
 *
 * @module context/game/types
 */
import { GameState, Pet, PetStats, Transaction, RandomEvent, InventoryItem, GameNotification, DailyTask, DailyTracking, AccessorySlot, ActionLogEntry, WeeklyGoal, CollectionItem } from '@/types/game';
import { INITIAL_ACHIEVEMENTS } from '@/data/achievements';
import { DEFAULT_DAILY_TRACKING } from '@/data/tasks';

/**
 * Default game state used for brand-new games or after a reset.
 *
 * All monetary values are in the game's dollar unit.
 * Stats start at 50/100 (set in `createPet`), time at 7:00 AM,
 * and the player receives 15 daily actions.
 */
export const initialState: GameState = {
  pet: null,
  /** Starting cash for a new player */
  money: 100,
  /** Weekly spending budget cap */
  weeklyBudget: 300,
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
  activeShopDiscount: 0,
  lifetimeCounters: { totalFeeds: 0, totalPlays: 0, totalGamesWon: 0, weeksUnderBudget: 0 },
  petAsleep: false,
  lastSleepDate: '',
  petDead: false,
  tutorialCompleted: false,
  dailyGameRewards: {},
  gameTime: 7 * 60, // Start at 7:00 AM
  mealsEatenToday: { breakfast: false, lunch: false, dinner: false },
  playWindowsSatisfied: [false, false, false],
  // New features
  dailyActionsRemaining: 15, // 15 actions per day
  dailyActionsMax: 15,
  lastActionResetDate: '',
  petBehavior: 'normal',
  actionLog: [],
  weeklyGoals: [],
  weeklyGoalProgress: {},
  collection: [],
  activeRoomTheme: null,
  tomorrowReward: null,
  lastDayRecap: null,
};

/**
 * Discriminated union of every action the game reducer can handle.
 *
 * Each variant is a plain object with a `type` string literal and an
 * optional `payload`. New features should add their actions at the bottom
 * of this union and implement the matching case in `reducer.ts`.
 */
export type GameAction =
  | { type: 'CREATE_PET'; payload: Pet }
  | { type: 'UPDATE_STATS'; payload: Partial<PetStats> }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_MONEY'; payload: number }
  | { type: 'SPEND_MONEY'; payload: { amount: number; category: string; description: string } }
  | { type: 'ADD_TO_INVENTORY'; payload: InventoryItem }
  | { type: 'USE_ITEM'; payload: string }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'TRIGGER_EVENT'; payload: RandomEvent }
  | { type: 'CLEAR_EVENT'; payload?: { discount?: number } }
  | { type: 'UPDATE_CARE_STREAK' }
  | { type: 'CHECK_GROWTH' }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'RESET_WEEKLY_BUDGET' }
  | { type: 'UPDATE_HIGH_SCORE'; payload: { gameId: string; score: number } }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<GameNotification, 'id' | 'read' | 'timestamp'> }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'DECAY_STATS' }
  | { type: 'TRACK_ACTION'; payload: { key: keyof DailyTracking; amount?: number } }
  | { type: 'CLAIM_DAILY_BONUS' }
  | { type: 'RESET_DAILY_TASKS' }
  | { type: 'CHECK_MILESTONES' }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'INCREMENT_LIFETIME_COUNTER'; payload: { counter: 'totalFeeds' | 'totalPlays' | 'totalGamesWon' | 'weeksUnderBudget'; amount?: number } }
  | { type: 'CLAIM_DAILY_TASK'; payload: string }
  | { type: 'EQUIP_ACCESSORY'; payload: { slot: AccessorySlot; accessoryId: string } }
  | { type: 'UNEQUIP_ACCESSORY'; payload: AccessorySlot }
  | { type: 'PUT_PET_TO_SLEEP' }
  | { type: 'EXPIRE_TIMED_TASK'; payload: string }
  | { type: 'WAKE_PET_UP' }
  | { type: 'PET_DIED' }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'RESTART_TUTORIAL' }
  | { type: 'CLAIM_GAME_REWARD'; payload: { gameId: string; amount: number } }
  | { type: 'UPDATE_GAME_TIME'; payload: number }
  // New actions
  | { type: 'USE_DAILY_ACTION' }
  | { type: 'RESET_DAILY_ACTIONS' }
  | { type: 'UPDATE_PET_BEHAVIOR' }
  | { type: 'ADD_ACTION_LOG'; payload: ActionLogEntry }
  | { type: 'INIT_WEEKLY_GOALS' }
  | { type: 'UPDATE_WEEKLY_GOALS' }
  | { type: 'CLAIM_WEEKLY_GOAL'; payload: string }
  | { type: 'ADD_TO_COLLECTION'; payload: CollectionItem }
  | { type: 'SET_ROOM_THEME'; payload: string | null }
  | { type: 'GENERATE_TOMORROW_REWARD' }
  | { type: 'CLAIM_TOMORROW_REWARD' }
  | { type: 'GENERATE_DAY_RECAP' }
  | { type: 'SATISFY_PLAY_WINDOW'; payload: number }
  | { type: 'PENALIZE_MISSED_PLAY_WINDOW'; payload: number }
  | { type: 'RESET_PLAY_WINDOWS' };

/**
 * Lightweight event emitted after a player action so the UI can
 * display contextual animations or stat-change toasts.
 */
export interface ActionFeedbackEvent {
  /** The type of action performed (e.g. 'feed', 'play', 'use-item') */
  action: string;
  /** Item/stat category the action belongs to */
  category?: string;
  /** Name of the primary stat affected */
  statName?: string;
  /** New value of the primary stat after the action */
  statValue?: number;
  /** Emoji/icon of the item used */
  itemIcon?: string;
  /** Display name of the item used */
  itemName?: string;
  /** Epoch-ms timestamp for animation deduplication */
  timestamp: number;
}

/**
 * Shape of the value provided by the GameContext React context.
 *
 * Consumed via the {@link useGame} hook. Includes the full game state
 * object and every action function the UI can invoke.
 */
export interface GameContextType {
  state: GameState;
  lastActionFeedback: ActionFeedbackEvent | null;
  isPlayingMiniGame: boolean;
  setIsPlayingMiniGame: (playing: boolean) => void;
  createPet: (pet: Omit<Pet, 'id' | 'stats' | 'experience' | 'level' | 'equippedAccessories' | 'createdAt' | 'lastCaredAt'>) => void;
  equipAccessory: (slot: AccessorySlot, accessoryId: string) => void;
  unequipAccessory: (slot: AccessorySlot) => void;
  updateStats: (stats: Partial<PetStats>) => void;
  addMoney: (amount: number, description?: string) => void;
  spendMoney: (amount: number, category: string, description: string) => boolean;
  addToInventory: (item: InventoryItem) => void;
  consumeItem: (itemId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  triggerRandomEvent: () => void;
  handleEventChoice: (choiceIndex: number) => void;
  updateCareStreak: () => void;
  saveGame: () => Promise<void>;
  loadGameFromCloud: (saveData: GameState) => void;
  resetGame: () => Promise<void>;
  performAction: (action: 'feed' | 'play' | 'rest' | 'clean' | 'vet') => void;
  updateHighScore: (gameId: string, score: number) => void;
  markNotificationsRead: () => void;
  clearNotifications: () => void;
  trackGamePlayed: (gameId?: string, won?: boolean) => void;
  claimDailyBonus: () => void;
  claimDailyTask: (taskId: string) => void;
  expireTimedTask: (taskId: string) => void;
  putPetToSleep: () => void;
  wakePetUp: () => void;
  completeTutorial: () => void;
  restartTutorial: () => void;
  claimGameReward: (gameId: string, amount: number) => boolean;
  updateGameTime: (minutes: number) => void;
  // New features
  useDailyAction: () => boolean;
  initWeeklyGoals: () => void;
  claimWeeklyGoal: (goalId: string) => void;
  claimTomorrowReward: () => void;
  addActionLog: (action: string, description: string, icon: string, statChanges?: Partial<PetStats>) => void;
  penalizeMissedPlayWindow: (index: number) => void;
  resetPlayWindows: () => void;
}
