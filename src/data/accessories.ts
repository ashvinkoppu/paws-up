/**
 * Accessory catalog — all equippable cosmetic items available in the Wardrobe tab.
 *
 * Each {@link AccessoryDef} belongs to a {@link AccessorySlot} (head/neck/body/tag)
 * and may be restricted to a specific pet gender via `genderFilter`. Items with a
 * `condition` are only rendered on the pet when the specified stat meets its minimum.
 *
 * `ACCESSORY_POSITIONS` stores per-species, per-slot overlay coordinates so the
 * emoji is rendered at the anatomically correct position on the pet image.
 *
 * @module data/accessories
 */
import { AccessoryDef, Species, AccessorySlot } from '@/types/game';

export const ACCESSORY_CATALOG: AccessoryDef[] = [
  // ===== MALE ACCESSORIES =====
  // Head
  {
    id: 'acc-m-cap',
    name: 'Cap',
    emoji: '🧢',
    slot: 'head',
    genderFilter: 'male',
    price: 20,
    tier: 'standard',
    description: 'A sporty cap for a cool look',
  },
  // Neck
  {
    id: 'acc-m-bowtie',
    name: 'Bow Tie',
    emoji: '🤵',
    slot: 'neck',
    genderFilter: 'male',
    price: 15,
    tier: 'basic',
    description: 'Classic and cute bow tie',
  },
  {
    id: 'acc-m-bandana',
    name: 'Bandana',
    emoji: '🧣',
    slot: 'neck',
    genderFilter: 'male',
    price: 18,
    tier: 'standard',
    description: 'Casual and sporty bandana',
    condition: { stat: 'happiness', min: 40 },
  },
  // Body
  {
    id: 'acc-m-scarf',
    name: 'Scarf',
    emoji: '🧶',
    slot: 'body',
    genderFilter: 'male',
    price: 25,
    tier: 'standard',
    description: 'A cozy winter scarf',
    condition: { stat: 'energy', min: 50 },
  },
  // Tag
  {
    id: 'acc-m-bonetag',
    name: 'Bone Tag',
    emoji: '🦴',
    slot: 'tag',
    genderFilter: 'male',
    price: 10,
    tier: 'basic',
    description: 'Bone-shaped name tag',
  },
  {
    id: 'acc-m-metaltag',
    name: 'Metal Tag',
    emoji: '🏷️',
    slot: 'tag',
    genderFilter: 'male',
    price: 12,
    tier: 'basic',
    description: 'Sturdy metal name tag',
  },

  // ===== FEMALE ACCESSORIES =====
  // Head
  {
    id: 'acc-f-hairbow',
    name: 'Hair Bow',
    emoji: '🎀',
    slot: 'head',
    genderFilter: 'female',
    price: 15,
    tier: 'basic',
    description: 'A cute bow that appears when happy',
    condition: { stat: 'happiness', min: 50 },
  },
  {
    id: 'acc-f-flowerclip',
    name: 'Flower Clip',
    emoji: '🌸',
    slot: 'head',
    genderFilter: 'female',
    price: 20,
    tier: 'standard',
    description: 'Delicate flower hair clip',
  },
  // Neck
  {
    id: 'acc-f-flowercollar',
    name: 'Flower Collar',
    emoji: '🌺',
    slot: 'neck',
    genderFilter: 'female',
    price: 22,
    tier: 'standard',
    description: 'Soft decorative flower collar',
  },
  {
    id: 'acc-f-scarf',
    name: 'Silk Scarf',
    emoji: '🧣',
    slot: 'neck',
    genderFilter: 'female',
    price: 25,
    tier: 'standard',
    description: 'An elegant silk scarf',
    condition: { stat: 'health', min: 60 },
  },
  // Body
  {
    id: 'acc-f-dress',
    name: 'Dress',
    emoji: '👗',
    slot: 'body',
    genderFilter: 'female',
    price: 35,
    tier: 'deluxe',
    description: 'A pretty dress for dogs and cats',
  },
  {
    id: 'acc-f-coat',
    name: 'Stylish Coat',
    emoji: '🧥',
    slot: 'body',
    genderFilter: 'female',
    price: 40,
    tier: 'deluxe',
    description: 'A fashionable seasonal coat',
  },
  // Tag
  {
    id: 'acc-f-hearttag',
    name: 'Heart Tag',
    emoji: '💖',
    slot: 'tag',
    genderFilter: 'female',
    price: 12,
    tier: 'basic',
    description: 'Heart-shaped name tag',
  },
];

// Emoji positions relative to the pet image container, per species and slot.
// Values are percentages: { top, left, fontSize }
export const ACCESSORY_POSITIONS: Record<Species, Record<AccessorySlot, { top: string; left: string; fontSize: string }>> = {
  dog: {
    head: { top: '2%', left: '58%', fontSize: '1.6rem' },
    neck: { top: '38%', left: '50%', fontSize: '1.4rem' },
    body: { top: '55%', left: '50%', fontSize: '1.5rem' },
    tag: { top: '42%', left: '35%', fontSize: '1rem' },
  },
  cat: {
    head: { top: '0%', left: '60%', fontSize: '1.6rem' },
    neck: { top: '35%', left: '50%', fontSize: '1.4rem' },
    body: { top: '52%', left: '50%', fontSize: '1.5rem' },
    tag: { top: '40%', left: '35%', fontSize: '1rem' },
  },
  rabbit: {
    head: { top: '-2%', left: '55%', fontSize: '1.5rem' },
    neck: { top: '32%', left: '50%', fontSize: '1.3rem' },
    body: { top: '50%', left: '50%', fontSize: '1.4rem' },
    tag: { top: '38%', left: '35%', fontSize: '0.9rem' },
  },
  hamster: {
    head: { top: '2%', left: '58%', fontSize: '1.3rem' },
    neck: { top: '35%', left: '50%', fontSize: '1.2rem' },
    body: { top: '52%', left: '48%', fontSize: '1.3rem' },
    tag: { top: '40%', left: '32%', fontSize: '0.85rem' },
  },
};

export function getAccessoryById(id: string): AccessoryDef | undefined {
  return ACCESSORY_CATALOG.find((accessory) => accessory.id === id);
}

export function getAccessoriesForGender(gender: 'male' | 'female' | 'neutral'): AccessoryDef[] {
  if (gender === 'neutral') return ACCESSORY_CATALOG;
  return ACCESSORY_CATALOG.filter((accessory) => accessory.genderFilter === gender || accessory.genderFilter === 'both');
}
