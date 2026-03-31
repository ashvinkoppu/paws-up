/**
 * PetDisplay -- The main visual hub for the player's pet.
 *
 * Renders the pet image inside an animated aura circle whose appearance
 * (color, particles, animation) is driven by the pet's current mood.
 * Mood is derived from a two-tier check: any single critically low stat
 * overrides the average-health-based mood label (see `getMood`).
 *
 * Also handles:
 *  - Growth stage evolution animation (baby -> teen -> adult) with sparkle
 *    burst, expanding rings, and white-flash overlay.
 *  - Level-up confetti overlay triggered by XP gains.
 *  - Eating animation when the pet is fed (food emoji float + "nom nom").
 *  - Item-use particle effects per category (toy, grooming, medicine, accessory).
 *  - Equipped accessory emoji overlays positioned per species + slot.
 *  - Sleep state with floating "zzz" and dimmed image.
 *  - Top badges for growth stage progress, level/XP, care streak, days played.
 *  - Achievement badge row and weekly budget snapshot bar.
 *
 * @prop onXpClick   - Opens the daily tasks panel when the level badge is clicked.
 * @prop onFinanceClick - Opens the finance panel when the budget card is clicked.
 */
import React, { useState, useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import {
  Species,
  GrowthStage,
  PetColor,
  AccessorySlot,
  GROWTH_THRESHOLDS,
} from "@/types/game";
import { cn } from "@/lib/utils";
import {
  Flame,
  Calendar,
  AlertTriangle,
  Heart,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { calculateLevel } from "@/data/tasks";
import { getAccessoryById, ACCESSORY_POSITIONS } from "@/data/accessories";
import ConfettiOverlay from "@/components/overlays/ConfettiOverlay";

// Mood visual config - controls aura, pet animation, and ambient particles
type MoodVisual = {
  auraColor: string;
  auraIntensity: string;
  petAnimation: string;
  particles: "sparkle" | "hearts" | "sweat" | "alert" | "none";
  petFilter: string;
};

const MOOD_VISUALS: Record<string, MoodVisual> = {
  thriving: {
    auraColor: "from-emerald-400/25 via-yellow-300/15 to-emerald-400/25",
    auraIntensity:
      "shadow-[0_0_30px_hsl(152,45%,36%,0.2),0_0_60px_hsl(40,88%,52%,0.1)]",
    petAnimation: "animate-float",
    particles: "sparkle",
    petFilter: "",
  },
  happy: {
    auraColor: "from-green-400/15 via-emerald-300/10 to-green-400/15",
    auraIntensity: "shadow-[0_0_20px_hsl(152,45%,36%,0.15)]",
    petAnimation: "animate-float",
    particles: "hearts",
    petFilter: "",
  },
  okay: {
    auraColor: "from-amber-300/10 via-orange-200/5 to-amber-300/10",
    auraIntensity: "",
    petAnimation: "animate-breathe",
    particles: "none",
    petFilter: "",
  },
  needsAttention: {
    auraColor: "from-orange-400/15 via-amber-300/10 to-orange-400/15",
    auraIntensity: "shadow-[0_0_20px_hsl(24,82%,50%,0.15)]",
    petAnimation: "animate-pet-droopy",
    particles: "sweat",
    petFilter: "saturate(0.8)",
  },
  critical: {
    auraColor: "from-red-400/20 via-rose-300/15 to-red-400/20",
    auraIntensity: "shadow-[0_0_25px_hsl(355,75%,44%,0.2)]",
    petAnimation: "animate-breathe",
    particles: "alert",
    petFilter: "saturate(0.5) brightness(0.9)",
  },
};

import { PET_IMAGES, PET_COLOR_FILTERS } from "@/data/petVisuals";

const STAGE_CONFIG: Record<
  GrowthStage,
  { scale: string; label: string; imageSize: string }
> = {
  baby: { scale: "scale-75", label: "Baby", imageSize: "w-28 h-28" },
  teen: { scale: "scale-90", label: "Growing", imageSize: "w-32 h-32" },
  adult: { scale: "scale-100", label: "Adult", imageSize: "w-36 h-36" },
};

const EVOLUTION_SPARKLE_POSITIONS = [
  { x: "-40px", y: "-40px" },
  { x: "40px", y: "-35px" },
  { x: "-35px", y: "30px" },
  { x: "45px", y: "25px" },
  { x: "0px", y: "-50px" },
  { x: "-50px", y: "0px" },
  { x: "50px", y: "5px" },
  { x: "5px", y: "45px" },
  { x: "-25px", y: "-48px" },
  { x: "30px", y: "40px" },
];

const EATING_FOOD_EMOJIS = ["🍖", "🥣", "🍗", "🥩", "🧆"];

// Category-specific particle emojis for item use animations
const CATEGORY_PARTICLES: Record<string, string[]> = {
  toy: ["⚽", "🎾", "🏀", "🔴", "🟡"],
  grooming: ["✨", "💫", "🫧", "🧼", "💧"],
  medicine: ["💊", "💖", "❤️", "🩹", "💗"],
  accessory: ["⭐", "🌟", "✨", "💎", "🎀"],
};

interface ItemUseParticle {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  duration: number;
  category: string;
}

interface PetDisplayProps {
  onXpClick?: () => void;
  onFinanceClick?: () => void;
  showFinanceSnapshot?: boolean;
}

const PetDisplay: React.FC<PetDisplayProps> = ({
  onXpClick,
  onFinanceClick,
  showFinanceSnapshot = true,
}) => {
  const { state, lastActionFeedback } = useGame();
  const { petAsleep } = state;
  const pet = state.pet;
  const petStage = pet?.stage;
  const petLevel = pet?.level;
  const hasPet = pet !== null;

  const [interaction, setInteraction] = useState<"none" | "happy" | "sad">(
    "none",
  );
  const [eatingState, setEatingState] = useState<"idle" | "eating" | "done">(
    "idle",
  );
  const [eatingEmoji, setEatingEmoji] = useState("🍖");
  const [hungerAfter, setHungerAfter] = useState<number | null>(null);
  const [itemUseParticles, setItemUseParticles] = useState<ItemUseParticle[]>(
    [],
  );
  const [itemUseLabel, setItemUseLabel] = useState<string | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionTarget, setEvolutionTarget] = useState<GrowthStage | null>(
    null,
  );
  const [showLevelUpConfetti, setShowLevelUpConfetti] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(1);
  const previousStageRef = useRef<GrowthStage>(petStage ?? "baby");
  const previousLevelRef = useRef<number>(petLevel ?? 1);
  const lastFeedTimestamp = useRef<number>(0);
  const lastItemUseTimestamp = useRef<number>(0);
  const particleIdRef = useRef(0);

  // Detect stage evolution
  useEffect(() => {
    if (!petStage) return;
    const currentStage = petStage;
    const previousStage = previousStageRef.current;

    if (currentStage !== previousStage) {
      const stageOrder: GrowthStage[] = ["baby", "teen", "adult"];
      const previousIndex = stageOrder.indexOf(previousStage);
      const currentIndex = stageOrder.indexOf(currentStage);

      // Only animate forward evolution (not regression)
      if (currentIndex > previousIndex) {
        setEvolutionTarget(currentStage);
        setIsEvolving(true);

        const evolutionTimer = setTimeout(() => {
          setIsEvolving(false);
          setEvolutionTarget(null);
        }, 3200);

        previousStageRef.current = currentStage;
        return () => clearTimeout(evolutionTimer);
      }

      previousStageRef.current = currentStage;
    }
  }, [petStage]);

  // Detect level up
  useEffect(() => {
    if (!petLevel) return;
    const currentLevel = petLevel;
    const previousLevel = previousLevelRef.current;

    if (currentLevel > previousLevel) {
      setLevelUpLevel(currentLevel);
      setShowLevelUpConfetti(true);

      const confettiTimer = setTimeout(() => {
        setShowLevelUpConfetti(false);
      }, 3500);

      previousLevelRef.current = currentLevel;
      return () => clearTimeout(confettiTimer);
    }

    previousLevelRef.current = currentLevel;
  }, [petLevel]);

  // Handle eating animation (food items)
  useEffect(() => {
    if (
      hasPet &&
      lastActionFeedback &&
      lastActionFeedback.action === "feed" &&
      lastActionFeedback.timestamp !== lastFeedTimestamp.current
    ) {
      lastFeedTimestamp.current = lastActionFeedback.timestamp;
      setEatingEmoji(
        EATING_FOOD_EMOJIS[
          Math.floor(Math.random() * EATING_FOOD_EMOJIS.length)
        ],
      );
      setEatingState("eating");
      setHungerAfter(lastActionFeedback.statValue ?? null);

      // After eating animation, show the stat result
      const doneTimer = setTimeout(() => {
        setEatingState("done");
      }, 1400);

      // Clear everything
      const clearTimer = setTimeout(() => {
        setEatingState("idle");
        setHungerAfter(null);
      }, 3200);

      return () => {
        clearTimeout(doneTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [hasPet, lastActionFeedback]);

  // Handle item-use animation (toys, grooming, medicine, accessories)
  useEffect(() => {
    if (
      hasPet &&
      lastActionFeedback &&
      lastActionFeedback.action === "use-item" &&
      lastActionFeedback.timestamp !== lastItemUseTimestamp.current
    ) {
      lastItemUseTimestamp.current = lastActionFeedback.timestamp;
      const category = lastActionFeedback.category || "toy";
      const particleEmojis =
        CATEGORY_PARTICLES[category] || CATEGORY_PARTICLES.toy;
      const itemIcon = lastActionFeedback.itemIcon || particleEmojis[0];

      // Generate particles - use the item's own icon plus category particles
      const particles: ItemUseParticle[] = [];
      const particleCount = category === "toy" ? 8 : 6;

      for (let index = 0; index < particleCount; index++) {
        const emoji =
          index < 3
            ? itemIcon
            : particleEmojis[Math.floor(Math.random() * particleEmojis.length)];
        particles.push({
          id: particleIdRef.current++,
          emoji,
          x: 10 + Math.random() * 80,
          delay: index * 0.12,
          duration: 1.2 + Math.random() * 0.6,
          category,
        });
      }

      setItemUseParticles(particles);
      setItemUseLabel(lastActionFeedback.itemName || null);

      // Trigger happy reaction on pet
      setInteraction("happy");
      setTimeout(() => setInteraction("none"), 1000);

      // Clear particles after animation
      const clearTimer = setTimeout(() => {
        setItemUseParticles([]);
        setItemUseLabel(null);
      }, 2500);

      return () => clearTimeout(clearTimer);
    }
  }, [hasPet, lastActionFeedback]);

  if (!pet) return null;
  const avgHealth =
    Object.values(pet.stats).reduce((sum, value) => sum + value, 0) / 5;

  const handlePetClick = () => {
    if (interaction !== "none") return;

    const lowestStat = Math.min(...Object.values(pet.stats));
    const isHappy = lowestStat >= 20 && avgHealth >= 40;

    setInteraction(isHappy ? "happy" : "sad");

    // Reset animation state after it completes
    setTimeout(() => {
      setInteraction("none");
    }, 1000);
  };

  const getMood = () => {
    const lowestStat = Math.min(...Object.values(pet.stats));

    // If any single stat is critically low, mood reflects that
    if (lowestStat < 10)
      return {
        emoji: "😢",
        text: "Critical!",
        color: "text-destructive",
        key: "critical",
      };
    if (lowestStat < 20)
      return {
        emoji: "😔",
        text: "Needs attention",
        color: "text-chart-2",
        key: "needsAttention",
      };

    // Otherwise use average health
    if (avgHealth >= 80)
      return {
        emoji: "😄",
        text: "Thriving!",
        color: "text-secondary",
        key: "thriving",
      };
    if (avgHealth >= 60)
      return {
        emoji: "😊",
        text: "Happy",
        color: "text-chart-3",
        key: "happy",
      };
    if (avgHealth >= 40)
      return { emoji: "😐", text: "Okay", color: "text-chart-1", key: "okay" };
    if (avgHealth >= 20)
      return {
        emoji: "😔",
        text: "Needs attention",
        color: "text-chart-2",
        key: "needsAttention",
      };
    return {
      emoji: "😢",
      text: "Critical!",
      color: "text-destructive",
      key: "critical",
    };
  };

  const mood = getMood();
  const stageConfig = STAGE_CONFIG[pet.stage];

  // Calculate growth progress (level-based thresholds)
  const getGrowthProgress = () => {
    if (pet.stage === "adult") return 100;

    const currentThreshold = GROWTH_THRESHOLDS[pet.stage];
    const nextStage = pet.stage === "baby" ? "teen" : "adult";
    const nextThreshold = GROWTH_THRESHOLDS[nextStage];

    // Safety check to avoid division by zero
    if (nextThreshold === currentThreshold) return 100;

    const progress =
      ((pet.level - currentThreshold) / (nextThreshold - currentThreshold)) *
      100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const growthProgress = getGrowthProgress();
  const levelInfo = calculateLevel(pet.experience);
  const unlockedAchievements = state.achievements.filter(
    (achievement) => achievement.unlocked,
  );

  return (
    <div className="relative bg-card border border-border rounded-xl shadow-sm p-6">
      <div className="relative flex flex-col items-center">
        {/* Top badges row */}
        <div className="w-full flex flex-wrap justify-between items-center mb-4 gap-2 px-1">
          {/* Stage Badge with Growth Progress */}
          <div className="flex items-center gap-2 px-3 py-2 bg-accent/60 rounded-xl border border-border/50">
            <span className="text-xs font-semibold text-accent-foreground capitalize">
              {stageConfig.label}
            </span>
            {pet.stage !== "adult" && (
              <div className="flex flex-col justify-center h-full">
                <div
                  className="w-12 h-1.5 bg-border rounded-full overflow-hidden"
                  title={`Growth to next stage: ${Math.round(growthProgress)}%`}
                >
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${growthProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Level Badge with XP Progress */}
          <div
            className="flex items-center gap-1.5 px-3 py-2 bg-secondary/10 rounded-xl border border-secondary/20 cursor-pointer hover:bg-secondary/20 transition-colors duration-200"
            onClick={onXpClick}
            title="View daily tasks"
          >
            <span className="text-xs font-semibold text-secondary">
              Lv {pet.level}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-12 h-1.5 bg-secondary/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-500"
                  style={{
                    width: `${(levelInfo.currentXp / levelInfo.xpForNext) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-secondary/70 whitespace-nowrap flex-shrink-0">
                {levelInfo.currentXp}/{levelInfo.xpForNext}
              </span>
            </div>
          </div>
        </div>

        {/* Pet Image Container */}
        {(() => {
          const moodVisual = MOOD_VISUALS[mood.key] || MOOD_VISUALS.okay;
          return (
            <div
              className={cn(
                "relative mt-2 mb-6 transition-all duration-500",
                stageConfig.scale,
              )}
            >
              {/* Mood aura - pulsing gradient ring behind the pet circle */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full transition-all duration-700",
                  isEvolving
                    ? "bg-gradient-to-br from-yellow-400/40 via-amber-300/30 to-yellow-400/40 animate-evolution-glow"
                    : `bg-gradient-to-br ${moodVisual.auraColor}`,
                  !isEvolving && moodVisual.auraIntensity,
                  !isEvolving && mood.key === "critical" && "animate-pulse",
                  !isEvolving &&
                    mood.key === "needsAttention" &&
                    "animate-breathe",
                )}
                style={{ transform: "scale(1.15)" }}
              />

              {/* Inner circle */}
              <div
                className={cn(
                  "w-48 h-48 rounded-full flex items-center justify-center relative overflow-hidden",
                  "bg-gradient-to-br from-accent/80 via-card to-card/60",
                  "border-2 border-border/20 shadow-xl ring-4 ring-white/10",
                )}
              >
                {/* Pet image - the pet itself animates based on mood */}
                <img
                  src={PET_IMAGES[pet.species]}
                  alt={pet.name}
                  onClick={handlePetClick}
                  className={cn(
                    "object-contain transition-all duration-500 drop-shadow-lg cursor-pointer hover:scale-105 active:scale-95",
                    stageConfig.imageSize,
                    isEvolving
                      ? "animate-evolution-scale-burst"
                      : petAsleep
                        ? "animate-pet-sleeping opacity-80"
                        : eatingState === "eating"
                          ? "animate-pet-eating"
                          : interaction === "happy"
                            ? "animate-happy-jump"
                            : interaction === "sad"
                              ? "animate-sad-shake"
                              : moodVisual.petAnimation,
                  )}
                  style={{
                    filter:
                      [
                        isEvolving
                          ? `${PET_COLOR_FILTERS[pet.color] || ""} brightness(1.3) saturate(1.4)`
                          : petAsleep
                            ? `${PET_COLOR_FILTERS[pet.color] || ""} brightness(0.85)`
                            : PET_COLOR_FILTERS[pet.color] || "",
                        isEvolving ? "" : moodVisual.petFilter,
                      ]
                        .filter(Boolean)
                        .join(" ") || undefined,
                  }}
                />

                {/* Evolution animation overlay */}
                {isEvolving && (
                  <>
                    {/* White flash overlay */}
                    <div className="absolute inset-0 rounded-full bg-white/70 pointer-events-none z-30 animate-evolution-flash" />

                    {/* Expanding ring effects */}
                    {[0, 1, 2].map((index) => (
                      <div
                        key={`ring-${index}`}
                        className="absolute inset-0 rounded-full border-yellow-400 pointer-events-none z-20 animate-evolution-ring"
                        style={{
                          animationDelay: `${index * 0.4}s`,
                          borderStyle: "solid",
                        }}
                      />
                    ))}

                    {/* Sparkle burst particles */}
                    {EVOLUTION_SPARKLE_POSITIONS.map((position, index) => (
                      <div
                        key={`evo-sparkle-${index}`}
                        className="absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-full pointer-events-none z-30 animate-evolution-sparkle"
                        style={
                          {
                            "--spark-x": position.x,
                            "--spark-y": position.y,
                            animationDelay: `${0.3 + index * 0.1}s`,
                            background:
                              index % 3 === 0
                                ? "#FFD700"
                                : index % 3 === 1
                                  ? "#FFA500"
                                  : "#FFFFFF",
                            boxShadow: `0 0 6px ${index % 3 === 0 ? "#FFD700" : index % 3 === 1 ? "#FFA500" : "#FFFFFF"}`,
                          } as React.CSSProperties
                        }
                      />
                    ))}

                    {/* Star emoji particles */}
                    {["⭐", "✨", "🌟", "⭐", "✨"].map((emoji, index) => (
                      <div
                        key={`evo-star-${index}`}
                        className="absolute top-1/2 left-1/2 text-xl pointer-events-none z-30 animate-evolution-sparkle"
                        style={
                          {
                            "--spark-x": `${Math.cos(index * 1.25) * 55}px`,
                            "--spark-y": `${Math.sin(index * 1.25) * 55}px`,
                            animationDelay: `${0.5 + index * 0.15}s`,
                          } as React.CSSProperties
                        }
                      >
                        {emoji}
                      </div>
                    ))}
                  </>
                )}

                {/* CSS-based ambient particles instead of emoji clusters */}
                {!petAsleep &&
                  eatingState === "idle" &&
                  moodVisual.particles === "sparkle" && (
                    <>
                      {[...Array(5)].map((_, index) => (
                        <div
                          key={`sparkle-${index}`}
                          className="absolute w-1.5 h-1.5 rounded-full bg-yellow-400/70 pointer-events-none animate-pet-sparkle"
                          style={{
                            left: `${15 + index * 17}%`,
                            top: `${10 + (index % 3) * 25}%`,
                            animationDelay: `${index * 0.6}s`,
                          }}
                        />
                      ))}
                    </>
                  )}

                {!petAsleep &&
                  eatingState === "idle" &&
                  moodVisual.particles === "hearts" && (
                    <>
                      {[...Array(3)].map((_, index) => (
                        <Heart
                          key={`heart-${index}`}
                          className="absolute w-3 h-3 text-rose-400/60 pointer-events-none animate-pet-heart-float fill-rose-400/40"
                          style={{
                            left: `${20 + index * 25}%`,
                            top: "15%",
                            animationDelay: `${index * 1.2}s`,
                          }}
                        />
                      ))}
                    </>
                  )}

                {!petAsleep &&
                  eatingState === "idle" &&
                  moodVisual.particles === "sweat" && (
                    <>
                      {[...Array(2)].map((_, index) => (
                        <div
                          key={`sweat-${index}`}
                          className="absolute w-1.5 h-2.5 rounded-b-full bg-blue-400/50 pointer-events-none animate-pet-sweat-drop"
                          style={{
                            right: `${18 + index * 12}%`,
                            top: "20%",
                            animationDelay: `${index * 1.5}s`,
                          }}
                        />
                      ))}
                    </>
                  )}

                {!petAsleep &&
                  eatingState === "idle" &&
                  moodVisual.particles === "alert" && (
                    <div className="absolute top-2 right-4 pointer-events-none z-20 animate-pulse">
                      <AlertTriangle className="w-5 h-5 text-red-500 drop-shadow-md" />
                    </div>
                  )}

                {/* Eating animation overlay */}
                {eatingState === "eating" && (
                  <>
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className="absolute pointer-events-none z-10 text-3xl animate-food-float"
                        style={{
                          left: `${20 + index * 25}%`,
                          top: "10%",
                          animationDelay: `${index * 0.25}s`,
                        }}
                      >
                        {eatingEmoji}
                      </div>
                    ))}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-nom-text">
                      <span className="font-serif font-bold text-lg text-primary">
                        nom nom
                      </span>
                    </div>
                  </>
                )}

                {/* Item use particle animation */}
                {itemUseParticles.length > 0 && (
                  <>
                    {itemUseParticles.map((particle) => (
                      <div
                        key={particle.id}
                        className={cn(
                          "absolute pointer-events-none z-10 text-2xl",
                          particle.category === "toy"
                            ? "animate-item-bounce"
                            : particle.category === "grooming"
                              ? "animate-item-sparkle"
                              : particle.category === "medicine"
                                ? "animate-item-float-up"
                                : "animate-item-twinkle",
                        )}
                        style={{
                          left: `${particle.x}%`,
                          top: particle.category === "medicine" ? "80%" : "5%",
                          animationDelay: `${particle.delay}s`,
                          animationDuration: `${particle.duration}s`,
                        }}
                      >
                        {particle.emoji}
                      </div>
                    ))}
                    {itemUseLabel && (
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-item-label">
                        <span className="font-serif font-bold text-lg text-secondary whitespace-nowrap">
                          {itemUseLabel}!
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Equipped accessory overlays - outside overflow-hidden circle so they aren't clipped */}
              {pet.equippedAccessories &&
                (
                  Object.entries(pet.equippedAccessories) as [
                    AccessorySlot,
                    string,
                  ][]
                ).map(([slot, accessoryId]) => {
                  if (!accessoryId) return null;
                  const accessory = getAccessoryById(accessoryId);
                  if (!accessory) return null;
                  if (accessory.condition) {
                    const statValue = pet.stats[accessory.condition.stat];
                    if (statValue < accessory.condition.min) return null;
                  }
                  const position = ACCESSORY_POSITIONS[pet.species]?.[slot];
                  if (!position) return null;
                  return (
                    <div
                      key={slot}
                      className="absolute pointer-events-none z-20 transition-all duration-300"
                      style={{
                        top: position.top,
                        left: position.left,
                        fontSize: position.fontSize,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <span
                        style={{
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                        }}
                      >
                        {accessory.emoji}
                      </span>
                    </div>
                  );
                })}

              {/* Evolution announcement - positioned above the circle */}
              {isEvolving && evolutionTarget && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-evolution-text">
                  <div className="bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 rounded-2xl px-6 py-3 shadow-2xl text-center whitespace-nowrap border-2 border-yellow-300/50">
                    <div className="text-xs font-semibold text-yellow-900/80 uppercase tracking-wider">
                      Evolving!
                    </div>
                    <div className="font-serif font-bold text-xl text-white drop-shadow-md capitalize">
                      {evolutionTarget === "teen"
                        ? "Teen Stage"
                        : "Adult Stage"}
                    </div>
                  </div>
                </div>
              )}

              {/* Hunger result after eating - positioned above the circle */}
              {eatingState === "done" && hungerAfter !== null && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-fade-in-up">
                  <div className="bg-card border-2 border-secondary/40 rounded-xl px-4 py-2 shadow-lg text-center whitespace-nowrap">
                    <div className="text-xs text-muted-foreground">Hunger</div>
                    <div className="font-mono font-bold text-lg text-secondary">
                      {Math.round(hungerAfter)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Sleeping overlay */}
              {petAsleep && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="absolute top-8 right-6 flex flex-col items-end gap-0">
                    <span
                      className="text-xs font-bold text-indigo-500/80 animate-float-zzz"
                      style={{ animationDelay: "0s" }}
                    >
                      z
                    </span>
                    <span
                      className="text-sm font-bold text-indigo-500/60 animate-float-zzz"
                      style={{ animationDelay: "0.5s" }}
                    >
                      z
                    </span>
                    <span
                      className="text-base font-bold text-indigo-500/40 animate-float-zzz"
                      style={{ animationDelay: "1s" }}
                    >
                      z
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Sleeping label - outside circle */}
        {petAsleep && (
          <div className="flex justify-center -mt-1 mb-1">
            <span className="text-xs bg-indigo-500/15 text-indigo-600 px-3 py-1 rounded-full font-medium border border-indigo-500/20">
              Sleeping
            </span>
          </div>
        )}

        {/* Pet Info */}
        <div className="text-center mb-5">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-1.5 tracking-tight">
            {pet.name}
          </h2>
          <p className="text-sm text-muted-foreground capitalize mb-2.5">
            {pet.gender && pet.gender !== "neutral" ? `${pet.gender} ` : ""}
            {pet.color} {pet.species} · {pet.personality}
          </p>
          <div
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
              avgHealth >= 60
                ? "bg-secondary/10"
                : avgHealth >= 30
                  ? "bg-chart-3/10"
                  : "bg-destructive/10",
            )}
          >
            <span className={cn("text-sm font-semibold", mood.color)}>
              {mood.text}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 text-sm">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary/8 to-primary/4 rounded-xl border border-primary/10">
            <Flame className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground font-mono">
              {state.careStreak}
            </span>
            <span className="text-muted-foreground text-xs">day streak</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary/8 to-secondary/4 rounded-xl border border-secondary/10">
            <Calendar className="w-4 h-4 text-secondary" />
            <span className="font-bold text-foreground font-mono">
              {state.totalDaysPlayed}
            </span>
            <span className="text-muted-foreground text-xs">days</span>
          </div>
        </div>

        {/* Achievement Badges */}
        {unlockedAchievements.length > 0 && (
          <div className="w-full mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Achievements
              </span>
              <span className="text-[10px] text-muted-foreground">
                {unlockedAchievements.length}/{state.achievements.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {unlockedAchievements.slice(0, 8).map((achievement) => (
                <div
                  key={achievement.id}
                  className="group relative"
                  title={`${achievement.name}: ${achievement.description}`}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-amber-400/20 to-amber-500/10 rounded-lg border border-amber-500/30 hover:border-amber-400/50 hover:scale-110 transition-all cursor-pointer shadow-sm hover:shadow-amber-500/20">
                    <span className="text-sm">{achievement.icon}</span>
                  </div>
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card/95 border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                    <p className="text-xs font-semibold text-foreground">
                      {achievement.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
              {unlockedAchievements.length > 8 && (
                <div
                  className="w-8 h-8 flex items-center justify-center bg-muted/50 rounded-lg border border-border/50 text-[10px] font-bold text-muted-foreground"
                  title={`+${unlockedAchievements.length - 8} more achievements`}
                >
                  +{unlockedAchievements.length - 8}
                </div>
              )}
            </div>
          </div>
        )}

        {showFinanceSnapshot && (
          <div
            className="w-full mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 cursor-pointer hover:bg-emerald-500/10 transition-colors group"
            onClick={() => onFinanceClick?.()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-foreground">
                  Weekly Budget
                </span>
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Details <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            {(() => {
              const budgetUsedPercent =
                state.weeklyBudget > 0
                  ? (state.weeklySpent / state.weeklyBudget) * 100
                  : 0;
              const isOverBudget = state.weeklySpent > state.weeklyBudget;
              const remaining = state.weeklyBudget - state.weeklySpent;
              return (
                <>
                  <div className="h-2.5 bg-emerald-500/10 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500 relative",
                        isOverBudget
                          ? "bg-red-500"
                          : budgetUsedPercent > 75
                            ? "bg-amber-500"
                            : "bg-emerald-500",
                      )}
                      style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground font-mono font-semibold">
                      ${state.weeklySpent.toFixed(0)} / ${state.weeklyBudget}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-bold font-mono",
                        isOverBudget ? "text-red-500" : "text-emerald-600",
                      )}
                    >
                      {isOverBudget
                        ? `Over $${Math.abs(remaining).toFixed(0)}`
                        : `$${remaining.toFixed(0)} left`}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Level-up confetti overlay */}
      <ConfettiOverlay show={showLevelUpConfetti} newLevel={levelUpLevel} />
    </div>
  );
};

export default PetDisplay;
