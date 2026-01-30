import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Species, GrowthStage, PetColor } from '@/types/game';
import { cn } from '@/lib/utils';
import { Flame, Calendar } from 'lucide-react';
import { calculateLevel } from '@/data/tasks';

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
  white: '',
  cream: 'sepia(0.15) saturate(0.9) brightness(1.02)',
  golden: 'sepia(0.5) saturate(1.4) brightness(0.92)',
  orange: 'sepia(0.8) saturate(2.5) brightness(0.85) hue-rotate(-5deg)',
  brown: 'sepia(0.7) saturate(1.5) brightness(0.6)',
  gray: 'saturate(0.05) brightness(0.78)',
  black: 'brightness(0.35) contrast(1.2) saturate(0.2)',
};

const STAGE_CONFIG: Record<GrowthStage, { scale: string; label: string; icon: string }> = {
  baby: { scale: 'scale-75', label: 'Baby', icon: '🍼' },
  teen: { scale: 'scale-90', label: 'Growing', icon: '🌱' },
  adult: { scale: 'scale-100', label: 'Adult', icon: '🌟' },
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

const PetDisplay: React.FC = () => {
  const { state, lastActionFeedback } = useGame();

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
    if (lowestStat < 10) return { emoji: '😢', text: 'Critical!', color: 'text-destructive' };
    if (lowestStat < 20) return { emoji: '😔', text: 'Needs attention', color: 'text-chart-2' };

    // Otherwise use average health
    if (avgHealth >= 80) return { emoji: '😄', text: 'Thriving!', color: 'text-secondary' };
    if (avgHealth >= 60) return { emoji: '😊', text: 'Happy', color: 'text-chart-3' };
    if (avgHealth >= 40) return { emoji: '😐', text: 'Okay', color: 'text-chart-1' };
    if (avgHealth >= 20) return { emoji: '😔', text: 'Needs attention', color: 'text-chart-2' };
    return { emoji: '😢', text: 'Critical!', color: 'text-destructive' };
  };

  const mood = getMood();
  const stageConfig = STAGE_CONFIG[pet.stage];

  return (
    <div className="relative p-6 bg-card rounded-3xl border-2 border-border/50 shadow-lg overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-50%] left-[-25%] w-[80%] h-[80%] bg-primary/5 blob-shape" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] bg-secondary/5 blob-shape" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Top badges row */}
        <div className="w-full flex justify-between items-center mb-4">
          {/* Stage Badge */}
          <div className="px-3 py-1.5 bg-accent/60 rounded-full border border-border/50">
            <span className="text-xs font-semibold text-accent-foreground flex items-center gap-1.5">
              <span>{stageConfig.icon}</span>
              <span className="capitalize">{stageConfig.label}</span>
            </span>
          </div>

          {/* Level Badge with XP Progress */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-full border border-secondary/20">
            <span className="text-xs font-semibold text-secondary">Lv {pet.level}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-secondary/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-500"
                  style={{ width: `${(calculateLevel(pet.experience).currentXp / calculateLevel(pet.experience).xpForNext) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-secondary/70">
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
            "bg-gradient-to-br from-accent via-card to-muted/20",
            "border-4 border-border/30 shadow-xl"
          )}>
            {/* Pet image */}
            <img
              src={PET_IMAGES[pet.species]}
              alt={pet.name}
              onClick={handlePetClick}
              className={cn(
                "w-36 h-36 object-contain transition-all duration-300 drop-shadow-lg cursor-pointer hover:scale-105 active:scale-95",
                eatingState === 'eating' ? "animate-pet-eating" :
                interaction === 'happy' ? "animate-happy-jump" :
                interaction === 'sad' ? "animate-sad-shake" :
                avgHealth >= 60 ? "animate-float" : "",
                avgHealth < 30 && interaction === 'none' && eatingState === 'idle' && "grayscale-[40%] opacity-90",
              )}
              style={{
                filter: PET_COLOR_FILTERS[pet.color] || undefined,
              }}
            />

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

            {/* Mood indicator floating beside pet */}
            <div className={cn(
              "absolute -bottom-1 left-1/2 -translate-x-1/2",
              "text-4xl transition-transform duration-300 pointer-events-none",
              eatingState !== 'idle' ? "" :
              avgHealth >= 60 ? "animate-wiggle" : avgHealth < 30 ? "animate-heartbeat" : ""
            )}>
              {eatingState === 'eating' ? '😋' : mood.emoji}
            </div>
          </div>
        </div>

        {/* Pet Info */}
        <div className="text-center mb-5">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-1">{pet.name}</h2>
          <p className="text-sm text-muted-foreground capitalize mb-2">
            {pet.color} {pet.species} · {pet.personality}
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
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-accent/40 rounded-xl border border-border/30">
            <Flame className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">{state.careStreak}</span>
            <span className="text-muted-foreground">day streak</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-accent/40 rounded-xl border border-border/30">
            <Calendar className="w-4 h-4 text-secondary" />
            <span className="font-bold text-foreground">{state.totalDaysPlayed}</span>
            <span className="text-muted-foreground">days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDisplay;
