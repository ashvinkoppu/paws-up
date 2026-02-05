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
