import { GameState, Pet, PetStats, Transaction, RandomEvent, InventoryItem, GameNotification, DailyTask, DailyTracking, AccessorySlot } from '@/types/game';
import { INITIAL_ACHIEVEMENTS } from '@/data/achievements';
import { DEFAULT_DAILY_TRACKING } from '@/data/tasks';

export const initialState: GameState = {
  pet: null,
  money: 100,
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
};

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
  | { type: 'UPDATE_GAME_TIME'; payload: number };

export interface ActionFeedbackEvent {
  action: string;
  category?: string;
  statName?: string;
  statValue?: number;
  itemIcon?: string;
  itemName?: string;
  timestamp: number;
}

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
  useItem: (itemId: string) => void;
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
}
