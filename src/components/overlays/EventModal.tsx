/**
 * EventModal - Centered modal presenting random in-game events to the player.
 *
 * Events are drawn from game state (emergencies, sickness, discounts, rewards)
 * and displayed as a focused card with clear action hierarchy.
 * Choices that cost more than the player has are disabled.
 *
 * Hidden automatically while a mini-game is in progress.
 */
import React from "react";
import { useGame } from "@/context/GameContext";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type EventType =
  | "emergency"
  | "sickness"
  | "discount"
  | "reward"
  | "broken"
  | "opportunity";

interface TypeConfig {
  label: string;
  className: string;
}

const TYPE_CONFIG: Record<EventType, TypeConfig> = {
  emergency: {
    label: "Emergency",
    className:
      "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50",
  },
  sickness: {
    label: "Sickness",
    className:
      "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50",
  },
  discount: {
    label: "Flash Sale",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50",
  },
  reward: {
    label: "Reward",
    className:
      "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800/50",
  },
  broken: {
    label: "Damaged",
    className:
      "bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/50",
  },
  opportunity: {
    label: "Opportunity",
    className:
      "bg-violet-50 text-violet-700 border-violet-200/80 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/50",
  },
};

const FALLBACK_CONFIG: TypeConfig = {
  label: "Event",
  className: "bg-accent text-muted-foreground border-border",
};

const EventModal: React.FC = () => {
  const { state, handleEventChoice, isPlayingMiniGame } = useGame();

  if (!state.currentEvent || isPlayingMiniGame) return null;

  const event = state.currentEvent;
  const typeConfig = TYPE_CONFIG[event.type as EventType] ?? FALLBACK_CONFIG;

  // Primary = first choice the player can afford (or first free choice)
  const primaryIndex = event.choices.findIndex(
    (choice) => !choice.cost || state.money >= choice.cost,
  );
  const allUnaffordable = primaryIndex === -1;
  const hasAnyCost = event.choices.some((choice) => choice.cost);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div
        className={cn(
          "max-w-sm w-full mx-4 bg-card border border-border rounded-2xl shadow-xl",
          "animate-in zoom-in-95 slide-in-from-bottom-2 duration-200",
        )}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <span
            className={cn(
              "inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border",
              typeConfig.className,
            )}
          >
            {typeConfig.label}
          </span>

          <h2
            id="event-modal-title"
            className="font-serif text-xl font-bold text-foreground leading-snug mt-3 mb-2"
          >
            {event.title}
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Actions */}
        <div className="px-5 py-4 space-y-2">
          {event.choices.map((choice, index) => {
            const canAfford = !choice.cost || state.money >= choice.cost;
            const isPrimary = index === primaryIndex && canAfford;

            return (
              <button
                key={index}
                onClick={() => handleEventChoice(index)}
                disabled={!canAfford}
                className={cn(
                  "w-full rounded-xl px-4 py-3 text-left transition-all duration-150",
                  "flex items-center justify-between gap-3",
                  isPrimary
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99] shadow-sm"
                    : canAfford
                      ? "bg-background border border-border text-foreground hover:bg-accent active:scale-[0.99]"
                      : "bg-background border border-border/50 text-muted-foreground cursor-not-allowed opacity-50",
                )}
              >
                <span className="text-sm font-medium leading-snug">
                  {choice.text}
                </span>

                {choice.moneyEffect !== undefined && choice.moneyEffect > 0 && (
                  <span
                    className={cn(
                      "text-xs font-mono font-semibold shrink-0",
                      isPrimary ? "text-primary-foreground/80" : "text-emerald-600",
                    )}
                  >
                    +${choice.moneyEffect}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Balance footer — only shown when choices involve money */}
        {hasAnyCost && (
          <div className="px-5 pb-4 flex flex-col items-center gap-1.5">
            {allUnaffordable && (
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Insufficient funds for all options</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Balance:{" "}
              <span className="font-mono font-semibold text-foreground">
                ${state.money.toFixed(0)}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventModal;
