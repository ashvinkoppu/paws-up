/**
 * @file GameClock.tsx
 *
 * Manages and displays accelerated in-game time (1 real second = 5 game minutes).
 * The clock drives several time-based game mechanics:
 *
 *  - **Meal windows** (Breakfast 8-10, Lunch 12-14, Dinner 18-20): triggers
 *    reminder popups when a meal window opens and notifies the parent via
 *    onMealReminder callback.
 *  - **Play windows** (3 per day, ~20 game-minutes each): shows a "Play Time"
 *    reminder when the window opens and applies a happiness penalty via
 *    penalizeMissedPlayWindow() if the window closes without the player playing.
 *  - **Bedtime** (10 PM): fires a bedtime reminder and onBedtimeReminder callback.
 *  - **Day rollover** (midnight): resets all reminder tracking and play windows.
 *
 * Local gameMinutes state ticks independently for smooth UI updates, syncing
 * back to the global GameContext every 5 game-minutes and re-syncing from
 * context on large drifts (e.g., loading a save).
 */
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Clock, Utensils, Moon, Sun, Coffee, Soup, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Time acceleration constants:
// 1 real second = 5 game minutes, so 1 real minute = 5 game hours,
// and a full 24-hour game day passes in ~4.8 real minutes.
const GAME_MINUTES_PER_TICK = 5;
const REAL_MS_PER_TICK = 1000;

interface MealWindow {
  name: string;
  startHour: number;
  endHour: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const MEAL_WINDOWS: MealWindow[] = [
  {
    name: 'Breakfast',
    startHour: 8,
    endHour: 10,
    icon: <Coffee className="w-4 h-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/15 border-amber-500/30',
  },
  {
    name: 'Lunch',
    startHour: 12,
    endHour: 14,
    icon: <Soup className="w-4 h-4" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/15 border-orange-500/30',
  },
  {
    name: 'Dinner',
    startHour: 18,
    endHour: 20,
    icon: <Utensils className="w-4 h-4" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/15 border-rose-500/30',
  },
];

const BEDTIME_HOUR = 22; // 10 PM

interface PlayWindow {
  name: string;
  startMinute: number;
  endMinute: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const PLAY_WINDOWS: PlayWindow[] = [
  {
    name: 'Morning Play',
    startMinute: 610, // 10:10 AM
    endMinute: 630, // 10:30 AM
    icon: <Gamepad2 className="w-4 h-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/15 border-emerald-500/30',
  },
  {
    name: 'Afternoon Play',
    startMinute: 780, // 1:00 PM
    endMinute: 800, // 1:20 PM
    icon: <Gamepad2 className="w-4 h-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/15 border-emerald-500/30',
  },
  {
    name: 'Evening Play',
    startMinute: 1050, // 5:30 PM
    endMinute: 1070, // 5:50 PM
    icon: <Gamepad2 className="w-4 h-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/15 border-emerald-500/30',
  },
];

interface ReminderPopup {
  id: string;
  type: 'meal' | 'bedtime' | 'wake' | 'play';
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
}

interface GameClockProps {
  onMealReminder?: (mealName: string) => void;
  onBedtimeReminder?: () => void;
}

const GameClock: React.FC<GameClockProps> = ({ onMealReminder, onBedtimeReminder }) => {
  const { state, updateGameTime, penalizeMissedPlayWindow, resetPlayWindows } = useGame();
  // Start game time from saved state or default to 7:00 AM
  const [gameMinutes, setGameMinutes] = useState(state.gameTime || 7 * 60);
  const [reminders, setReminders] = useState<ReminderPopup[]>([]);
  const [shownReminders, setShownReminders] = useState<Set<string>>(new Set());
  // Refs track whether one-shot reminders (bedtime, wake) have fired this day cycle.
  // shownReminders (Set) handles meal and play window dedup by key string.
  const lastMealWindowRef = useRef<string | null>(null);
  const lastBedtimeShownRef = useRef(false);
  const lastWakeShownRef = useRef(false);

  // Game clock tick - advances 3 game minutes per second
  useEffect(() => {
    const interval = setInterval(() => {
      setGameMinutes((prev) => {
        const next = prev + GAME_MINUTES_PER_TICK;
        // Reset at midnight (1440 minutes = 24 hours)
        if (next >= 1440) {
          // Reset reminder tracking for new day
          setShownReminders(new Set());
          lastMealWindowRef.current = null;
          lastBedtimeShownRef.current = false;
          lastWakeShownRef.current = false;
          resetPlayWindows();
          return next - 1440; // Wrap around properly
        }
        return next;
      });
    }, REAL_MS_PER_TICK);

    return () => clearInterval(interval);
  }, []);

  // Re-sync local clock from global state when a large jump is detected (e.g., loading a save).
  // Small diffs (< 20 min) are ignored to avoid jitter from the periodic context sync.
  // Wrap-around diffs (> 1400 min) are also ignored since 0 and 1439 are only 1 min apart.
  useEffect(() => {
    const diff = Math.abs((state.gameTime || 0) - gameMinutes);
    if (diff > 20 && diff < 1400) {
      setGameMinutes(state.gameTime || 7 * 60);
    }
  }, [state.gameTime]);

  // Push local clock to global context every 5 game-minutes (~1 real second)
  // so the value persists across saves without flooding the reducer on every tick.
  useEffect(() => {
    if (gameMinutes % 5 === 0) {
      updateGameTime(gameMinutes);
    }
  }, [gameMinutes, updateGameTime]);

  // Check for meal and bedtime reminders
  useEffect(() => {
    const currentHour = Math.floor(gameMinutes / 60);
    const currentMinute = gameMinutes % 60;

    // Check meal windows
    for (const meal of MEAL_WINDOWS) {
      const mealKey = `${meal.name}-${Math.floor(gameMinutes / 60)}`;

      // Trigger reminder when entering a meal window
      if (currentHour === meal.startHour && currentMinute === 0 && !shownReminders.has(meal.name)) {
        const reminder: ReminderPopup = {
          id: Date.now().toString(),
          type: 'meal',
          title: `${meal.name} Time! 🍽️`,
          message: `It's ${meal.name.toLowerCase()} time for your pet! Feed them now for best health.`,
          icon: meal.icon,
          color: meal.color,
        };

        setReminders((prev) => [...prev, reminder]);
        setShownReminders((prev) => new Set(prev).add(meal.name));
        onMealReminder?.(meal.name);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
        }, 5000);
      }
    }

    // Check play windows
    for (let i = 0; i < PLAY_WINDOWS.length; i++) {
      const playWindow = PLAY_WINDOWS[i];
      const playStartKey = `play-start-${i}`;
      const playEndKey = `play-end-${i}`;

      // Show "Play Time!" reminder when entering the window
      if (gameMinutes >= playWindow.startMinute && gameMinutes < playWindow.startMinute + GAME_MINUTES_PER_TICK && !shownReminders.has(playStartKey)) {
        const reminder: ReminderPopup = {
          id: `play-start-${Date.now()}`,
          type: 'play',
          title: `Play Time! 🎮`,
          message: `${playWindow.name} window is open! Play with your pet for a happiness bonus.`,
          icon: playWindow.icon,
          color: playWindow.color,
        };
        setReminders((prev) => [...prev, reminder]);
        setShownReminders((prev) => new Set(prev).add(playStartKey));

        setTimeout(() => {
          setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
        }, 5000);
      }

      // Check if window just ended and was missed
      if (gameMinutes >= playWindow.endMinute && gameMinutes < playWindow.endMinute + GAME_MINUTES_PER_TICK && !shownReminders.has(playEndKey)) {
        setShownReminders((prev) => new Set(prev).add(playEndKey));

        if (!state.playWindowsSatisfied[i]) {
          penalizeMissedPlayWindow(i);
          const reminder: ReminderPopup = {
            id: `play-miss-${Date.now()}`,
            type: 'play',
            title: `Missed Play! 😿`,
            message: `${playWindow.name} window closed without playing. Happiness dropped!`,
            icon: playWindow.icon,
            color: 'text-red-500',
          };
          setReminders((prev) => [...prev, reminder]);

          setTimeout(() => {
            setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
          }, 5000);
        }
      }
    }

    // Bedtime reminder at 10 PM
    if (currentHour === BEDTIME_HOUR && currentMinute === 0 && !lastBedtimeShownRef.current) {
      const reminder: ReminderPopup = {
        id: Date.now().toString(),
        type: 'bedtime',
        title: 'Bedtime! 🌙',
        message: "It's getting late. Your pet should go to sleep now!",
        icon: <Moon className="w-4 h-4" />,
        color: 'text-indigo-600',
      };

      setReminders((prev) => [...prev, reminder]);
      lastBedtimeShownRef.current = true;
      onBedtimeReminder?.();

      setTimeout(() => {
        setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
      }, 5000);
    }

    // Good morning reminder at 7 AM
    if (currentHour === 7 && currentMinute === 0 && !lastWakeShownRef.current) {
      const reminder: ReminderPopup = {
        id: Date.now().toString(),
        type: 'wake',
        title: 'Good Morning! ☀️',
        message: 'A new day begins! Time to wake up and care for your pet.',
        icon: <Sun className="w-4 h-4" />,
        color: 'text-amber-500',
      };

      setReminders((prev) => [...prev, reminder]);
      lastWakeShownRef.current = true;

      setTimeout(() => {
        setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
      }, 5000);
    }
  }, [gameMinutes, shownReminders, onMealReminder, onBedtimeReminder, state.playWindowsSatisfied, penalizeMissedPlayWindow]);

  /** Converts gameMinutes to a 12-hour display string and AM/PM period. */
  const formatTime = () => {
    const hours = Math.floor(gameMinutes / 60);
    const minutes = gameMinutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return {
      time: `${displayHours}:${minutes.toString().padStart(2, '0')}`,
      period,
    };
  };

  // Get current meal window if any
  const getCurrentMealWindow = (): MealWindow | null => {
    const currentHour = Math.floor(gameMinutes / 60);
    for (const meal of MEAL_WINDOWS) {
      if (currentHour >= meal.startHour && currentHour < meal.endHour) {
        return meal;
      }
    }
    return null;
  };

  // Get current play window if any
  const getCurrentPlayWindow = (): PlayWindow | null => {
    for (const playWindow of PLAY_WINDOWS) {
      if (gameMinutes >= playWindow.startMinute && gameMinutes < playWindow.endMinute) {
        return playWindow;
      }
    }
    return null;
  };

  // Check if it's night time (after 10 PM or before 6 AM)
  const isNightTime = () => {
    const currentHour = Math.floor(gameMinutes / 60);
    return currentHour >= BEDTIME_HOUR || currentHour < 6;
  };

  const { time, period } = formatTime();
  const currentMeal = getCurrentMealWindow();
  const currentPlay = getCurrentPlayWindow();
  const nightTime = isNightTime();

  const dismissReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <>
      {/* Clock Display */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300',
          nightTime ? 'bg-indigo-500/10 border-indigo-500/20' : currentMeal ? currentMeal.bgColor : currentPlay ? currentPlay.bgColor : 'bg-sky-500/10 border-sky-500/20',
        )}
      >
        {nightTime ? (
          <Moon className="w-4 h-4 text-indigo-500" />
        ) : currentMeal ? (
          <span className={currentMeal.color}>{currentMeal.icon}</span>
        ) : currentPlay ? (
          <span className={currentPlay.color}>{currentPlay.icon}</span>
        ) : (
          <Clock className="w-4 h-4 text-sky-600" />
        )}
        <div className="flex items-baseline gap-1">
          <span className={cn('font-mono font-bold text-sm tracking-tight', nightTime ? 'text-indigo-700' : currentMeal ? currentMeal.color : currentPlay ? currentPlay.color : 'text-sky-700')}>
            {time}
          </span>
          <span className={cn('text-[10px] font-medium uppercase', nightTime ? 'text-indigo-500/70' : currentMeal ? 'opacity-70' : currentPlay ? 'opacity-70' : 'text-sky-500/70')}>{period}</span>
        </div>
        {currentMeal && <span className={cn('text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full', currentMeal.bgColor, currentMeal.color)}>{currentMeal.name}</span>}
        {currentPlay && !currentMeal && <span className={cn('text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full', currentPlay.bgColor, currentPlay.color)}>Play Time!</span>}
      </div>

      {/* Reminder Popups */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 pointer-events-none">
        {reminders.map((reminder) => (
          <div key={reminder.id} className="pointer-events-auto animate-reminder-slide-in rounded-2xl" onClick={() => dismissReminder(reminder.id)}>
            <div
              className={cn(
                'flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border cursor-pointer',
                'bg-card/95 backdrop-blur-xl border-border/50',
                'hover:scale-[1.02] transition-transform duration-200',
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  reminder.type === 'meal' ? 'bg-amber-500/15' : reminder.type === 'bedtime' ? 'bg-indigo-500/15' : reminder.type === 'play' ? 'bg-emerald-500/15' : 'bg-amber-500/15',
                )}
              >
                <span className={cn('text-lg', reminder.color)}>{reminder.icon}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-sm text-foreground">{reminder.title}</span>
                <span className="text-xs text-muted-foreground max-w-[200px]">{reminder.message}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default GameClock;
