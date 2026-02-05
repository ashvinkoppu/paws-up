import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Target, Coins } from 'lucide-react';

interface CatchGameProps {
  onWin: (reward: number) => void;
  onLose: () => void;
  petSpecies: string;
  highScore: number;
  onNewHighScore: (score: number) => void;
}

const CatchGame: React.FC<CatchGameProps> = ({ onWin, onLose, petSpecies, highScore, onNewHighScore }) => {
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

  const handleAreaClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!gameActive) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setPetPosition({ x, y });
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 300);

    // Check collision
    const distance = Math.sqrt(Math.pow(x - targetPosition.x, 2) + Math.pow(y - targetPosition.y, 2));

    if (distance < 12) {
      setScore((previous) => previous + 1);

      const boneValue = BONES[currentBoneIndex].value;
      setTotalEarned((previous) => previous + boneValue);

      // Add feedback
      const feedbackId = Date.now();
      setActiveFeedback(previous => [...previous, { id: feedbackId, x: targetPosition.x, y: targetPosition.y, text: `CAUGHT!`, subtext: `$${boneValue} earned` }]);

      // Remove feedback after animation
      setTimeout(() => {
        setActiveFeedback(previous => previous.filter(feedback => feedback.id !== feedbackId));
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

export default CatchGame;
