import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

interface QuizGameProps {
  onWin: (reward: number) => void;
  onLose: () => void;
  highScore: number;
  onNewHighScore: (score: number) => void;
}

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

const QuizGame: React.FC<QuizGameProps> = ({ onWin, onLose, highScore, onNewHighScore }) => {
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

export default QuizGame;
