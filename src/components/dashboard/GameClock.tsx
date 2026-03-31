/**
 * @file GameClock.tsx
 *
 * Manages and displays accelerated in-game time.
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
 * Local `gameMinutes` state ticks independently for smooth UI updates while
 * the global `gameTime` is advanced by the simulation loop in GameProvider.
 * The component re-syncs from context on meaningful drift (e.g. after load).
 */
import React, { useState, useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import {
  Clock,
  Utensils,
  Moon,
  Sun,
  Coffee,
  Soup,
  Gamepad2,
} from "lucide-react";
import {
  DEFAULT_START_GAME_TIME,
  GAME_MINUTES_PER_CLOCK_TICK,
  REAL_MS_PER_CLOCK_TICK,
  PLAY_WINDOW_RANGES,
} from "@/data/gameTiming";
import { cn } from "@/lib/utils";

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
    name: "Breakfast",
    startHour: 8,
    endHour: 10,
    icon: <Coffee className="w-4 h-4" />,
    color: "text-amber-600",
    bgColor: "bg-amber-500/15 border-amber-500/30",
  },
  {
    name: "Lunch",
    startHour: 12,
    endHour: 14,
    icon: <Soup className="w-4 h-4" />,
    color: "text-orange-600",
    bgColor: "bg-orange-500/15 border-orange-500/30",
  },
  {
    name: "Dinner",
    startHour: 18,
    endHour: 20,
    icon: <Utensils className="w-4 h-4" />,
    color: "text-rose-600",
    bgColor: "bg-rose-500/15 border-rose-500/30",
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
    name: "Morning Play",
    ...PLAY_WINDOW_RANGES[0],
    icon: <Gamepad2 className="w-4 h-4" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/15 border-emerald-500/30",
  },
  {
    name: "Afternoon Play",
    ...PLAY_WINDOW_RANGES[1],
    icon: <Gamepad2 className="w-4 h-4" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/15 border-emerald-500/30",
  },
  {
    name: "Evening Play",
    ...PLAY_WINDOW_RANGES[2],
    icon: <Gamepad2 className="w-4 h-4" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/15 border-emerald-500/30",
  },
];

interface ReminderPopup {
  id: string;
  type: "meal" | "bedtime" | "wake" | "play";
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
}

interface GameClockProps {
  onMealReminder?: (mealName: string) => void;
  onBedtimeReminder?: () => void;
}

const GameClock: React.FC<GameClockProps> = ({
  onMealReminder,
  onBedtimeReminder,
}) => {
  const { state, penalizeMissedPlayWindow, resetPlayWindows } = useGame();
  const [gameMinutes, setGameMinutes] = useState(
    state.gameTime || DEFAULT_START_GAME_TIME,
  );
  const [reminders, setReminders] = useState<ReminderPopup[]>([]);
  // Refs track which reminders have already fired this day cycle.
  // Using refs (not state) so adds don't trigger effect re-runs.
  const shownRemindersRef = useRef(new Set<string>());
  const lastBedtimeShownRef = useRef(false);
  const lastWakeShownRef = useRef(false);

  // Local display tick - matches the simulation pace without mutating global state.
  useEffect(() => {
    const interval = setInterval(() => {
      setGameMinutes((prev) => {
        const next = prev + GAME_MINUTES_PER_CLOCK_TICK;
        // Reset at midnight (1440 minutes = 24 hours)
        if (next >= 1440) {
          // Reset reminder tracking for new day
          shownRemindersRef.current.clear();
          lastBedtimeShownRef.current = false;
          lastWakeShownRef.current = false;
          resetPlayWindows();
          return next - 1440; // Wrap around properly
        }
        return next;
      });
    }, REAL_MS_PER_CLOCK_TICK);

    return () => clearInterval(interval);
  }, [resetPlayWindows]);

  // Re-sync local clock from the simulation state on meaningful drift.
  useEffect(() => {
    const diff = Math.abs((state.gameTime || 0) - gameMinutes);
    if (diff > GAME_MINUTES_PER_CLOCK_TICK && diff < 1400) {
      setGameMinutes(state.gameTime || DEFAULT_START_GAME_TIME);
    }
  }, [gameMinutes, state.gameTime]);

  // Check for meal, play, bedtime, and wake reminders.
  useEffect(() => {
    const currentHour = Math.floor(gameMinutes / 60);
    const currentMinute = gameMinutes % 60;
    const shown = shownRemindersRef.current;
    const dismissTimers: ReturnType<typeof setTimeout>[] = [];

    const autoDismiss = (id: string) => {
      dismissTimers.push(
        setTimeout(() => {
          setReminders((prev) => prev.filter((r) => r.id !== id));
        }, 5000),
      );
    };

    // Check meal windows
    for (const meal of MEAL_WINDOWS) {
      if (currentHour === meal.startHour && currentMinute === 0 && !shown.has(meal.name)) {
        const reminder: ReminderPopup = {
          id: Date.now().toString(),
          type: "meal",
          title: `${meal.name} Time!`,
          message: `It's ${meal.name.toLowerCase()} time for your pet! Feed them now for best health.`,
          icon: meal.icon,
          color: meal.color,
        };
        shown.add(meal.name);
        setReminders((prev) => [...prev, reminder]);
        autoDismiss(reminder.id);
        onMealReminder?.(meal.name);
      }
    }

    // Check play windows
    for (let i = 0; i < PLAY_WINDOWS.length; i++) {
      const playWindow = PLAY_WINDOWS[i];
      const playStartKey = `play-start-${i}`;
      const playEndKey = `play-end-${i}`;

      if (
        gameMinutes >= playWindow.startMinute &&
        gameMinutes < playWindow.startMinute + GAME_MINUTES_PER_CLOCK_TICK &&
        !shown.has(playStartKey)
      ) {
        const reminder: ReminderPopup = {
          id: `play-start-${Date.now()}`,
          type: "play",
          title: "Play Time!",
          message: `${playWindow.name} window is open! Play with your pet for a happiness bonus.`,
          icon: playWindow.icon,
          color: playWindow.color,
        };
        shown.add(playStartKey);
        setReminders((prev) => [...prev, reminder]);
        autoDismiss(reminder.id);
      }

      if (
        gameMinutes >= playWindow.endMinute &&
        gameMinutes < playWindow.endMinute + GAME_MINUTES_PER_CLOCK_TICK &&
        !shown.has(playEndKey)
      ) {
        shown.add(playEndKey);
        if (!state.playWindowsSatisfied[i]) {
          penalizeMissedPlayWindow(i);
          const reminder: ReminderPopup = {
            id: `play-miss-${Date.now()}`,
            type: "play",
            title: "Missed Play!",
            message: `${playWindow.name} window closed without playing. Happiness dropped!`,
            icon: playWindow.icon,
            color: "text-red-500",
          };
          setReminders((prev) => [...prev, reminder]);
          autoDismiss(reminder.id);
        }
      }
    }

    // Bedtime reminder at 10 PM
    if (currentHour === BEDTIME_HOUR && currentMinute === 0 && !lastBedtimeShownRef.current) {
      const reminder: ReminderPopup = {
        id: Date.now().toString(),
        type: "bedtime",
        title: "Bedtime!",
        message: "It's getting late. Your pet should go to sleep now!",
        icon: <Moon className="w-4 h-4" />,
        color: "text-indigo-600",
      };
      lastBedtimeShownRef.current = true;
      setReminders((prev) => [...prev, reminder]);
      autoDismiss(reminder.id);
      onBedtimeReminder?.();
    }

    // Good morning reminder at 7 AM
    if (currentHour === 7 && currentMinute === 0 && !lastWakeShownRef.current) {
      const reminder: ReminderPopup = {
        id: Date.now().toString(),
        type: "wake",
        title: "Good Morning!",
        message: "A new day begins! Time to wake up and care for your pet.",
        icon: <Sun className="w-4 h-4" />,
        color: "text-amber-500",
      };
      lastWakeShownRef.current = true;
      setReminders((prev) => [...prev, reminder]);
      autoDismiss(reminder.id);
    }

    return () => {
      for (const timer of dismissTimers) clearTimeout(timer);
    };
  }, [
    gameMinutes,
    onMealReminder,
    onBedtimeReminder,
    state.playWindowsSatisfied,
    penalizeMissedPlayWindow,
  ]);

  /** Converts gameMinutes to a 12-hour display string and AM/PM period. */
  const formatTime = () => {
    const hours = Math.floor(gameMinutes / 60);
    const minutes = gameMinutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return {
      time: `${displayHours}:${minutes.toString().padStart(2, "0")}`,
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
      if (
        gameMinutes >= playWindow.startMinute &&
        gameMinutes < playWindow.endMinute
      ) {
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
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent border border-border rounded-full text-sm transition-all duration-300">
        {nightTime ? (
          <Moon className="w-3.5 h-3.5 text-foreground/60" />
        ) : currentMeal ? (
          <span className="text-foreground/60">{currentMeal.icon}</span>
        ) : currentPlay ? (
          <span className="text-foreground/60">{currentPlay.icon}</span>
        ) : (
          <Clock className="w-3.5 h-3.5 text-foreground/60" />
        )}
        <div className="flex items-baseline gap-0.5">
          <span className="font-mono font-semibold text-foreground tabular-nums">
            {time}
          </span>
          <span className="text-[10px] font-medium uppercase text-foreground/50">
            {period}
          </span>
        </div>
      </div>

      {/* Reminder Popups */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 pointer-events-none">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="pointer-events-auto animate-reminder-slide-in rounded-2xl"
            onClick={() => dismissReminder(reminder.id)}
          >
            <div
              className={cn(
                "flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border cursor-pointer",
                "bg-card border-border shadow-lg",
                "hover:scale-[1.02] transition-transform duration-200",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  reminder.type === "meal"
                    ? "bg-amber-500/15"
                    : reminder.type === "bedtime"
                      ? "bg-indigo-500/15"
                      : reminder.type === "play"
                        ? "bg-emerald-500/15"
                        : "bg-amber-500/15",
                )}
              >
                <span className={cn("text-lg", reminder.color)}>
                  {reminder.icon}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-sm text-foreground">
                  {reminder.title}
                </span>
                <span className="text-xs text-muted-foreground max-w-[200px]">
                  {reminder.message}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default GameClock;
