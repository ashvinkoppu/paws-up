import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Utensils, Gamepad2, Moon, Sparkles, Stethoscope, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTIONS = [
  {
    id: 'feed',
    label: 'Feed',
    icon: Utensils,
    description: 'Uses food',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    hoverColor: 'hover:bg-chart-1/20 hover:border-chart-1/50',
    activeColor: 'active:bg-chart-1/30',
  },
  {
    id: 'play',
    label: 'Play',
    icon: Gamepad2,
    description: 'Uses toy',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    hoverColor: 'hover:bg-chart-2/20 hover:border-chart-2/50',
    activeColor: 'active:bg-chart-2/30',
  },
  {
    id: 'rest',
    label: 'Rest',
    icon: Moon,
    description: '+20 Energy',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    hoverColor: 'hover:bg-chart-3/20 hover:border-chart-3/50',
    activeColor: 'active:bg-chart-3/30',
  },
  {
    id: 'clean',
    label: 'Clean',
    icon: Sparkles,
    description: '+15 Clean',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    hoverColor: 'hover:bg-chart-4/20 hover:border-chart-4/50',
    activeColor: 'active:bg-chart-4/30',
  },
  {
    id: 'vet',
    label: 'Vet',
    icon: Stethoscope,
    description: '+15 Health',
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    hoverColor: 'hover:bg-chart-5/20 hover:border-chart-5/50',
    activeColor: 'active:bg-chart-5/30',
  },
];

const ACTION_FEEDBACK: Record<string, { emoji: string; verb: string }> = {
  feed: { emoji: '🍖', verb: 'Fed' },
  play: { emoji: '🎾', verb: 'Played with' },
  rest: { emoji: '💤', verb: 'Rested' },
  clean: { emoji: '🛁', verb: 'Cleaned' },
  vet: { emoji: '💊', verb: 'Healed' },
};

interface ActionFeedback {
  actionId: string;
  key: number;
}

const ActionButtons: React.FC = () => {
  const { state, performAction } = useGame();
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 2200);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleAction = useCallback((actionId: 'feed' | 'play' | 'rest' | 'clean' | 'vet') => {
    performAction(actionId);
    setFeedback({ actionId, key: Date.now() });
  }, [performAction]);

  if (!state.pet) return null;

  const activeFeedback = feedback ? ACTIONS.find(action => action.id === feedback.actionId) : null;
  const activeFeedbackMeta = feedback ? ACTION_FEEDBACK[feedback.actionId] : null;

  return (
    <div className="glass-card rounded-2xl shadow-md p-5 relative">
      {/* Prominent action feedback overlay */}
      {feedback && activeFeedback && activeFeedbackMeta && (
        <div
          key={feedback.key}
          className="fixed top-6 left-1/2 z-[100] pointer-events-none"
          style={{
            transform: 'translateX(-50%)',
            animation: 'actionFeedbackIn 0.4s ease-out, actionFeedbackOut 0.4s ease-in 1.8s forwards',
          }}
        >
          <div
            className={cn(
              "flex items-center gap-4 px-8 py-5 rounded-2xl shadow-2xl glass-card",
            )}
            style={{
              minWidth: '320px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.1) inset',
            }}
          >
            <div className={cn(
              "text-4xl",
            )}
              style={{ animation: 'actionEmojiPop 0.5s ease-out' }}
            >
              {activeFeedbackMeta.emoji}
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-foreground">
                {activeFeedbackMeta.verb} {state.pet?.name}!
              </span>
              <span className={cn("text-sm font-semibold", activeFeedback.color)}>
                {activeFeedback.description}
              </span>
            </div>
            <div
              className={cn("text-3xl font-bold ml-2", activeFeedback.color)}
              style={{ animation: 'actionStatBounce 0.6s ease-out' }}
            >
              +
            </div>
          </div>
        </div>
      )}

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
                "border border-border/40 rounded-xl",
                "transition-all duration-200 transform btn-press",
                "hover:scale-105 hover:-translate-y-1 hover:shadow-md",
                action.bgColor,
                action.hoverColor,
                action.activeColor,
                "animate-fade-in-up opacity-0"
              )}
              style={{
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'forwards'
              }}
              onClick={() => handleAction(action.id as 'feed' | 'play' | 'rest' | 'clean' | 'vet')}
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
