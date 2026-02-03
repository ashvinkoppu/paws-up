import React from 'react';
import { useGame } from '@/context/GameContext';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PetStats } from '@/types/game';

const STAT_CONFIG: Record<keyof PetStats, {
  label: string;
  icon: string;
  action: 'feed' | 'play' | 'rest' | 'clean' | 'vet';
  actionLabel: string;
  actionIcon: React.ReactNode;
  description: string;
}> = {
  energy: {
    label: 'Energy',
    icon: '⚡',
    action: 'rest',
    actionLabel: 'Energy',
    actionIcon: <span className="text-xs">⚡</span>,
    description: 'Let me rest or reduce activities',
  },
  hunger: {
    label: 'Hunger',
    icon: '🍖',
    action: 'feed',
    actionLabel: 'Hunger',
    actionIcon: <span className="text-xs">🍖</span>,
    description: 'Buy food in the shop',
  },
  happiness: {
    label: 'Happiness',
    icon: '💕',
    action: 'play',
    actionLabel: 'Happiness',
    actionIcon: <span className="text-xs">💕</span>,
    description: 'Buy toys or accessories and play with me',
  },
  cleanliness: {
    label: 'Cleanliness',
    icon: '✨',
    action: 'clean',
    actionLabel: 'Cleanliness',
    actionIcon: <span className="text-xs">✨</span>,
    description: 'Book grooming',
  },
  health: {
    label: 'Health',
    icon: '❤️',
    action: 'vet',
    actionLabel: 'Health',
    actionIcon: <span className="text-xs">❤️</span>,
    description: 'Buy vitamins or schedule a vet checkup',
  },
};

// Get stat bar color based on value
const getStatColor = (value: number): { barColor: string; textColor: string; bgColor: string } => {
  if (value <= 15) {
    return {
      barColor: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-500/20',
    };
  }
  if (value <= 30) {
    return {
      barColor: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-500/20',
    };
  }
  return {
    barColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-500/20',
  };
};

interface SidePanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onFinanceClick?: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ collapsed = false, onToggle, onFinanceClick }) => {
  const { state } = useGame();
  const { pet } = state;

  if (!pet) return null;

  const stats = pet.stats;
  const avgStats = Object.values(stats).reduce((sum, value) => sum + value, 0) / 5;

  const getOverallStatus = () => {
    const lowestStat = Math.min(...Object.values(stats));

    if (lowestStat <= 10) return { label: 'Needs Care', color: 'bg-red-500/15 text-red-600 border-red-500/30' };
    if (lowestStat <= 25) return { label: 'Fair', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30' };

    if (avgStats >= 70) return { label: 'Excellent', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' };
    if (avgStats >= 50) return { label: 'Good', color: 'bg-teal-500/15 text-teal-600 border-teal-500/30' };
    if (avgStats >= 30) return { label: 'Fair', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30' };
    return { label: 'Needs Care', color: 'bg-red-500/15 text-red-600 border-red-500/30' };
  };

  const status = getOverallStatus();

  return (
    <div className="glass-card rounded-2xl shadow-md overflow-hidden transition-all duration-300">
      {/* Header - Clickable to toggle */}
      <div 
        className="px-4 py-3 border-b border-border/30 bg-gradient-to-r from-accent/30 via-accent/15 to-transparent"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-serif font-semibold text-base text-foreground">Pet Status</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all duration-300",
              status.color
            )}>
              {status.label}
            </div>
          </div>
        </div>
        
        {/* Compact stat preview row */}
        <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-border/30">
          {(Object.keys(STAT_CONFIG) as (keyof PetStats)[]).map((stat) => {
            const value = stats[stat];
            const colors = getStatColor(value);
            const config = STAT_CONFIG[stat];
            return (
              <div 
                key={stat} 
                className="flex items-center gap-1"
                title={`${config.label}: ${Math.round(value)}%`}
              >
                <span className={cn(
                  "text-sm transition-transform",
                  value <= 30 && "animate-wiggle"
                )}>
                  {config.icon}
                </span>
                <span className={cn(
                  "text-xs font-mono font-bold",
                  colors.textColor
                )}>
                  {Math.round(value)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
