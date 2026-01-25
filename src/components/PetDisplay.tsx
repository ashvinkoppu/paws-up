import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Species, GrowthStage } from '@/types/game';
import { cn } from '@/lib/utils';
import { Flame, Calendar } from 'lucide-react';

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

const STAGE_CONFIG: Record<GrowthStage, { scale: string; label: string; icon: string }> = {
  baby: { scale: 'scale-75', label: 'Baby', icon: '🍼' },
  teen: { scale: 'scale-90', label: 'Growing', icon: '🌱' },
  adult: { scale: 'scale-100', label: 'Adult', icon: '🌟' },
};

const PetDisplay: React.FC = () => {
  const { state } = useGame();

  if (!state.pet) return null;

  const [interaction, setInteraction] = useState<'none' | 'happy' | 'sad'>('none');

  const { pet } = state;
  const avgHealth = Object.values(pet.stats).reduce((sum, value) => sum + value, 0) / 5;

  const handlePetClick = () => {
    if (interaction !== 'none') return;

    // Determine mood based on health
    // Happy if average health is 40 or above (Okay, Happy, Thriving)
    const isHappy = avgHealth >= 40;
    
    setInteraction(isHappy ? 'happy' : 'sad');
    
    // Reset animation state after it completes
    setTimeout(() => {
      setInteraction('none');
    }, 1000);
  };

  const getMood = () => {
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

          {/* Level Badge */}
          <div className="px-3 py-1.5 bg-secondary/10 rounded-full border border-secondary/20">
            <span className="text-xs font-semibold text-secondary">
              Level {pet.level} · {pet.experience} XP
            </span>
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
                interaction === 'happy' ? "animate-happy-jump" : 
                interaction === 'sad' ? "animate-sad-shake" :
                avgHealth >= 60 ? "animate-float" : "",
                avgHealth < 30 && interaction === 'none' && "grayscale-[40%] opacity-90",
                // Apply black filter if pet color is black
                pet.color.toLowerCase() === 'black' && "brightness-[0.4] grayscale contrast-125"
              )}
            />

            {/* Mood indicator floating beside pet */}
            <div className={cn(
              "absolute -bottom-1 left-1/2 -translate-x-1/2",
              "text-4xl transition-transform duration-300 pointer-events-none",
              avgHealth >= 60 ? "animate-wiggle" : avgHealth < 30 ? "animate-heartbeat" : ""
            )}>
              {mood.emoji}
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
