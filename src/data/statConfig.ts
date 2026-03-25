/**
 * Static configuration for the five pet stats (hunger, happiness, energy,
 * cleanliness, health).
 *
 * `STAT_CONFIG` maps each stat key to a `StatConfigEntry` describing its
 * display label, icon, associated action, color classes, warning thresholds,
 * tooltip text, and decay/boost descriptions shown in the UI.
 *
 * `getStatColor` returns Tailwind color classes based on the current value:
 * red (<=15), amber (<=30), or emerald (>30).
 *
 * @module data/statConfig
 */
import { PetStats } from '@/types/game';

export interface StatConfigEntry {
  label: string;
  icon: string;
  action: 'feed' | 'play' | 'rest' | 'clean' | 'vet';
  actionLabel: string;
  description: string;
  color: string;
  bgColor: string;
  lowWarning: number;
  warning: string;
  tooltip: string;
  decayInfo: string;
  boostInfo: string;
}

export const STAT_CONFIG: Record<keyof PetStats, StatConfigEntry> = {
  hunger: {
    label: 'Hunger',
    icon: '🍖',
    action: 'feed',
    actionLabel: 'Feed',
    description: 'Buy food in the shop',
    color: 'bg-chart-1',
    bgColor: 'bg-chart-1/20',
    lowWarning: 30,
    warning: 'Your pet is hungry!',
    tooltip: 'How full your pet is. Decreases over time.',
    decayInfo: 'Decays -0.5 per tick. Missing a meal (breakfast, lunch, dinner) causes an extra -25 drop.',
    boostInfo: 'Increased by: Food items. Feeding during meal windows prevents the penalty.',
  },
  happiness: {
    label: 'Happiness',
    icon: '💕',
    action: 'play',
    actionLabel: 'Play',
    description: 'Buy toys or accessories and play with me',
    color: 'bg-chart-2',
    bgColor: 'bg-chart-2/20',
    lowWarning: 25,
    warning: 'Your pet needs attention!',
    tooltip: 'How happy your pet feels. Affects behavior.',
    decayInfo: 'Decays -0.5 per tick. Faster with curious personality.',
    boostInfo: 'Increased by: Toys, play sessions, accessories.',
  },
  energy: {
    label: 'Energy',
    icon: '⚡',
    action: 'rest',
    actionLabel: 'Rest',
    description: 'Let me rest or reduce activities',
    color: 'bg-chart-3',
    bgColor: 'bg-chart-3/20',
    lowWarning: 20,
    warning: 'Your pet is tired!',
    tooltip: 'Energy level. Low energy makes pet sluggish.',
    decayInfo: 'Decays -0.33 per tick. Faster with playful personality.',
    boostInfo: 'Increased by: Sleep, cozy beds, rest items.',
  },
  cleanliness: {
    label: 'Cleanliness',
    icon: '✨',
    action: 'clean',
    actionLabel: 'Clean',
    description: 'Book grooming',
    color: 'bg-chart-4',
    bgColor: 'bg-chart-4/20',
    lowWarning: 25,
    warning: 'Your pet needs grooming!',
    tooltip: 'How clean your pet is. Low cleanliness hurts health.',
    decayInfo: 'Decays -0.5 per tick. Faster with curious personality.',
    boostInfo: 'Increased by: Grooming, spa days, baths.',
  },
  health: {
    label: 'Health',
    icon: '❤️',
    action: 'vet',
    actionLabel: 'Vet',
    description: 'Buy vitamins or schedule a vet checkup',
    color: 'bg-chart-5',
    bgColor: 'bg-chart-5/20',
    lowWarning: 40,
    warning: 'Visit the vet!',
    tooltip: 'Overall health. Critical low = danger!',
    decayInfo: 'Decays -0.33 normally, -0.67 when hunger/cleanliness <30%.',
    boostInfo: 'Increased by: Vitamins, vet visits, good food.',
  },
};

export const getStatColor = (value: number): { barColor: string; textColor: string; bgColor: string } => {
  if (value <= 15) {
    return { barColor: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-500/20' };
  }
  if (value <= 30) {
    return { barColor: 'bg-amber-500', textColor: 'text-amber-600', bgColor: 'bg-amber-500/20' };
  }
  return { barColor: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-500/20' };
};
