import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, CheckCircle2, HeartPulse, Sparkles, Smile, Battery, Droplets, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PetStats } from '@/types/game';

const NotificationsPanel: React.FC = () => {
  const { state, performAction } = useGame();
  const { pet } = state;

  if (!pet) return null;

  const stats = pet.stats;

  // Define thresholds and configs locally
  const NOTIFICATION_CONFIG: Record<keyof PetStats, {
    label: string,
    icon: React.ElementType,
    threshold: number,
    criticalThreshold: number,
    message: string,
    action: 'feed' | 'play' | 'rest' | 'clean' | 'vet',
    actionLabel: string,
    color: string
  }> = {
    hunger: {
      label: 'Hunger',
      icon: Utensils,
      threshold: 30,
      criticalThreshold: 15,
      message: 'is feeling very hungry',
      action: 'feed',
      actionLabel: 'Feed Now',
      color: 'text-chart-1'
    },
    happiness: {
      label: 'Happiness',
      icon: Smile,
      threshold: 25,
      criticalThreshold: 10,
      message: 'is feeling sad and lonely',
      action: 'play',
      actionLabel: 'Play Game',
      color: 'text-chart-2'
    },
    energy: {
      label: 'Energy',
      icon: Battery,
      threshold: 20,
      criticalThreshold: 5,
      message: 'is exhausted and needs sleep',
      action: 'rest',
      actionLabel: 'Go to Sleep',
      color: 'text-chart-3'
    },
    cleanliness: {
      label: 'Cleanliness',
      icon: Droplets,
      threshold: 25,
      criticalThreshold: 10,
      message: 'needs a bath urgently',
      action: 'clean',
      actionLabel: 'Clean Up',
      color: 'text-secondary'
    },
    health: {
      label: 'Health',
      icon: HeartPulse,
      threshold: 40,
      criticalThreshold: 20,
      message: 'is not feeling well',
      action: 'vet',
      actionLabel: 'Visit Vet',
      color: 'text-chart-5'
    }
  };

  const getAlerts = () => {
    const alerts: Array<{
      stat: keyof PetStats,
      value: number,
      config: typeof NOTIFICATION_CONFIG[keyof PetStats],
      isCritical: boolean
    }> = [];

    (Object.keys(stats) as Array<keyof PetStats>).forEach(key => {
      const config = NOTIFICATION_CONFIG[key];
      if (stats[key] <= config.threshold) {
        alerts.push({
          stat: key,
          value: stats[key],
          config,
          isCritical: stats[key] <= config.criticalThreshold
        });
      }
    });

    return alerts.sort((a, b) => (a.isCritical === b.isCritical ? 0 : a.isCritical ? -1 : 1));
  };

  const alerts = getAlerts();

  return (
    <Card className="max-h-[600px] h-full border-2 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
      <CardHeader className="pb-3 bg-card/80 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-destructive/10 rounded-xl">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="tracking-tight">Needs & Alerts</CardTitle>
              <CardDescription>Things that need your attention</CardDescription>
            </div>
          </div>
          <div className="px-3 py-1 bg-accent/50 rounded-full text-xs font-semibold text-muted-foreground">
            {alerts.length} Active
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 min-h-[300px]">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4 animate-breathe">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-foreground">All Good!</h3>
            <p className="text-muted-foreground max-w-[250px]">
              {pet.name} is happy, healthy, and doing great. Keep up the good work!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => {
              const Icon = alert.config.icon;
              return (
                <div 
                  key={alert.stat}
                  className={cn(
                    "relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 animate-slide-in-left",
                    alert.isCritical 
                      ? "bg-destructive/5 border-destructive/30 hover:bg-destructive/10" 
                      : "bg-card border-border hover:border-primary/30"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-full flex-shrink-0",
                      alert.isCritical ? "bg-destructive/20 animate-pulse" : "bg-accent"
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        alert.isCritical ? "text-destructive" : alert.config.color
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-serif font-bold text-lg leading-none">
                          {alert.config.label} Critical
                        </h4>
                        <span className={cn(
                          "font-mono font-bold text-sm px-2 py-0.5 rounded",
                          alert.isCritical ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground"
                        )}>
                          {Math.round(alert.value)}%
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground mb-3 text-sm">
                        {pet.name} {alert.config.message}.
                      </p>
                      
                      <div className="flex items-center gap-3">
                         <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full transition-all duration-500", alert.isCritical ? "bg-destructive" : "bg-primary")} 
                              style={{ width: `${alert.value}%` }} 
                            />
                         </div>
                         <Button 
                           size="sm" 
                           onClick={() => performAction(alert.config.action)}
                           className={cn(
                             "shrink-0 h-8",
                             alert.isCritical ? "bg-destructive hover:bg-destructive/90" : ""
                           )}
                         >
                           {alert.config.actionLabel}
                         </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;
