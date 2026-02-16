import { Achievement } from '@/types/game';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-pet',
    name: 'New Best Friend',
    description: 'Adopt your very first pet',
    icon: '🐾',
    unlocked: false,
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Keep your pet alive through a tough situation',
    icon: '💪',
    unlocked: false,
  },
  {
    id: 'rich',
    name: 'Rolling in It',
    description: 'Accumulate a large amount of money',
    icon: '💰',
    unlocked: false,
  },
  {
    id: 'streak-3',
    name: '3-Day Streak',
    description: 'Care for your pet 3 days in a row',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Care for your pet 7 days in a row',
    icon: '⭐',
    unlocked: false,
  },
  {
    id: 'teen-stage',
    name: 'Growing Up',
    description: 'Your pet reached the teen stage',
    icon: '🌱',
    unlocked: false,
  },
  {
    id: 'adult-stage',
    name: 'All Grown Up',
    description: 'Your pet reached the adult stage',
    icon: '🌟',
    unlocked: false,
  },
  {
    id: 'perfect-stats',
    name: 'Perfect Care',
    description: 'Get all pet stats to maximum',
    icon: '✨',
    unlocked: false,
  },
  {
    id: 'budget-hero',
    name: 'Budget Hero',
    description: 'Stay under your weekly budget',
    icon: '🏦',
    unlocked: false,
  },
  {
    id: 'minigame-master',
    name: 'Minigame Master',
    description: 'Win multiple mini-games',
    icon: '🎮',
    unlocked: false,
  },
];
