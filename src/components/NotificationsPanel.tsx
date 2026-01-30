import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Activity, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PetStats } from '@/types/game';

const STAT_CONFIG: Record<keyof PetStats, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  action: 'feed' | 'play' | 'rest' | 'clean' | 'vet';
  actionLabel: string;
  lowWarning: number;
  warning: string;
}> = {
  hunger: {
    label: 'Hunger',
    icon: '🍖',
    color: 'bg-chart-1',
    bgColor: 'bg-chart-1/20',
    action: 'feed',
    actionLabel: 'Feed',
    lowWarning: 30,
    warning: 'Your pet is hungry!',
  },
  happiness: {
    label: 'Happiness',
    icon: '💕',
    color: 'bg-chart-2',
    bgColor: 'bg-chart-2/20',
    action: 'play',
    actionLabel: 'Play',
    lowWarning: 25,
    warning: 'Your pet needs attention!',
  },
  energy: {
    label: 'Energy',
    icon: '⚡',
    color: 'bg-chart-3',
    bgColor: 'bg-chart-3/20',
    action: 'rest',
    actionLabel: 'Rest',
    lowWarning: 20,
    warning: 'Your pet is tired!',
  },
  cleanliness: {
    label: 'Clean',
    icon: '✨',
    color: 'bg-chart-4',
    bgColor: 'bg-chart-4/20',
    action: 'clean',
    actionLabel: 'Clean',
    lowWarning: 25,
    warning: 'Your pet needs grooming!',
  },
  health: {
    label: 'Health',
    icon: '❤️',
    color: 'bg-chart-5',
    bgColor: 'bg-chart-5/20',
    action: 'vet',
    actionLabel: 'Vet',
    lowWarning: 40,
    warning: 'Visit the vet!',
  },
};

const NotificationsPanel: React.FC = () => {
  const { state, performAction } = useGame();
  const { pet } = state;

  if (!pet) return null;

  const stats = pet.stats;
  const avgStats = Object.values(stats).reduce((sum, value) => sum + value, 0) / 5;

  const getOverallStatus = () => {
    const lowestStat = Math.min(...Object.values(stats));

    if (lowestStat <= 10) return { label: 'Needs Care', color: 'bg-destructive/15 text-destructive border-destructive/30' };
    if (lowestStat <= 25) return { label: 'Fair', color: 'bg-chart-1/15 text-chart-1 border-chart-1/30' };

    if (avgStats >= 70) return { label: 'Excellent', color: 'bg-secondary/15 text-secondary border-secondary/30' };
    if (avgStats >= 50) return { label: 'Good', color: 'bg-chart-3/15 text-chart-3 border-chart-3/30' };
    if (avgStats >= 30) return { label: 'Fair', color: 'bg-chart-1/15 text-chart-1 border-chart-1/30' };
    return { label: 'Needs Care', color: 'bg-destructive/15 text-destructive border-destructive/30' };
  };

  const status = getOverallStatus();

  return (
    <div className="p-5 bg-card rounded-2xl border-2 border-border/50 shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-serif font-semibold text-lg text-foreground">Vital Signs</h3>
        </div>
        <div className={cn(
          "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300",
          status.color
        )}>
          {status.label}
        </div>
      </div>

      {/* Stats list */}
      <div className="space-y-4">
        {(Object.keys(stats) as (keyof PetStats)[]).map((stat, index) => {
          const config = STAT_CONFIG[stat];
          const value = stats[stat];
          const isLow = value <= config.lowWarning;
          const isCritical = value <= 15;

          return (
            <div
              key={stat}
              className={cn(
                "animate-slide-in-left opacity-0",
                isLow && "relative"
              )}
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="flex items-center gap-2">
                  <span className={cn(
                    "text-lg transition-transform duration-300",
                    isLow && "animate-wiggle"
                  )}>
                    {config.icon}
                  </span>
                  <span className="font-medium text-sm text-foreground">{config.label}</span>
                </span>
                <span className={cn(
                  "font-mono text-sm font-semibold transition-colors duration-300",
                  isCritical ? "text-destructive" :
                  isLow ? "text-chart-1" :
                  "text-muted-foreground"
                )}>
                  {Math.round(value)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-3 flex-1 rounded-full overflow-hidden transition-all duration-300",
                  config.bgColor
                )}>
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500 ease-out relative",
                      config.color,
                      isCritical && "animate-pulse"
                    )}
                    style={{ width: `${Math.max(value, 2)}%` }}
                  >
                    {value > 30 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    )}
                  </div>
                </div>

                {/* Action button for low stats */}
                {isLow && (
                  <Button
                    size="sm"
                    onClick={() => performAction(config.action)}
                    className={cn(
                      "shrink-0 h-7 text-xs font-semibold px-3",
                      isCritical
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    )}
                  >
                    {config.actionLabel}
                  </Button>
                )}
              </div>

              {/* Warning message */}
              {isLow && (
                <div className={cn(
                  "flex items-center gap-1.5 mt-1.5 text-xs",
                  isCritical ? "text-destructive" : "text-chart-1"
                )}>
                  <AlertCircle className="w-3 h-3" />
                  <span>{config.warning}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Wellness */}
      <div className="mt-5 pt-4 border-t border-border/50">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Overall Wellness</span>
          <span className="font-mono font-semibold text-foreground">{Math.round(avgStats)}%</span>
        </div>
        <div className="mt-2 h-2 bg-muted/30 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              avgStats >= 70 ? "bg-secondary" :
              avgStats >= 50 ? "bg-chart-3" :
              avgStats >= 30 ? "bg-chart-1" :
              "bg-destructive"
            )}
            style={{ width: `${avgStats}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
