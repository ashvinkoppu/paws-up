/**
 * PetDeathOverlay -- Full-screen modal shown when the pet dies.
 *
 * Death occurs when all five stats drop critically low simultaneously.
 * The overlay displays:
 *  - An animated heartbeat crying emoji.
 *  - The pet's final stat snapshot (hunger, happiness, energy, cleanliness, health).
 *  - A summary of the player's run: total days played, level reached, best care streak.
 *  - A "Try Again" button that triggers a full game reset via onReset.
 *
 * Uses custom CSS keyframe animations (deathFadeIn, deathCardPop, deathHeartbeat)
 * for the entrance effect rather than Tailwind utility classes.
 *
 * @prop pet             - The pet object at time of death (for name, stats, level).
 * @prop totalDaysPlayed - Number of in-game days the player completed.
 * @prop careStreak      - The player's best consecutive care streak.
 * @prop onReset         - Callback to reset the entire game state and return to pet creation.
 */
import React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pet } from "@/types/game";

interface PetDeathOverlayProps {
  pet: Pet;
  totalDaysPlayed: number;
  careStreak: number;
  onReset: () => void;
}

const PetDeathOverlay: React.FC<PetDeathOverlayProps> = ({
  pet,
  totalDaysPlayed,
  careStreak,
  onReset,
}) => {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md"
      style={{
        animation: "deathFadeIn 1s ease-out",
      }}
    >
      <div
        className="bg-card rounded-3xl shadow-2xl border border-border/60 overflow-hidden max-w-md w-[90vw]"
        style={{
          animation: "deathCardPop 0.8s ease-out 0.3s both",
        }}
      >
        <div className="bg-gradient-to-b from-rose-100/80 via-rose-50/50 to-transparent px-8 py-10 flex flex-col items-center gap-6">
          <div
            className="w-24 h-24 rounded-full bg-rose-100 flex items-center justify-center"
            style={{ animation: "deathHeartbeat 2s ease-in-out infinite" }}
          >
            <span className="text-5xl">{"😢"}</span>
          </div>

          <div className="text-center">
            <h2 className="font-serif font-bold text-2xl text-foreground mb-2">
              {pet.name} has passed away...
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Your pet was neglected for too long. All their stats became
              critically low at the same time.
            </p>
          </div>

          <div className="w-full bg-rose-50/50 rounded-xl p-4 border border-rose-200/50">
            <p className="text-xs text-rose-600 font-medium mb-2 text-center">
              Final Stats
            </p>
            <div className="grid grid-cols-5 gap-2 text-center">
              <div>
                <span className="text-lg">{"🍖"}</span>
                <p className="text-[10px] text-rose-700 font-mono">
                  {Math.round(pet.stats.hunger)}%
                </p>
              </div>
              <div>
                <span className="text-lg">{"😊"}</span>
                <p className="text-[10px] text-rose-700 font-mono">
                  {Math.round(pet.stats.happiness)}%
                </p>
              </div>
              <div>
                <span className="text-lg">{"⚡"}</span>
                <p className="text-[10px] text-rose-700 font-mono">
                  {Math.round(pet.stats.energy)}%
                </p>
              </div>
              <div>
                <span className="text-lg">{"🧼"}</span>
                <p className="text-[10px] text-rose-700 font-mono">
                  {Math.round(pet.stats.cleanliness)}%
                </p>
              </div>
              <div>
                <span className="text-lg">{"❤️"}</span>
                <p className="text-[10px] text-rose-700 font-mono">
                  {Math.round(pet.stats.health)}%
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="text-center">
              <p className="font-mono font-bold text-lg text-foreground">
                {totalDaysPlayed}
              </p>
              <p className="text-[10px]">Days</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="font-mono font-bold text-lg text-foreground">
                {pet.level}
              </p>
              <p className="text-[10px]">Level</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="font-mono font-bold text-lg text-foreground">
                {careStreak}
              </p>
              <p className="text-[10px]">Best Streak</p>
            </div>
          </div>

          <Button
            onClick={onReset}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-chart-5 hover:from-primary/90 hover:to-chart-5/90 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Try Again
          </Button>

          <p className="text-[10px] text-muted-foreground/60">
            This will reset all progress and start a new game.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PetDeathOverlay;
