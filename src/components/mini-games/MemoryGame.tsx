/**
 * MemoryGame - Classic card-matching game with 6 emoji pairs (12 cards total).
 *
 * Cards are shuffled on mount. The player flips two cards per turn; matching pairs
 * stay face-up, mismatches flip back after 800ms. The game ends when all 6 pairs
 * are matched. Reward is tiered by move count:
 *   - 10 or fewer moves: $12
 *   - 11-15 moves: $8
 *   - 16+ moves: $5
 *
 * High score tracks fewest moves (lower is better).
 *
 * @prop {(reward: number) => void} onWin - Called with the dollar reward on completion.
 * @prop {number} highScore - Best (lowest) move count to display. 0 means no prior game.
 * @prop {(score: number) => void} onNewHighScore - Called when the player beats their record.
 */
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MemoryGameProps {
  onWin: (reward: number) => void;
  highScore: number;
  onNewHighScore: (score: number) => void;
}

const EMOJIS = ["🐕", "🐈", "🐰", "🐹", "🦴", "🐟"];

const MemoryGame: React.FC<MemoryGameProps> = ({
  onWin,
  highScore,
  onNewHighScore,
}) => {
  const [cards, setCards] = useState<
    { id: number; emoji: string; flipped: boolean; matched: boolean }[]
  >([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);
  const resolvingPairRef = useRef(false);

  // Initialize board: duplicate emoji array to create pairs, then shuffle
  useEffect(() => {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false,
      }));
    setCards(shuffled);
  }, []);

  // When two cards are flipped, check for a match. Matching cards stay face-up;
  // non-matching cards flip back after an 800ms delay so the player can memorize them.
  useEffect(() => {
    if (flippedCards.length !== 2 || resolvingPairRef.current) {
      return;
    }

    resolvingPairRef.current = true;
    const [first, second] = flippedCards;
    const currentMoveCount = moves + 1;
    setMoves(currentMoveCount);

    if (cards[first].emoji === cards[second].emoji) {
      setCards((previous) =>
        previous.map((card) =>
          card.id === first || card.id === second
            ? { ...card, matched: true }
            : card,
        ),
      );
      setMatches((currentMatches) => currentMatches + 1);
      setFlippedCards([]);
      resolvingPairRef.current = false;

      // Flash a "MATCH FOUND!" banner with the per-match reward amount.
      // Reward per match is higher when total moves are low.
      const perMatchReward = currentMoveCount <= 10 ? 2 : 1;
      setMatchMessage(`MATCH FOUND!  +$${perMatchReward}`);
      setTimeout(() => setMatchMessage(null), 1200);
      return;
    }

    const mismatchTimer = setTimeout(() => {
      setCards((previous) =>
        previous.map((card) =>
          card.id === first || card.id === second
            ? { ...card, flipped: false }
            : card,
        ),
      );
      setFlippedCards([]);
      resolvingPairRef.current = false;
    }, 800);

    return () => clearTimeout(mismatchTimer);
  }, [cards, flippedCards, moves]);

  // End-of-game: when all 6 pairs matched, calculate tiered reward based on move count
  useEffect(() => {
    if (matches === 6) {
      setGameComplete(true);
      const reward = moves <= 10 ? 12 : moves <= 15 ? 8 : 5;
      onWin(reward);

      // For memory game, fewer moves is better. Store as positive number.
      // A score of 0 means no previous game played.
      if (highScore === 0 || moves < highScore) {
        onNewHighScore(moves);
      }
    }
  }, [matches, moves, onWin, highScore, onNewHighScore]);

  // Ignore clicks when: two cards already flipped (waiting for match check),
  // the clicked card is already face-up or matched, or the game is over.
  const handleCardClick = (index: number) => {
    if (
      flippedCards.length === 2 ||
      cards[index].flipped ||
      cards[index].matched ||
      gameComplete
    )
      return;

    setCards((previous) =>
      previous.map((card, cardIndex) =>
        cardIndex === index ? { ...card, flipped: true } : card,
      ),
    );
    setFlippedCards((previous) => [...previous, index]);
  };

  return (
    <div className="space-y-5">
      {/* Game stats */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-xl">
          <div className="flex flex-col items-start leading-none">
            <div>
              <span className="text-sm text-muted-foreground mr-1">Moves:</span>
              <span className="font-mono font-semibold text-foreground">
                {moves}
              </span>
            </div>
            {highScore !== 0 && (
              <span className="text-xs text-muted-foreground">
                Best: {highScore}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-xl">
          <span className="text-sm text-muted-foreground">Matches:</span>
          <span className="font-mono font-semibold text-secondary">
            {matches}/6
          </span>
        </div>
      </div>

      {/* Cards grid with overlay for match message */}
      <div className="relative">
        {/* Match found message - overlay on top */}
        {matchMessage && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
            <div className="flex items-center justify-center gap-3 px-5 py-3 bg-secondary/95 rounded-xl border border-secondary/30 shadow-lg animate-fade-in-up">
              <span className="text-lg font-serif font-bold text-secondary-foreground">
                MATCH FOUND!
              </span>
              <span className="font-mono font-bold text-white/90">
                {matchMessage.split("  ")[1]}
              </span>
            </div>
          </div>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-4 gap-2.5">
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={cn(
                "h-18 rounded-xl transition-all duration-300 text-2xl flex items-center justify-center border-2",
                "transform hover:scale-105 active:scale-95",
                card.flipped || card.matched
                  ? "bg-primary/15 border-primary shadow-md"
                  : "bg-accent/40 border-border/50 hover:border-primary/50 hover:bg-accent/60",
              )}
              disabled={card.matched}
            >
              <span
                className={cn(
                  "transition-all duration-300",
                  card.flipped || card.matched
                    ? "scale-100 opacity-100"
                    : "scale-0 opacity-0",
                )}
              >
                {card.emoji}
              </span>
              {!card.flipped && !card.matched && (
                <span className="text-muted-foreground/50 text-xl">?</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Win message */}
      {gameComplete && (
        <div className="text-center p-5 bg-secondary/15 rounded-2xl border border-secondary/30 animate-fade-in-up">
          <div className="text-4xl mb-2 animate-wiggle">🎉</div>
          <p className="text-xl font-serif font-bold text-secondary">
            You Won!
          </p>
          <p className="text-sm text-muted-foreground">
            Completed in {moves} moves
          </p>
        </div>
      )}

      {/* Instructions */}
      <p className="text-sm text-muted-foreground text-center bg-accent/30 p-3 rounded-xl">
        Match all pairs!{" "}
        <span className="font-semibold text-foreground">
          Fewer moves = better reward
        </span>
      </p>
    </div>
  );
};

export default MemoryGame;
