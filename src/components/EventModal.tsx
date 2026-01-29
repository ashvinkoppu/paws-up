import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const EventModal: React.FC = () => {
  const { state, handleEventChoice, isPlayingMiniGame } = useGame();

  // Don't show events during active mini-games
  if (!state.currentEvent || isPlayingMiniGame) return null;

  const event = state.currentEvent;

  const getEventColor = () => {
    switch (event.type) {
      case 'emergency': return 'border-destructive bg-destructive/5';
      case 'sickness': return 'border-chart-3 bg-chart-3/5';
      case 'discount': return 'border-chart-2 bg-chart-2/5';
      case 'reward': return 'border-primary bg-primary/5';
      case 'broken': return 'border-chart-4 bg-chart-4/5';
      case 'opportunity': return 'border-chart-1 bg-chart-1/5';
      default: return 'border-border bg-card';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <Card className={cn("max-w-md w-full mx-4 shadow-2xl border-2", getEventColor())}>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{event.title}</CardTitle>
          <CardDescription className="text-base">{event.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {event.choices.map((choice, index) => (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "w-full h-auto py-3 px-4 justify-start text-left",
                choice.cost && state.money < choice.cost && "opacity-50"
              )}
              onClick={() => handleEventChoice(index)}
              disabled={choice.cost !== undefined && state.money < choice.cost}
            >
              <div>
                <span className="font-medium">{choice.text}</span>
                {choice.cost && (
                  <span className={cn(
                    "ml-2 text-sm",
                    state.money < choice.cost ? "text-destructive" : "text-muted-foreground"
                  )}>
                    (${choice.cost})
                  </span>
                )}
                {choice.moneyEffect && choice.moneyEffect > 0 && (
                  <span className="ml-2 text-sm text-chart-2">(+${choice.moneyEffect})</span>
                )}
              </div>
            </Button>
          ))}
          {event.choices.some(c => c.cost && state.money < c.cost) && (
            <p className="text-xs text-destructive text-center">
              ⚠️ Some options require more money than you have
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventModal;
