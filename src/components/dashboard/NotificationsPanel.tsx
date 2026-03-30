/**
 * @file NotificationsPanel.tsx
 *
 * The "Needs" / "Vital Signs" tab in the activity hub. Despite its filename,
 * this is the detailed pet-stats panel (the header notification dropdown lives
 * in GameDashboard itself).
 *
 * Contains two sub-components:
 *
 * **SleepAction** - a small inline widget for putting the pet to sleep or
 * waking it up. Tracks whether the pet has already slept today via
 * `lastSleepDate` comparison.
 *
 * **NotificationsPanel** (default export) - renders:
 * - An overall wellness label (same logic as SidePanel).
 * - A toggleable action log showing the 10 most recent actions and their
 *   per-stat deltas.
 * - A full stat list with progress bars, tooltips explaining decay/boost
 *   info, inline "Fix it" action buttons for low stats, and an expandable
 *   "Why?" section that cross-references the action log.
 * - Rapid-drop detection: compares current stats to a `previousStats` ref
 *   each render. If any stat fell >= 5 points since the last snapshot, it
 *   gets a pulsing amber highlight that auto-clears after 3 seconds.
 * - An overall wellness bar (average of all five stats).
 *
 * Uses the shared STAT_CONFIG from `src/data/statConfig.ts`.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Activity, AlertCircle, HelpCircle, ChevronDown, ChevronUp, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PetStats } from '@/types/game';
import { STAT_CONFIG } from '@/data/statConfig';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SleepAction: React.FC = () => {
  const { state, putPetToSleep, wakePetUp } = useGame();
  const { pet, petAsleep, lastSleepDate } = state;

  if (!pet) return null;

  const today = new Date().toDateString();
  const hasSleptToday = lastSleepDate === today;

  return (
    <div className="mt-5 pt-4 border-t border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌙</span>
          <span className="text-sm font-medium text-foreground">Nightly Rest</span>
        </div>

        {petAsleep ? (
          <Button size="sm" onClick={wakePetUp} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center gap-2">
            <span className="animate-pulse">☀️</span>
            Wake Up
          </Button>
        ) : hasSleptToday ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <span className="text-xs">💤</span>
            <span className="text-xs font-medium text-indigo-600">Rested today</span>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={putPetToSleep}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 group"
          >
            <span className="group-hover:animate-bounce">🌙</span>
            Put to Sleep
          </Button>
        )}
      </div>

      {petAsleep && (
        <div className="mt-3 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-center gap-3 animate-fade-in">
          <div className="relative">
            <span className="text-2xl">😴</span>
            <span className="absolute -top-1 -right-1 text-sm animate-float-zzz">💤</span>
          </div>
          <div>
            <p className="text-xs font-medium text-indigo-700">{pet.name} is sleeping soundly...</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Stats restored! ⚡+15 💕+8 ✨+5 ❤️+5 🍖-10</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Track recent stat changes for "Why?" explanations
interface StatChange {
  stat: keyof PetStats;
  oldValue: number;
  newValue: number;
  timestamp: number;
}

const NotificationsPanel: React.FC = () => {
  const { state, performAction } = useGame();
  const { pet, actionLog } = state;
  const [expandedStat, setExpandedStat] = useState<keyof PetStats | null>(null);
  const [showActionLog, setShowActionLog] = useState(false);
  const previousStats = useRef<PetStats | null>(null);
  const [rapidDropStats, setRapidDropStats] = useState<Set<keyof PetStats>>(new Set());

  // Detect rapid stat drops (more than 5 points in 3 seconds)
  useEffect(() => {
    if (!pet) return;

    if (previousStats.current) {
      const newRapidDrops = new Set<keyof PetStats>();

      (Object.keys(pet.stats) as (keyof PetStats)[]).forEach((stat) => {
        const prev = previousStats.current![stat];
        const curr = pet.stats[stat];
        const drop = prev - curr;

        if (drop >= 5) {
          newRapidDrops.add(stat);
        }
      });

      if (newRapidDrops.size > 0) {
        setRapidDropStats((prev) => {
          const combined = new Set([...prev, ...newRapidDrops]);
          // Clear after 3 seconds
          setTimeout(() => {
            setRapidDropStats((current) => {
              const updated = new Set(current);
              newRapidDrops.forEach((stat) => updated.delete(stat));
              return updated;
            });
          }, 3000);
          return combined;
        });
      }
    }

    previousStats.current = { ...pet.stats };
  }, [pet?.stats]);

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

  // Get recent actions that affected a stat
  const getRecentActionsForStat = (stat: keyof PetStats) => {
    if (!actionLog) return [];
    return actionLog.filter((log) => log.statChanges && log.statChanges[stat] !== undefined).slice(0, 5);
  };

  return (
    <TooltipProvider>
      <div className="p-5 glass-card rounded-2xl shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-foreground">Vital Signs</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowActionLog(!showActionLog)} className={cn('h-7 px-2 text-xs', showActionLog && 'bg-primary/10')}>
              <History className="w-3 h-3 mr-1" />
              Log
            </Button>
            <div className={cn('px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300', status.color)}>{status.label}</div>
          </div>
        </div>

        {/* Action Log Panel */}
        {showActionLog && (
          <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border max-h-48 overflow-y-auto">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Recent Actions</h4>
            {!actionLog || actionLog.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No actions yet. Feed or play with your pet!</p>
            ) : (
              <div className="space-y-2">
                {actionLog.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-xs">
                    <span className="text-base flex-shrink-0">{log.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground">{log.action}</span>
                      <span className="text-muted-foreground ml-1">— {log.description}</span>
                      {log.statChanges && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {Object.entries(log.statChanges).map(([stat, change]) => (
                            <span key={stat} className={cn('text-[10px] px-1.5 py-0.5 rounded-full', Number(change) >= 0 ? 'bg-emerald-500/15 text-emerald-600' : 'bg-red-500/15 text-red-600')}>
                              {STAT_CONFIG[stat as keyof PetStats].icon} {Number(change) >= 0 ? '+' : ''}
                              {change}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats list */}
        <div className="space-y-4">
          {(Object.keys(stats) as (keyof PetStats)[]).map((stat, index) => {
            const config = STAT_CONFIG[stat];
            const value = stats[stat];
            const isLow = value <= config.lowWarning;
            const isCritical = value <= 15;
            const isRapidDrop = rapidDropStats.has(stat);
            const isExpanded = expandedStat === stat;
            const recentActions = getRecentActionsForStat(stat);

            return (
              <div key={stat} className={cn('animate-slide-in-left opacity-0', isLow && 'relative')} style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={cn('text-lg transition-transform duration-300 cursor-help', isLow && 'animate-wiggle', isRapidDrop && 'animate-pulse')}>{config.icon}</span>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[220px] p-3">
                        <p className="font-semibold mb-1">{config.label}</p>
                        <p className="text-xs text-muted-foreground mb-2">{config.tooltip}</p>
                        <div className="text-[10px] space-y-1 border-t border-border/50 pt-2">
                          <p className="text-amber-600">{config.decayInfo}</p>
                          <p className="text-emerald-600">{config.boostInfo}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    <span className="font-medium text-base text-foreground">{config.label}</span>
                    {/* "Why?" Button */}
                    {isLow && (
                      <Button variant="ghost" size="sm" onClick={() => setExpandedStat(isExpanded ? null : stat)} className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground">
                        <HelpCircle className="w-3 h-3 mr-0.5" />
                        Why?
                        {isExpanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                      </Button>
                    )}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-base font-bold transition-colors duration-300',
                      isCritical ? 'text-destructive' : isRapidDrop ? 'text-amber-500 animate-pulse' : isLow ? 'text-chart-1' : 'text-muted-foreground',
                    )}
                  >
                    {Math.round(value)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className={cn('h-3 flex-1 rounded-full overflow-hidden transition-all duration-300', isRapidDrop ? 'bg-amber-500/20 ring-2 ring-amber-500/30' : config.bgColor)}>
                    <div
                      className={cn('h-full rounded-full transition-all duration-500 ease-out relative', isRapidDrop ? 'bg-amber-500' : config.color, isCritical && 'animate-pulse')}
                      style={{ width: `${Math.max(value, 2)}%` }}
                    >
                      {value > 30 && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />}
                    </div>
                  </div>

                  {/* Action button for low stats */}
                  {isLow && (
                    <Button
                      size="sm"
                      onClick={() => performAction(config.action)}
                      className={cn('shrink-0 h-7 text-xs font-semibold px-3', isCritical ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white')}
                    >
                      {config.actionLabel}
                    </Button>
                  )}
                </div>

                {/* Expanded "Why?" section */}
                {isExpanded && (
                  <div className="mt-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 animate-fade-in">
                    <p className="text-xs font-semibold text-amber-700 mb-2">Why is {config.label} low?</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>
                        📉 <span className="font-medium">Natural decay:</span> {config.decayInfo}
                      </p>
                      <p>
                        ⬆️ <span className="font-medium">To increase:</span> {config.boostInfo}
                      </p>
                      {recentActions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-amber-500/20">
                          <p className="font-medium text-amber-700 mb-1">Recent effects:</p>
                          {recentActions.map((log) => (
                            <p key={log.id} className="flex items-center gap-1">
                              <span>{log.icon}</span>
                              <span>{log.action}:</span>
                              <span className={cn('font-mono', (log.statChanges?.[stat] || 0) >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                                {(log.statChanges?.[stat] || 0) >= 0 ? '+' : ''}
                                {log.statChanges?.[stat]}
                              </span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Warning message */}
                {isLow && !isExpanded && (
                  <div className={cn('flex items-center gap-1.5 mt-1.5 text-xs', isCritical ? 'text-destructive' : 'text-chart-1')}>
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
              className={cn('h-full rounded-full transition-all duration-500', avgStats >= 70 ? 'bg-secondary' : avgStats >= 50 ? 'bg-chart-3' : avgStats >= 30 ? 'bg-chart-1' : 'bg-destructive')}
              style={{ width: `${avgStats}%` }}
            />
          </div>
        </div>

        {/* Sleep Action */}
        <SleepAction />
      </div>
    </TooltipProvider>
  );
};

export default NotificationsPanel;
