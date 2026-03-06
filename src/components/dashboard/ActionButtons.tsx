/**
 * @file ActionButtons.tsx
 *
 * A row of quick-action buttons for core pet interactions: Feed, Play, Rest,
 * Clean, and Vet. Each action dispatches performAction() which modifies pet
 * stats in the game reducer.
 *
 * When the pet is asleep (state.petAsleep), all buttons are disabled except
 * "Rest" which transforms into a "Wake Up" button that calls wakePetUp().
 *
 * Includes an animated feedback overlay (fixed-position toast) that appears
 * briefly after each action, showing the action emoji, verb, and pet name.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Utensils, Gamepad2, Moon, Sparkles, Stethoscope, Zap, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Static config for the five pet care actions. Each entry maps to a performAction() type. */
const ACTIONS = [
  {
    id: 'feed',
    label: 'Feed',
    icon: Utensils,
    description: 'Uses food',
    color: 'text-orange-700',
    bgColor: 'bg-gradient-to-br from-orange-400/25 to-amber-300/20',
    hoverColor: 'hover:from-orange-400/40 hover:to-amber-300/35 hover:border-orange-400/50 hover:shadow-orange-400/20 hover:shadow-lg',
    activeColor: 'active:from-orange-400/50 active:to-amber-300/45',
  },
  {
    id: 'play',
    label: 'Play',
    icon: Gamepad2,
    description: 'Uses toy',
    color: 'text-pink-700',
    bgColor: 'bg-gradient-to-br from-pink-400/25 to-rose-300/20',
    hoverColor: 'hover:from-pink-400/40 hover:to-rose-300/35 hover:border-pink-400/50 hover:shadow-pink-400/20 hover:shadow-lg',
    activeColor: 'active:from-pink-400/50 active:to-rose-300/45',
  },
  {
    id: 'rest',
    label: 'Rest',
    icon: Moon,
    description: '+20 Energy',
    color: 'text-yellow-700',
    bgColor: 'bg-gradient-to-br from-yellow-400/25 to-amber-200/20',
    hoverColor: 'hover:from-yellow-400/40 hover:to-amber-200/35 hover:border-yellow-400/50 hover:shadow-yellow-400/20 hover:shadow-lg',
    activeColor: 'active:from-yellow-400/50 active:to-amber-200/45',
  },
  {
    id: 'clean',
    label: 'Clean',
    icon: Sparkles,
    description: '+15 Clean',
    color: 'text-emerald-700',
    bgColor: 'bg-gradient-to-br from-emerald-400/25 to-teal-300/20',
    hoverColor: 'hover:from-emerald-400/40 hover:to-teal-300/35 hover:border-emerald-400/50 hover:shadow-emerald-400/20 hover:shadow-lg',
    activeColor: 'active:from-emerald-400/50 active:to-teal-300/45',
  },
  {
    id: 'vet',
    label: 'Vet',
    icon: Stethoscope,
    description: '+15 Health',
    color: 'text-red-700',
    bgColor: 'bg-gradient-to-br from-red-400/25 to-rose-300/20',
    hoverColor: 'hover:from-red-400/40 hover:to-rose-300/35 hover:border-red-400/50 hover:shadow-red-400/20 hover:shadow-lg',
    activeColor: 'active:from-red-400/50 active:to-rose-300/45',
  },
];

/** Emoji and past-tense verb shown in the feedback overlay after performing an action. */
const ACTION_FEEDBACK: Record<string, { emoji: string; verb: string }> = {
  feed: { emoji: '🍖', verb: 'Fed' },
  play: { emoji: '🎾', verb: 'Played with' },
  rest: { emoji: '💤', verb: 'Rested' },
  clean: { emoji: '🛁', verb: 'Cleaned' },
  vet: { emoji: '💊', verb: 'Healed' },
  wake: { emoji: '☀️', verb: 'Woke up' },
};

interface ActionFeedback {
  actionId: string;
  key: number;
}

const ActionButtons: React.FC = () => {
  const { state, performAction, wakePetUp } = useGame();
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);

  // Auto-clear feedback overlay after 2.2s (matches the CSS animation duration)
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 2200);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleAction = useCallback(
    (actionId: 'feed' | 'play' | 'rest' | 'clean' | 'vet' | 'wake') => {
      if (actionId === 'wake') {
        wakePetUp();
        setFeedback({ actionId: 'wake', key: Date.now() });
        return;
      }
      performAction(actionId);
      setFeedback({ actionId, key: Date.now() });
    },
    [performAction, wakePetUp],
  );

  if (!state.pet) return null;

  // Build a synthetic action config for "wake" since it's not in ACTIONS array
  const activeFeedback = feedback
    ? feedback.actionId === 'wake'
      ? {
          id: 'wake',
          label: 'Wake Up',
          icon: Sun,
          description: 'Start the day',
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          hoverColor: '',
          activeColor: '',
        }
      : ACTIONS.find((action) => action.id === feedback.actionId)
    : null;
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
            className={cn('flex items-center gap-4 px-8 py-5 rounded-2xl shadow-2xl glass-card')}
            style={{
              minWidth: '320px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.1) inset',
            }}
          >
            <div className={cn('text-4xl')} style={{ animation: 'actionEmojiPop 0.5s ease-out' }}>
              {activeFeedbackMeta.emoji}
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-foreground">
                {activeFeedbackMeta.verb} {state.pet?.name}!
              </span>
              <span className={cn('text-sm font-semibold', activeFeedback.color)}>{activeFeedback.description}</span>
            </div>
            {feedback.actionId !== 'wake' && (
              <div className={cn('text-3xl font-bold ml-2', activeFeedback.color)} style={{ animation: 'actionStatBounce 0.6s ease-out' }}>
                +
              </div>
            )}
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
          let Icon = action.icon;
          let label = action.label;
          let description = action.description;
          let color = action.color;
          let bgColor = action.bgColor;
          let isDisabled = false;
          let clickAction = action.id;

          // When pet is asleep, swap the Rest button into a Wake Up button;
          // disable all other actions until the pet is awake.
          if (state.petAsleep) {
            if (action.id === 'rest') {
              Icon = Sun;
              label = 'Wake Up';
              description = 'Start the day';
              color = 'text-orange-500';
              bgColor = 'bg-orange-500/10';
              clickAction = 'wake';
            } else {
              isDisabled = true;
            }
          }

          return (
            <Button
              key={action.id}
              variant="outline"
              disabled={isDisabled}
              className={cn(
                'flex flex-col items-center justify-center h-auto py-4 px-2',
                'border border-border/40 rounded-xl',
                'transition-all duration-200 transform btn-press',
                !isDisabled && 'hover:scale-105 hover:-translate-y-1 hover:shadow-md',
                bgColor,
                action.hoverColor,
                action.activeColor,
                'animate-fade-in-up opacity-0',
                isDisabled && 'opacity-50 cursor-not-allowed grayscale',
              )}
              style={{
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'forwards',
              }}
              onClick={() => handleAction(clickAction as any)}
            >
              <div className={cn('p-2 rounded-xl mb-2 transition-colors duration-200', bgColor)}>
                <Icon className={cn('w-5 h-5', color)} />
              </div>
              <span className="font-semibold text-xs text-foreground">{label}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5 hidden md:block">{description}</span>
            </Button>
          );
        })}
      </div>

      {/* Tip */}
      <div className="mt-4 pt-3 border-t border-border/30">
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
          <span className="text-primary">Tip:</span>
          <span>{state.petAsleep ? 'Wake up your pet to play!' : 'Shop items give bigger stat boosts'}</span>
        </p>
      </div>
    </div>
  );
};

export default ActionButtons;
