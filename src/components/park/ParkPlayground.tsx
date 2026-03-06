/**
 * ParkPlayground - A top-down WASD-controlled park environment.
 *
 * The player moves their pet around a grassy park using WASD keys.
 * Activity stations are scattered around the park:
 *  - Fetch Area: throw a ball, pet runs to fetch it
 *  - Water Bowl / Food Station: feed/hydrate the pet
 *  - Agility Course: timed obstacle mini-game
 *  - NPC Pets: interact with wandering park visitors
 *
 * Press spacebar near a station to interact with it.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Heart, Zap, UtensilsCrossed, Sparkles,
  Target, Timer, PawPrint, TreePine, Trees, Flower2,
  Leaf, Bird, Bug, Wind, Star, Trophy,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import petDog from '@/assets/pet-dog.png';
import petCat from '@/assets/pet-cat.png';
import petRabbit from '@/assets/pet-rabbit.png';
import petHamster from '@/assets/pet-hamster.png';
import { Species, PetColor } from '@/types/game';

const PET_IMAGES: Record<Species, string> = {
  dog: petDog,
  cat: petCat,
  rabbit: petRabbit,
  hamster: petHamster,
};

const PET_COLOR_FILTERS: Record<PetColor, string> = {
  blue: 'sepia(0.4) saturate(1.8) brightness(0.85) hue-rotate(170deg)',
  green: 'sepia(0.4) saturate(1.5) brightness(0.82) hue-rotate(80deg)',
  brown: 'sepia(0.7) saturate(1.5) brightness(0.6)',
  gray: 'saturate(0.05) brightness(0.78)',
  pink: 'sepia(0.3) saturate(2) brightness(0.95) hue-rotate(310deg)',
  purple: 'sepia(0.4) saturate(1.8) brightness(0.8) hue-rotate(250deg)',
  peach: 'sepia(0.3) saturate(1.2) brightness(1.0) hue-rotate(340deg)',
  white: '',
  yellow: 'sepia(0.5) saturate(2.5) brightness(1.0) hue-rotate(15deg)',
  teal: 'sepia(0.3) saturate(1.8) brightness(0.85) hue-rotate(130deg)',
  golden: 'sepia(0.5) saturate(1.4) brightness(0.92)',
  cream: 'sepia(0.15) saturate(0.9) brightness(1.02)',
};

// Park dimensions
const PARK_WIDTH = 800;
const PARK_HEIGHT = 600;
const PET_SIZE = 48;
const MOVE_SPEED = 4;
const INTERACT_DISTANCE = 70;

// ─── Types ───

type PetAction = 'idle' | 'moving' | 'eating' | 'jumping' | 'playing' | 'socializing';
type ParticleKind = 'heart' | 'star' | 'sparkle' | 'paw' | 'dot' | 'wind' | 'trophy';
type NatureKind = 'leaf' | 'grass' | 'rock' | 'mushroom' | 'log';
type CreatureKind = 'butterfly' | 'bee' | 'bird' | 'bug';

// ─── Data Structures ───

interface Station {
  id: string;
  name: string;
  icon: React.ElementType;
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  groundHue: string;
  accentColor: string;
  description: string;
}

const STATIONS: Station[] = [
  {
    id: 'fetch', name: 'Fetch Area', icon: Target,
    x: 600, y: 150, radius: 55,
    color: 'from-amber-300/50 to-yellow-200/30',
    glowColor: 'rgba(251, 191, 36, 0.35)',
    groundHue: 'radial-gradient(ellipse at center, rgba(251,191,36,0.18) 0%, rgba(217,170,60,0.08) 60%, transparent 100%)',
    accentColor: '#F59E0B',
    description: 'Throw a ball!',
  },
  {
    id: 'food', name: 'Food Bowl', icon: UtensilsCrossed,
    x: 200, y: 450, radius: 50,
    color: 'from-orange-300/50 to-amber-200/30',
    glowColor: 'rgba(249, 115, 22, 0.35)',
    groundHue: 'radial-gradient(ellipse at center, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 60%, transparent 100%)',
    accentColor: '#F97316',
    description: 'Feed your pet',
  },
  {
    id: 'agility', name: 'Agility Course', icon: Timer,
    x: 600, y: 450, radius: 55,
    color: 'from-sky-300/50 to-cyan-200/30',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    groundHue: 'radial-gradient(ellipse at center, rgba(56,189,248,0.15) 0%, rgba(14,165,233,0.06) 60%, transparent 100%)',
    accentColor: '#0EA5E9',
    description: 'Jump hurdles!',
  },
  {
    id: 'npc', name: 'Friendly Pets', icon: PawPrint,
    x: 200, y: 150, radius: 50,
    color: 'from-rose-300/50 to-pink-200/30',
    glowColor: 'rgba(244, 114, 182, 0.35)',
    groundHue: 'radial-gradient(ellipse at center, rgba(244,114,182,0.15) 0%, rgba(236,72,153,0.06) 60%, transparent 100%)',
    accentColor: '#EC4899',
    description: 'Meet friends!',
  },
];

interface NpcPet {
  id: string;
  species: Species;
  color: PetColor;
  name: string;
  x: number;
  y: number;
  patrolRadius: number;
  angle: number;
  speed: number;
}

const INITIAL_NPCS: NpcPet[] = [
  { id: 'npc1', species: 'dog', color: 'golden', name: 'Buddy', x: 150, y: 120, patrolRadius: 40, angle: 0, speed: 0.01 },
  { id: 'npc2', species: 'cat', color: 'gray', name: 'Whiskers', x: 220, y: 180, patrolRadius: 35, angle: Math.PI, speed: 0.015 },
  { id: 'npc3', species: 'rabbit', color: 'white', name: 'Thumper', x: 180, y: 150, patrolRadius: 30, angle: Math.PI / 2, speed: 0.012 },
];

const TREES = [
  { type: 'round' as const, x: 35, y: 65, size: 32, flip: false },
  { type: 'pine' as const, x: 760, y: 540, size: 30, flip: false },
  { type: 'round' as const, x: 400, y: 18, size: 28, flip: true },
  { type: 'round' as const, x: 400, y: 570, size: 26, flip: false },
  { type: 'pine' as const, x: 50, y: 380, size: 28, flip: true },
  { type: 'pine' as const, x: 755, y: 80, size: 26, flip: false },
  { type: 'round' as const, x: 100, y: 560, size: 22, flip: true },
  { type: 'pine' as const, x: 700, y: 30, size: 24, flip: false },
];

const FLOWERS = [
  { variant: '#F9A8D4', x: 110, y: 290, delay: 0 },
  { variant: '#FBBF24', x: 370, y: 565, delay: 1.2 },
  { variant: '#F87171', x: 690, y: 310, delay: 0.6 },
  { variant: '#FDE68A', x: 310, y: 85, delay: 1.8 },
  { variant: '#FB923C', x: 500, y: 45, delay: 0.4 },
  { variant: '#F9A8D4', x: 640, y: 565, delay: 2.2 },
  { variant: '#F87171', x: 80, y: 170, delay: 1.4 },
  { variant: '#FBBF24', x: 460, y: 300, delay: 0.8 },
  { variant: '#FDE68A', x: 720, y: 200, delay: 2.0 },
  { variant: '#F9A8D4', x: 350, y: 420, delay: 1.6 },
];

const NATURE_DETAILS: { kind: NatureKind; x: number; y: number; size: number }[] = [
  { kind: 'leaf', x: 350, y: 200, size: 14 },
  { kind: 'grass', x: 450, y: 520, size: 16 },
  { kind: 'rock', x: 120, y: 500, size: 14 },
  { kind: 'mushroom', x: 550, y: 280, size: 12 },
  { kind: 'log', x: 680, y: 560, size: 14 },
  { kind: 'mushroom', x: 75, y: 440, size: 11 },
  { kind: 'grass', x: 330, y: 520, size: 15 },
  { kind: 'leaf', x: 520, y: 110, size: 13 },
];

const CREATURES: { kind: CreatureKind; x: number; y: number; duration: number; delay: number }[] = [
  { kind: 'butterfly', x: 280, y: 140, duration: 7, delay: 0 },
  { kind: 'bee', x: 500, y: 350, duration: 5.5, delay: 1.5 },
  { kind: 'bird', x: 650, y: 75, duration: 8, delay: 3 },
  { kind: 'bug', x: 150, y: 460, duration: 6, delay: 2 },
  { kind: 'butterfly', x: 420, y: 250, duration: 7.5, delay: 4 },
];

const DANDELION_SEEDS = [
  { x: 300, y: 400, dx: 60, dy: -90, ex: 120, ey: -180, duration: 9, delay: 0 },
  { x: 550, y: 200, dx: -40, dy: -70, ex: -80, ey: -140, duration: 11, delay: 3 },
  { x: 150, y: 300, dx: 50, dy: -80, ex: 100, ey: -160, duration: 10, delay: 6 },
  { x: 680, y: 430, dx: -30, dy: -60, ex: -60, ey: -120, duration: 12, delay: 2 },
];

// ─── Helper Components ───

const NatureDetailIcon: React.FC<{ kind: NatureKind; size: number }> = ({ kind, size }) => {
  switch (kind) {
    case 'leaf':
    case 'grass':
      return <Leaf style={{ width: size, height: size, color: '#4D7C0F' }} />;
    case 'rock':
      return (
        <div style={{
          width: size, height: size * 0.7, borderRadius: '50%',
          background: 'linear-gradient(145deg, #9CA3AF, #6B7280)',
        }} />
      );
    case 'mushroom':
      return (
        <div style={{ width: size, height: size, position: 'relative' }}>
          <div style={{
            width: size * 0.8, height: size * 0.5,
            borderRadius: '50% 50% 20% 20%',
            background: 'linear-gradient(135deg, #DC2626, #991B1B)',
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          }} />
          <div style={{
            width: size * 0.3, height: size * 0.5,
            background: '#D4C4A8', borderRadius: '2px 2px 4px 4px',
            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          }} />
        </div>
      );
    case 'log':
      return (
        <div style={{
          width: size * 1.4, height: size * 0.5, borderRadius: 4,
          background: 'linear-gradient(180deg, #92400E, #78350F)',
        }} />
      );
  }
};

const CreatureIcon: React.FC<{ kind: CreatureKind }> = ({ kind }) => {
  switch (kind) {
    case 'bird':
      return <Bird className="text-amber-700/70" style={{ width: 15, height: 15 }} />;
    case 'bug':
      return <Bug className="text-red-600/70" style={{ width: 14, height: 14 }} />;
    case 'butterfly':
      return (
        <div className="relative" style={{ width: 16, height: 12 }}>
          <div style={{
            position: 'absolute', width: 7, height: 10,
            borderRadius: '50% 50% 50% 0',
            background: 'linear-gradient(135deg, #C084FC, #A855F7)',
            top: 0, left: 0, transform: 'rotate(-15deg)',
          }} />
          <div style={{
            position: 'absolute', width: 7, height: 10,
            borderRadius: '50% 50% 0 50%',
            background: 'linear-gradient(135deg, #C084FC, #A855F7)',
            top: 0, right: 0, transform: 'rotate(15deg)',
          }} />
        </div>
      );
    case 'bee':
      return (
        <div className="relative" style={{ width: 14, height: 10 }}>
          <div style={{
            width: 10, height: 8, borderRadius: '50%',
            background: 'repeating-linear-gradient(90deg, #FBBF24 0px, #FBBF24 3px, #1F2937 3px, #1F2937 6px)',
            position: 'absolute', bottom: 0, left: 2,
          }} />
          <div style={{
            width: 6, height: 4, borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            position: 'absolute', top: 0, left: 1, transform: 'rotate(-20deg)',
          }} />
          <div style={{
            width: 6, height: 4, borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            position: 'absolute', top: 0, right: 1, transform: 'rotate(20deg)',
          }} />
        </div>
      );
  }
};

const ParticleIcon: React.FC<{ kind: ParticleKind; color: string }> = ({ kind, color }) => {
  const iconStyle = { color, width: 14, height: 14 };
  switch (kind) {
    case 'heart': return <Heart style={iconStyle} fill={color} />;
    case 'star': return <Star style={iconStyle} fill={color} />;
    case 'sparkle': return <Sparkles style={iconStyle} />;
    case 'paw': return <PawPrint style={iconStyle} />;
    case 'trophy': return <Trophy style={iconStyle} />;
    case 'wind': return <Wind style={iconStyle} />;
    case 'dot': return <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />;
  }
};

// ─── Other Interfaces ───

interface FetchBall {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  phase: 'flying' | 'landed' | 'returning';
  progress: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface AgilityState {
  active: boolean;
  hurdles: { x: number; cleared: boolean }[];
  score: number;
  timer: number;
  petX: number;
}

interface Particle {
  id: number;
  kind: ParticleKind;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// ─── Main Component ───

const ParkPlayground: React.FC = () => {
  const { state, updateStats, consumeItem } = useGame();
  const pet = state.pet!;

  // Pet position and movement
  const [petPosition, setPetPosition] = useState({ x: PARK_WIDTH / 2, y: PARK_HEIGHT / 2 });
  const [petDirection, setPetDirection] = useState<'left' | 'right'>('right');
  const keysPressed = useRef(new Set<string>());

  // Pet action state
  const [petAction, setPetAction] = useState<PetAction>('idle');
  const petActionRef = useRef<PetAction>('idle');
  const petActionTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Activity states
  const [fetchBall, setFetchBall] = useState<FetchBall | null>(null);
  const [fetchCooldown, setFetchCooldown] = useState(false);
  const [npcCooldowns, setNpcCooldowns] = useState<Record<string, boolean>>({});
  const [npcs, setNpcs] = useState<NpcPet[]>(INITIAL_NPCS);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [nearStation, setNearStation] = useState<Station | null>(null);
  const [agilityState, setAgilityState] = useState<AgilityState | null>(null);
  const floatingTextIdRef = useRef(0);

  // Particle effects
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);

  const parkRef = useRef<HTMLDivElement>(null);

  // Pet animation class mapping
  const petAnimationClass = (() => {
    switch (petAction) {
      case 'idle': return 'animate-breathe';
      case 'moving': return 'animate-wiggle';
      case 'eating': return 'animate-pet-eating';
      case 'jumping': return 'animate-happy-jump';
      case 'playing': return 'animate-park-run';
      case 'socializing': return 'animate-park-social';
    }
  })();

  // Trigger a pet action with auto-reset
  const triggerPetAction = useCallback((action: PetAction, duration: number) => {
    if (petActionTimeoutRef.current) clearTimeout(petActionTimeoutRef.current);
    setPetAction(action);
    petActionRef.current = action;
    petActionTimeoutRef.current = setTimeout(() => {
      setPetAction('idle');
      petActionRef.current = 'idle';
    }, duration);
  }, []);

  // Add floating text
  const addFloatingText = useCallback((text: string, x: number, y: number, color: string = 'text-white') => {
    const id = floatingTextIdRef.current++;
    setFloatingTexts(previous => [...previous, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(previous => previous.filter(floatingText => floatingText.id !== id));
    }, 1500);
  }, []);

  // Spawn particles
  const spawnParticles = useCallback((x: number, y: number, items: { kind: ParticleKind; color: string }[], count: number = 5) => {
    const newParticles = Array.from({ length: count }, () => {
      const item = items[Math.floor(Math.random() * items.length)];
      return {
        id: particleIdRef.current++,
        kind: item.kind,
        color: item.color,
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: -(Math.random() * 3 + 1),
      };
    });
    setParticles(previous => [...previous, ...newParticles]);
    setTimeout(() => {
      setParticles(previous => previous.filter(particle => !newParticles.some(newParticle => newParticle.id === particle.id)));
    }, 1200);
  }, []);

  // Distance helper
  const distanceTo = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  }, []);

  // Handle fetch interaction
  const handleFetch = useCallback(() => {
    if (fetchCooldown || fetchBall) return;

    const targetX = 100 + Math.random() * (PARK_WIDTH - 200);
    const targetY = 100 + Math.random() * (PARK_HEIGHT - 200);

    setFetchBall({
      x: petPosition.x,
      y: petPosition.y,
      targetX,
      targetY,
      phase: 'flying',
      progress: 0,
    });

    triggerPetAction('jumping', 1000);
    spawnParticles(petPosition.x, petPosition.y, [{ kind: 'wind', color: '#9CA3AF' }, { kind: 'star', color: '#FBBF24' }], 3);
    addFloatingText('Throw!', petPosition.x, petPosition.y - 30, 'text-yellow-300');
  }, [fetchCooldown, fetchBall, petPosition, triggerPetAction, spawnParticles, addFloatingText]);

  // Handle food station
  const handleFood = useCallback(() => {
    triggerPetAction('eating', 1800);

    const foodItem = state.inventory.find(item => item.category === 'hunger' && item.quantity > 0);
    if (foodItem) {
      consumeItem(foodItem.id);
      spawnParticles(200, 450, [{ kind: 'heart', color: '#EC4899' }, { kind: 'sparkle', color: '#F97316' }], 6);
      addFloatingText('+Hunger!', 200, 420, 'text-orange-300');
      toast({
        title: `Fed ${pet.name} at the bowl!`,
        description: `Used ${foodItem.name}`,
      });
    } else {
      updateStats({ hunger: 5, happiness: 2 });
      spawnParticles(200, 450, [{ kind: 'dot', color: '#60A5FA' }, { kind: 'sparkle', color: '#38BDF8' }], 4);
      addFloatingText('+5 Hunger', 200, 420, 'text-blue-300');
      toast({
        title: `${pet.name} drank some water!`,
        description: '+5 hunger, +2 happiness',
      });
    }
  }, [state.inventory, consumeItem, updateStats, pet.name, triggerPetAction, spawnParticles, addFloatingText]);

  // Handle NPC interaction
  const handleNpcInteraction = useCallback(() => {
    const nearNpc = npcs.find(npc => {
      const npcCurrentX = npc.x + Math.cos(npc.angle) * npc.patrolRadius;
      const npcCurrentY = npc.y + Math.sin(npc.angle) * npc.patrolRadius;
      return distanceTo(petPosition.x, petPosition.y, npcCurrentX, npcCurrentY) < INTERACT_DISTANCE;
    });

    if (!nearNpc || npcCooldowns[nearNpc.id]) return;

    const interactions = [
      { text: 'Played together!', happiness: 5 },
      { text: 'Sniffed hello!', happiness: 2 },
      { text: 'Best friends!', happiness: 8 },
      { text: 'Chase game!', happiness: 6 },
    ];

    const interaction = interactions[Math.floor(Math.random() * interactions.length)];
    updateStats({ happiness: interaction.happiness });
    triggerPetAction('socializing', 1400);
    spawnParticles(petPosition.x, petPosition.y, [{ kind: 'heart', color: '#EC4899' }, { kind: 'paw', color: '#92400E' }, { kind: 'sparkle', color: '#F9A8D4' }], 5);
    addFloatingText(`${interaction.text} +${interaction.happiness}`, petPosition.x, petPosition.y - 30, 'text-pink-300');

    toast({
      title: `${pet.name} met ${nearNpc.name}!`,
      description: `${interaction.text} +${interaction.happiness} happiness`,
    });

    setNpcCooldowns(previous => ({ ...previous, [nearNpc.id]: true }));
    setTimeout(() => {
      setNpcCooldowns(previous => ({ ...previous, [nearNpc.id]: false }));
    }, 5000);
  }, [npcs, npcCooldowns, petPosition, distanceTo, updateStats, pet.name, triggerPetAction, spawnParticles, addFloatingText]);

  // Handle agility course
  const handleAgility = useCallback(() => {
    if (agilityState?.active) return;

    setAgilityState({
      active: true,
      hurdles: [
        { x: 150, cleared: false },
        { x: 300, cleared: false },
        { x: 450, cleared: false },
        { x: 600, cleared: false },
      ],
      score: 0,
      timer: 10,
      petX: 50,
    });

    triggerPetAction('playing', 10000);

    toast({
      title: 'Agility Course Started!',
      description: 'Press SPACEBAR to jump over hurdles!',
    });
  }, [agilityState, triggerPetAction]);

  // Agility timer
  useEffect(() => {
    if (!agilityState?.active) return;

    const timer = setInterval(() => {
      setAgilityState(previous => {
        if (!previous || !previous.active) return previous;

        const newTimer = previous.timer - 0.1;
        const newPetX = previous.petX + 3;

        const updatedHurdles = previous.hurdles.map(hurdle => {
          if (!hurdle.cleared && Math.abs(newPetX - hurdle.x) < 20) {
            return { ...hurdle, cleared: true };
          }
          return hurdle;
        });

        const newScore = updatedHurdles.filter(hurdle => hurdle.cleared).length;

        if (newTimer <= 0 || newPetX > 700) {
          const happinessBonus = 5 + newScore * 3;
          const energyBonus = 2 + newScore * 2;
          updateStats({ happiness: happinessBonus, energy: energyBonus });
          spawnParticles(600, 450, [{ kind: 'trophy', color: '#FBBF24' }, { kind: 'star', color: '#F59E0B' }, { kind: 'sparkle', color: '#FDE68A' }], 8);
          addFloatingText(`+${happinessBonus} Happy!`, 600, 420, 'text-yellow-300');
          triggerPetAction('jumping', 1200);

          toast({
            title: `Agility Complete! Score: ${newScore}/4`,
            description: `+${happinessBonus} happiness, +${energyBonus} energy`,
          });

          return null;
        }

        return { ...previous, timer: newTimer, petX: newPetX, hurdles: updatedHurdles, score: newScore };
      });
    }, 100);

    return () => clearInterval(timer);
  }, [agilityState?.active, updateStats, spawnParticles, addFloatingText, triggerPetAction]);

  // Fetch ball animation
  useEffect(() => {
    if (!fetchBall) return;

    const timer = setInterval(() => {
      setFetchBall(previous => {
        if (!previous) return null;

        if (previous.phase === 'flying') {
          const newProgress = previous.progress + 0.05;
          if (newProgress >= 1) {
            return { ...previous, phase: 'landed', progress: 1 };
          }
          return { ...previous, progress: newProgress };
        }

        if (previous.phase === 'landed') {
          const ballX = previous.x + (previous.targetX - previous.x) * previous.progress;
          const ballY = previous.y + (previous.targetY - previous.y) * previous.progress;

          if (distanceTo(petPosition.x, petPosition.y, ballX, ballY) < 50) {
            updateStats({ happiness: 5, energy: -2 });
            spawnParticles(ballX, ballY, [{ kind: 'star', color: '#FBBF24' }, { kind: 'paw', color: '#92400E' }, { kind: 'heart', color: '#EC4899' }], 5);
            addFloatingText('+5 Happy!', ballX, ballY - 20, 'text-green-300');
            setFetchCooldown(true);
            setTimeout(() => setFetchCooldown(false), 2000);

            toast({
              title: `${pet.name} fetched the ball!`,
              description: '+5 happiness, -2 energy',
            });

            return null;
          }
          return previous;
        }

        return previous;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [fetchBall, petPosition, distanceTo, updateStats, pet.name, spawnParticles, addFloatingText]);

  // NPC patrol animation
  useEffect(() => {
    const timer = setInterval(() => {
      setNpcs(previous => previous.map(npc => ({
        ...npc,
        angle: npc.angle + npc.speed,
      })));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd', ' '].includes(key)) {
        event.preventDefault();
        keysPressed.current.add(key);
      }

      if (key === ' ') {
        if (agilityState?.active) {
          spawnParticles(600, 450, [{ kind: 'wind', color: '#38BDF8' }], 3);
          return;
        }

        if (nearStation) {
          switch (nearStation.id) {
            case 'fetch':
              handleFetch();
              break;
            case 'food':
              handleFood();
              break;
            case 'agility':
              handleAgility();
              break;
            case 'npc':
              handleNpcInteraction();
              break;
          }
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearStation, handleFetch, handleFood, handleAgility, handleNpcInteraction, agilityState, spawnParticles]);

  // Movement loop
  useEffect(() => {
    const moveInterval = setInterval(() => {
      const keys = keysPressed.current;
      let deltaX = 0;
      let deltaY = 0;

      if (keys.has('w')) deltaY -= MOVE_SPEED;
      if (keys.has('s')) deltaY += MOVE_SPEED;
      if (keys.has('a')) deltaX -= MOVE_SPEED;
      if (keys.has('d')) deltaX += MOVE_SPEED;

      if (deltaX !== 0 || deltaY !== 0) {
        if (deltaX !== 0 && deltaY !== 0) {
          const factor = 1 / Math.sqrt(2);
          deltaX *= factor;
          deltaY *= factor;
        }

        setPetPosition(previous => ({
          x: Math.max(PET_SIZE / 2, Math.min(PARK_WIDTH - PET_SIZE / 2, previous.x + deltaX)),
          y: Math.max(PET_SIZE / 2, Math.min(PARK_HEIGHT - PET_SIZE / 2, previous.y + deltaY)),
        }));

        if (deltaX < 0) setPetDirection('left');
        else if (deltaX > 0) setPetDirection('right');

        if (petActionRef.current === 'idle') {
          setPetAction('moving');
          petActionRef.current = 'moving';
        }
      } else {
        if (petActionRef.current === 'moving') {
          setPetAction('idle');
          petActionRef.current = 'idle';
        }
      }
    }, 16);

    return () => clearInterval(moveInterval);
  }, []);

  // Check proximity to stations
  useEffect(() => {
    const closest = STATIONS.find(station =>
      distanceTo(petPosition.x, petPosition.y, station.x, station.y) < INTERACT_DISTANCE,
    );
    setNearStation(closest || null);
  }, [petPosition, distanceTo]);

  // Fetch ball rendering position
  const getBallPosition = () => {
    if (!fetchBall) return null;
    const progress = fetchBall.progress;
    const x = fetchBall.x + (fetchBall.targetX - fetchBall.x) * progress;
    const y = fetchBall.y + (fetchBall.targetY - fetchBall.y) * progress;
    const arcHeight = fetchBall.phase === 'flying' ? -80 * Math.sin(progress * Math.PI) : 0;
    return { x, y: y + arcHeight };
  };

  const ballPos = getBallPosition();

  // ──────────────────── RENDER ────────────────────

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden select-none">

      {/* ── Layered Sky Background ── */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, #7DBBE6 0%, #A2D2E6 20%, #B8DDD4 40%, #9FD4A8 60%, #7EC88E 80%, #5CB878 100%)',
      }} />

      {/* Golden Sun with Rays */}
      <div className="fixed pointer-events-none" style={{
        top: '5%', right: '16%', width: 72, height: 72, borderRadius: '50%',
        background: 'radial-gradient(circle, #FFFDE7 0%, #FFE082 35%, #FFB300 65%, transparent 100%)',
        boxShadow: '0 0 50px 25px rgba(255,183,0,0.12), 0 0 100px 50px rgba(255,183,0,0.06)',
      }}>
        <div className="absolute inset-[-80%] opacity-30" style={{ animation: 'sunRays 80s linear infinite' }}>
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="absolute top-1/2 left-1/2 origin-left" style={{
              transform: `rotate(${index * 30}deg)`,
              width: 80, height: 1.5,
              background: 'linear-gradient(90deg, rgba(255,200,0,0.5), transparent)',
              marginTop: -0.75,
            }} />
          ))}
        </div>
      </div>

      {/* Painterly Clouds */}
      <div className="fixed top-0 left-0 w-full h-2/5 pointer-events-none overflow-hidden">
        {[
          { left: '-5%', top: '7%', scale: 1.3, duration: 55, opacity: 0.75, width: 140, delay: 0 },
          { left: '-10%', top: '3%', scale: 1.6, duration: 70, opacity: 0.5, width: 180, delay: 15 },
          { left: '-8%', top: '14%', scale: 1.0, duration: 45, opacity: 0.6, width: 110, delay: 30 },
          { left: '-6%', top: '5%', scale: 0.85, duration: 60, opacity: 0.45, width: 100, delay: 8 },
        ].map((cloud, index) => (
          <div key={index} className="absolute animate-park-cloud" style={{
            left: cloud.left, top: cloud.top,
            '--cloud-scale': cloud.scale,
            '--cloud-travel': '120vw',
            '--cloud-duration': `${cloud.duration}s`,
            animationDelay: `${cloud.delay}s`,
            opacity: cloud.opacity,
          } as React.CSSProperties}>
            <div style={{
              width: cloud.width, height: cloud.width * 0.35,
              borderRadius: '50px',
              background: 'rgba(255,255,255,0.85)',
              boxShadow: `
                ${cloud.width * 0.2}px ${-cloud.width * 0.12}px 0 ${cloud.width * 0.06}px rgba(255,255,255,0.85),
                ${cloud.width * 0.45}px ${-cloud.width * 0.04}px 0 ${cloud.width * 0.03}px rgba(255,255,255,0.75),
                ${-cloud.width * 0.08}px ${-cloud.width * 0.08}px 0 ${cloud.width * 0.05}px rgba(255,255,255,0.7)
              `,
            }} />
          </div>
        ))}
      </div>

      {/* Distant Rolling Hills */}
      <div className="fixed bottom-0 left-0 w-full pointer-events-none" style={{ height: '45%' }}>
        <div className="absolute bottom-0 w-full h-full" style={{
          background: `
            radial-gradient(ellipse 90% 50% at 15% 100%, rgba(76,175,80,0.25) 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 85% 100%, rgba(56,142,60,0.2) 0%, transparent 70%),
            radial-gradient(ellipse 60% 30% at 50% 100%, rgba(102,187,106,0.15) 0%, transparent 60%)
          `,
        }} />
      </div>

      {/* Floating Dandelion Seeds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {DANDELION_SEEDS.map((seed, index) => (
          <div key={index} className="absolute animate-dandelion" style={{
            left: seed.x, top: seed.y,
            '--seed-dx': `${seed.dx}px`,
            '--seed-dy': `${seed.dy}px`,
            '--seed-ex': `${seed.ex}px`,
            '--seed-ey': `${seed.ey}px`,
            '--seed-duration': `${seed.duration}s`,
            animationDelay: `${seed.delay}s`,
          } as React.CSSProperties}>
            {/* CSS cross shape */}
            <div style={{ width: 8, height: 8, position: 'relative' }}>
              <div style={{ position: 'absolute', width: 2, height: 8, background: 'rgba(255,255,255,0.6)', left: 3, top: 0, borderRadius: 1 }} />
              <div style={{ position: 'absolute', width: 8, height: 2, background: 'rgba(255,255,255,0.6)', left: 0, top: 3, borderRadius: 1 }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Top HUD ── */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl shadow-lg border transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,248,235,0.95), rgba(255,240,220,0.95))',
            borderColor: 'rgba(200,160,100,0.3)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px -4px rgba(140,100,50,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          <ArrowLeft className="w-4 h-4 text-amber-800/70" />
          <span className="font-serif font-semibold text-sm text-amber-900/80">Back Home</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {[
            { icon: Heart, value: Math.round(pet.stats.happiness), color: '#EC4899', bgFrom: 'rgba(252,231,243,0.95)', bgTo: 'rgba(251,207,232,0.95)', border: 'rgba(236,72,153,0.2)' },
            { icon: Zap, value: Math.round(pet.stats.energy), color: '#EAB308', bgFrom: 'rgba(254,252,232,0.95)', bgTo: 'rgba(254,249,195,0.95)', border: 'rgba(234,179,8,0.2)' },
            { icon: UtensilsCrossed, value: Math.round(pet.stats.hunger), color: '#F97316', bgFrom: 'rgba(255,247,237,0.95)', bgTo: 'rgba(255,237,213,0.95)', border: 'rgba(249,115,22,0.2)' },
          ].map(({ icon: Icon, value, color, bgFrom, bgTo, border }, index) => (
            <div key={index} className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl shadow-md" style={{
              background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})`,
              borderWidth: 1, borderStyle: 'solid', borderColor: border,
              backdropFilter: 'blur(12px)',
              boxShadow: `0 4px 16px -4px ${color}20, inset 0 1px 0 rgba(255,255,255,0.5)`,
            }}>
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="font-mono font-bold text-sm" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Interaction Prompt ── */}
      {nearStation && !agilityState?.active && (() => {
        const StationIcon = nearStation.icon;
        return (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
            <div className="flex items-center gap-4 px-7 py-4 rounded-[1.25rem] shadow-2xl" style={{
              background: 'linear-gradient(135deg, rgba(255,250,240,0.97), rgba(255,245,230,0.97))',
              border: `2px solid ${nearStation.accentColor}30`,
              backdropFilter: 'blur(16px)',
              boxShadow: `0 12px 40px -8px ${nearStation.accentColor}25, 0 4px 16px -4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7)`,
            }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: `${nearStation.accentColor}15`,
                boxShadow: `0 0 20px 4px ${nearStation.accentColor}10`,
              }}>
                <StationIcon className="w-6 h-6" style={{ color: nearStation.accentColor }} />
              </div>
              <div>
                <p className="font-serif font-bold text-base text-amber-900">{nearStation.name}</p>
                <p className="text-xs text-amber-700/60 flex items-center gap-1.5 mt-0.5">
                  Press
                  <kbd className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold"
                    style={{
                      background: `${nearStation.accentColor}12`,
                      color: nearStation.accentColor,
                      border: `1px solid ${nearStation.accentColor}25`,
                      boxShadow: `0 1px 2px ${nearStation.accentColor}08`,
                    }}>
                    SPACE
                  </kbd>
                  {nearStation.description}
                </p>
              </div>
              <Sparkles className="w-4 h-4 animate-sparkle" style={{ color: nearStation.accentColor, opacity: 0.5 }} />
            </div>
          </div>
        );
      })()}

      {/* ── WASD Hint ── */}
      <div className="fixed bottom-6 right-5 z-40 opacity-40 hover:opacity-70 transition-opacity duration-300">
        <div className="grid grid-cols-3 gap-1 text-center">
          <div />
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold text-amber-800/80"
            style={{ background: 'rgba(255,248,235,0.85)', border: '1px solid rgba(200,160,100,0.25)', boxShadow: '0 2px 4px rgba(140,100,50,0.08)' }}>W</div>
          <div />
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold text-amber-800/80"
            style={{ background: 'rgba(255,248,235,0.85)', border: '1px solid rgba(200,160,100,0.25)', boxShadow: '0 2px 4px rgba(140,100,50,0.08)' }}>A</div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold text-amber-800/80"
            style={{ background: 'rgba(255,248,235,0.85)', border: '1px solid rgba(200,160,100,0.25)', boxShadow: '0 2px 4px rgba(140,100,50,0.08)' }}>S</div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold text-amber-800/80"
            style={{ background: 'rgba(255,248,235,0.85)', border: '1px solid rgba(200,160,100,0.25)', boxShadow: '0 2px 4px rgba(140,100,50,0.08)' }}>D</div>
        </div>
      </div>

      {/* ── Agility Overlay ── */}
      {agilityState?.active && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-4 px-7 py-3.5 rounded-2xl shadow-2xl" style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.92), rgba(56,189,248,0.92))',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px -4px rgba(14,165,233,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}>
            <Timer className="w-6 h-6 text-white" />
            <div>
              <p className="font-serif font-bold text-sm text-white">Agility Course</p>
              <p className="text-xs text-white/75 font-mono">Score: {agilityState.score}/4 | Time: {agilityState.timer.toFixed(1)}s</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════ PARK AREA ══════════════════════ */}
      <div
        ref={parkRef}
        className="relative overflow-hidden"
        style={{
          width: PARK_WIDTH,
          height: PARK_HEIGHT,
          borderRadius: '2rem',
          boxShadow: `
            0 0 0 3px rgba(34,120,60,0.2),
            0 0 0 6px rgba(34,120,60,0.08),
            0 24px 60px -12px rgba(20,60,30,0.25),
            inset 0 2px 4px rgba(255,255,255,0.15)
          `,
        }}
      >
        {/* ── Rich Grass Base ── */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 50% 40% at 25% 30%, rgba(134,239,172,0.4) 0%, transparent 100%),
            radial-gradient(ellipse 45% 45% at 70% 65%, rgba(74,222,128,0.3) 0%, transparent 100%),
            radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34,197,94,0.2) 0%, transparent 100%),
            linear-gradient(145deg, #5CB85C 0%, #4CAF50 20%, #43A047 40%, #3D9B41 60%, #388E3C 80%, #2E7D32 100%)
          `,
        }}>
          {/* Grass Blade Pattern */}
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: `
              repeating-linear-gradient(78deg, transparent, transparent 7px, rgba(255,255,255,0.6) 7px, rgba(255,255,255,0.6) 8px),
              repeating-linear-gradient(102deg, transparent, transparent 11px, rgba(255,255,255,0.4) 11px, rgba(255,255,255,0.4) 12px)
            `,
          }} />

          {/* Dappled Sunlight */}
          <div className="absolute inset-0 animate-dappled-shift" style={{
            background: `
              radial-gradient(circle 50px at 28% 22%, rgba(255,255,200,0.45) 0%, transparent 100%),
              radial-gradient(circle 60px at 62% 38%, rgba(255,255,200,0.3) 0%, transparent 100%),
              radial-gradient(circle 40px at 42% 68%, rgba(255,255,200,0.35) 0%, transparent 100%),
              radial-gradient(circle 55px at 78% 18%, rgba(255,255,200,0.25) 0%, transparent 100%),
              radial-gradient(circle 45px at 15% 75%, rgba(255,255,200,0.3) 0%, transparent 100%)
            `,
          }} />

          {/* Wildflower Patches */}
          <div className="absolute inset-0 opacity-40" style={{
            background: `
              radial-gradient(circle 3px at 15% 25%, rgba(244,114,182,0.8) 0%, transparent 100%),
              radial-gradient(circle 2px at 17% 27%, rgba(251,191,36,0.8) 0%, transparent 100%),
              radial-gradient(circle 3px at 82% 72%, rgba(244,114,182,0.7) 0%, transparent 100%),
              radial-gradient(circle 2px at 84% 74%, rgba(96,165,250,0.7) 0%, transparent 100%),
              radial-gradient(circle 2px at 55% 88%, rgba(251,191,36,0.7) 0%, transparent 100%),
              radial-gradient(circle 3px at 57% 90%, rgba(244,114,182,0.6) 0%, transparent 100%),
              radial-gradient(circle 2px at 35% 12%, rgba(167,139,250,0.6) 0%, transparent 100%),
              radial-gradient(circle 2px at 72% 15%, rgba(251,191,36,0.5) 0%, transparent 100%)
            `,
          }} />
        </div>

        {/* ── Organic Dirt Paths (SVG) ── */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${PARK_WIDTH} ${PARK_HEIGHT}`} preserveAspectRatio="none">
          {/* Horizontal path */}
          <path
            d={`M 0 ${PARK_HEIGHT / 2 + 5} C ${PARK_WIDTH * 0.2} ${PARK_HEIGHT / 2 - 12}, ${PARK_WIDTH * 0.35} ${PARK_HEIGHT / 2 + 18}, ${PARK_WIDTH / 2} ${PARK_HEIGHT / 2} C ${PARK_WIDTH * 0.65} ${PARK_HEIGHT / 2 - 18}, ${PARK_WIDTH * 0.8} ${PARK_HEIGHT / 2 + 12}, ${PARK_WIDTH} ${PARK_HEIGHT / 2 - 5}`}
            stroke="rgba(180,140,90,0.22)" strokeWidth="44" fill="none" strokeLinecap="round"
          />
          <path
            d={`M 0 ${PARK_HEIGHT / 2 + 5} C ${PARK_WIDTH * 0.2} ${PARK_HEIGHT / 2 - 12}, ${PARK_WIDTH * 0.35} ${PARK_HEIGHT / 2 + 18}, ${PARK_WIDTH / 2} ${PARK_HEIGHT / 2} C ${PARK_WIDTH * 0.65} ${PARK_HEIGHT / 2 - 18}, ${PARK_WIDTH * 0.8} ${PARK_HEIGHT / 2 + 12}, ${PARK_WIDTH} ${PARK_HEIGHT / 2 - 5}`}
            stroke="rgba(160,120,70,0.08)" strokeWidth="50" fill="none" strokeLinecap="round"
          />
          {/* Vertical path */}
          <path
            d={`M ${PARK_WIDTH / 2 - 3} 0 C ${PARK_WIDTH / 2 + 15} ${PARK_HEIGHT * 0.2}, ${PARK_WIDTH / 2 - 18} ${PARK_HEIGHT * 0.35}, ${PARK_WIDTH / 2} ${PARK_HEIGHT / 2} C ${PARK_WIDTH / 2 + 18} ${PARK_HEIGHT * 0.65}, ${PARK_WIDTH / 2 - 15} ${PARK_HEIGHT * 0.8}, ${PARK_WIDTH / 2 + 3} ${PARK_HEIGHT}`}
            stroke="rgba(180,140,90,0.22)" strokeWidth="44" fill="none" strokeLinecap="round"
          />
          <path
            d={`M ${PARK_WIDTH / 2 - 3} 0 C ${PARK_WIDTH / 2 + 15} ${PARK_HEIGHT * 0.2}, ${PARK_WIDTH / 2 - 18} ${PARK_HEIGHT * 0.35}, ${PARK_WIDTH / 2} ${PARK_HEIGHT / 2} C ${PARK_WIDTH / 2 + 18} ${PARK_HEIGHT * 0.65}, ${PARK_WIDTH / 2 - 15} ${PARK_HEIGHT * 0.8}, ${PARK_WIDTH / 2 + 3} ${PARK_HEIGHT}`}
            stroke="rgba(160,120,70,0.08)" strokeWidth="50" fill="none" strokeLinecap="round"
          />
          {/* Path texture - small pebbles */}
          {Array.from({ length: 30 }).map((_, index) => {
            const angle = (index / 30) * Math.PI * 2;
            const pathX = PARK_WIDTH / 2 + Math.cos(angle) * (80 + Math.random() * 240);
            const pathY = PARK_HEIGHT / 2 + Math.sin(angle) * (60 + Math.random() * 180);
            return (
              <circle key={index} cx={pathX} cy={pathY} r={1.5 + Math.random() * 1.5}
                fill={`rgba(160,130,80,${0.08 + Math.random() * 0.08})`}
              />
            );
          })}
        </svg>

        {/* ── Park Border Foliage ── */}
        <div className="absolute inset-0 pointer-events-none" style={{
          boxShadow: 'inset 0 0 40px 15px rgba(22,101,52,0.15), inset 0 0 80px 30px rgba(22,101,52,0.06)',
        }} />

        {/* ── Nature Details (back layer) ── */}
        {NATURE_DETAILS.map((detail, index) => (
          <div
            key={`nature-${index}`}
            className="absolute pointer-events-none select-none"
            style={{
              left: detail.x, top: detail.y,
              transform: 'translate(-50%, -50%)',
              opacity: 0.7,
            }}
          >
            <NatureDetailIcon kind={detail.kind} size={detail.size} />
          </div>
        ))}

        {/* ── Trees (with sway animation) ── */}
        {TREES.map((tree, index) => (
          <div
            key={`tree-${index}`}
            className="absolute pointer-events-none select-none animate-tree-sway"
            style={{
              left: tree.x, top: tree.y,
              transform: 'translate(-50%, -50%)',
              '--tree-flip': tree.flip ? -1 : 1,
              animationDelay: `${index * 0.7}s`,
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
            } as React.CSSProperties}
          >
            {tree.type === 'pine'
              ? <TreePine style={{ width: tree.size, height: tree.size, color: '#166534' }} />
              : <Trees style={{ width: tree.size, height: tree.size, color: '#15803D' }} />
            }
          </div>
        ))}

        {/* ── Flowers (gentle bounce) ── */}
        {FLOWERS.map((flower, index) => (
          <div
            key={`flower-${index}`}
            className="absolute pointer-events-none select-none animate-float"
            style={{
              left: flower.x, top: flower.y,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${flower.delay}s`,
              animationDuration: '5s',
              opacity: 0.85,
            }}
          >
            <Flower2 style={{ width: 16, height: 16, color: flower.variant }} />
          </div>
        ))}

        {/* ── Animated Creatures ── */}
        {CREATURES.map((creature, index) => (
          <div
            key={`creature-${index}`}
            className="absolute pointer-events-none select-none animate-butterfly-float"
            style={{
              left: creature.x, top: creature.y,
              transform: 'translate(-50%, -50%)',
              animationDuration: `${creature.duration}s`,
              animationDelay: `${creature.delay}s`,
              opacity: 0.7,
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
            }}
          >
            <CreatureIcon kind={creature.kind} />
          </div>
        ))}

        {/* ── Station Ground Zones ── */}
        {STATIONS.map(station => (
          <div
            key={`ground-${station.id}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: station.x - station.radius * 1.4,
              top: station.y - station.radius * 1.4,
              width: station.radius * 2.8,
              height: station.radius * 2.8,
              background: station.groundHue,
            }}
          />
        ))}

        {/* ── Activity Stations ── */}
        {STATIONS.map(station => {
          const isNear = nearStation?.id === station.id;
          const StationIcon = station.icon;
          return (
            <div key={station.id}>
              {/* Glow ring when near */}
              {isNear && (
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: station.x - station.radius - 8,
                    top: station.y - station.radius - 8,
                    width: (station.radius + 8) * 2,
                    height: (station.radius + 8) * 2,
                    border: `2px solid ${station.accentColor}40`,
                    boxShadow: `0 0 24px 8px ${station.glowColor}, inset 0 0 16px 4px ${station.glowColor}`,
                    animation: 'stationGlowRing 2s ease-out infinite',
                  }}
                />
              )}

              {/* Station circle */}
              <div
                className={cn(
                  'absolute rounded-full flex flex-col items-center justify-center transition-all duration-300',
                  isNear && 'scale-110',
                )}
                style={{
                  left: station.x - station.radius,
                  top: station.y - station.radius,
                  width: station.radius * 2,
                  height: station.radius * 2,
                  background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, transparent 60%), linear-gradient(145deg, ${station.accentColor}25, ${station.accentColor}10)`,
                  border: `2px solid ${station.accentColor}20`,
                  boxShadow: isNear
                    ? `0 8px 32px -4px ${station.accentColor}30, 0 0 0 1px ${station.accentColor}15, inset 0 1px 4px rgba(255,255,255,0.3)`
                    : `0 4px 16px -4px ${station.accentColor}15, inset 0 1px 4px rgba(255,255,255,0.2)`,
                  backdropFilter: 'blur(4px)',
                  animation: isNear ? undefined : 'stationBreath 3.5s ease-in-out infinite',
                }}
              >
                <StationIcon
                  className={cn(
                    'w-8 h-8 transition-transform duration-300 drop-shadow-md',
                    isNear && 'scale-110 animate-float',
                  )}
                  style={{ color: station.accentColor, animationDuration: '2s' }}
                />
                <span className="text-[10px] font-serif font-bold mt-1 drop-shadow-sm"
                  style={{ color: station.accentColor }}>
                  {station.name}
                </span>
              </div>
            </div>
          );
        })}

        {/* ── NPC Pets ── */}
        {npcs.map(npc => {
          const currentX = npc.x + Math.cos(npc.angle) * npc.patrolRadius;
          const currentY = npc.y + Math.sin(npc.angle) * npc.patrolRadius;
          const isNear = distanceTo(petPosition.x, petPosition.y, currentX, currentY) < INTERACT_DISTANCE;
          const npcFilter = PET_COLOR_FILTERS[npc.color];
          return (
            <div
              key={npc.id}
              className={cn(
                'absolute transition-all duration-100 select-none',
                isNear && 'scale-125',
              )}
              style={{
                left: currentX,
                top: currentY,
                transform: `translate(-50%, -50%) scaleX(${Math.cos(npc.angle) > 0 ? 1 : -1})`,
              }}
            >
              <img
                src={PET_IMAGES[npc.species]}
                alt={npc.name}
                style={{
                  width: 32, height: 32, objectFit: 'contain',
                  filter: `${npcFilter || ''} drop-shadow(0 2px 4px rgba(0,0,0,0.15))`.trim(),
                }}
              />
              {isNear && !npcCooldowns[npc.id] && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-serif font-bold whitespace-nowrap px-2.5 py-1 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(236,72,153,0.85), rgba(244,114,182,0.85))',
                    color: 'white',
                    boxShadow: '0 2px 8px -2px rgba(236,72,153,0.4)',
                    transform: `scaleX(${Math.cos(npc.angle) > 0 ? 1 : -1})`,
                  }}>
                  {npc.name}
                </div>
              )}
            </div>
          );
        })}

        {/* ── Fetch Ball ── */}
        {fetchBall && ballPos && (
          <div
            className={cn(
              'absolute select-none pointer-events-none z-20 transition-none',
              fetchBall.phase === 'landed' && 'animate-float',
            )}
            style={{
              left: ballPos.x,
              top: ballPos.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* CSS tennis ball */}
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #D9F99D, #84CC16, #65A30D)',
              boxShadow: '0 3px 6px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(0,0,0,0.15)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', width: '120%', height: 2,
                top: '50%', left: '-10%',
                background: 'rgba(255,255,255,0.4)', borderRadius: 1,
                transform: 'translateY(-50%) rotate(20deg)',
              }} />
            </div>
          </div>
        )}

        {/* ── Player Pet ── */}
        <div
          className="absolute z-30 transition-none"
          style={{
            left: petPosition.x - PET_SIZE / 2,
            top: petPosition.y - PET_SIZE / 2,
            width: PET_SIZE,
            height: PET_SIZE,
          }}
        >
          {/* Pet shadow */}
          <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-[70%] h-[12%] rounded-full"
            style={{ background: 'rgba(0,0,0,0.12)', filter: 'blur(3px)' }}
          />
          {/* Direction wrapper - scaleX here to avoid transform conflict with animations */}
          <div className="w-full h-full" style={{ transform: `scaleX(${petDirection === 'left' ? -1 : 1})` }}>
            <img
              src={PET_IMAGES[pet.species]}
              alt={pet.name}
              className={cn('w-full h-full object-contain', petAnimationClass)}
              style={{
                filter: `${PET_COLOR_FILTERS[pet.color] || ''} drop-shadow(0 3px 6px rgba(0,0,0,0.2))`.trim(),
              }}
            />
          </div>
          {/* Pet name label */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-serif font-bold whitespace-nowrap px-2.5 py-0.5 rounded-full shadow-md"
            style={{
              background: 'linear-gradient(135deg, hsl(12 76% 50% / 0.85), hsl(12 76% 55% / 0.85))',
              color: 'white',
              boxShadow: '0 2px 8px -2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}>
            {pet.name}
          </div>
        </div>

        {/* ── Floating Texts ── */}
        {floatingTexts.map(floatingText => (
          <div
            key={floatingText.id}
            className={cn('absolute pointer-events-none z-40 font-serif font-bold text-sm', floatingText.color)}
            style={{
              left: floatingText.x,
              top: floatingText.y,
              transform: 'translate(-50%, -50%)',
              animation: 'floatTextUp 1.5s ease-out forwards',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            {floatingText.text}
          </div>
        ))}

        {/* ── Particles ── */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute pointer-events-none z-40 select-none"
            style={{
              left: particle.x,
              top: particle.y,
              transform: 'translate(-50%, -50%)',
              animation: 'particleBurst 1.2s ease-out forwards',
              '--particle-vx': `${particle.vx * 30}px`,
              '--particle-vy': `${particle.vy * 30}px`,
            } as React.CSSProperties}
          >
            <ParticleIcon kind={particle.kind} color={particle.color} />
          </div>
        ))}

        {/* ── Agility Hurdles Overlay ── */}
        {agilityState?.active && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Agility lane */}
            <div className="absolute bottom-[20%] left-0 right-0 h-20" style={{
              background: 'linear-gradient(180deg, rgba(56,189,248,0.12), rgba(56,189,248,0.2), rgba(56,189,248,0.12))',
              borderTop: '2px solid rgba(56,189,248,0.25)',
              borderBottom: '2px solid rgba(56,189,248,0.25)',
            }} />
            {/* Hurdles */}
            {agilityState.hurdles.map((hurdle, index) => (
              <div
                key={index}
                className={cn(
                  'absolute bottom-[25%] transition-all',
                  hurdle.cleared ? 'opacity-30 scale-75' : 'animate-float',
                )}
                style={{ left: hurdle.x, animationDelay: `${index * 0.3}s` }}
              >
                {/* CSS hurdle bar */}
                <div style={{ position: 'relative', width: 30, height: 36 }}>
                  <div style={{ position: 'absolute', width: 4, height: 36, background: '#92400E', borderRadius: 2, left: 2, bottom: 0 }} />
                  <div style={{ position: 'absolute', width: 4, height: 36, background: '#92400E', borderRadius: 2, right: 2, bottom: 0 }} />
                  <div style={{ position: 'absolute', width: '100%', height: 5, background: '#F97316', borderRadius: 2, top: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
                </div>
              </div>
            ))}
            {/* Running pet sprite */}
            <div
              className="absolute bottom-[28%]"
              style={{
                left: agilityState.petX,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              }}
            >
              <img
                src={PET_IMAGES[pet.species]}
                alt={pet.name}
                className="animate-park-run"
                style={{
                  width: 32, height: 32, objectFit: 'contain',
                  filter: PET_COLOR_FILTERS[pet.color] || undefined,
                }}
              />
            </div>
          </div>
        )}

        {/* ── Vignette Overlay ── */}
        <div className="absolute inset-0 pointer-events-none rounded-[2rem]" style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(22,101,52,0.08) 100%)',
        }} />
      </div>

      {/* ── Park Name Badge ── */}
      <div className="mt-4 z-10">
        <div className="flex items-center gap-2 px-5 py-2 rounded-2xl" style={{
          background: 'linear-gradient(135deg, rgba(255,248,235,0.9), rgba(255,240,220,0.9))',
          border: '1px solid rgba(200,160,100,0.2)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 16px -4px rgba(140,100,50,0.1)',
        }}>
          <Trees className="w-5 h-5 text-green-700/80" />
          <span className="font-serif font-bold text-sm text-amber-900/80">Paws Park</span>
          <span className="text-[10px] font-mono text-amber-700/50 ml-1">WASD to move</span>
        </div>
      </div>
    </div>
  );
};

export default ParkPlayground;
