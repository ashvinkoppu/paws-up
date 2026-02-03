import React, { useState, useEffect, useRef } from 'react';
import { Clock, Utensils, Moon, Sun, Coffee, Soup } from 'lucide-react';
import { cn } from '@/lib/utils';

// Game time progresses at 1 real second = 1 game minute
// This means 1 real hour = 1 game hour, which feels natural
const REAL_MS_PER_GAME_MINUTE = 3000; // 3 seconds = 1 game minute

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
    bgColor: 'bg-amber-500/15 border-amber-500/30'
  },
  { 
    name: 'Lunch', 
    startHour: 12, 
    endHour: 14, 
    icon: <Soup className="w-4 h-4" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/15 border-orange-500/30'
  },
  { 
    name: 'Dinner', 
    startHour: 18, 
    endHour: 20, 
    icon: <Utensils className="w-4 h-4" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/15 border-rose-500/30'
  },
];

const BEDTIME_HOUR = 22; // 10 PM

interface ReminderPopup {
  id: string;
  type: 'meal' | 'bedtime' | 'wake';
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
  // Start game time at 7:00 AM
  const [gameMinutes, setGameMinutes] = useState(7 * 60); // 7:00 AM = 420 minutes
  const [reminders, setReminders] = useState<ReminderPopup[]>([]);
  const [shownReminders, setShownReminders] = useState<Set<string>>(new Set());
  const lastMealWindowRef = useRef<string | null>(null);
  const lastBedtimeShownRef = useRef(false);
  const lastWakeShownRef = useRef(false);

  // Game clock tick - advances 1 minute per second
  useEffect(() => {
    const interval = setInterval(() => {
      setGameMinutes((prev) => {
        const next = prev + 1;
        // Reset at midnight (1440 minutes = 24 hours)
        if (next >= 1440) {
          // Reset reminder tracking for new day
          setShownReminders(new Set());
          lastMealWindowRef.current = null;
          lastBedtimeShownRef.current = false;
          lastWakeShownRef.current = false;
          return 0;
        }
        return next;
      });
    }, REAL_MS_PER_GAME_MINUTE);

    return () => clearInterval(interval);
  }, []);

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

    // Bedtime reminder at 10 PM
    if (currentHour === BEDTIME_HOUR && currentMinute === 0 && !lastBedtimeShownRef.current) {
      const reminder: ReminderPopup = {
        id: Date.now().toString(),
        type: 'bedtime',
        title: "Bedtime! 🌙",
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
        title: "Good Morning! ☀️",
        message: "A new day begins! Time to wake up and care for your pet.",
        icon: <Sun className="w-4 h-4" />,
        color: 'text-amber-500',
      };
      
      setReminders((prev) => [...prev, reminder]);
      lastWakeShownRef.current = true;

      setTimeout(() => {
        setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
      }, 5000);
    }
  }, [gameMinutes, shownReminders, onMealReminder, onBedtimeReminder]);

  // Format time display
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

  // Check if it's night time (after 10 PM or before 6 AM)
  const isNightTime = () => {
    const currentHour = Math.floor(gameMinutes / 60);
    return currentHour >= BEDTIME_HOUR || currentHour < 6;
  };

  const { time, period } = formatTime();
  const currentMeal = getCurrentMealWindow();
  const nightTime = isNightTime();

  const dismissReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <>
      {/* Clock Display */}
      <div 
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300",
          nightTime 
            ? "bg-indigo-500/10 border-indigo-500/20" 
            : currentMeal 
              ? currentMeal.bgColor 
              : "bg-sky-500/10 border-sky-500/20"
        )}
      >
        {nightTime ? (
          <Moon className="w-4 h-4 text-indigo-500" />
        ) : currentMeal ? (
          <span className={currentMeal.color}>{currentMeal.icon}</span>
        ) : (
          <Clock className="w-4 h-4 text-sky-600" />
        )}
        <div className="flex items-baseline gap-1">
          <span className={cn(
            "font-mono font-bold text-sm tracking-tight",
            nightTime ? "text-indigo-700" : currentMeal ? currentMeal.color : "text-sky-700"
          )}>
            {time}
          </span>
          <span className={cn(
            "text-[10px] font-medium uppercase",
            nightTime ? "text-indigo-500/70" : currentMeal ? "opacity-70" : "text-sky-500/70"
          )}>
            {period}
          </span>
        </div>
        {currentMeal && (
          <span className={cn(
            "text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full",
            currentMeal.bgColor,
            currentMeal.color
          )}>
            {currentMeal.name}
          </span>
        )}
      </div>

      {/* Reminder Popups */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 pointer-events-none">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="pointer-events-auto animate-reminder-slide-in rounded-2xl"
            onClick={() => dismissReminder(reminder.id)}
          >
            <div className={cn(
              "flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border cursor-pointer",
              "bg-card/95 backdrop-blur-xl border-border/50",
              "hover:scale-[1.02] transition-transform duration-200"
            )}>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                reminder.type === 'meal' ? "bg-amber-500/15" :
                reminder.type === 'bedtime' ? "bg-indigo-500/15" : "bg-amber-500/15"
              )}>
                <span className={cn(
                  "text-lg",
                  reminder.color
                )}>
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
