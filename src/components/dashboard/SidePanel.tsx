/**
 * @file SidePanel.tsx
 *
 * A compact "Pet Status" card displayed in the left column of the dashboard,
 * directly below the PetDisplay. Shows an overall health label (Excellent /
 * Good / Fair / Needs Care) plus an inline row of all five stat values with
 * color-coded text and wiggle animation when a stat drops below 30%.
 *
 * Overall status logic:
 * - If any single stat is critically low (<= 10 or <= 25), the label reflects
 *   that urgency regardless of the average.
 * - Otherwise the label is derived from the mean of all five stats.
 *
 * Uses the shared STAT_CONFIG from `src/data/statConfig.ts` to keep icons,
 * labels, and color thresholds consistent with NotificationsPanel.
 */
import React from 'react';
import { useGame } from '@/context/GameContext';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PetStats } from '@/types/game';
import { STAT_CONFIG, getStatColor } from '@/data/statConfig';

const SidePanel: React.FC = () => {
  const { state } = useGame();
  const { pet } = state;

  if (!pet) return null;

  const stats = pet.stats;
  const avgStats = Object.values(stats).reduce((sum, value) => sum + value, 0) / 5;

  const getOverallStatus = () => {
    const lowestStat = Math.min(...Object.values(stats));

    if (lowestStat <= 10) return { label: 'Needs Care', color: 'bg-red-500/15 text-red-600 border-red-500/30' };
    if (lowestStat <= 25) return { label: 'Fair', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30' };

    if (avgStats >= 70) return { label: 'Excellent', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' };
    if (avgStats >= 50) return { label: 'Good', color: 'bg-teal-500/15 text-teal-600 border-teal-500/30' };
    if (avgStats >= 30) return { label: 'Fair', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30' };
    return { label: 'Needs Care', color: 'bg-red-500/15 text-red-600 border-red-500/30' };
  };

  const status = getOverallStatus();

  return (
    <div className="glass-card rounded-2xl shadow-md overflow-hidden transition-all duration-300">
      {/* Header - Clickable to toggle */}
      <div
        className="px-4 py-3 border-b border-border/30 bg-gradient-to-r from-accent/30 via-accent/15 to-transparent"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-serif font-semibold text-base text-foreground">Pet Status</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all duration-300",
              status.color
            )}>
              {status.label}
            </div>
          </div>
        </div>

        {/* Compact stat preview row */}
        <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-border/30">
          {(Object.keys(STAT_CONFIG) as (keyof PetStats)[]).map((stat) => {
            const value = stats[stat];
            const colors = getStatColor(value);
            const config = STAT_CONFIG[stat];
            return (
              <div
                key={stat}
                className="flex items-center gap-1"
                title={`${config.label}: ${Math.round(value)}%`}
              >
                <span className={cn(
                  "text-sm transition-transform",
                  value <= 30 && "animate-wiggle"
                )}>
                  {config.icon}
                </span>
                <span className={cn(
                  "text-xs font-mono font-bold",
                  colors.textColor
                )}>
                  {Math.round(value)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
