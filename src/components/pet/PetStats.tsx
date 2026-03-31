/**
 * PetStats -- Displays all five vital-sign bars (hunger, happiness, energy,
 * cleanliness, health) with real-time visual feedback.
 *
 * Each stat bar shows:
 *  - Current percentage with a color-coded fill.
 *  - A "dropping fast" indicator when the stat fell >= 3 points since the
 *    last 10-second snapshot (tracked via previousStats / lastCheckRef).
 *  - A low-stat warning with a "Why?" button that opens a modal explaining
 *    the cause and suggesting remedies.
 *  - An info tooltip (on hover) describing what increases/decreases the stat.
 *
 * Also renders:
 *  - An overall wellness bar (average of all five stats).
 *  - An overall status badge (Excellent / Good / Fair / Needs Care) that
 *    uses a two-tier approach: any single critically-low stat overrides
 *    the average-based label.
 *  - A collapsible action log showing the 10 most recent game actions
 *    with timestamps formatted as 12-hour game time.
 */
import React, { useState, useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { PetStats as PetStatsType } from "@/types/game";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  X,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Tooltips explaining how each stat works
const STAT_TOOLTIPS: Record<
  keyof PetStatsType,
  {
    description: string;
    increases: string;
    decreases: string;
  }
> = {
  hunger: {
    description:
      "How full your pet is. Low hunger makes your pet weak and unhappy.",
    increases: "Feed your pet with food items from the shop.",
    decreases: "Naturally over time. Playing and activities also drain hunger.",
  },
  happiness: {
    description: "How content your pet feels. Happy pets earn more XP!",
    increases: "Play with toys, give attention, use fun items.",
    decreases: "Over time, when neglected, or during stressful events.",
  },
  energy: {
    description: "Your pet's stamina. Low energy makes them sluggish.",
    increases: "Let your pet rest or put them to sleep at night.",
    decreases: "Playing, activities, and time. Faster during active play.",
  },
  cleanliness: {
    description: "How clean your pet is. Affects health if too low.",
    increases: "Use cleaning supplies and grooming items.",
    decreases: "Over time, and faster during play or outdoor activities.",
  },
  health: {
    description:
      "Overall health. Critical stat - if it drops too low, your pet gets sick!",
    increases: "Use health items, visit vet, keep other stats high.",
    decreases: "When hunger or cleanliness is critically low.",
  },
};

const STAT_CONFIG: Record<
  keyof PetStatsType,
  {
    label: string;
    icon: string;
    color: string;
    bgColor: string;
    lowWarning: number;
    warning: string;
    dropColor: string; // Color when stat is dropping fast
  }
> = {
  hunger: {
    label: "Hunger",
    icon: "🍖",
    color: "bg-chart-1",
    bgColor: "bg-chart-1/20",
    lowWarning: 30,
    warning: "Your pet is hungry!",
    dropColor: "bg-orange-500",
  },
  happiness: {
    label: "Happiness",
    icon: "💕",
    color: "bg-chart-2",
    bgColor: "bg-chart-2/20",
    lowWarning: 25,
    warning: "Your pet needs attention!",
    dropColor: "bg-rose-500",
  },
  energy: {
    label: "Energy",
    icon: "⚡",
    color: "bg-chart-3",
    bgColor: "bg-chart-3/20",
    lowWarning: 20,
    warning: "Your pet is tired!",
    dropColor: "bg-yellow-600",
  },
  cleanliness: {
    label: "Clean",
    icon: "✨",
    color: "bg-chart-4",
    bgColor: "bg-chart-4/20",
    lowWarning: 25,
    warning: "Your pet needs grooming!",
    dropColor: "bg-amber-600",
  },
  health: {
    label: "Health",
    icon: "❤️",
    color: "bg-chart-5",
    bgColor: "bg-chart-5/20",
    lowWarning: 40,
    warning: "Visit the vet!",
    dropColor: "bg-red-600",
  },
};

interface StatBarProps {
  stat: keyof PetStatsType;
  value: number;
  previousValue: number;
  index: number;
  onWhyClick: (stat: keyof PetStatsType) => void;
}

const StatBar: React.FC<StatBarProps> = ({
  stat,
  value,
  previousValue,
  index,
  onWhyClick,
}) => {
  const config = STAT_CONFIG[stat];
  const tooltip = STAT_TOOLTIPS[stat];
  const isLow = value <= config.lowWarning;
  const isCritical = value <= 15;
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate rate of change
  const changeRate = value - previousValue;
  const isDroppingFast = changeRate <= -3; // Dropping more than 3 points since last check

  return (
    <div
      className={cn(
        "animate-slide-in-left opacity-0 relative group",
        isLow && "relative",
      )}
      style={{
        animationDelay: `${index * 0.05}s`,
        animationFillMode: "forwards",
      }}
    >
      <div className="flex justify-between items-center mb-1.5">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "text-lg transition-transform duration-300",
              isLow && "animate-wiggle",
            )}
          >
            {config.icon}
          </span>
          <span className="font-medium text-sm text-foreground">
            {config.label}
          </span>
          {/* Info tooltip trigger */}
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded-full"
          >
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </span>
        <div className="flex items-center gap-2">
          {/* Rate of change indicator */}
          {isDroppingFast && (
            <span className="flex items-center gap-1 text-[10px] text-destructive animate-pulse">
              <TrendingDown className="w-3 h-3" />
              <span>-{Math.abs(Math.round(changeRate))}</span>
            </span>
          )}
          <span
            className={cn(
              "font-mono text-sm font-semibold transition-colors duration-300",
              isCritical
                ? "text-destructive"
                : isLow
                  ? "text-chart-1"
                  : "text-muted-foreground",
            )}
          >
            {Math.round(value)}%
          </span>
        </div>
      </div>

      {/* Tooltip popup */}
      {showTooltip && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 p-3 bg-card/98 backdrop-blur-xl rounded-xl border shadow-xl animate-fade-in-up">
          <div className="flex justify-between items-start mb-2">
            <span className="font-semibold text-sm text-foreground">
              {config.label}
            </span>
            <button
              onClick={() => setShowTooltip(false)}
              className="p-0.5 hover:bg-muted rounded-full"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {tooltip.description}
          </p>
          <div className="space-y-1.5 text-[11px]">
            <p>
              <span className="text-secondary font-medium">↑ Increases:</span>{" "}
              {tooltip.increases}
            </p>
            <p>
              <span className="text-destructive font-medium">↓ Decreases:</span>{" "}
              {tooltip.decreases}
            </p>
          </div>
        </div>
      )}

      {/* Progress bar container */}
      <div
        className={cn(
          "h-3 rounded-full overflow-hidden transition-all duration-300",
          config.bgColor,
        )}
      >
        {/* Progress bar fill */}
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out relative",
            isDroppingFast ? config.dropColor : config.color,
            isCritical && "animate-pulse",
          )}
          style={{ width: `${Math.max(value, 2)}%` }}
        >
          {/* Shine effect */}
          {value > 30 && !isDroppingFast && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          )}
        </div>
      </div>

      {/* Warning message with "Why?" button */}
      {isLow && (
        <div
          className={cn(
            "flex items-center justify-between mt-1.5 text-xs",
            isCritical ? "text-destructive" : "text-chart-1",
          )}
        >
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            <span>{config.warning}</span>
          </div>
          <button
            onClick={() => onWhyClick(stat)}
            className="flex items-center gap-1 px-2 py-0.5 bg-muted/50 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Why?</span>
          </button>
        </div>
      )}
    </div>
  );
};

const PetStats: React.FC = () => {
  const { state } = useGame();
  const [previousStats, setPreviousStats] = useState<PetStatsType | null>(null);
  const [whyModalStat, setWhyModalStat] = useState<keyof PetStatsType | null>(
    null,
  );
  const [showActionLog, setShowActionLog] = useState(false);
  const lastCheckRef = useRef<number>(Date.now());

  // Track previous stat values to detect fast drops
  useEffect(() => {
    if (!state.pet) return;

    const now = Date.now();
    // Update previous stats every 10 seconds
    if (now - lastCheckRef.current > 10000) {
      setPreviousStats(state.pet.stats);
      lastCheckRef.current = now;
    }
  }, [state.pet?.stats]);

  // Initialize previous stats
  useEffect(() => {
    if (state.pet && !previousStats) {
      setPreviousStats(state.pet.stats);
    }
  }, [state.pet, previousStats]);

  if (!state.pet) return null;

  const stats = state.pet.stats;
  const avgStats =
    Object.values(stats).reduce((sum, value) => sum + value, 0) / 5;

  const getOverallStatus = () => {
    const lowestStat = Math.min(...Object.values(stats));

    // A critically low stat overrides the average-based label
    if (lowestStat <= 10)
      return {
        label: "Needs Care",
        color: "bg-destructive/15 text-destructive border-destructive/30",
      };
    if (lowestStat <= 25)
      return {
        label: "Fair",
        color: "bg-chart-1/15 text-chart-1 border-chart-1/30",
      };

    if (avgStats >= 70)
      return {
        label: "Excellent",
        color: "bg-secondary/15 text-secondary border-secondary/30",
      };
    if (avgStats >= 50)
      return {
        label: "Good",
        color: "bg-chart-3/15 text-chart-3 border-chart-3/30",
      };
    if (avgStats >= 30)
      return {
        label: "Fair",
        color: "bg-chart-1/15 text-chart-1 border-chart-1/30",
      };
    return {
      label: "Needs Care",
      color: "bg-destructive/15 text-destructive border-destructive/30",
    };
  };

  const getWhyExplanation = (stat: keyof PetStatsType): string => {
    const statValue = stats[stat];
    const reasons: string[] = [];

    // General decay
    reasons.push(
      "Stats naturally decay over time as part of the game mechanics.",
    );

    // Specific reasons based on stat
    switch (stat) {
      case "hunger":
        reasons.push("Your pet gets hungry faster when active or playing.");
        if (state.pet?.personality === "playful") {
          reasons.push("Playful pets use more energy and get hungry faster.");
        }
        break;
      case "happiness":
        reasons.push(
          "Happiness drops when your pet is neglected or other stats are low.",
        );
        if (stats.hunger < 30)
          reasons.push("Low hunger is making your pet unhappy.");
        if (stats.energy < 20)
          reasons.push("Being tired is affecting their mood.");
        break;
      case "energy":
        reasons.push(
          "Energy depletes with activities and naturally over time.",
        );
        reasons.push("Put your pet to sleep at night to restore energy!");
        break;
      case "cleanliness":
        reasons.push("Pets get dirty over time, especially after playing.");
        if (state.pet?.personality === "curious") {
          reasons.push("Curious pets explore more and get dirty faster.");
        }
        break;
      case "health":
        if (stats.hunger < 30)
          reasons.push("Low hunger is directly affecting health!");
        if (stats.cleanliness < 30)
          reasons.push("Poor hygiene is causing health issues!");
        reasons.push("Keep hunger and cleanliness up to maintain health.");
        break;
    }

    return reasons.join(" ");
  };

  const status = getOverallStatus();
  const currentStats = previousStats || stats;

  // Format game time for action log
  const formatGameTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className="p-5 bg-card rounded-2xl border-2 border-border/50 shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-serif font-semibold text-lg text-foreground">
            Vital Signs
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Action Log Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActionLog(!showActionLog)}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <History className="w-3.5 h-3.5 mr-1" />
            <span className="text-[10px]">Log</span>
          </Button>
          <div
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300",
              status.color,
            )}
          >
            {status.label}
          </div>
        </div>
      </div>

      {/* Action Log Panel */}
      {showActionLog && (
        <div className="mb-4 p-3 bg-muted/30 rounded-xl border border-border/30 max-h-40 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-foreground">
              Recent Actions
            </span>
            <button onClick={() => setShowActionLog(false)}>
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          {state.actionLog.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              No recent actions
            </p>
          ) : (
            <div className="space-y-1.5">
              {state.actionLog.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-xs">
                  <span>{log.icon}</span>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">
                      {log.action}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      - {log.description}
                    </span>
                    {log.statChanges && (
                      <span className="ml-1 text-secondary">
                        {Object.entries(log.statChanges)
                          .map(([key, val]) =>
                            val ? `${key}: ${val > 0 ? "+" : ""}${val}` : null,
                          )
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground/60 text-[10px]">
                    {formatGameTime(log.gameTime)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats list */}
      <div className="space-y-4">
        {(Object.keys(stats) as (keyof PetStatsType)[]).map((stat, index) => (
          <StatBar
            key={stat}
            stat={stat}
            value={stats[stat]}
            previousValue={currentStats[stat]}
            index={index}
            onWhyClick={setWhyModalStat}
          />
        ))}
      </div>

      {/* "Why?" Modal */}
      {whyModalStat && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-2xl p-5 m-4 max-w-sm w-full shadow-2xl border animate-scale-in">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {STAT_CONFIG[whyModalStat].icon}
                </span>
                <h4 className="font-serif font-bold text-lg">
                  Why is {STAT_CONFIG[whyModalStat].label} low?
                </h4>
              </div>
              <button
                onClick={() => setWhyModalStat(null)}
                className="p-1 hover:bg-muted rounded-full"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {getWhyExplanation(whyModalStat)}
            </p>
            <div className="p-3 bg-secondary/10 rounded-xl border border-secondary/20">
              <p className="text-xs font-medium text-secondary">
                💡 Tip: {STAT_TOOLTIPS[whyModalStat].increases}
              </p>
            </div>
            <Button
              onClick={() => setWhyModalStat(null)}
              className="w-full mt-4"
              variant="outline"
            >
              Got it!
            </Button>
          </div>
        </div>
      )}

      {/* Overall health indicator */}
      <div className="mt-5 pt-4 border-t border-border/50">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Overall Wellness</span>
          <span className="font-mono font-semibold text-foreground">
            {Math.round(avgStats)}%
          </span>
        </div>
        <div className="mt-2 h-2 bg-muted/30 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              avgStats >= 70
                ? "bg-secondary"
                : avgStats >= 50
                  ? "bg-chart-3"
                  : avgStats >= 30
                    ? "bg-chart-1"
                    : "bg-destructive",
            )}
            style={{ width: `${avgStats}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PetStats;
