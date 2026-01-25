import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Utensils, Gamepad2, Moon, Sparkles, Stethoscope, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTIONS = [
  {
    id: 'feed',
    label: 'Feed',
    icon: Utensils,
    description: '+20 Hunger',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    hoverColor: 'hover:bg-chart-1/20 hover:border-chart-1/50',
    activeColor: 'active:bg-chart-1/30',
  },
  {
    id: 'play',
    label: 'Play',
    icon: Gamepad2,
    description: '+25 Happy',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    hoverColor: 'hover:bg-chart-2/20 hover:border-chart-2/50',
    activeColor: 'active:bg-chart-2/30',
  },
  {
    id: 'rest',
    label: 'Rest',
    icon: Moon,
    description: '+30 Energy',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    hoverColor: 'hover:bg-chart-3/20 hover:border-chart-3/50',
    activeColor: 'active:bg-chart-3/30',
  },
  {
    id: 'clean',
    label: 'Clean',
    icon: Sparkles,
    description: '+25 Clean',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    hoverColor: 'hover:bg-chart-4/20 hover:border-chart-4/50',
    activeColor: 'active:bg-chart-4/30',
  },
  {
    id: 'vet',
    label: 'Vet',
    icon: Stethoscope,
    description: '+20 Health',
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    hoverColor: 'hover:bg-chart-5/20 hover:border-chart-5/50',
    activeColor: 'active:bg-chart-5/30',
  },
];

const ActionButtons: React.FC = () => {
  const { state, performAction } = useGame();

  if (!state.pet) return null;

  return (
    <div className="bg-card rounded-2xl border-2 border-border/50 shadow-md p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-serif font-semibold text-lg text-foreground">Quick Actions</h3>
      </div>

      {/* Action buttons grid */}
      <div className="grid grid-cols-5 gap-2">
        {ACTIONS.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant="outline"
              className={cn(
                "flex flex-col items-center justify-center h-auto py-4 px-2",
                "border-2 border-border/50 rounded-xl",
                "transition-all duration-200 transform",
                "hover:scale-105 hover:-translate-y-1",
                action.bgColor,
                action.hoverColor,
                action.activeColor,
                "animate-fade-in-up opacity-0"
              )}
              style={{
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'forwards'
              }}
              onClick={() => performAction(action.id as 'feed' | 'play' | 'rest' | 'clean' | 'vet')}
            >
              <div className={cn(
                "p-2 rounded-xl mb-2 transition-colors duration-200",
                `${action.bgColor}`
              )}>
                <Icon className={cn("w-5 h-5", action.color)} />
              </div>
              <span className="font-semibold text-xs text-foreground">{action.label}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5 hidden md:block">
                {action.description}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Tip */}
      <div className="mt-4 pt-3 border-t border-border/30">
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
          <span className="text-primary">Tip:</span>
          <span>Shop items give bigger stat boosts</span>
        </p>
      </div>
    </div>
  );
};

export default ActionButtons;
