import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Trophy, Lock, Sparkles } from 'lucide-react';

const Achievements: React.FC = () => {
  const { state } = useGame();

  const unlockedCount = state.achievements.filter(achievement => achievement.unlocked).length;
  const totalCount = state.achievements.length;
  const progressPercent = (unlockedCount / totalCount) * 100;

  return (
    <Card className="h-full bg-card/80 border-2 border-border/50 shadow-lg rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif">Achievements</span>
          </span>
          <Badge className="bg-secondary/15 text-secondary border-secondary/30 font-mono">
            {unlockedCount}/{totalCount}
          </Badge>
        </CardTitle>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-mono font-semibold text-foreground">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2.5 bg-accent/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-500 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
          {state.achievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className={cn(
                "relative p-4 rounded-2xl border-2 text-center transition-all duration-300",
                "animate-fade-in-up opacity-0",
                achievement.unlocked
                  ? "bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/40 shadow-md"
                  : "bg-muted/20 border-dashed border-border/50"
              )}
              style={{
                animationDelay: `${index * 0.03}s`,
                animationFillMode: 'forwards'
              }}
            >
              {/* Lock overlay for locked achievements */}
              {!achievement.unlocked && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
                </div>
              )}

              {/* Achievement icon */}
              <div className={cn(
                "text-4xl mb-3 transition-all duration-300",
                !achievement.unlocked && "grayscale opacity-40"
              )}>
                {achievement.icon}
              </div>

              {/* Achievement name */}
              <h4 className={cn(
                "font-semibold text-sm mb-1",
                achievement.unlocked ? "text-foreground" : "text-muted-foreground"
              )}>
                {achievement.name}
              </h4>

              {/* Achievement description */}
              <p className="text-xs text-muted-foreground line-clamp-2">
                {achievement.description}
              </p>

              {/* Unlocked badge */}
              {achievement.unlocked && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary/15 rounded-full">
                  <Sparkles className="w-3 h-3 text-secondary" />
                  <span className="text-xs font-semibold text-secondary">Unlocked</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Encouragement message */}
        {unlockedCount < totalCount && (
          <div className="mt-5 pt-4 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{totalCount - unlockedCount}</span> more achievements to unlock!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Achievements;
