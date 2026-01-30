import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { calculateLevel, DAILY_TASK_POOL, MILESTONES } from '@/data/tasks';
import { cn } from '@/lib/utils';
import { Check, Clock, Gift, Lock, Star, Trophy } from 'lucide-react';

function useCountdownToMidnight() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${hours}h ${minutes}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

const Tasks: React.FC = () => {
  const { state, claimDailyBonus } = useGame();
  const countdown = useCountdownToMidnight();

  if (!state.pet) return null;

  const { level, currentXp, xpForNext } = calculateLevel(state.pet.experience);
  const xpPercent = (currentXp / xpForNext) * 100;
  const completedDailyCount = state.dailyTasks.filter(task => task.completed).length;
  const allDailyComplete = state.dailyTasks.length > 0 && completedDailyCount === state.dailyTasks.length;

  // Group milestones by tier
  const milestonesByTier = [1, 2, 3].map(tier => ({
    tier,
    milestones: MILESTONES.filter(milestone => milestone.tier === tier),
  }));

  // Determine current tier (first tier with incomplete milestones)
  const currentTier = milestonesByTier.find(group =>
    group.milestones.some(milestone => {
      const milestoneState = state.milestones.find(ms => ms.id === milestone.id);
      return !milestoneState?.completed;
    })
  )?.tier || 3;

  return (
    <div className="space-y-5">
      {/* XP Summary Bar */}
      <Card className="rounded-2xl border-2 border-border/50 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="font-serif font-bold text-lg">Level {level}</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {state.pet.experience} XP lifetime
            </span>
          </div>
          <div className="w-full h-3 bg-accent rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-muted-foreground font-mono">
            <span>{currentXp} XP</span>
            <span>{xpForNext} XP to level {level + 1}</span>
          </div>
        </CardContent>
      </Card>

      {/* Daily Tasks Card */}
      <Card className="rounded-2xl border-2 border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-serif flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Daily Tasks
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {completedDailyCount}/{state.dailyTasks.length} done
              </span>
              <span className="text-xs text-muted-foreground/60 font-mono">
                {countdown} left
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {state.dailyTasks.map(task => {
            const taskDef = DAILY_TASK_POOL.find(definition => definition.id === task.id);
            if (!taskDef) return null;
            const trackingValue = (state.dailyTracking?.[taskDef.trackingKey as keyof typeof state.dailyTracking] as number) || 0;
            const progress = Math.min(trackingValue, taskDef.target);
            const progressPercent = (progress / taskDef.target) * 100;

            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                  task.completed
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : progress > 0
                    ? "bg-amber-500/5 border-amber-500/20"
                    : "bg-card border-border/30"
                )}
              >
                <span className="text-xl flex-shrink-0">{taskDef.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-sm font-semibold truncate",
                      task.completed && "text-emerald-600"
                    )}>
                      {taskDef.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      +{taskDef.xpReward} XP
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5">{taskDef.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-accent rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          task.completed ? "bg-emerald-500" : "bg-amber-400"
                        )}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">
                      {progress}/{taskDef.target}
                    </span>
                  </div>
                </div>
                {task.completed && (
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                )}
              </div>
            );
          })}

          {/* Daily Bonus Row */}
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl border-2 border-dashed transition-all",
            allDailyComplete && !state.dailyBonusClaimed
              ? "border-amber-400 bg-amber-500/10"
              : state.dailyBonusClaimed
              ? "border-emerald-400/50 bg-emerald-500/5"
              : "border-border/30 bg-muted/30"
          )}>
            <Gift className={cn(
              "w-6 h-6",
              allDailyComplete && !state.dailyBonusClaimed ? "text-amber-500" :
              state.dailyBonusClaimed ? "text-emerald-500" : "text-muted-foreground/40"
            )} />
            <div className="flex-1">
              <span className="text-sm font-semibold">Daily Bonus</span>
              <p className="text-xs text-muted-foreground">Complete all tasks: +30 XP, +$20</p>
            </div>
            {state.dailyBonusClaimed ? (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Claimed
              </span>
            ) : allDailyComplete ? (
              <Button
                size="sm"
                onClick={claimDailyBonus}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                Claim
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">
                {completedDailyCount}/{state.dailyTasks.length}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Milestones Card */}
      <Card className="rounded-2xl border-2 border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {milestonesByTier.map(({ tier, milestones }) => {
            const isLocked = tier > currentTier;
            const isCurrentTier = tier === currentTier;
            const tierCompletedCount = milestones.filter(milestone => {
              const milestoneState = state.milestones.find(ms => ms.id === milestone.id);
              return milestoneState?.completed;
            }).length;
            const allTierComplete = tierCompletedCount === milestones.length;

            const tierLabel = tier === 1 ? 'Beginner' : tier === 2 ? 'Intermediate' : 'Expert';
            const tierColor = tier === 1 ? 'text-emerald-500' : tier === 2 ? 'text-blue-500' : 'text-purple-500';

            return (
              <div key={tier}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("text-xs font-bold uppercase tracking-wider", tierColor)}>
                    Tier {tier} — {tierLabel}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {tierCompletedCount}/{milestones.length}
                  </span>
                  {isLocked && <Lock className="w-3 h-3 text-muted-foreground/40" />}
                  {allTierComplete && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </div>

                {(isCurrentTier || allTierComplete || !isLocked) && (
                  <div className="space-y-1.5">
                    {milestones.map(milestone => {
                      const milestoneState = state.milestones.find(ms => ms.id === milestone.id);
                      const completed = milestoneState?.completed || false;

                      return (
                        <div
                          key={milestone.id}
                          className={cn(
                            "flex items-center gap-3 p-2.5 rounded-lg transition-colors",
                            completed
                              ? "bg-emerald-500/5"
                              : isLocked
                              ? "opacity-40"
                              : "bg-card"
                          )}
                        >
                          <span className="text-lg flex-shrink-0">{milestone.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className={cn(
                              "text-sm font-medium",
                              completed && "text-emerald-600"
                            )}>
                              {milestone.name}
                            </span>
                            <p className="text-xs text-muted-foreground">{milestone.description}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] font-mono text-muted-foreground">
                              +{milestone.xpReward} XP, +${milestone.moneyReward}
                            </span>
                            {completed && <Check className="w-4 h-4 text-emerald-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isLocked && !allTierComplete && (
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <Lock className="w-4 h-4 text-muted-foreground/40 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">
                      Complete Tier {tier - 1} to unlock
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default Tasks;
