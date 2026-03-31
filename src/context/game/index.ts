/**
 * Game Context Module - barrel export file.
 *
 * Re-exports the public API of the game state management layer so
 * consumers can import everything from `@/context/game` in one place.
 *
 * Exports:
 * - {@link GameProvider}        - React context provider that wraps the app.
 * - {@link useGame}             - Hook to access game state & actions.
 * - {@link ActionFeedbackEvent} - Type describing UI feedback after an action.
 *
 * @module context/game
 */
export { GameProvider } from './GameProvider';
export { useGame } from './useGame';
export type { ActionFeedbackEvent } from './types';
