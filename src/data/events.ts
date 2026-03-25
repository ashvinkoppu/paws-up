/**
 * Random event catalog.
 *
 * `RANDOM_EVENTS` is the pool of events that can fire during gameplay (5% chance
 * per decay tick when no mini-game is active). Each event presents the player
 * with 2-3 choices that apply stat effects, cost money, earn money, or trigger
 * a shop discount.
 *
 * `getRandomEvent` picks a uniformly random entry from the pool.
 *
 * @module data/events
 */
import { RandomEvent } from '@/types/game';

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'event-sale',
    title: '🏷️ Flash Sale!',
    description: 'The pet store is having a surprise sale! Everything is 50% off for today.',
    type: 'discount',
    choices: [
      {
        text: 'Visit the store',
        message: 'You got 50% off in the shop for today! Shop wisely.',
        discountEffect: 50,
      },
      {
        text: 'Maybe later',
        message: 'The sale ends soon, but you can come back later.',
      },
    ],
  },
  {
    id: 'event-sick',
    title: '🤒 Feeling Under the Weather',
    description: 'Your pet seems a bit unwell today. They might need some medicine or a vet visit.',
    type: 'sickness',
    choices: [
      {
        text: 'Visit the vet ($40)',
        cost: 40,
        effects: { health: 30 },
        message: 'The vet gave your pet a checkup and some medicine. They feel much better!',
      },
      {
        text: 'Give vitamins ($15)',
        cost: 15,
        effects: { health: 15 },
        message: 'The vitamins helped a little, but keep an eye on your pet.',
      },
      {
        text: 'Let them rest',
        effects: { health: -10, happiness: -15 },
        message: 'Your pet rested but still feels unwell. Maybe see a vet soon.',
      },
    ],
  },
  {
    id: 'event-broken-toy',
    title: '💔 Broken Toy',
    description: "Oh no! Your pet's favorite toy broke during playtime.",
    type: 'broken',
    choices: [
      {
        text: 'Buy a new one ($25)',
        cost: 25,
        effects: { happiness: 20 },
        message: 'Your pet loves the new toy!',
      },
      {
        text: 'Try to fix it',
        effects: { happiness: -10 },
        message: "You tried to fix it, but it's not quite the same. Your pet misses the old toy.",
      },
    ],
  },
  {
    id: 'event-found-money',
    title: '💵 Lucky Find!',
    description: 'While walking your pet, you found some money on the ground!',
    type: 'reward',
    choices: [
      {
        text: 'Keep it',
        moneyEffect: 25,
        message: 'You found $25! Added to your savings.',
      },
      {
        text: 'Donate it',
        effects: { happiness: 15 },
        message: 'You donated the money. Your pet seems happy with your kindness!',
      },
    ],
  },
  {
    id: 'event-emergency',
    title: '🚨 Emergency!',
    description: "Your pet accidentally ate something they shouldn't have! They need immediate care.",
    type: 'emergency',
    choices: [
      {
        text: 'Emergency vet ($80)',
        cost: 80,
        effects: { health: 50 },
        message: "The vet saved your pet! They're recovering well.",
      },
      {
        text: 'Home remedy ($20)',
        cost: 20,
        effects: { health: 10, happiness: -20 },
        message: 'The home remedy helped a little, but your pet is still uncomfortable.',
      },
    ],
  },
  {
    id: 'event-friend',
    title: '🐕 Made a Friend!',
    description: 'Your pet made a new friend at the park! They had a great time playing together.',
    type: 'reward',
    choices: [
      {
        text: 'Plan a playdate',
        effects: { happiness: 25, energy: -15 },
        message: 'Your pet had an amazing time with their new friend!',
      },
      {
        text: 'Say goodbye',
        effects: { happiness: 10 },
        message: 'Your pet waves goodbye to their new friend.',
      },
    ],
  },
  {
    id: 'event-contest',
    title: '🏅 Pet Contest',
    description: "There's a local pet contest happening! Entry fee is $30.",
    type: 'opportunity',
    choices: [
      {
        text: 'Enter the contest ($30)',
        cost: 30,
        moneyEffect: 100,
        effects: { happiness: 30 },
        message: 'Your pet won first place! You received $100 prize money!',
      },
      {
        text: 'Just watch',
        effects: { happiness: 5 },
        message: 'You enjoyed watching the contest together.',
      },
    ],
  },
  {
    id: 'event-rainy',
    title: '🌧️ Rainy Day',
    description: "It's raining outside and your pet is feeling cooped up.",
    type: 'opportunity',
    choices: [
      {
        text: 'Indoor play session',
        effects: { happiness: 15, energy: -20 },
        message: 'You had a fun indoor play session!',
      },
      {
        text: 'Cozy nap time',
        effects: { energy: 30, happiness: 10 },
        message: 'You and your pet had a relaxing nap together.',
      },
    ],
  },
];

export const getRandomEvent = (): RandomEvent => {
  const index = Math.floor(Math.random() * RANDOM_EVENTS.length);
  return RANDOM_EVENTS[index];
};
