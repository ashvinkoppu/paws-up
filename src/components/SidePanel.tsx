import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Activity, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PetStats, Personality } from '@/types/game';

// Personality-based alert messages when stats are critical (<15)
const PERSONALITY_ALERTS: Record<Personality, Record<keyof PetStats, string>> = {
  playful: {
    hunger: "I'm starving! Give me a treat!",
    happiness: "Play with me now! I'm bored!",
    energy: "I'm tired but still want to play...",
    cleanliness: "I'm dirty! Can we groom?",
    health: "I feel sick! Help me!",
  },
  calm: {
    hunger: "I feel a bit hungry, please feed me.",
    happiness: "I feel a little sad, some attention please.",
    energy: "I could use a gentle grooming session.",
    cleanliness: "I could use a gentle grooming session.",
    health: "Health check recommended, please.",
  },
  curious: {
    hunger: "Feed me, I want to explore!",
    happiness: "I'm bored... let's learn something fun!",
    energy: "I'm tired but curious about a nap...",
    cleanliness: "Eww, I'm messy! Let's groom me.",
    health: "I don't feel well, need care!",
  },
  lazy: {
    hunger: "I'm hungry... more food, please.",
    happiness: "I just want a little attention...",
    energy: "So sleepy... let me rest...",
    cleanliness: "Do I really have to... clean me?",
    health: "I feel off... maybe vitamins?",
  },
};

// Default messages for when personality is not set - using consistent naming convention
// Hunger → Buy food | Happiness → Buy toys/play | Cleanliness → Book grooming
// Health → Buy vitamins/vet | Energy → Rest/reduce activities
const DEFAULT_ALERTS: Record<keyof PetStats, string> = {
  hunger: 'Please buy food in the shop',
  happiness: 'Please buy toys or accessories and play with me',
  energy: 'Please let me rest or reduce activities',
  cleanliness: 'Please book grooming',
  health: 'Please buy vitamins or schedule a vet checkup',
};

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
  const { state, performAction } = useGame();
  const { pet } = state;
  const [isMinimized, setIsMinimized] = useState(false);

  if (!pet) return null;

  const stats = pet.stats;
  const avgStats = Object.values(stats).reduce((sum, value) => sum + value, 0) / 5;

  // Get stats that need attention (low stats first)
  const sortedStats = (Object.keys(stats) as (keyof PetStats)[]).sort((a, b) => stats[a] - stats[b]);
  
  // Stats that need attention (<= 40)
  const needsAttentionStats = sortedStats.filter(stat => stats[stat] <= 40);
  const doingWellStats = sortedStats.filter(stat => stats[stat] > 40);

  const getAlertMessage = (stat: keyof PetStats): string => {
    const value = stats[stat];
    const personality = pet.personality;
    
    if (value <= 15) {
      // Urgent - use personality-based messages
      return PERSONALITY_ALERTS[personality]?.[stat] || DEFAULT_ALERTS[stat];
    }
    if (value <= 30) {
      // Warning - gentler reminder with consistent naming
      const gentleMessages: Record<keyof PetStats, string> = {
        hunger: 'A little hungry – check the Hunger section in the shop',
        happiness: 'Could use some playtime – visit Happiness in the shop',
        energy: `${pet.name} is tired – maybe some rest items from Energy section`,
        cleanliness: 'Getting a bit messy – check Cleanliness in the shop',
        health: 'A checkup would be nice – visit Health in the shop',
      };
      return gentleMessages[stat];
    }
    return '';
  };

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

  const StatRow: React.FC<{ stat: keyof PetStats; showAction?: boolean }> = ({ stat, showAction = true }) => {
    const config = STAT_CONFIG[stat];
    const value = stats[stat];
    const colors = getStatColor(value);
    const isLow = value <= 30;
    const isCritical = value <= 15;
    const alertMessage = getAlertMessage(stat);

    return (
      <div className="py-2.5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="flex items-center gap-2">
            <span className={cn(
              "text-base transition-transform duration-300",
              isLow && "animate-wiggle"
            )}>
              {config.icon}
            </span>
            <span className="font-medium text-sm text-foreground">{config.label}</span>
          </span>
          <span className={cn(
            "font-mono text-xs font-semibold transition-colors duration-300",
            colors.textColor
          )}>
            {Math.round(value)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className={cn(
          "h-2 rounded-full overflow-hidden transition-all duration-300",
          colors.bgColor
        )}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out relative",
              colors.barColor,
              isCritical && "animate-pulse"
            )}
            style={{ width: `${Math.max(value, 2)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            {value > 50 && (
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/15" />
            )}
          </div>
        </div>

        {/* Alert message */}
        {alertMessage && (
          <div className={cn(
            "flex items-start gap-1.5 mt-1.5 text-[11px] leading-tight",
            isCritical ? "text-red-600" : "text-amber-600"
          )}>
            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="italic">{alertMessage}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-card rounded-2xl shadow-md overflow-hidden transition-all duration-300">
      {/* Header - Clickable to toggle */}
      <div 
        className="px-4 py-3 border-b border-border/30 bg-gradient-to-r from-accent/30 via-accent/15 to-transparent cursor-pointer hover:from-accent/40 hover:via-accent/20 transition-colors"
        onClick={() => setIsMinimized(!isMinimized)}
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
            <div className="p-1 hover:bg-primary/10 rounded-md transition-colors">
              {isMinimized ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
        
        {/* Minimized: Compact stat preview row */}
        {isMinimized && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
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
                    "text-xs transition-transform",
                    value <= 30 && "animate-wiggle"
                  )}>
                    {config.icon}
                  </span>
                  <span className={cn(
                    "text-[10px] font-mono font-semibold",
                    colors.textColor
                  )}>
                    {Math.round(value)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
        
        {!isMinimized && (
          <p className="text-[11px] text-muted-foreground mt-1">{pet.name}'s current condition</p>
        )}
      </div>

      {/* Content - Only shown when expanded */}
      {!isMinimized && (
        <>
          <div className="px-4 py-2">
            {/* Needs Attention Section */}
            {needsAttentionStats.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs font-semibold text-red-600">⚠️ NEEDS ATTENTION ({needsAttentionStats.length})</span>
                </div>
                <div className="space-y-1 divide-y divide-border/30">
                  {needsAttentionStats.map((stat) => (
                    <StatRow key={stat} stat={stat} showAction={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Doing Well Section */}
            {doingWellStats.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs font-semibold text-emerald-600">✅ DOING WELL ({doingWellStats.length})</span>
                </div>
                <div className="space-y-1 divide-y divide-border/30">
                  {doingWellStats.map((stat) => (
                    <StatRow key={stat} stat={stat} showAction={false} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Footer - Using consistent attribute naming */}
          <div className="px-4 py-3 border-t border-border/50 bg-accent/20">
            <p className="text-[10px] text-muted-foreground mb-2">Quick Actions</p>
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => { e.stopPropagation(); performAction('feed'); }}
                className="h-7 text-xs gap-1 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-700"
                title="Buy food in the shop"
              >
                <span className="text-sm">🍖</span>
                Hunger
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => { e.stopPropagation(); performAction('play'); }}
                className="h-7 text-xs gap-1 border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-700"
                title="Buy toys or accessories and play with me"
              >
                <span className="text-sm">💕</span>
                Happiness
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => { e.stopPropagation(); performAction('rest'); }}
                className="h-7 text-xs gap-1 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-700"
                title="Let me rest or reduce activities"
              >
                <span className="text-sm">⚡</span>
                Energy
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => { e.stopPropagation(); performAction('clean'); }}
                className="h-7 text-xs gap-1 border-teal-500/30 hover:bg-teal-500/10 hover:text-teal-700"
                title="Book grooming"
              >
                <span className="text-sm">✨</span>
                Cleanliness
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => { e.stopPropagation(); performAction('vet'); }}
                className="h-7 text-xs gap-1 border-red-500/30 hover:bg-red-500/10 hover:text-red-700"
                title="Buy vitamins or schedule a vet checkup"
              >
                <span className="text-sm">❤️</span>
                Health
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SidePanel;
