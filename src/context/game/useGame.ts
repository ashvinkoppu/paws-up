/**
 * useGame Hook — convenient accessor for the Game context.
 *
 * Wraps `useContext(GameContext)` and throws a descriptive error when
 * called outside of a `<GameProvider>`, preventing silent undefined-context
 * bugs.
 *
 * @module context/game/useGame
 */
import { useContext } from 'react';
import { GameContext } from '@/context/game/GameProvider';

/**
 * Returns the current {@link GameContextType} value.
 *
 * @throws {Error} If used outside of a `<GameProvider>`.
 * @returns The full game context including state and action dispatchers.
 */
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
