import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Species, GrowthStage, PetColor, AccessorySlot } from '@/types/game';
import { cn } from '@/lib/utils';
import { Flame, Calendar, AlertTriangle, Heart } from 'lucide-react';
import { calculateLevel } from '@/data/tasks';
import { getAccessoryById, ACCESSORY_POSITIONS } from '@/data/accessories';

// Mood visual config — controls aura, pet animation, and ambient particles
type MoodVisual = {
  auraColor: string;
  auraIntensity: string;
  petAnimation: string;
  particles: 'sparkle' | 'hearts' | 'sweat' | 'alert' | 'none';
  petFilter: string;
};

const MOOD_VISUALS: Record<string, MoodVisual> = {
  thriving: {
    auraColor: 'from-emerald-400/25 via-yellow-300/15 to-emerald-400/25',
    auraIntensity: 'shadow-[0_0_30px_hsl(152,45%,36%,0.2),0_0_60px_hsl(40,88%,52%,0.1)]',
    petAnimation: 'animate-float',
    particles: 'sparkle',
    petFilter: '',
  },
  happy: {
    auraColor: 'from-green-400/15 via-emerald-300/10 to-green-400/15',
    auraIntensity: 'shadow-[0_0_20px_hsl(152,45%,36%,0.15)]',
    petAnimation: 'animate-float',
    particles: 'hearts',
    petFilter: '',
  },
  okay: {
    auraColor: 'from-amber-300/10 via-orange-200/5 to-amber-300/10',
    auraIntensity: '',
    petAnimation: 'animate-breathe',
    particles: 'none',
    petFilter: '',
  },
  needsAttention: {
    auraColor: 'from-orange-400/15 via-amber-300/10 to-orange-400/15',
    auraIntensity: 'shadow-[0_0_20px_hsl(24,82%,50%,0.15)]',
    petAnimation: 'animate-pet-droopy',
    particles: 'sweat',
    petFilter: 'saturate(0.8)',
  },
  critical: {
    auraColor: 'from-red-400/20 via-rose-300/15 to-red-400/20',
    auraIntensity: 'shadow-[0_0_25px_hsl(355,75%,44%,0.2)]',
    petAnimation: 'animate-pet-shiver',
    particles: 'alert',
    petFilter: 'saturate(0.5) brightness(0.9)',
  },
};

import petDog from '@/assets/pet-dog.png';
import petCat from '@/assets/pet-cat.png';
import petRabbit from '@/assets/pet-rabbit.png';
import petHamster from '@/assets/pet-hamster.png';

const PET_IMAGES: Record<Species, string> = {
  dog: petDog,
  cat: petCat,
  rabbit: petRabbit,
  hamster: petHamster,
};

// CSS filter strings to tint the pet image based on chosen color.
// Base images are light/warm-toned, so filters shift from that baseline.
const PET_COLOR_FILTERS: Record<PetColor, string> = {
  // Male palette
  blue: 'sepia(0.4) saturate(1.8) brightness(0.85) hue-rotate(170deg)',
  green: 'sepia(0.4) saturate(1.5) brightness(0.82) hue-rotate(80deg)',
  brown: 'sepia(0.7) saturate(1.5) brightness(0.6)',
  gray: 'saturate(0.05) brightness(0.78)',
  // Female palette
  pink: 'sepia(0.3) saturate(2) brightness(0.95) hue-rotate(310deg)',
  purple: 'sepia(0.4) saturate(1.8) brightness(0.8) hue-rotate(250deg)',
  peach: 'sepia(0.3) saturate(1.2) brightness(1.0) hue-rotate(340deg)',
  white: '',
  // Neutral palette
  yellow: 'sepia(0.5) saturate(2.5) brightness(1.0) hue-rotate(15deg)',
  teal: 'sepia(0.3) saturate(1.8) brightness(0.85) hue-rotate(130deg)',
  golden: 'sepia(0.5) saturate(1.4) brightness(0.92)',
  cream: 'sepia(0.15) saturate(0.9) brightness(1.02)',
};

const STAGE_CONFIG: Record<GrowthStage, { scale: string; label: string }> = {
  baby: { scale: 'scale-75', label: 'Baby' },
  teen: { scale: 'scale-90', label: 'Growing' },
  adult: { scale: 'scale-100', label: 'Adult' },
};

const EATING_FOOD_EMOJIS = ['🍖', '🥣', '🍗', '🥩', '🧆'];

// Category-specific particle emojis for item use animations
const CATEGORY_PARTICLES: Record<string, string[]> = {
  toy: ['⚽', '🎾', '🏀', '🔴', '🟡'],
  grooming: ['✨', '💫', '🫧', '🧼', '💧'],
  medicine: ['💊', '💖', '❤️', '🩹', '💗'],
  accessory: ['⭐', '🌟', '✨', '💎', '🎀'],
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
}

const PetDisplay: React.FC<PetDisplayProps> = ({ onXpClick }) => {
  const { state, lastActionFeedback } = useGame();
  const { petAsleep } = state;

  if (!state.pet) return null;

  const [interaction, setInteraction] = useState<'none' | 'happy' | 'sad'>('none');
  const [eatingState, setEatingState] = useState<'idle' | 'eating' | 'done'>('idle');
  const [eatingEmoji, setEatingEmoji] = useState('🍖');
  const [hungerAfter, setHungerAfter] = useState<number | null>(null);
  const [itemUseParticles, setItemUseParticles] = useState<ItemUseParticle[]>([]);
  const [itemUseLabel, setItemUseLabel] = useState<string | null>(null);
  const lastFeedTimestamp = useRef<number>(0);
  const lastItemUseTimestamp = useRef<number>(0);
  const particleIdRef = useRef(0);

  // Handle eating animation (food items)
  useEffect(() => {
    if (
      lastActionFeedback &&
      lastActionFeedback.action === 'feed' &&
      lastActionFeedback.timestamp !== lastFeedTimestamp.current
    ) {
      lastFeedTimestamp.current = lastActionFeedback.timestamp;
      setEatingEmoji(EATING_FOOD_EMOJIS[Math.floor(Math.random() * EATING_FOOD_EMOJIS.length)]);
      setEatingState('eating');
      setHungerAfter(lastActionFeedback.statValue ?? null);

      // After eating animation, show the stat result
      const doneTimer = setTimeout(() => {
        setEatingState('done');
      }, 1400);

      // Clear everything
      const clearTimer = setTimeout(() => {
        setEatingState('idle');
        setHungerAfter(null);
      }, 3200);

      return () => {
        clearTimeout(doneTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [lastActionFeedback]);

  // Handle item-use animation (toys, grooming, medicine, accessories)
  useEffect(() => {
    if (
      lastActionFeedback &&
      lastActionFeedback.action === 'use-item' &&
      lastActionFeedback.timestamp !== lastItemUseTimestamp.current
    ) {
      lastItemUseTimestamp.current = lastActionFeedback.timestamp;
      const category = lastActionFeedback.category || 'toy';
      const particleEmojis = CATEGORY_PARTICLES[category] || CATEGORY_PARTICLES.toy;
      const itemIcon = lastActionFeedback.itemIcon || particleEmojis[0];

      // Generate particles - use the item's own icon plus category particles
      const particles: ItemUseParticle[] = [];
      const particleCount = category === 'toy' ? 8 : 6;

      for (let index = 0; index < particleCount; index++) {
        const emoji = index < 3 ? itemIcon : particleEmojis[Math.floor(Math.random() * particleEmojis.length)];
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
      setInteraction('happy');
      setTimeout(() => setInteraction('none'), 1000);

      // Clear particles after animation
      const clearTimer = setTimeout(() => {
        setItemUseParticles([]);
        setItemUseLabel(null);
      }, 2500);

      return () => clearTimeout(clearTimer);
    }
  }, [lastActionFeedback]);

  const { pet } = state;
  const avgHealth = Object.values(pet.stats).reduce((sum, value) => sum + value, 0) / 5;

  const handlePetClick = () => {
    if (interaction !== 'none') return;

    const lowestStat = Math.min(...Object.values(pet.stats));
    const isHappy = lowestStat >= 20 && avgHealth >= 40;

    setInteraction(isHappy ? 'happy' : 'sad');
    
    // Reset animation state after it completes
    setTimeout(() => {
      setInteraction('none');
    }, 1000);
  };

  const getMood = () => {
    const lowestStat = Math.min(...Object.values(pet.stats));

    // If any single stat is critically low, mood reflects that
    if (lowestStat < 10) return { emoji: '😢', text: 'Critical!', color: 'text-destructive', key: 'critical' };
    if (lowestStat < 20) return { emoji: '😔', text: 'Needs attention', color: 'text-chart-2', key: 'needsAttention' };

    // Otherwise use average health
    if (avgHealth >= 80) return { emoji: '😄', text: 'Thriving!', color: 'text-secondary', key: 'thriving' };
    if (avgHealth >= 60) return { emoji: '😊', text: 'Happy', color: 'text-chart-3', key: 'happy' };
    if (avgHealth >= 40) return { emoji: '😐', text: 'Okay', color: 'text-chart-1', key: 'okay' };
    if (avgHealth >= 20) return { emoji: '😔', text: 'Needs attention', color: 'text-chart-2', key: 'needsAttention' };
    return { emoji: '😢', text: 'Critical!', color: 'text-destructive', key: 'critical' };
  };

  const mood = getMood();
  const stageConfig = STAGE_CONFIG[pet.stage];

  return (
    <div className="relative p-6 glass-card rounded-3xl shadow-lg overflow-hidden">
      {/* Scenic room background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-accent/20 via-accent/8 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[50%] bg-gradient-to-b from-primary/4 via-transparent to-transparent" />
        <div className="absolute top-[10%] left-[8%] w-3 h-3 rounded-full bg-chart-3/20 animate-sparkle" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[20%] right-[12%] w-2 h-2 rounded-full bg-primary/20 animate-sparkle" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[5%] right-[30%] w-2.5 h-2.5 rounded-full bg-secondary/15 animate-sparkle" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Top badges row */}
        <div className="w-full flex justify-between items-center mb-4 gap-2 px-1">
          {/* Stage Badge */}
          <div className="px-3 py-2 bg-accent/60 rounded-full border border-border/50">
            <span className="text-xs font-semibold text-accent-foreground capitalize">
              {stageConfig.label}
            </span>
          </div>

          {/* Level Badge with XP Progress */}
          <div
            className="flex items-center gap-1.5 px-3 py-2 bg-secondary/10 rounded-xl border border-secondary/20 cursor-pointer hover:bg-secondary/20 transition-colors duration-200"
            onClick={onXpClick}
            title="View daily tasks"
          >
            <span className="text-xs font-semibold text-secondary">Lv {pet.level}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-12 h-1.5 bg-secondary/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-500"
                  style={{ width: `${(calculateLevel(pet.experience).currentXp / calculateLevel(pet.experience).xpForNext) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-secondary/70 whitespace-nowrap flex-shrink-0">
                {calculateLevel(pet.experience).currentXp}/{calculateLevel(pet.experience).xpForNext}
              </span>
            </div>
          </div>
        </div>

        {/* Pet Image Container */}
        {(() => {
          const moodVisual = MOOD_VISUALS[mood.key] || MOOD_VISUALS.okay;
          return (
            <div className={cn(
              "relative mt-2 mb-6 transition-all duration-500",
              stageConfig.scale,
            )}>
              {/* Mood aura — pulsing gradient ring behind the pet circle */}
              <div className={cn(
                "absolute inset-0 rounded-full transition-all duration-700",
                `bg-gradient-to-br ${moodVisual.auraColor}`,
                moodVisual.auraIntensity,
                mood.key === 'critical' && "animate-pulse",
                mood.key === 'needsAttention' && "animate-breathe",
              )} style={{ transform: 'scale(1.15)' }} />

              {/* Inner circle */}
              <div className={cn(
                "w-48 h-48 rounded-full flex items-center justify-center relative overflow-hidden",
                "bg-gradient-to-br from-accent/80 via-card to-card/60",
                "border-2 border-border/20 shadow-xl ring-4 ring-white/10"
              )}>
                {/* Pet image — the pet itself animates based on mood */}
                <img
                  src={PET_IMAGES[pet.species]}
                  alt={pet.name}
                  onClick={handlePetClick}
                  className={cn(
                    "w-36 h-36 object-contain transition-all duration-500 drop-shadow-lg cursor-pointer hover:scale-105 active:scale-95",
                    petAsleep ? "animate-pet-sleeping opacity-80" :
                    eatingState === 'eating' ? "animate-pet-eating" :
                    interaction === 'happy' ? "animate-happy-jump" :
                    interaction === 'sad' ? "animate-sad-shake" :
                    moodVisual.petAnimation,
                  )}
                  style={{
                    filter: [
                      petAsleep ? `${PET_COLOR_FILTERS[pet.color] || ''} brightness(0.85)` : PET_COLOR_FILTERS[pet.color] || '',
                      moodVisual.petFilter,
                    ].filter(Boolean).join(' ') || undefined,
                  }}
                />

                {/* CSS-based ambient particles instead of emoji clusters */}
                {!petAsleep && eatingState === 'idle' && moodVisual.particles === 'sparkle' && (
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

                {!petAsleep && eatingState === 'idle' && moodVisual.particles === 'hearts' && (
                  <>
                    {[...Array(3)].map((_, index) => (
                      <Heart
                        key={`heart-${index}`}
                        className="absolute w-3 h-3 text-rose-400/60 pointer-events-none animate-pet-heart-float fill-rose-400/40"
                        style={{
                          left: `${20 + index * 25}%`,
                          top: '15%',
                          animationDelay: `${index * 1.2}s`,
                        }}
                      />
                    ))}
                  </>
                )}

                {!petAsleep && eatingState === 'idle' && moodVisual.particles === 'sweat' && (
                  <>
                    {[...Array(2)].map((_, index) => (
                      <div
                        key={`sweat-${index}`}
                        className="absolute w-1.5 h-2.5 rounded-b-full bg-blue-400/50 pointer-events-none animate-pet-sweat-drop"
                        style={{
                          right: `${18 + index * 12}%`,
                          top: '20%',
                          animationDelay: `${index * 1.5}s`,
                        }}
                      />
                    ))}
                  </>
                )}

                {!petAsleep && eatingState === 'idle' && moodVisual.particles === 'alert' && (
                  <div className="absolute top-2 right-4 pointer-events-none z-20 animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-red-500 drop-shadow-md" />
                  </div>
                )}

                {/* Equipped accessory overlays */}
                {pet.equippedAccessories && (Object.entries(pet.equippedAccessories) as [AccessorySlot, string][]).map(([slot, accessoryId]) => {
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
                      className="absolute pointer-events-none z-10 transition-all duration-300"
                      style={{
                        top: position.top,
                        left: position.left,
                        fontSize: position.fontSize,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <span className="drop-shadow-md">
                        {accessory.emoji}
                      </span>
                    </div>
                  );
                })}

                {/* Eating animation overlay */}
                {eatingState === 'eating' && (
                  <>
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className="absolute pointer-events-none z-10 text-3xl animate-food-float"
                        style={{
                          left: `${20 + index * 25}%`,
                          top: '10%',
                          animationDelay: `${index * 0.25}s`,
                        }}
                      >
                        {eatingEmoji}
                      </div>
                    ))}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-nom-text">
                      <span className="font-serif font-bold text-lg text-primary">nom nom</span>
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
                          particle.category === 'toy' ? "animate-item-bounce" :
                          particle.category === 'grooming' ? "animate-item-sparkle" :
                          particle.category === 'medicine' ? "animate-item-float-up" :
                          "animate-item-twinkle"
                        )}
                        style={{
                          left: `${particle.x}%`,
                          top: particle.category === 'medicine' ? '80%' : '5%',
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

              {/* Hunger result after eating — positioned above the circle */}
              {eatingState === 'done' && hungerAfter !== null && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-fade-in-up">
                  <div className="bg-card border-2 border-secondary/40 rounded-xl px-4 py-2 shadow-lg text-center whitespace-nowrap">
                    <div className="text-xs text-muted-foreground">Hunger</div>
                    <div className="font-mono font-bold text-lg text-secondary">{Math.round(hungerAfter)}%</div>
                  </div>
                </div>
              )}

              {/* Sleeping overlay */}
              {petAsleep && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="absolute top-8 right-6 flex flex-col items-end gap-0">
                    <span className="text-xs font-bold text-indigo-500/80 animate-float-zzz" style={{ animationDelay: '0s' }}>z</span>
                    <span className="text-sm font-bold text-indigo-500/60 animate-float-zzz" style={{ animationDelay: '0.5s' }}>z</span>
                    <span className="text-base font-bold text-indigo-500/40 animate-float-zzz" style={{ animationDelay: '1s' }}>z</span>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <span className="text-xs bg-indigo-500/15 text-indigo-600 px-3 py-1 rounded-full font-medium border border-indigo-500/20">
                      Sleeping
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Pet Info */}
        <div className="text-center mb-5">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-1.5 tracking-tight">{pet.name}</h2>
          <p className="text-sm text-muted-foreground capitalize mb-2.5">
            {pet.gender && pet.gender !== 'neutral' ? `${pet.gender} ` : ''}{pet.color} {pet.species} · {pet.personality}
          </p>
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
            avgHealth >= 60 ? "bg-secondary/10" : avgHealth >= 30 ? "bg-chart-3/10" : "bg-destructive/10"
          )}>
            <span className={cn("text-sm font-semibold", mood.color)}>
              {mood.text}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 text-sm">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary/8 to-primary/4 rounded-xl border border-primary/10">
            <Flame className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground font-mono">{state.careStreak}</span>
            <span className="text-muted-foreground text-xs">day streak</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary/8 to-secondary/4 rounded-xl border border-secondary/10">
            <Calendar className="w-4 h-4 text-secondary" />
            <span className="font-bold text-foreground font-mono">{state.totalDaysPlayed}</span>
            <span className="text-muted-foreground text-xs">days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDisplay;
