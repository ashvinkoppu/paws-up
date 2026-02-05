import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Zap, Coins } from 'lucide-react';

interface WhackGameProps {
  onWin: (reward: number) => void;
  onLose: () => void;
  highScore: number;
  onNewHighScore: (score: number) => void;
}

const MOLE_EMOJIS = ['🐹', '🐭', '🐿️'];

const WhackGame: React.FC<WhackGameProps> = ({ onWin, onLose, highScore, onNewHighScore }) => {
  const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameActive, setGameActive] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);
  const [whackedCells, setWhackedCells] = useState<Set<number>>(new Set());
  const [goldenMole, setGoldenMole] = useState<number | null>(null);
  const [moleTypes, setMoleTypes] = useState<number[]>(Array(9).fill(0));

  // Timer
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

  // Mole spawning
  useEffect(() => {
    if (!gameActive) return;
    const spawnInterval = setInterval(() => {
      setMoles(previous => {
        const newMoles = [...previous];
        // Hide some existing moles
        newMoles.forEach((mole, index) => {
          if (mole && Math.random() < 0.4) newMoles[index] = false;
        });
        // Spawn 1-2 new moles
        const spawnCount = Math.random() < 0.3 ? 2 : 1;
        for (let iteration = 0; iteration < spawnCount; iteration++) {
          const emptySlots = newMoles.map((mole, index) => !mole ? index : -1).filter(index => index >= 0);
          if (emptySlots.length > 0) {
            const slot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
            newMoles[slot] = true;
            setMoleTypes(previous => {
              const updated = [...previous];
              updated[slot] = Math.floor(Math.random() * MOLE_EMOJIS.length);
              return updated;
            });
          }
        }
        return newMoles;
      });

      // Chance for golden mole
      if (Math.random() < 0.15) {
        const slot = Math.floor(Math.random() * 9);
        setGoldenMole(slot);
        setTimeout(() => setGoldenMole(null), 1500);
      }
    }, 800);
    return () => clearInterval(spawnInterval);
  }, [gameActive]);

  // Handle game end
  useEffect(() => {
    if (timeLeft === 0 && !gameActive) {
      if (score >= 8) {
        onWin(totalEarned);
        if (score > highScore) {
          onNewHighScore(score);
        }
      } else {
        onLose();
      }
    }
  }, [timeLeft, gameActive, score, totalEarned, highScore, onWin, onLose, onNewHighScore]);

  const handleWhack = (index: number) => {
    if (!gameActive || !moles[index]) return;

    const isGolden = goldenMole === index;
    const reward = isGolden ? 5 : 2;

    setScore(previous => previous + 1);
    setTotalEarned(previous => previous + reward);
    setMoles(previous => {
      const updated = [...previous];
      updated[index] = false;
      return updated;
    });

    if (isGolden) setGoldenMole(null);

    // Visual feedback
    setWhackedCells(previous => new Set(previous).add(index));
    setTimeout(() => {
      setWhackedCells(previous => {
        const updated = new Set(previous);
        updated.delete(index);
        return updated;
      });
    }, 300);
  };

  return (
    <div className="space-y-5">
      {/* Game stats */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-xl">
          <Zap className="w-4 h-4 text-secondary" />
          <div className="flex flex-col items-start leading-none">
            <div>
              <span className="font-mono font-semibold text-foreground">{score}</span>
              <span className="text-sm text-muted-foreground ml-1">whacked</span>
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
          style={{ width: `${(timeLeft / 20) * 100}%` }}
        />
      </div>

      {/* Game grid */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-3">
          {moles.map((hasMole, index) => (
            <button
              key={index}
              onClick={() => handleWhack(index)}
              className={cn(
                "h-20 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center text-3xl",
                "bg-gradient-to-br from-accent/40 to-accent/20",
                hasMole ? "border-primary/50 cursor-pointer hover:scale-105 active:scale-95" : "border-border/30 cursor-default",
                whackedCells.has(index) && "bg-secondary/20 border-secondary scale-95",
                goldenMole === index && hasMole && "border-yellow-400 bg-yellow-50/30 shadow-lg shadow-yellow-200/30"
              )}
              disabled={!gameActive || !hasMole}
            >
              {hasMole && (
                <span className={cn(
                  "transition-all duration-200",
                  "animate-bounce",
                  goldenMole === index && "drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]"
                )}>
                  {goldenMole === index ? '⭐' : MOLE_EMOJIS[moleTypes[index]]}
                </span>
              )}
              {!hasMole && whackedCells.has(index) && (
                <span className="text-sm font-bold text-secondary animate-fade-in-up">+$2</span>
              )}
              {!hasMole && !whackedCells.has(index) && (
                <div className="w-8 h-2 bg-accent/40 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {!gameActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/90 backdrop-blur-sm z-10 rounded-2xl">
            <div className="text-center p-6 animate-fade-in-up">
              <div className={cn("text-6xl mb-4", score >= 8 ? "animate-wiggle" : "")}>
                {score >= 8 ? '🎉' : '😔'}
              </div>
              <p className="text-2xl font-serif font-bold text-foreground mb-2">
                {score >= 8 ? 'Great Reflexes!' : 'Too Slow!'}
              </p>
              <p className="text-muted-foreground">
                You whacked {score} critters
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-sm text-muted-foreground text-center bg-accent/30 p-3 rounded-xl">
        Tap critters as they pop up! ⭐ Golden ones are worth more. Whack <span className="font-semibold text-foreground">8+</span> to win.
      </p>
    </div>
  );
};

export default WhackGame;
