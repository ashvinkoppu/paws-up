import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Species, GrowthStage, PetColor, AccessorySlot } from '@/types/game';
import { cn } from '@/lib/utils';
import { Flame, Calendar } from 'lucide-react';
import { calculateLevel } from '@/data/tasks';
import { getAccessoryById, ACCESSORY_POSITIONS } from '@/data/accessories';

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

const STAGE_CONFIG: Record<GrowthStage, { scale: string; label: string; icon: string }> = {
  baby: { scale: 'scale-75', label: 'Baby', icon: '🍼' },
  teen: { scale: 'scale-90', label: 'Growing', icon: '🌱' },
  adult: { scale: 'scale-100', label: 'Adult', icon: '🌟' },
};

const EATING_FOOD_EMOJIS = ['🍖', '🥣', '🍗', '🥩', '🧆'];

// Mood-based floating emojis that orbit around the pet
const MOOD_EMOJIS: Record<string, string[]> = {
  thriving: ['😄', '🌟', '💛', '✨', '🎉'],
  happy: ['😊', '💚', '🌸', '✨'],
  okay: ['😐', '💭', '🍃'],
  needsAttention: ['😔', '💧', '🥺', '💔'],
  critical: ['😢', '💔', '🆘', '❗', '💧'],
};

// Category-specific particle emojis for item use animations
const CATEGORY_PARTICLES: Record<string, string[]> = {
  toy: ['⚽', '🎾', '🏀', '🔴', '🟡'],
  grooming: ['✨', '💫', '🫧', '🧼', '💧'],
  medicine: ['💊', '💖', '❤️', '🩹', '💗'],
  accessory: ['⭐', '🌟', '✨', '💎', '🎀'],
};

// Pet expression types based on stats and actions
type PetExpression = 'normal' | 'tired' | 'excited' | 'hungry' | 'sick' | 'dirty' | 'sad' | 'sleepy' | 'eating';

// Expression emojis that appear near the pet's face
const EXPRESSION_EMOJIS: Record<PetExpression, { emoji: string; position: string; animation: string }> = {
  normal: { emoji: '😊', position: 'bottom-0 right-0', animation: '' },
  tired: { emoji: '😪', position: 'bottom-0 right-0', animation: 'animate-mood-sad' },
  excited: { emoji: '🤩', position: 'bottom-0 right-0', animation: 'animate-mood-thriving' },
  hungry: { emoji: '🤤', position: 'bottom-0 right-0', animation: 'animate-wiggle' },
  sick: { emoji: '🤒', position: 'bottom-0 right-0', animation: 'animate-mood-critical' },
  dirty: { emoji: '😷', position: 'bottom-0 right-0', animation: 'animate-wiggle' },
  sad: { emoji: '😢', position: 'bottom-0 right-0', animation: 'animate-mood-sad' },
  sleepy: { emoji: '😴', position: 'bottom-0 right-0', animation: 'animate-breathe' },
  eating: { emoji: '😋', position: 'bottom-0 right-0', animation: 'animate-mood-thriving' },
};

// Get the dominant expression based on pet stats
const getDominantExpression = (stats: { hunger: number; happiness: number; energy: number; cleanliness: number; health: number }): PetExpression => {
  // Check for critical conditions first (value <= 15)
  if (stats.health <= 15) return 'sick';
  if (stats.energy <= 15) return 'sleepy';
  if (stats.hunger <= 15) return 'hungry';
  if (stats.cleanliness <= 15) return 'dirty';
  if (stats.happiness <= 15) return 'sad';
  
  // Check for warning conditions (value <= 30)
  if (stats.energy <= 30) return 'tired';
  if (stats.hunger <= 30) return 'hungry';
  if (stats.health <= 30) return 'sick';
  
  return 'normal';
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
  const [temporaryExpression, setTemporaryExpression] = useState<PetExpression | null>(null);
  const lastFeedTimestamp = useRef<number>(0);
  const lastItemUseTimestamp = useRef<number>(0);
  const particleIdRef = useRef(0);

  // Get current expression based on stats or temporary override
  const currentExpression: PetExpression = temporaryExpression || 
    (eatingState === 'eating' ? 'excited' : getDominantExpression(state.pet.stats));

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
      
      // Trigger excited expression when eating
      setTemporaryExpression('excited');

      // After eating animation, show the stat result
      const doneTimer = setTimeout(() => {
        setEatingState('done');
      }, 1400);

      // Clear everything
      const clearTimer = setTimeout(() => {
        setEatingState('idle');
        setHungerAfter(null);
        setTemporaryExpression(null); // Reset expression back to normal
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
            <span className="text-xs font-semibold text-accent-foreground flex items-center gap-1.5">
              <span className="text-sm leading-none">{stageConfig.icon}</span>
              <span className="capitalize">{stageConfig.label}</span>
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
        <div className={cn(
          "relative mt-2 mb-6 transition-all duration-500",
          stageConfig.scale,
          avgHealth < 30 && "opacity-75"
        )}>
          {/* Outer glow ring */}
          <div className={cn(
            "absolute inset-0 rounded-full transition-all duration-500",
            avgHealth >= 60 ? "bg-secondary/10 warm-glow" :
            avgHealth >= 30 ? "bg-chart-3/10" :
            "bg-destructive/10"
          )} style={{ transform: 'scale(1.1)' }} />

          {/* Inner circle with gradient */}
          <div className={cn(
            "w-48 h-48 rounded-full flex items-center justify-center relative",
            "bg-gradient-to-br from-accent/80 via-card to-card/60",
            "border-2 border-border/20 shadow-xl ring-4 ring-white/10"
          )}>
            {/* Pet image */}
            <img
              src={PET_IMAGES[pet.species]}
              alt={pet.name}
              onClick={handlePetClick}
              className={cn(
                "w-36 h-36 object-contain transition-all duration-300 drop-shadow-lg cursor-pointer hover:scale-105 active:scale-95",
                petAsleep ? "animate-pet-sleeping opacity-80" :
                eatingState === 'eating' ? "animate-pet-eating" :
                interaction === 'happy' ? "animate-happy-jump" :
                interaction === 'sad' ? "animate-sad-shake" :
                avgHealth >= 60 ? "animate-float" : "",
                avgHealth < 30 && interaction === 'none' && eatingState === 'idle' && !petAsleep && "grayscale-[40%] opacity-90",
              )}
              style={{
                filter: petAsleep ? `${PET_COLOR_FILTERS[pet.color] || ''} brightness(0.85)` : PET_COLOR_FILTERS[pet.color] || undefined,
              }}
            />

            {/* Equipped accessory overlays */}
            {pet.equippedAccessories && (Object.entries(pet.equippedAccessories) as [AccessorySlot, string][]).map(([slot, accessoryId]) => {
              if (!accessoryId) return null;
              const accessory = getAccessoryById(accessoryId);
              if (!accessory) return null;
              // Check conditional visibility
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
                  <span className="drop-shadow-md animate-wiggle" style={{ animationDuration: '3s' }}>
                    {accessory.emoji}
                  </span>
                </div>
              );
            })}

            {/* Pet Expression Overlay - shows current pet expression */}
            {currentExpression !== 'normal' && eatingState !== 'eating' && (
              <div
                className={cn(
                  "absolute bottom-1 right-1 text-3xl pointer-events-none z-20 transition-all duration-300",
                  EXPRESSION_EMOJIS[currentExpression]?.animation || ''
                )}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                  transform: 'translate(25%, 25%)',
                }}
              >
                {EXPRESSION_EMOJIS[currentExpression]?.emoji}
              </div>
            )}

            {/* Eating animation overlay */}
            {eatingState === 'eating' && (
              <>
                {/* Food items floating toward pet */}
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
                {/* Nom nom text */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-nom-text">
                  <span className="font-serif font-bold text-lg text-primary">nom nom nom</span>
                </div>
              </>
            )}

            {/* Item use particle animation (toys, grooming, medicine, accessories) */}
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
                {/* Item use label */}
                {itemUseLabel && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-item-label">
                    <span className="font-serif font-bold text-lg text-secondary whitespace-nowrap">
                      {itemUseLabel}!
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Hunger result after eating */}
            {eatingState === 'done' && hungerAfter !== null && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-fade-in-up">
                <div className="bg-card border-2 border-secondary/40 rounded-xl px-4 py-2 shadow-lg text-center whitespace-nowrap">
                  <div className="text-xs text-muted-foreground">Hunger now</div>
                  <div className="font-mono font-bold text-lg text-secondary">{Math.round(hungerAfter)}%</div>
                </div>
              </div>
            )}

            {/* Floating mood emojis orbiting around pet */}
            {eatingState === 'eating' ? (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-4xl pointer-events-none">
                😋
              </div>
            ) : (
              (MOOD_EMOJIS[mood.key] || [mood.emoji]).map((moodEmoji, index, array) => {
                // Position emojis in a circle around the pet
                const angle = (index / array.length) * 360;
                const radius = 108; // px from center
                const radians = (angle * Math.PI) / 180;
                const xPosition = Math.cos(radians) * radius;
                const yPosition = Math.sin(radians) * radius;
                return (
                  <div
                    key={`mood-${index}`}
                    className={cn(
                      "absolute pointer-events-none z-10",
                      mood.key === 'critical' ? "animate-mood-critical" :
                      mood.key === 'needsAttention' ? "animate-mood-sad" :
                      mood.key === 'thriving' ? "animate-mood-thriving" :
                      mood.key === 'happy' ? "animate-mood-happy" :
                      "animate-mood-neutral"
                    )}
                    style={{
                      left: `calc(50% + ${xPosition}px)`,
                      top: `calc(50% + ${yPosition}px)`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: index === 0 ? '1.75rem' : '1.25rem',
                      animationDelay: `${index * 0.4}s`,
                    }}
                  >
                    {moodEmoji}
                  </div>
                );
              })
            )}
          </div>

          {/* Sleeping overlay with floating zzz's */}
          {petAsleep && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="absolute top-2 right-8 flex flex-col gap-1">
                <span className="text-2xl animate-float-zzz" style={{ animationDelay: '0s' }}>💤</span>
                <span className="text-xl animate-float-zzz" style={{ animationDelay: '0.5s' }}>💤</span>
                <span className="text-lg animate-float-zzz" style={{ animationDelay: '1s' }}>💤</span>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <span className="text-xs bg-indigo-500/20 text-indigo-700 px-3 py-1 rounded-full font-medium border border-indigo-500/30">
                  Sleeping soundly...
                </span>
              </div>
            </div>
          )}
        </div>

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
