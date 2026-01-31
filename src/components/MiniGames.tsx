import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Gamepad2, Target, Brain, ArrowLeft, Trophy, Coins, HelpCircle, Zap } from 'lucide-react';

type MiniGameType = 'catch' | 'memory' | 'quiz' | 'whack' | null;

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

// Pet Quiz Game
const QuizGame: React.FC<{
  onWin: (reward: number) => void;
  onLose: () => void;
  highScore: number;
  onNewHighScore: (score: number) => void;
}> = ({ onWin, onLose, highScore, onNewHighScore }) => {
  const QUESTIONS = [
    { question: "How many hours a day do cats sleep on average?", options: ["8 hours", "12-16 hours", "20 hours", "6 hours"], correct: 1 },
    { question: "What is a group of kittens called?", options: ["A pack", "A kindle", "A flock", "A herd"], correct: 1 },
    { question: "Which dog breed is the smallest?", options: ["Pomeranian", "Yorkie", "Chihuahua", "Dachshund"], correct: 2 },
    { question: "How many teeth does an adult dog have?", options: ["28", "32", "42", "36"], correct: 2 },
    { question: "What is a rabbit's favorite time of day?", options: ["Noon", "Midnight", "Dawn & dusk", "Afternoon"], correct: 2 },
    { question: "Which animal can rotate its ears 180°?", options: ["Dog", "Cat", "Hamster", "Rabbit"], correct: 3 },
    { question: "How fast can a hamster run?", options: ["2 mph", "5 mph", "8 mph", "12 mph"], correct: 2 },
    { question: "What is a baby rabbit called?", options: ["Pup", "Kit", "Cub", "Joey"], correct: 1 },
    { question: "How many whiskers does a cat typically have?", options: ["12", "24", "36", "48"], correct: 1 },
    { question: "Which pet can be trained to use a litter box?", options: ["Only cats", "Cats & rabbits", "Only dogs", "All pets"], correct: 1 },
  ];

  const [shuffledQuestions] = useState(() =>
    [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5)
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [streak, setStreak] = useState(0);

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === shuffledQuestions[currentQuestion].correct;
    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    const newStreak = isCorrect ? streak + 1 : 0;

    if (isCorrect) {
      setCorrectCount(newCorrectCount);
      setStreak(newStreak);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestion + 1 >= shuffledQuestions.length) {
        setGameComplete(true);
        if (newCorrectCount >= 3) {
          const reward = newCorrectCount === 5 ? 15 : newCorrectCount === 4 ? 10 : 6;
          onWin(reward);
          if (newCorrectCount > highScore) {
            onNewHighScore(newCorrectCount);
          }
        } else {
          onLose();
        }
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 1200);
  };

  const question = shuffledQuestions[currentQuestion];

  return (
    <div className="space-y-5">
      {/* Game stats */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-xl">
          <span className="text-sm text-muted-foreground">Question:</span>
          <span className="font-mono font-semibold text-foreground">{currentQuestion + 1}/{shuffledQuestions.length}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-xl">
          <span className="text-sm text-muted-foreground">Score:</span>
          <span className="font-mono font-semibold text-secondary">{correctCount}</span>
        </div>
        {streak >= 2 && (
          <div className="flex items-center gap-1 px-3 py-2 bg-primary/15 rounded-xl animate-pulse">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-mono font-semibold text-primary text-sm">{streak}x</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-accent/30 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#8B5E3C] transition-all duration-500 ease-out"
          style={{ width: `${((currentQuestion + (showResult ? 1 : 0)) / shuffledQuestions.length) * 100}%` }}
        />
      </div>

      {!gameComplete && (
        <>
          {/* Question */}
          <div className="p-5 bg-accent/30 rounded-2xl border border-border/30">
            <p className="font-serif font-semibold text-lg text-foreground text-center">
              {question.question}
            </p>
          </div>

          {/* Answer options */}
          <div className="grid grid-cols-1 gap-2.5">
            {question.options.map((option, index) => {
              const isCorrect = index === question.correct;
              const isSelected = selectedAnswer === index;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all duration-300",
                    "hover:border-primary/50 hover:bg-primary/5",
                    selectedAnswer === null && "border-border/50 bg-card",
                    showResult && isCorrect && "border-secondary bg-secondary/15",
                    showResult && isSelected && !isCorrect && "border-destructive bg-destructive/10",
                    showResult && !isSelected && !isCorrect && "opacity-50"
                  )}
                >
                  <span className="font-medium">{option}</span>
                  {showResult && isCorrect && <span className="ml-2">✓</span>}
                  {showResult && isSelected && !isCorrect && <span className="ml-2">✗</span>}
                </button>
              );
            })}
          </div>
        </>
      )}

      {gameComplete && (
        <div className="text-center py-8 animate-fade-in-up">
          <div className={cn("text-6xl mb-4", correctCount >= 3 ? "animate-wiggle" : "")}>
            {correctCount >= 4 ? '🧠' : correctCount >= 3 ? '🎉' : '📚'}
          </div>
          <p className="text-2xl font-serif font-bold text-foreground mb-2">
            {correctCount >= 4 ? 'Pet Expert!' : correctCount >= 3 ? 'Well Done!' : 'Keep Learning!'}
          </p>
          <p className="text-muted-foreground">
            {correctCount}/{shuffledQuestions.length} correct answers
          </p>
        </div>
      )}

      {/* Instructions */}
      <p className="text-sm text-muted-foreground text-center bg-accent/30 p-3 rounded-xl">
        Answer pet trivia! Get <span className="font-semibold text-foreground">3+ correct</span> to earn rewards.
      </p>
    </div>
  );
};

// Whack-a-Mole Game
const WhackGame: React.FC<{
  onWin: (reward: number) => void;
  onLose: () => void;
  highScore: number;
  onNewHighScore: (score: number) => void;
}> = ({ onWin, onLose, highScore, onNewHighScore }) => {
  const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameActive, setGameActive] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);
  const [whackedCells, setWhackedCells] = useState<Set<number>>(new Set());
  const [goldenMole, setGoldenMole] = useState<number | null>(null);

  const MOLE_EMOJIS = ['🐹', '🐭', '🐿️'];
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
        for (let i = 0; i < spawnCount; i++) {
          const emptySlots = newMoles.map((m, idx) => !m ? idx : -1).filter(idx => idx >= 0);
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
    <Card className="h-full glass-card shadow-lg rounded-2xl">
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

            {/* Quiz Game Card */}
            <button
              onClick={() => setSelectedGame('quiz')}
              className={cn(
                "p-6 rounded-2xl border-2 border-dashed border-border/50",
                "bg-gradient-to-br from-card to-[#8B5E3C]/5",
                "hover:border-[#8B5E3C]/50 hover:shadow-lg",
                "transition-all duration-300 text-center group card-hover"
              )}
            >
              <div className="p-4 bg-[#8B5E3C]/10 rounded-2xl inline-flex mb-4 group-hover:scale-110 transition-transform duration-300">
                <HelpCircle className="w-10 h-10 text-[#8B5E3C]" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-foreground mb-2">Pet Trivia</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Test your pet knowledge!
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-secondary">
                  <Coins className="w-4 h-4" />
                  <span className="font-semibold text-sm">$6–$15 per game</span>
                </div>
                {state.highScores?.['quiz'] !== undefined && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-accent/50 rounded-lg text-xs font-medium text-muted-foreground">
                    <Trophy className="w-3 h-3 text-[#8B5E3C]" />
                    <span>Best: {state.highScores['quiz']}/5</span>
                  </div>
                )}
              </div>
            </button>

            {/* Whack Game Card */}
            <button
              onClick={() => setSelectedGame('whack')}
              className={cn(
                "p-6 rounded-2xl border-2 border-dashed border-border/50",
                "bg-gradient-to-br from-card to-primary/5",
                "hover:border-primary/50 hover:shadow-lg",
                "transition-all duration-300 text-center group card-hover"
              )}
            >
              <div className="p-4 bg-primary/10 rounded-2xl inline-flex mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-foreground mb-2">Whack-a-Critter</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Tap critters before they hide!
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-secondary">
                  <Coins className="w-4 h-4" />
                  <span className="font-semibold text-sm">$2–$5 per whack</span>
                </div>
                {state.highScores?.['whack'] !== undefined && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-accent/50 rounded-lg text-xs font-medium text-muted-foreground">
                    <Trophy className="w-3 h-3 text-primary" />
                    <span>Best: {state.highScores['whack']}</span>
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
                ) : selectedGame === 'memory' ? (
                  <>
                    <Brain className="w-5 h-5 text-secondary" />
                    <span>Memory Match</span>
                  </>
                ) : selectedGame === 'quiz' ? (
                  <>
                    <HelpCircle className="w-5 h-5 text-[#8B5E3C]" />
                    <span>Pet Trivia</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-primary" />
                    <span>Whack-a-Critter</span>
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
                {selectedGame === 'quiz' && (
                  <QuizGame
                    onWin={handleWin}
                    onLose={handleLose}
                    highScore={state.highScores?.['quiz'] || 0}
                    onNewHighScore={(score) => updateHighScore('quiz', score)}
                  />
                )}
                {selectedGame === 'whack' && (
                  <WhackGame
                    onWin={handleWin}
                    onLose={handleLose}
                    highScore={state.highScores?.['whack'] || 0}
                    onNewHighScore={(score) => updateHighScore('whack', score)}
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
