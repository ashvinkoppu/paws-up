import { ShopItem } from '@/types/game';

// Shop categories organized by pet attributes for consistent naming
// Hunger → Food items
// Happiness → Toys & Accessories (play with me)
// Cleanliness → Grooming items (book grooming)
// Health → Medicine items (vitamins & vet checkup)
// Energy → Rest items (rest & reduce activities)

export interface ShopCategory {
  id: string;
  attribute: 'hunger' | 'happiness' | 'cleanliness' | 'health' | 'energy';
  label: string;
  icon: string;
  description: string;
}

export const SHOP_CATEGORIES: ShopCategory[] = [
  { id: 'all', attribute: 'hunger', label: 'All', icon: '🛒', description: 'Browse all items' },
  { id: 'hunger', attribute: 'hunger', label: 'Hunger', icon: '🍖', description: 'Buy food in the shop' },
  { id: 'happiness', attribute: 'happiness', label: 'Happiness', icon: '💕', description: 'Buy toys or accessories and play with me' },
  { id: 'cleanliness', attribute: 'cleanliness', label: 'Cleanliness', icon: '✨', description: 'Book grooming' },
  { id: 'health', attribute: 'health', label: 'Health', icon: '❤️', description: 'Buy vitamins or schedule a vet checkup' },
  { id: 'energy', attribute: 'energy', label: 'Energy', icon: '⚡', description: 'Let me rest or reduce activities' },
];

export const SHOP_ITEMS: ShopItem[] = [
  // ========== HUNGER ITEMS (Food) ==========
  // "Please buy food in the shop"
  {
    id: 'hunger-basic-kibble',
    name: 'Basic Kibble',
    description: 'Simple but nutritious food for your pet',
    price: 5,
    category: 'hunger',
    tier: 'basic',
    effects: { hunger: 8 },
    icon: '🥣',
  },
  {
    id: 'hunger-premium-meal',
    name: 'Premium Meal',
    description: 'High-quality balanced nutrition',
    price: 15,
    category: 'hunger',
    tier: 'standard',
    effects: { hunger: 15, health: 2 },
    icon: '🍖',
  },
  {
    id: 'hunger-gourmet-feast',
    name: 'Gourmet Feast',
    description: 'The finest cuisine for your beloved pet',
    price: 35,
    category: 'hunger',
    tier: 'deluxe',
    effects: { hunger: 25, happiness: 5, health: 3 },
    icon: '🥩',
  },
  {
    id: 'hunger-tasty-treats',
    name: 'Tasty Treats',
    description: 'Delicious snacks that make your pet happy',
    price: 8,
    category: 'hunger',
    tier: 'basic',
    effects: { hunger: 5, happiness: 6 },
    icon: '🦴',
  },

  // ========== HAPPINESS ITEMS (Toys & Accessories) ==========
  // "Please buy toys or accessories and play with me"
  {
    id: 'happiness-bouncy-ball',
    name: 'Bouncy Ball',
    description: 'A simple ball for endless fun',
    price: 10,
    category: 'happiness',
    tier: 'basic',
    effects: { happiness: 8, energy: -10 },
    icon: '⚽',
  },
  {
    id: 'happiness-puzzle-toy',
    name: 'Puzzle Toy',
    description: 'Stimulates your pet mentally',
    price: 25,
    category: 'happiness',
    tier: 'standard',
    effects: { happiness: 12, energy: -15 },
    icon: '🧩',
  },
  {
    id: 'happiness-interactive-playset',
    name: 'Interactive Play Set',
    description: 'The ultimate entertainment center',
    price: 50,
    category: 'happiness',
    tier: 'deluxe',
    effects: { happiness: 18, energy: -20, health: 2 },
    icon: '🎮',
  },
  {
    id: 'happiness-bowtie',
    name: 'Bow Tie',
    description: 'A dapper bow tie to make your pet look fancy',
    price: 12,
    category: 'happiness',
    tier: 'basic',
    effects: { happiness: 10 },
    icon: '🎀',
  },
  {
    id: 'happiness-nametag',
    name: 'Name Tag',
    description: 'A personalized name tag for your pet',
    price: 8,
    category: 'happiness',
    tier: 'basic',
    effects: { happiness: 5 },
    icon: '🏷️',
  },
  {
    id: 'happiness-collar',
    name: 'Cute Collar',
    description: 'A stylish collar for your pet',
    price: 30,
    category: 'happiness',
    tier: 'standard',
    effects: { happiness: 15 },
    icon: '🐾',
  },
  {
    id: 'happiness-bandana',
    name: 'Pet Bandana',
    description: "A colorful bandana to show off your pet's style",
    price: 18,
    category: 'happiness',
    tier: 'standard',
    effects: { happiness: 12 },
    icon: '🧣',
  },
  {
    id: 'happiness-crown',
    name: 'Royal Crown',
    description: 'A majestic crown fit for pet royalty',
    price: 75,
    category: 'happiness',
    tier: 'deluxe',
    effects: { happiness: 20 },
    icon: '👑',
  },

  // ========== CLEANLINESS ITEMS (Grooming) ==========
  // "Please book grooming"
  {
    id: 'cleanliness-basic-brush',
    name: 'Basic Brush',
    description: 'Simple grooming brush',
    price: 8,
    category: 'cleanliness',
    tier: 'basic',
    effects: { cleanliness: 10 },
    icon: '🪮',
  },
  {
    id: 'cleanliness-premium-shampoo',
    name: 'Premium Shampoo',
    description: 'Leaves coat shiny and clean',
    price: 20,
    category: 'cleanliness',
    tier: 'standard',
    effects: { cleanliness: 18, happiness: 4 },
    icon: '🧴',
  },
  {
    id: 'cleanliness-spa-day',
    name: 'Spa Day Package',
    description: 'Full grooming and pampering session',
    price: 45,
    category: 'cleanliness',
    tier: 'deluxe',
    effects: { cleanliness: 28, happiness: 8, health: 3 },
    icon: '✨',
  },

  // ========== HEALTH ITEMS (Medicine) ==========
  // "Please buy vitamins or schedule a vet checkup"
  {
    id: 'health-daily-vitamins',
    name: 'Daily Vitamins',
    description: 'Boosts overall health',
    price: 15,
    category: 'health',
    tier: 'basic',
    effects: { health: 8 },
    icon: '💊',
  },
  {
    id: 'health-vet-checkup',
    name: 'Vet Checkup',
    description: 'Professional health examination',
    price: 40,
    category: 'health',
    tier: 'standard',
    effects: { health: 15 },
    icon: '🏥',
  },
  {
    id: 'health-full-treatment',
    name: 'Full Treatment',
    description: 'Complete medical care package',
    price: 80,
    category: 'health',
    tier: 'deluxe',
    effects: { health: 25, happiness: -10 },
    icon: '💉',
  },

  // ========== ENERGY ITEMS (Rest) ==========
  // "Please let me rest or reduce activities"
  {
    id: 'energy-cozy-bed',
    name: 'Cozy Bed',
    description: 'Premium rest for better energy recovery',
    price: 60,
    category: 'energy',
    tier: 'deluxe',
    effects: { energy: 20, happiness: 12 },
    icon: '🛏️',
  },
  {
    id: 'energy-soft-blanket',
    name: 'Soft Blanket',
    description: 'A warm blanket for comfortable naps',
    price: 25,
    category: 'energy',
    tier: 'standard',
    effects: { energy: 12, happiness: 5 },
    icon: '🧶',
  },
  {
    id: 'energy-calming-treats',
    name: 'Calming Treats',
    description: 'Helps your pet relax and unwind',
    price: 12,
    category: 'energy',
    tier: 'basic',
    effects: { energy: 8, happiness: 3 },
    icon: '🌿',
  },
];

export const getCheaperAlternative = (item: ShopItem): ShopItem | null => {
  if (item.tier === 'basic') return null;

  const alternatives = SHOP_ITEMS.filter((i) => i.category === item.category && i.tier === 'basic');

  return alternatives[0] || null;
};
