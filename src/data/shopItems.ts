import { ShopItem } from '@/types/game';

export const SHOP_ITEMS: ShopItem[] = [
  // Food Items
  {
    id: 'food-basic',
    name: 'Basic Kibble',
    description: 'Simple but nutritious food for your pet',
    price: 5,
    category: 'food',
    tier: 'basic',
    effects: { hunger: 15 },
    icon: '🥣',
  },
  {
    id: 'food-standard',
    name: 'Premium Meal',
    description: 'High-quality balanced nutrition',
    price: 15,
    category: 'food',
    tier: 'standard',
    effects: { hunger: 30, health: 3 },
    icon: '🍖',
  },
  {
    id: 'food-deluxe',
    name: 'Gourmet Feast',
    description: 'The finest cuisine for your beloved pet',
    price: 35,
    category: 'food',
    tier: 'deluxe',
    effects: { hunger: 50, happiness: 10, health: 5 },
    icon: '🥩',
  },
  {
    id: 'food-treat',
    name: 'Tasty Treats',
    description: 'Delicious snacks that make your pet happy',
    price: 8,
    category: 'food',
    tier: 'basic',
    effects: { hunger: 8, happiness: 12 },
    icon: '🦴',
  },

  // Toys
  {
    id: 'toy-ball',
    name: 'Bouncy Ball',
    description: 'A simple ball for endless fun',
    price: 10,
    category: 'toy',
    tier: 'basic',
    effects: { happiness: 15, energy: -10 },
    icon: '⚽',
  },
  {
    id: 'toy-puzzle',
    name: 'Puzzle Toy',
    description: 'Stimulates your pet mentally',
    price: 25,
    category: 'toy',
    tier: 'standard',
    effects: { happiness: 25, energy: -15 },
    icon: '🧩',
  },
  {
    id: 'toy-deluxe',
    name: 'Interactive Play Set',
    description: 'The ultimate entertainment center',
    price: 50,
    category: 'toy',
    tier: 'deluxe',
    effects: { happiness: 35, energy: -20, health: 3 },
    icon: '🎮',
  },

  // Grooming
  {
    id: 'groom-basic',
    name: 'Basic Brush',
    description: 'Simple grooming brush',
    price: 8,
    category: 'grooming',
    tier: 'basic',
    effects: { cleanliness: 18 },
    icon: '🪮',
  },
  {
    id: 'groom-shampoo',
    name: 'Premium Shampoo',
    description: 'Leaves coat shiny and clean',
    price: 20,
    category: 'grooming',
    tier: 'standard',
    effects: { cleanliness: 35, happiness: 8 },
    icon: '🧴',
  },
  {
    id: 'groom-spa',
    name: 'Spa Day Package',
    description: 'Full grooming and pampering session',
    price: 45,
    category: 'grooming',
    tier: 'deluxe',
    effects: { cleanliness: 55, happiness: 18, health: 5 },
    icon: '✨',
  },

  // Medicine
  {
    id: 'med-vitamins',
    name: 'Daily Vitamins',
    description: 'Boosts overall health',
    price: 15,
    category: 'medicine',
    tier: 'basic',
    effects: { health: 15 },
    icon: '💊',
  },
  {
    id: 'med-checkup',
    name: 'Vet Checkup',
    description: 'Professional health examination',
    price: 40,
    category: 'medicine',
    tier: 'standard',
    effects: { health: 28 },
    icon: '🏥',
  },
  {
    id: 'med-treatment',
    name: 'Full Treatment',
    description: 'Complete medical care package',
    price: 80,
    category: 'medicine',
    tier: 'deluxe',
    effects: { health: 50, happiness: -10 },
    icon: '💉',
  },

  // Accessories
  {
    id: 'acc-bowtie',
    name: 'Bow Tie',
    description: 'A dapper bow tie to make your pet look fancy',
    price: 12,
    category: 'accessory',
    tier: 'basic',
    effects: { happiness: 10 },
    icon: '🎀',
  },
  {
    id: 'acc-nametag',
    name: 'Name Tag',
    description: 'A personalized name tag for your pet',
    price: 8,
    category: 'accessory',
    tier: 'basic',
    effects: { happiness: 5 },
    icon: '🏷️',
  },
  {
    id: 'acc-collar',
    name: 'Cute Collar',
    description: 'A stylish collar for your pet',
    price: 30,
    category: 'accessory',
    tier: 'standard',
    effects: { happiness: 15 },
    icon: '🐾',
  },
  {
    id: 'acc-bandana',
    name: 'Pet Bandana',
    description: 'A colorful bandana to show off your pet\'s style',
    price: 18,
    category: 'accessory',
    tier: 'standard',
    effects: { happiness: 12 },
    icon: '🧣',
  },
  {
    id: 'acc-bed',
    name: 'Cozy Bed',
    description: 'Premium rest for better energy recovery',
    price: 60,
    category: 'accessory',
    tier: 'deluxe',
    effects: { energy: 20, happiness: 12 },
    icon: '🛏️',
  },
  {
    id: 'acc-crown',
    name: 'Royal Crown',
    description: 'A majestic crown fit for pet royalty',
    price: 75,
    category: 'accessory',
    tier: 'deluxe',
    effects: { happiness: 20 },
    icon: '👑',
  },
];

export const getCheaperAlternative = (item: ShopItem): ShopItem | null => {
  if (item.tier === 'basic') return null;
  
  const alternatives = SHOP_ITEMS.filter(
    (i) => i.category === item.category && i.tier === 'basic'
  );
  
  return alternatives[0] || null;
};
