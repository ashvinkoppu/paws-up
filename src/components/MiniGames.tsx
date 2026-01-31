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
const CatchGame: React.FC<{ 
  onWin: (reward: number) => void; 
  onLose: () => void; 
  petSpecies: string; 
  highScore: number;
  onNewHighScore: (score: number) => void;
}> = ({ onWin, onLose, petSpecies, highScore, onNewHighScore }) => {
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [petPosition, setPetPosition] = useState({ x: 50, y: 80 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);
  const [isJumping, setIsJumping] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<{ id: number; x: number; y: number; text: string; subtext: string }[]>([]);
  const [currentBoneIndex, setCurrentBoneIndex] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);

  const BONES = [
    { emoji: '🦴', label: 'Bone', value: 2 },
    { emoji: '🍖', label: 'Meat Bone', value: 3 },
    { emoji: '🥩', label: 'Steak Bone', value: 4 },
    { emoji: '🦷', label: 'Rare Bone', value: 6 },
    { emoji: '💎', label: 'Diamond Bone', value: 8 },
  ];

  const getPetEmoji = (species: string) => {
    switch (species) {
      case 'dog': return '🐕';
      case 'cat': return '🐈';
      case 'rabbit': return '🐇';
      case 'hamster': return '🐹';
      default: return '🐾';
    }
  };

  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          setGameActive(false);
          clearInterval(timer);
          return 0;
        }
        return time - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive]);

  // Handle game end when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !gameActive) {
      if (score >= 5) {
        onWin(totalEarned);
        if (score > highScore) {
          onNewHighScore(score);
        }
      } else {
        onLose();
      }
    }
  }, [timeLeft, gameActive, score, totalEarned, highScore, onWin, onLose, onNewHighScore]);

  const moveTarget = useCallback(() => {
    setTargetPosition({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
    });
    setCurrentBoneIndex(Math.floor(Math.random() * BONES.length));
  }, []);

  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameActive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPetPosition({ x, y });
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 300);

    // Check collision
    const distance = Math.sqrt(Math.pow(x - targetPosition.x, 2) + Math.pow(y - targetPosition.y, 2));
    
    if (distance < 12) {
      setScore((prevScore) => prevScore + 1);

      const boneValue = BONES[currentBoneIndex].value;
      setTotalEarned((previous) => previous + boneValue);

      // Add feedback
      const feedbackId = Date.now();
      setActiveFeedback(prev => [...prev, { id: feedbackId, x: targetPosition.x, y: targetPosition.y, text: `CAUGHT!`, subtext: `$${boneValue} earned` }]);

      // Remove feedback after animation
      setTimeout(() => {
        setActiveFeedback(prev => prev.filter(f => f.id !== feedbackId));
      }, 1200);

      // Delay move to allow "catch" visual, then spawn new bone
      setTimeout(moveTarget, 200);
    }
  };

  return (
    <div className="space-y-5">
      {/* Game stats */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-xl">
          <Target className="w-4 h-4 text-secondary" />
          <div className="flex flex-col items-start leading-none">
            <div>
              <span className="font-mono font-semibold text-foreground">{score}</span>
              <span className="text-sm text-muted-foreground ml-1">caught</span>
            </div>
            <span className="text-xs text-muted-foreground">Best: {highScore}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/10 rounded-xl">
          <Coins className="w-4 h-4 text-secondary" />
          <span className="font-mono font-semibold text-secondary">${totalEarned}</span>
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
      
      {/* (Game Area) */}
      <div
        onClick={handleAreaClick}
        className={cn(
          "relative h-72 rounded-2xl border-2 border-dashed overflow-hidden cursor-crosshair",
          "bg-gradient-to-br from-accent/30 via-card to-secondary/10",
          "transition-all duration-300"
        )}
      >
        {/* Decorative elements */}
        {/* ... */}

        {gameActive && (
          <>
            {/* The Target (Treat) */}
            <div
              className={cn(
                "absolute w-12 h-12 flex items-center justify-center text-3xl pointer-events-none",
                "transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
              )}
              style={{ left: `${targetPosition.x}%`, top: `${targetPosition.y}%` }}
            >
              {BONES[currentBoneIndex].emoji}
            </div>

            {/* Feedback Popups */}
            {activeFeedback.map(feedback => (
              <div
                key={feedback.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 whitespace-nowrap animate-fade-in-up text-center"
                style={{ left: `${feedback.x}%`, top: `${feedback.y - 12}%` }}
              >
                <div className="font-bold text-lg text-foreground">{feedback.text}</div>
                <div className="font-semibold text-sm text-secondary">{feedback.subtext}</div>
              </div>
            ))}

            {/* The Pet */}
            <div
              className={cn(
                "absolute w-16 h-16 flex items-center justify-center text-5xl pointer-events-none",
                "transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out",
                isJumping && "scale-125 mb-2"
              )}
              style={{ left: `${petPosition.x}%`, top: `${petPosition.y}%` }}
            >
              {getPetEmoji(petSpecies)}
            </div>
          </>
        )}

        {!gameActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/90 backdrop-blur-sm z-10 pointer-events-auto">
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
        Click to catch the bones! Each bone is worth different amounts. Catch <span className="font-semibold text-foreground">5+</span> to win.
      </p>
    </div>
  );
};

// Memory Match Game
const MemoryGame: React.FC<{ 
  onWin: (reward: number) => void; 
  onLose: () => void;
  highScore: number;
  onNewHighScore: (score: number) => void;
}> = ({ onWin, onLose, highScore, onNewHighScore }) => {
  const emojis = ['🐕', '🐈', '🐰', '🐹', '🦴', '🐟'];
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);

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

        // Show match found message briefly
        const currentMoveCount = moves + 1;
        const perMatchReward = currentMoveCount <= 10 ? 2 : currentMoveCount <= 15 ? 1 : 1;
        setMatchMessage(`MATCH FOUND!  +$${perMatchReward}`);
        setTimeout(() => setMatchMessage(null), 1200);
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
      const reward = moves <= 10 ? 12 : moves <= 15 ? 8 : 5;
      onWin(reward);
      
      // For memory game, lower moves is better. We store as negative for the "higher is better" reducer logic.
      // -8 (8 moves) > -12 (12 moves)
      const currentBest = highScore === 0 ? -999 : highScore; 
      
      const newScore = -moves;
      if (highScore === 0 || newScore > highScore) { 
         onNewHighScore(newScore);
      }
    }
  }, [matches, moves, onWin, highScore, onNewHighScore]);

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
          <div className="flex flex-col items-start leading-none">
            <div>
              <span className="text-sm text-muted-foreground mr-1">Moves:</span>
              <span className="font-mono font-semibold text-foreground">{moves}</span>
            </div>
            {highScore !== 0 && (
              <span className="text-xs text-muted-foreground">Best: {Math.abs(highScore)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-xl">
          <span className="text-sm text-muted-foreground">Matches:</span>
          <span className="font-mono font-semibold text-secondary">{matches}/6</span>
        </div>
      </div>

      {/* Cards grid with overlay for match message */}
      <div className="relative">
        {/* Match found message - overlay on top */}
        {matchMessage && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
            <div className="flex items-center justify-center gap-3 px-5 py-3 bg-secondary/95 rounded-xl border border-secondary/30 shadow-lg animate-fade-in-up">
              <span className="text-lg font-serif font-bold text-secondary-foreground">MATCH FOUND!</span>
              <span className="font-mono font-bold text-white/90">{matchMessage.split('  ')[1]}</span>
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
  const { state, addMoney, updateStats, updateHighScore, setIsPlayingMiniGame, trackGamePlayed } = useGame();
  const [selectedGame, setSelectedGame] = useState<MiniGameType>(null);
  const [gameResult, setGameResult] = useState<{ won: boolean; reward: number } | null>(null);

  // Track when we're in an active game (selected game but no result yet)
  useEffect(() => {
    const isActive = selectedGame !== null && gameResult === null;
    setIsPlayingMiniGame(isActive);
    
    // Cleanup on unmount
    return () => setIsPlayingMiniGame(false);
  }, [selectedGame, gameResult, setIsPlayingMiniGame]);

  const handleWin = (reward: number) => {
    addMoney(reward, 'Mini-game reward');
    updateStats({ happiness: 5 });
    trackGamePlayed();
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
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-secondary">
                  <Coins className="w-4 h-4" />
                  <span className="font-semibold text-sm">$2–$8 per catch</span>
                </div>
                {state.highScores?.['catch'] !== undefined && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-accent/50 rounded-lg text-xs font-medium text-muted-foreground">
                    <Trophy className="w-3 h-3 text-primary" />
                    <span>Best: {state.highScores['catch']}</span>
                  </div>
                )}
              </div>
            </button>

            {/* Memory Game Card */}
            <button
              onClick={() => setSelectedGame('memory')}
              className={cn(
                "p-6 rounded-2xl border-2 border-dashed border-border/50",
                "bg-gradient-to-br from-card to-secondary/5",
                "hover:border-secondary/50 hover:shadow-lg",
                "transition-all duration-300 text-center group card-hover flex flex-col items-center"
              )}
            >
              <div className="p-4 bg-secondary/10 rounded-2xl inline-flex mb-4 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-foreground mb-2">Memory Match</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Match all the pairs!
              </p>
              <div className="flex items-center justify-between w-full mt-auto">
                 <div className="flex items-center gap-2 text-secondary justify-center w-full relative">
                   {/* Centered earnings, absolute positioned high score? Or just flex row */}
                 </div>
              </div>
               <div className="flex items-center justify-between w-full mt-2">
                <div className="flex items-center gap-2 text-secondary">
                  <Coins className="w-4 h-4" />
                  <span className="font-semibold text-sm">$5–$12 per game</span>
                </div>
                {state.highScores?.['memory'] !== undefined && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-accent/50 rounded-lg text-xs font-medium text-muted-foreground">
                    <Trophy className="w-3 h-3 text-secondary" />
                    <span>Best: {Math.abs(state.highScores['memory'])} moves</span>
                  </div>
                )}
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
                {selectedGame === 'catch' && (
                  <CatchGame 
                    onWin={handleWin} 
                    onLose={handleLose} 
                    petSpecies={state.pet?.species || 'dog'} 
                    highScore={state.highScores?.['catch'] || 0}
                    onNewHighScore={(score) => updateHighScore('catch', score)}
                  />
                )}
                {selectedGame === 'memory' && (
                  <MemoryGame 
                    onWin={handleWin} 
                    onLose={handleLose}
                    highScore={state.highScores?.['memory'] || 0}
                    onNewHighScore={(score) => updateHighScore('memory', score)}
                  />
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MiniGames;
