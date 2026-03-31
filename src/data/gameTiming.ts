/**
 * Shared pacing constants for the game simulation.
 *
 * These values intentionally keep the dashboard clock, stat decay loop,
 * and random-event cadence aligned so the UI time and gameplay time do
 * not drift apart.
 */

export const DEFAULT_START_GAME_TIME = 7 * 60; // 7:00 AM

// Clock display pace: 3 game minutes every 5 real seconds.
// A full 24-hour game day takes about 40 real minutes.
export const GAME_MINUTES_PER_CLOCK_TICK = 3;
export const REAL_MS_PER_CLOCK_TICK = 5000;

// Core simulation pace: stats decay every 30 seconds, and each decay tick
// advances the in-game day by 18 minutes to match the clock pace.
export const STAT_DECAY_INTERVAL_MS = 30000;
export const GAME_MINUTES_PER_DECAY_TICK = 18;

// Random events should feel occasional, not relentless.
export const RANDOM_EVENT_CHANCE_PER_DECAY_TICK = 0.03;

// Play window timing ranges shared between GameClock (display/penalty) and
// GameProvider (satisfaction dispatch). Order must match PLAY_WINDOWS in GameClock.
export const PLAY_WINDOW_RANGES = [
  { startMinute: 610, endMinute: 630 },  // Morning Play:   10:10 AM – 10:30 AM
  { startMinute: 780, endMinute: 800 },  // Afternoon Play:  1:00 PM –  1:20 PM
  { startMinute: 1050, endMinute: 1070 }, // Evening Play:   5:30 PM –  5:50 PM
] as const;
