import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, CheckCircle2, HeartPulse, Sparkles, Smile, Battery, Droplets, Utensils, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PetStats } from '@/types/game';

const STAT_CONFIG: Record<keyof PetStats, {
  label: string;
  icon: React.ElementType;
  lowMessage: string;
  criticalMessage: string;
  goodMessage: string;
  action: 'feed' | 'play' | 'rest' | 'clean' | 'vet';
  actionLabel: string;
  color: string;
  bgColor: string;
}> = {
  hunger: {
    label: 'Hunger',
    icon: Utensils,
    lowMessage: 'is getting hungry',
    criticalMessage: 'is starving and needs food now!',
    goodMessage: 'is well fed',
    action: 'feed',
    actionLabel: 'Feed',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
  },
  happiness: {
    label: 'Happiness',
    icon: Smile,
    lowMessage: 'is feeling sad and lonely',
    criticalMessage: 'is very unhappy and depressed!',
    goodMessage: 'is happy and content',
    action: 'play',
    actionLabel: 'Play',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500',
  },
  energy: {
    label: 'Energy',
    icon: Battery,
    lowMessage: 'is tired and sluggish',
    criticalMessage: 'is completely exhausted!',
    goodMessage: 'is energized',
    action: 'rest',
    actionLabel: 'Rest',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
  },
  cleanliness: {
    label: 'Cleanliness',
    icon: Droplets,
    lowMessage: 'is getting dirty',
    criticalMessage: 'desperately needs a bath!',
    goodMessage: 'is squeaky clean',
    action: 'clean',
    actionLabel: 'Clean',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
  },
  health: {
    label: 'Health',
    icon: HeartPulse,
    lowMessage: 'is not feeling well',
    criticalMessage: 'is very sick and needs a vet!',
    goodMessage: 'is in great shape',
    action: 'vet',
    actionLabel: 'Vet',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
  },
};

const CRITICAL_THRESHOLD = 15;
const LOW_THRESHOLD = 40;

function getStatSeverity(value: number): 'critical' | 'low' | 'okay' | 'good' {
  if (value <= CRITICAL_THRESHOLD) return 'critical';
  if (value <= LOW_THRESHOLD) return 'low';
  if (value <= 70) return 'okay';
  return 'good';
}

function getBarColor(severity: 'critical' | 'low' | 'okay' | 'good'): string {
  switch (severity) {
    case 'critical': return 'bg-red-500';
    case 'low': return 'bg-orange-400';
    case 'okay': return 'bg-yellow-400';
    case 'good': return 'bg-green-500';
  }
}

const NotificationsPanel: React.FC = () => {
  const { state, performAction } = useGame();
  const { pet } = state;

  if (!pet) return null;

  const stats = pet.stats;
  const statEntries = (Object.keys(STAT_CONFIG) as Array<keyof PetStats>).map((key) => ({
    key,
    value: stats[key],
    config: STAT_CONFIG[key],
    severity: getStatSeverity(stats[key]),
  }));

  // Separate into issues and healthy stats
  const issues = statEntries.filter((entry) => entry.severity === 'critical' || entry.severity === 'low');
  const healthy = statEntries.filter((entry) => entry.severity === 'okay' || entry.severity === 'good');

  // Sort issues: critical first, then by lowest value
  issues.sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (a.severity !== 'critical' && b.severity === 'critical') return 1;
    return a.value - b.value;
  });

  const overallAverage = Math.round(statEntries.reduce((sum, entry) => sum + entry.value, 0) / statEntries.length);

  return (
    <Card className="max-h-[600px] h-full border-2 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
      <CardHeader className="pb-3 bg-card/80 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-xl",
              issues.length > 0 ? "bg-destructive/10" : "bg-green-500/10"
            )}>
              {issues.length > 0 ? (
                <AlertCircle className="w-5 h-5 text-destructive" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
            <div>
              <CardTitle className="tracking-tight">Pet Status</CardTitle>
              <CardDescription>
                {pet.name}'s current condition
              </CardDescription>
            </div>
          </div>
          <div className={cn(
            "px-3 py-1.5 rounded-full text-xs font-bold",
            overallAverage >= 70
              ? "bg-green-500/10 text-green-600"
              : overallAverage >= 40
              ? "bg-yellow-500/10 text-yellow-600"
              : "bg-red-500/10 text-red-600"
          )}>
            {overallAverage}% Overall
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {/* Issues Section */}
        {issues.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-bold text-destructive uppercase tracking-wide">
                Needs Attention ({issues.length})
              </h3>
            </div>

            {issues.map((entry, index) => {
              const Icon = entry.config.icon;
              const isCritical = entry.severity === 'critical';
              const message = isCritical ? entry.config.criticalMessage : entry.config.lowMessage;

              return (
                <div
                  key={entry.key}
                  className={cn(
                    "relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 animate-slide-in-left",
                    isCritical
                      ? "bg-red-500/5 border-red-500/30"
                      : "bg-orange-500/5 border-orange-400/30"
                  )}
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2.5 rounded-full flex-shrink-0",
                      isCritical ? "bg-red-500/15 animate-pulse" : "bg-orange-500/15"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        isCritical ? "text-red-500" : "text-orange-500"
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-base">
                            {entry.config.label}
                          </h4>
                          {isCritical && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded">
                              Critical
                            </span>
                          )}
                        </div>
                        <span className={cn(
                          "font-mono font-bold text-lg",
                          isCritical ? "text-red-500" : "text-orange-500"
                        )}>
                          {Math.round(entry.value)}%
                        </span>
                      </div>

                      <p className="text-muted-foreground text-sm mb-2.5">
                        {pet.name} {message}
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="h-2.5 flex-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              getBarColor(entry.severity)
                            )}
                            style={{ width: `${entry.value}%` }}
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() => performAction(entry.config.action)}
                          className={cn(
                            "shrink-0 h-8 text-xs font-semibold",
                            isCritical
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-orange-500 hover:bg-orange-600 text-white"
                          )}
                        >
                          {entry.config.actionLabel}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* All Stats Overview */}
        <div className="space-y-3">
          {issues.length > 0 && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <h3 className="text-sm font-bold text-green-600 uppercase tracking-wide">
                Doing Well ({healthy.length})
              </h3>
            </div>
          )}

          {issues.length === 0 && (
            <div className="flex flex-col items-center text-center p-4 space-y-2">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center animate-breathe">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-foreground">All Good!</h3>
              <p className="text-sm text-muted-foreground">
                {pet.name} is happy and healthy. Here's the full breakdown:
              </p>
            </div>
          )}

          <div className="space-y-2">
            {(issues.length === 0 ? statEntries : healthy).map((entry) => {
              const Icon = entry.config.icon;
              return (
                <div
                  key={entry.key}
                  className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 border border-border/30"
                >
                  <div className={cn("p-1.5 rounded-lg", entry.severity === 'good' ? "bg-green-500/10" : "bg-yellow-500/10")}>
                    <Icon className={cn(
                      "w-4 h-4",
                      entry.severity === 'good' ? "text-green-500" : "text-yellow-500"
                    )} />
                  </div>
                  <span className="text-sm font-medium w-20">{entry.config.label}</span>
                  <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", getBarColor(entry.severity))}
                      style={{ width: `${entry.value}%` }}
                    />
                  </div>
                  <span className={cn(
                    "font-mono text-sm font-bold w-10 text-right",
                    entry.severity === 'good' ? "text-green-500" : "text-yellow-600"
                  )}>
                    {Math.round(entry.value)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;
