/**
 * GameContext - top-level barrel re-export.
 *
 * Proxies everything from `@/context/game` so legacy imports from
 * `@/context/GameContext` continue to work. Prefer importing directly
 * from `@/context/game` in new code.
 *
 * @module context/GameContext
 */
export { GameProvider, useGame } from "./game";
export type { ActionFeedbackEvent } from "./game";
