import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Gamepad2, Target, Brain, ArrowLeft, Trophy, Coins } from 'lucide-react';

type MiniGameType = 'catch' | 'memory' | null;

interface MiniGamesProps {
  onClose?: () => void;
}

// Catch the Treat Game
const CatchGame: React.FC<{ onWin: (reward: number) => void; onLose: () => void }> = ({ onWin, onLose }) => {
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          setGameActive(false);
          clearInterval(timer);
          if (score >= 5) {
            onWin(10 + score * 2);
          } else {
            onLose();
          }
          return 0;
        }
        return time - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive, score, onWin, onLose]);

  const moveTarget = useCallback(() => {
    setTargetPosition({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
    });
  }, []);

  const handleClick = () => {
    if (!gameActive) return;
    setScore((prevScore) => prevScore + 1);
    moveTarget();
  };

  return (
    <div className="space-y-5">
      {/* Game stats */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-xl">
          <Target className="w-4 h-4 text-secondary" />
          <span className="font-mono font-semibold text-foreground">{score}</span>
          <span className="text-sm text-muted-foreground">caught</span>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl transition-colors duration-300",
          timeLeft <= 5 ? "bg-destructive/15 text-destructive" : "bg-accent/50"
        )}>
          <span className="font-mono font-semibold">{timeLeft}s</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-accent/30 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-linear",
            timeLeft <= 5 ? "bg-destructive" : "bg-secondary"
          )}
          style={{ width: `${(timeLeft / 15) * 100}%` }}
        />
      </div>

      {/* Game area */}
      <div
        className={cn(
          "relative h-72 rounded-2xl border-2 border-dashed overflow-hidden",
          "bg-gradient-to-br from-accent/30 via-card to-secondary/10",
          "transition-all duration-300"
        )}
      >
        {/* Decorative elements */}
        <div className="absolute top-4 left-4 text-4xl opacity-20">🦴</div>
        <div className="absolute bottom-4 right-4 text-4xl opacity-20">🐾</div>

        {gameActive && (
          <button
            onClick={handleClick}
            className={cn(
              "absolute w-14 h-14 rounded-full flex items-center justify-center text-3xl cursor-pointer",
              "transform -translate-x-1/2 -translate-y-1/2",
              "bg-primary shadow-lg hover:scale-110 transition-transform duration-150",
              "animate-pulse warm-glow"
            )}
            style={{ left: `${targetPosition.x}%`, top: `${targetPosition.y}%` }}
          >
            🦴
          </button>
        )}

        {!gameActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/90 backdrop-blur-sm">
            <div className="text-center p-6 animate-fade-in-up">
              <div className={cn(
                "text-6xl mb-4",
                score >= 5 ? "animate-wiggle" : ""
              )}>
                {score >= 5 ? '🎉' : '😔'}
              </div>
              <p className="text-2xl font-serif font-bold text-foreground mb-2">
                {score >= 5 ? 'Great Catch!' : 'Try Again!'}
              </p>
              <p className="text-muted-foreground">
                You caught {score} treats
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-sm text-muted-foreground text-center bg-accent/30 p-3 rounded-xl">
        Click the treats as fast as you can! Catch <span className="font-semibold text-foreground">5+</span> to win.
      </p>
    </div>
  );
};

// Memory Match Game
const MemoryGame: React.FC<{ onWin: (reward: number) => void; onLose: () => void }> = ({ onWin, onLose }) => {
  const emojis = ['🐕', '🐈', '🐰', '🐹', '🦴', '🐟'];
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }));
    setCards(shuffled);
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      setMoves((currentMoves) => currentMoves + 1);

      if (cards[first].emoji === cards[second].emoji) {
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === first || card.id === second ? { ...card, matched: true } : card
          )
        );
        setMatches((currentMatches) => currentMatches + 1);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === first || card.id === second ? { ...card, flipped: false } : card
            )
          );
          setFlippedCards([]);
        }, 800);
      }
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (matches === 6) {
      setGameComplete(true);
      const reward = moves <= 10 ? 30 : moves <= 15 ? 20 : 10;
      onWin(reward);
    }
  }, [matches, moves, onWin]);

  const handleCardClick = (index: number) => {
    if (
      flippedCards.length === 2 ||
      cards[index].flipped ||
      cards[index].matched ||
      gameComplete
    )
      return;

    setCards((prevCards) =>
      prevCards.map((card, cardIndex) => (cardIndex === index ? { ...card, flipped: true } : card))
    );
    setFlippedCards((prevFlipped) => [...prevFlipped, index]);
  };

  return (
    <div className="space-y-5">
      {/* Game stats */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-xl">
          <span className="text-sm text-muted-foreground">Moves:</span>
          <span className="font-mono font-semibold text-foreground">{moves}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-xl">
          <span className="text-sm text-muted-foreground">Matches:</span>
          <span className="font-mono font-semibold text-secondary">{matches}/6</span>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            className={cn(
              "h-18 rounded-xl transition-all duration-300 text-2xl flex items-center justify-center border-2",
              "transform hover:scale-105",
              card.flipped || card.matched
                ? "bg-primary/15 border-primary shadow-md"
                : "bg-accent/40 border-border/50 hover:border-primary/50 hover:bg-accent/60"
            )}
            disabled={card.matched}
          >
            <span className={cn(
              "transition-all duration-300",
              card.flipped || card.matched ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )}>
              {card.emoji}
            </span>
            {!card.flipped && !card.matched && (
              <span className="text-muted-foreground/50 text-xl">?</span>
            )}
          </button>
        ))}
      </div>

      {/* Win message */}
      {gameComplete && (
        <div className="text-center p-5 bg-secondary/15 rounded-2xl border border-secondary/30 animate-fade-in-up">
          <div className="text-4xl mb-2 animate-wiggle">🎉</div>
          <p className="text-xl font-serif font-bold text-secondary">You Won!</p>
          <p className="text-sm text-muted-foreground">
            Completed in {moves} moves
          </p>
        </div>
      )}

      {/* Instructions */}
      <p className="text-sm text-muted-foreground text-center bg-accent/30 p-3 rounded-xl">
        Match all pairs! <span className="font-semibold text-foreground">Fewer moves = better reward</span>
      </p>
    </div>
  );
};

const MiniGames: React.FC<MiniGamesProps> = ({ onClose }) => {
  const { addMoney, updateStats } = useGame();
  const [selectedGame, setSelectedGame] = useState<MiniGameType>(null);
  const [gameResult, setGameResult] = useState<{ won: boolean; reward: number } | null>(null);

  const handleWin = (reward: number) => {
    addMoney(reward, 'Mini-game reward');
    updateStats({ happiness: 10 });
    setGameResult({ won: true, reward });
  };

  const handleLose = () => {
    setGameResult({ won: false, reward: 0 });
  };

  const resetGame = () => {
    setSelectedGame(null);
    setGameResult(null);
  };

  return (
    <Card className="h-full bg-card/80 border-2 border-border/50 shadow-lg rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Gamepad2 className="w-5 h-5 text-primary" />
          </div>
          <span className="font-serif">Mini Games</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Play games to earn money for your pet!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedGame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Catch Game Card */}
            <button
              onClick={() => setSelectedGame('catch')}
              className={cn(
                "p-6 rounded-2xl border-2 border-dashed border-border/50",
                "bg-gradient-to-br from-card to-primary/5",
                "hover:border-primary/50 hover:shadow-lg",
                "transition-all duration-300 text-center group card-hover"
              )}
            >
              <div className="p-4 bg-primary/10 rounded-2xl inline-flex mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-foreground mb-2">Catch the Treat</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Click treats as fast as you can!
              </p>
              <div className="flex items-center justify-center gap-2 text-secondary">
                <Coins className="w-4 h-4" />
                <span className="font-semibold">Earn up to $40</span>
              </div>
            </button>

            {/* Memory Game Card */}
            <button
              onClick={() => setSelectedGame('memory')}
              className={cn(
                "p-6 rounded-2xl border-2 border-dashed border-border/50",
                "bg-gradient-to-br from-card to-secondary/5",
                "hover:border-secondary/50 hover:shadow-lg",
                "transition-all duration-300 text-center group card-hover"
              )}
            >
              <div className="p-4 bg-secondary/10 rounded-2xl inline-flex mb-4 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-foreground mb-2">Memory Match</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Match all the pairs!
              </p>
              <div className="flex items-center justify-center gap-2 text-secondary">
                <Coins className="w-4 h-4" />
                <span className="font-semibold">Earn up to $30</span>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Game header */}
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-semibold text-lg flex items-center gap-2">
                {selectedGame === 'catch' ? (
                  <>
                    <Target className="w-5 h-5 text-primary" />
                    <span>Catch the Treat</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 text-secondary" />
                    <span>Memory Match</span>
                  </>
                )}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={resetGame}
                className="rounded-xl border-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Button>
            </div>

            {gameResult ? (
              <div className="text-center py-10 animate-fade-in-up">
                <div className={cn(
                  "text-7xl mb-5",
                  gameResult.won ? "animate-wiggle" : ""
                )}>
                  {gameResult.won ? '🎉' : '😔'}
                </div>
                <p className="text-3xl font-serif font-bold text-foreground mb-3">
                  {gameResult.won ? `You earned $${gameResult.reward}!` : 'Better luck next time!'}
                </p>
                {gameResult.won && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/15 rounded-full text-secondary mb-6">
                    <Trophy className="w-5 h-5" />
                    <span className="font-semibold">Reward added to balance</span>
                  </div>
                )}
                <div>
                  <Button onClick={resetGame} className="rounded-xl px-8">
                    Play Again
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {selectedGame === 'catch' && <CatchGame onWin={handleWin} onLose={handleLose} />}
                {selectedGame === 'memory' && <MemoryGame onWin={handleWin} onLose={handleLose} />}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MiniGames;
