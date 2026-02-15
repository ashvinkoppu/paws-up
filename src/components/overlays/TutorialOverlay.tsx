/**
 * TutorialOverlay - Step-by-step spotlight tutorial that introduces new players
 * to the game's UI sections.
 *
 * Renders a dark overlay with a spotlight cutout around the current target element
 * (located via `data-tutorial` selectors). A tooltip card beside the spotlight
 * explains each feature. Steps can switch the active tab (shop, games, etc.) so the
 * target element is visible when highlighted.
 *
 * Uses a box-shadow technique (9999px spread) for the dark backdrop with a transparent
 * "hole" around the target, avoiding SVG masks.
 *
 * @prop {() => void} onComplete - Called when the user finishes or skips the tutorial.
 * @prop {(tab: string) => void} onTabChange - Called to switch the active content tab
 *   so the highlighted element is rendered and measurable.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, X, PawPrint, Store, Gamepad2, ClipboardCheck, Wallet, Trophy, Heart, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialStep {
  targetSelector: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right';
  tabToActivate?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetSelector: '[data-tutorial="pet-display"]',
    title: 'Your Pet',
    description: 'This is your new companion! Watch their mood, level, and stats here. Keep all stats above 30% to keep them healthy and happy.',
    icon: <PawPrint className="w-5 h-5" />,
    position: 'right',
  },
  {
    targetSelector: '[data-tutorial="side-panel"]',
    title: 'Care Actions',
    description: 'Use these buttons to feed, play, clean, rest, and visit the vet. Each action uses items from your inventory, so stock up at the shop first!',
    icon: <Heart className="w-5 h-5" />,
    position: 'right',
  },
  {
    targetSelector: '[data-tutorial="tab-alerts"]',
    title: 'Needs & Alerts',
    description: 'This tab shows which stats need your attention. When a stat drops below 40%, it will appear here as a warning.',
    icon: <Bell className="w-5 h-5" />,
    position: 'bottom',
    tabToActivate: 'alerts',
  },
  {
    targetSelector: '[data-tutorial="tab-shop"]',
    title: 'Shop',
    description: 'Buy food, toys, cleaning supplies, and more to care for your pet. Manage your budget wisely - you start with $100!',
    icon: <Store className="w-5 h-5" />,
    position: 'bottom',
    tabToActivate: 'shop',
  },
  {
    targetSelector: '[data-tutorial="tab-games"]',
    title: 'Mini Games',
    description: 'Play fun mini games to earn money and XP. The better you score, the more you earn to spend on your pet!',
    icon: <Gamepad2 className="w-5 h-5" />,
    position: 'bottom',
    tabToActivate: 'games',
  },
  {
    targetSelector: '[data-tutorial="tab-tasks"]',
    title: 'Daily Tasks',
    description: 'Complete daily tasks to earn bonus XP and money. New tasks appear each day - some are timed, so act fast!',
    icon: <ClipboardCheck className="w-5 h-5" />,
    position: 'bottom',
    tabToActivate: 'tasks',
  },
  {
    targetSelector: '[data-tutorial="tab-finance"]',
    title: 'Finance Tracker',
    description: 'Track your spending and income here. Keep an eye on your weekly budget to avoid running out of money!',
    icon: <Wallet className="w-5 h-5" />,
    position: 'bottom',
    tabToActivate: 'finance',
  },
  {
    targetSelector: '[data-tutorial="tab-achievements"]',
    title: 'Awards & Achievements',
    description: 'Unlock achievements by reaching milestones. Each achievement earns you bonus money - collect them all!',
    icon: <Trophy className="w-5 h-5" />,
    position: 'bottom',
    tabToActivate: 'achievements',
  },
];

interface TutorialOverlayProps {
  onComplete: () => void;
  onTabChange: (tab: string) => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, onTabChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = TUTORIAL_STEPS[currentStep];

  const updateTargetRect = useCallback(() => {
    const element = document.querySelector(step.targetSelector);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
    }
  }, [step.targetSelector]);

  useEffect(() => {
    if (step.tabToActivate) {
      onTabChange(step.tabToActivate);
    }
    // Small delay to allow tab content to render before measuring
    const timeout = setTimeout(() => {
      updateTargetRect();
      setIsAnimating(true);
      const animTimeout = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(animTimeout);
    }, 100);

    return () => clearTimeout(timeout);
  }, [currentStep, step.tabToActivate, onTabChange, updateTargetRect]);

  useEffect(() => {
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [updateTargetRect]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Spotlight cutout dimensions: expand the target rect by `padding` on all sides
  // so the highlight doesn't clip the element's edges.
  const padding = 8;
  const spotlightStyle = targetRect
    ? {
        top: targetRect.top - padding,
        left: targetRect.left - padding,
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
      }
    : { top: '50%', left: '50%', width: 0, height: 0 };

  // Calculate tooltip position relative to the target element.
  // Each case clamps the tooltip horizontally so it stays within the viewport
  // (16px minimum margin from screen edges).
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const tooltipWidth = 340;
    const tooltipMargin = 16;

    switch (step.position) {
      case 'bottom':
        return {
          top: targetRect.bottom + padding + tooltipMargin,
          left: Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16)),
          width: tooltipWidth,
        };
      case 'top':
        return {
          bottom: window.innerHeight - targetRect.top + padding + tooltipMargin,
          left: Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16)),
          width: tooltipWidth,
        };
      case 'right':
        return {
          top: Math.max(16, targetRect.top + targetRect.height / 2 - 80),
          left: Math.min(targetRect.right + padding + tooltipMargin, window.innerWidth - tooltipWidth - 16),
          width: tooltipWidth,
        };
      case 'left':
        return {
          top: Math.max(16, targetRect.top + targetRect.height / 2 - 80),
          right: window.innerWidth - targetRect.left + padding + tooltipMargin,
          width: tooltipWidth,
        };
      default:
        return {
          top: targetRect.bottom + padding + tooltipMargin,
          left: targetRect.left,
          width: tooltipWidth,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-[300]" aria-modal="true" role="dialog">
      {/* Dark overlay with spotlight cutout using box-shadow */}
      <div
        className="absolute inset-0 transition-all duration-400 ease-out"
        style={{
          background: 'transparent',
          boxShadow: targetRect
            ? `0 0 0 9999px rgba(0, 0, 0, 0.65)`
            : '0 0 0 9999px rgba(0, 0, 0, 0.65)',
        }}
        onClick={handleSkip}
      />

      {/* Spotlight highlight */}
      {targetRect && (
        <div
          className="absolute rounded-2xl transition-all duration-400 ease-out pointer-events-none"
          style={{
            ...spotlightStyle,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
            zIndex: 1,
          }}
        >
          {/* Pulsing border ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/60 animate-tutorial-pulse" />
        </div>
      )}

      {/* Tooltip card */}
      <div
        className={cn(
          "absolute z-10 bg-card rounded-2xl shadow-2xl border border-border/60 overflow-hidden",
          isAnimating && "animate-tutorial-tooltip-in"
        )}
        style={getTooltipStyle()}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-4 flex items-center gap-3 border-b border-border/30">
          <div className="p-2 bg-primary/15 rounded-xl text-primary">
            {step.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-serif font-bold text-base text-foreground">{step.title}</h3>
            <p className="text-[11px] text-muted-foreground">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-2">
          <div className="flex gap-1">
            {TUTORIAL_STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1 rounded-full flex-1 transition-all duration-300",
                  index <= currentStep ? "bg-primary" : "bg-border"
                )}
              />
            ))}
          </div>
        </div>

        {/* Footer with navigation */}
        <div className="px-5 py-3 flex items-center justify-between border-t border-border/30 bg-accent/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Skip Tutorial
          </Button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="h-8 px-3 text-xs"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="h-8 px-4 text-xs bg-gradient-to-r from-primary to-chart-5 hover:from-primary/90 hover:to-chart-5/90 text-white shadow-md"
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? (
                "Start Playing!"
              ) : (
                <>
                  Next
                  <ChevronRight className="w-3 h-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
