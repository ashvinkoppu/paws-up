/**
 * MiniGames - Hub component for the four in-game mini-games:
 * Catch the Treat, Memory Match, Pet Trivia, and Whack-a-Critter.
 *
 * Displays a selection grid when no game is active. Each game card shows its
 * reward range, current high score, and whether the daily play limit has been
 * reached (1 play per game per day). Selecting a game renders the corresponding
 * child component; on completion, a result screen shows earnings before returning
 * to the selection grid.
 *
 * Sets `isPlayingMiniGame` in game context while a game is active so that
 * other overlays (e.g., EventModal) are suppressed during gameplay.
 */
import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Gamepad2,
  Target,
  Brain,
  ArrowLeft,
  Trophy,
  Coins,
  HelpCircle,
  Zap,
} from "lucide-react";
import CatchGame from "./CatchGame";
import MemoryGame from "./MemoryGame";
import QuizGame from "./QuizGame";
import WhackGame from "./WhackGame";

type MiniGameType = "catch" | "memory" | "quiz" | "whack" | null;

interface MiniGamesProps {
  onClose?: () => void;
}

const MiniGames: React.FC<MiniGamesProps> = ({ onClose }) => {
  const {
    state,
    updateStats,
    updateHighScore,
    setIsPlayingMiniGame,
    trackGamePlayed,
    addMoney,
  } = useGame();
  const [selectedGame, setSelectedGame] = useState<MiniGameType>(null);
  const [gameResult, setGameResult] = useState<{
    won: boolean;
    reward: number;
    rewardClaimed: boolean;
  } | null>(null);

  // Track when we're in an active game (selected game but no result yet)
  useEffect(() => {
    const isActive = selectedGame !== null && gameResult === null;
    setIsPlayingMiniGame(isActive);

    // Cleanup on unmount
    return () => setIsPlayingMiniGame(false);
  }, [selectedGame, gameResult, setIsPlayingMiniGame]);

  // On win: credit money, boost happiness, record the play, and show result screen
  const handleWin = (reward: number) => {
    addMoney(reward, "Mini-game reward");
    updateStats({ happiness: 5 });
    trackGamePlayed(selectedGame || undefined);
    setGameResult({ won: true, reward, rewardClaimed: true });
  };

  const handleLose = () => {
    setGameResult({ won: false, reward: 0, rewardClaimed: false });
  };

  const resetGame = () => {
    setSelectedGame(null);
    setGameResult(null);
  };

  // Check if the daily reward for a specific game has already been claimed today
  const isRewardAvailable = (gameId: string) => {
    const today = new Date().toDateString();
    return state.dailyGameRewards?.[gameId] !== today;
  };

  return (
    <Card className="h-full bg-card border border-border rounded-xl shadow-sm">
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
              onClick={() => setSelectedGame("catch")}
              disabled={
                !!(
                  state.dailyTracking?.catchGamePlayed &&
                  state.dailyTracking.catchGamePlayed >= 1
                )
              }
              className={cn(
                "p-6 rounded-2xl border-2 border-dashed border-border/50",
                "bg-gradient-to-br from-card to-primary/5",
                "hover:border-primary/50 hover:shadow-lg",
                "transition-all duration-300 text-center group card-hover relative active:scale-95",
                state.dailyTracking?.catchGamePlayed &&
                  state.dailyTracking.catchGamePlayed >= 1 &&
                  "opacity-60 cursor-not-allowed hover:border-border/50 hover:shadow-none",
              )}
            >
              {state.dailyTracking?.catchGamePlayed >= 1 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-2xl z-10">
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                    Daily Limit Reached
                  </span>
                </div>
              )}
              <div className="p-4 bg-primary/10 rounded-2xl inline-flex mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-foreground mb-2">
                Catch the Treat
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Click treats as fast as you can!
              </p>
              <div className="flex items-center justify-between mt-2">
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isRewardAvailable("catch")
                      ? "text-secondary"
                      : "text-muted-foreground",
                  )}
                >
                  <Coins className="w-4 h-4" />
                  <span className="font-semibold text-sm">
                    {isRewardAvailable("catch")
                      ? "$2-$8 per catch"
                      : "Daily Limit Reached"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  High Score: {state.highScores?.["catch"] ?? 0}
                </span>
              </div>
            </button>

            {/* Memory Game Card */}
            <button
              onClick={() => setSelectedGame("memory")}
              disabled={
                !!(
                  state.dailyTracking?.memoryGamePlayed &&
                  state.dailyTracking.memoryGamePlayed >= 1
                )
              }
              className={cn(
                "p-6 rounded-2xl border-2 border-dashed border-border/50",
                "bg-gradient-to-br from-card to-secondary/5",
                "hover:border-secondary/50 hover:shadow-lg",
                "transition-all duration-300 text-center group card-hover flex flex-col items-center relative active:scale-95",
                state.dailyTracking?.memoryGamePlayed &&
                  state.dailyTracking.memoryGamePlayed >= 1 &&
                  "opacity-60 cursor-not-allowed hover:border-border/50 hover:shadow-none",
              )}
            >
              {state.dailyTracking?.memoryGamePlayed >= 1 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-2xl z-10">
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                    Daily Limit Reached
                  </span>
                </div>
              )}
              <div className="p-4 bg-secondary/10 rounded-2xl inline-flex mb-4 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-foreground mb-2">
                Memory Match
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Match all the pairs!
              </p>
              <div className="flex items-center justify-between w-full mt-2">
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isRewardAvailable("memory")
                      ? "text-secondary"
                      : "text-muted-foreground",
                  )}
                >
                  <Coins className="w-4 h-4" />
                  <span className="font-semibold text-sm">
                    {isRewardAvailable("memory")
                      ? "$5-$12 per game"
                      : "Daily Limit Reached"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  High Score:{" "}
                  {state.highScores?.["memory"]
                    ? `${state.highScores["memory"]} moves`
                    : "0"}
                </span>
              </div>
            </button>

            {/* Quiz Game Card */}
            <button
              onClick={() => setSelectedGame("quiz")}
              disabled={
                !!(
                  state.dailyTracking?.quizGamePlayed &&
                  state.dailyTracking.quizGamePlayed >= 1
                )
              }
              className={cn(
                "p-6 rounded-2xl border-2 border-dashed border-border/50",
                "bg-gradient-to-br from-card to-[#8B5E3C]/5",
                "hover:border-[#8B5E3C]/50 hover:shadow-lg",
                "transition-all duration-300 text-center group card-hover relative active:scale-95",
                state.dailyTracking?.quizGamePlayed &&
                  state.dailyTracking.quizGamePlayed >= 1 &&
                  "opacity-60 cursor-not-allowed hover:border-border/50 hover:shadow-none",
              )}
            >
              {state.dailyTracking?.quizGamePlayed >= 1 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-2xl z-10">
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                    Daily Limit Reached
                  </span>
                </div>
              )}
              <div className="p-4 bg-[#8B5E3C]/10 rounded-2xl inline-flex mb-4 group-hover:scale-110 transition-transform duration-300">
                <HelpCircle className="w-10 h-10 text-[#8B5E3C]" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-foreground mb-2">
                Pet Trivia
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Test your pet knowledge!
              </p>
              <div className="flex items-center justify-between mt-2">
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isRewardAvailable("quiz")
                      ? "text-secondary"
                      : "text-muted-foreground",
                  )}
                >
                  <Coins className="w-4 h-4" />
                  <span className="font-semibold text-sm">
                    {isRewardAvailable("quiz")
                      ? "$6-$15 per game"
                      : "Daily Limit Reached"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  High Score: {state.highScores?.["quiz"] ?? 0}/5
                </span>
              </div>
            </button>

            {/* Whack Game Card */}
            <button
              onClick={() => setSelectedGame("whack")}
              disabled={
                !!(
                  state.dailyTracking?.whackGamePlayed &&
                  state.dailyTracking.whackGamePlayed >= 1
                )
              }
              className={cn(
                "p-6 rounded-2xl border-2 border-dashed border-border/50",
                "bg-gradient-to-br from-card to-primary/5",
                "hover:border-primary/50 hover:shadow-lg",
                "transition-all duration-300 text-center group card-hover relative active:scale-95",
                state.dailyTracking?.whackGamePlayed &&
                  state.dailyTracking.whackGamePlayed >= 1 &&
                  "opacity-60 cursor-not-allowed hover:border-border/50 hover:shadow-none",
              )}
            >
              {state.dailyTracking?.whackGamePlayed >= 1 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-2xl z-10">
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                    Daily Limit Reached
                  </span>
                </div>
              )}
              <div className="p-4 bg-primary/10 rounded-2xl inline-flex mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-foreground mb-2">
                Whack-a-Critter
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Tap critters before they hide!
              </p>
              <div className="flex items-center justify-between mt-2">
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isRewardAvailable("whack")
                      ? "text-secondary"
                      : "text-muted-foreground",
                  )}
                >
                  <Coins className="w-4 h-4" />
                  <span className="font-semibold text-sm">
                    {isRewardAvailable("whack")
                      ? "$2-$5 per whack"
                      : "Daily Limit Reached"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  High Score: {state.highScores?.["whack"] ?? 0}
                </span>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Game header */}
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-semibold text-lg flex items-center gap-2">
                {selectedGame === "catch" ? (
                  <>
                    <Target className="w-5 h-5 text-primary" />
                    <span>Catch the Treat</span>
                  </>
                ) : selectedGame === "memory" ? (
                  <>
                    <Brain className="w-5 h-5 text-secondary" />
                    <span>Memory Match</span>
                  </>
                ) : selectedGame === "quiz" ? (
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
                <div
                  className={cn(
                    "text-7xl mb-5",
                    gameResult.won ? "animate-wiggle" : "",
                  )}
                >
                  {gameResult.won ? "🎉" : "😔"}
                </div>
                <p className="text-3xl font-serif font-bold text-foreground mb-3">
                  {gameResult.won
                    ? gameResult.rewardClaimed
                      ? `You earned $${gameResult.reward}!`
                      : "You won!"
                    : "Better luck next time!"}
                </p>
                {gameResult.won && !gameResult.rewardClaimed && (
                  <p className="text-muted-foreground mb-2">
                    Daily limit reached for this game.
                  </p>
                )}
                {gameResult.won && gameResult.rewardClaimed && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/15 rounded-full text-secondary mb-6">
                    <Trophy className="w-5 h-5" />
                    <span className="font-semibold">
                      Reward added to balance
                    </span>
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
                {selectedGame === "catch" && (
                  <CatchGame
                    onWin={handleWin}
                    onLose={handleLose}
                    petSpecies={state.pet?.species || "dog"}
                    highScore={state.highScores?.["catch"] || 0}
                    onNewHighScore={(score) => updateHighScore("catch", score)}
                  />
                )}
                {selectedGame === "memory" && (
                  <MemoryGame
                    onWin={handleWin}
                    highScore={state.highScores?.["memory"] || 0}
                    onNewHighScore={(score) => updateHighScore("memory", score)}
                  />
                )}
                {selectedGame === "quiz" && (
                  <QuizGame
                    onWin={handleWin}
                    onLose={handleLose}
                    highScore={state.highScores?.["quiz"] || 0}
                    onNewHighScore={(score) => updateHighScore("quiz", score)}
                  />
                )}
                {selectedGame === "whack" && (
                  <WhackGame
                    onWin={handleWin}
                    onLose={handleLose}
                    highScore={state.highScores?.["whack"] || 0}
                    onNewHighScore={(score) => updateHighScore("whack", score)}
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
