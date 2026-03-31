/**
 * @file GameDashboard.tsx
 *
 * The main game screen shown after pet creation. Implements a two-screen
 * layout toggled by `activeScreen: 'play' | 'hub'`:
 *
 * **Play screen** (left column: PetDisplay;
 *   right column: low-stat alert banner + Tasks/Play tabs)
 *
 * **Manage screen** (PetDisplay + Budget Summary strip + Inventory bar +
 *   Care / Cost of Care / Shop / Progress tabs)
 *
 * Key behaviors:
 * - Money-earned "swoop" animation when `state.money` increases.
 * - New-day popup auto-shown for 4 seconds on day increment.
 * - Reset dialog: 300 ms delay so AlertDialog exit animation completes first.
 * - Notification dropdown: closes on outside click via mousedown listener.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PetDisplay from '@/components/pet/PetDisplay';
import SidePanel from '@/components/dashboard/SidePanel';
import Shop from '@/components/dashboard/Shop';
import FinancePanel from '@/components/dashboard/FinancePanel';
import MiniGames from '@/components/mini-games/MiniGames';
import Achievements from '@/components/dashboard/Achievements';
import Tasks from '@/components/dashboard/Tasks';
import NotificationPanel from '@/components/dashboard/NotificationPanel';
import EventModal from '@/components/overlays/EventModal';
import GameClock from '@/components/dashboard/GameClock';
import TutorialOverlay from '@/components/overlays/TutorialOverlay';
import FAQChatbot from '@/components/chat/FAQChatbot';
import NewDayPopup from '@/components/overlays/NewDayPopup';
import PetDeathOverlay from '@/components/pet/PetDeathOverlay';
import {
  Save,
  RotateCcw,
  Zap,
  BarChart3,
  PawPrint,
  Bell,
  X,
  Sun,
  DollarSign,
  LogOut,
  Menu,
  HelpCircle,
  GraduationCap,
  Trees,
  UtensilsCrossed,
  Dumbbell,
  Moon,
  Sparkles,
  HeartPulse,
  AlertTriangle,
  ClipboardCheck,
  Gamepad2,
  Trophy,
  Store,
  Heart,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import PublicFooter from '@/components/layout/PublicFooter';

type ActiveScreen = 'play' | 'hub';

const GameDashboard: React.FC = () => {
  const { state, saveGame, resetGame, markNotificationsRead, clearNotifications, completeTutorial, restartTutorial, performAction, putPetToSleep, wakePetUp } = useGame();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const showTutorial = !state.tutorialCompleted;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('play');
  const [playTab, setPlayTab] = useState('tasks');
  const [hubTab, setHubTab] = useState('finance');
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showNewDayPopup, setShowNewDayPopup] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const previousDaysPlayed = useRef(state.totalDaysPlayed);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const previousMoney = useRef(state.money);
  const [moneyAnimations, setMoneyAnimations] = useState<Array<{ id: number; amount: number; swoopX: number; swoopY: number }>>([]);
  const [walletPulsing, setWalletPulsing] = useState(false);

  const unreadNotificationCount = state.notifications.filter((notification) => !notification.read).length;
  const needsAttentionCount = state.pet ? Object.values(state.pet.stats).filter((value) => value <= 40).length : 0;
  const weeklyBudgetUsedPercent = state.weeklyBudget > 0 ? (state.weeklySpent / state.weeklyBudget) * 100 : 0;
  const weeklyBudgetRemaining = state.weeklyBudget - state.weeklySpent;
  const manageSpendingByCategory = state.transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((accumulator, transaction) => {
      accumulator[transaction.category] = (accumulator[transaction.category] || 0) + transaction.amount;
      return accumulator;
    }, {} as Record<string, number>);
  const topExpenseEntry = Object.entries(manageSpendingByCategory).sort((left, right) => right[1] - left[1])[0];
  const topExpenseLabel = topExpenseEntry
    ? `${topExpenseEntry[0].charAt(0).toUpperCase()}${topExpenseEntry[0].slice(1)}: $${topExpenseEntry[1].toFixed(0)}`
    : 'No spending yet';
  const financeLesson = weeklyBudgetRemaining < 0
    ? 'Pause non-essential shopping and use inventory first.'
    : weeklyBudgetUsedPercent >= 80
      ? 'You are close to the limit. Compare categories before buying more.'
      : 'You still have room this week, but track which category grows fastest.';

  // Detect new day
  useEffect(() => {
    if (state.totalDaysPlayed > previousDaysPlayed.current) {
      setShowNewDayPopup(true);
      const timer = setTimeout(() => setShowNewDayPopup(false), 4000);
      previousDaysPlayed.current = state.totalDaysPlayed;
      return () => clearTimeout(timer);
    }
    previousDaysPlayed.current = state.totalDaysPlayed;
  }, [state.totalDaysPlayed]);

  // Money swoop animation
  useEffect(() => {
    const earned = state.money - previousMoney.current;
    if (earned > 0) {
      const animationId = Date.now() + Math.random();
      let swoopX = 100;
      let swoopY = -300;
      if (walletRef.current) {
        const walletRect = walletRef.current.getBoundingClientRect();
        swoopX = walletRect.left + walletRect.width / 2 - window.innerWidth / 2;
        swoopY = walletRect.top + walletRect.height / 2 - window.innerHeight / 2;
      }
      setMoneyAnimations((previous) => [...previous, { id: animationId, amount: Math.round(earned), swoopX, swoopY }]);

      const pulseTimer = setTimeout(() => {
        if (!isMountedRef.current) return;
        setWalletPulsing(true);
        const resetTimer = setTimeout(() => {
          if (isMountedRef.current) setWalletPulsing(false);
        }, 400);
        return () => clearTimeout(resetTimer);
      }, 1000);

      const cleanupTimer = setTimeout(() => {
        if (isMountedRef.current) {
          setMoneyAnimations((previous) => previous.filter((animation) => animation.id !== animationId));
        }
      }, 1500);

      return () => {
        clearTimeout(pulseTimer);
        clearTimeout(cleanupTimer);
      };
    }
    previousMoney.current = state.money;
  }, [state.money]);

  // Close notification panel on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target as Node)) {
        setShowNotificationPanel(false);
      }
    };
    if (showNotificationPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotificationPanel]);

  const handleOpenNotifications = () => {
    setShowNotificationPanel(!showNotificationPanel);
    if (!showNotificationPanel && unreadNotificationCount > 0) {
      markNotificationsRead();
    }
  };

  const handleReset = () => {
    setShowResetDialog(false);
    setTimeout(() => resetGame(), 300);
  };

  const handleOpenTasks = () => {
    setActiveScreen('play');
    setPlayTab('tasks');
  };

  const handleOpenFinance = () => {
    setActiveScreen('hub');
    setHubTab('finance');
  };

  const handleOpenCare = () => {
    setActiveScreen('hub');
    setHubTab('care');
  };



  // Care action button config
  const ACTION_BUTTONS = [
    { action: 'feed' as const, icon: <UtensilsCrossed className="w-5 h-5 text-foreground" />, label: 'Feed', category: 'hunger', stat: 'hunger' as const },
    { action: 'play' as const, icon: <Dumbbell className="w-5 h-5 text-foreground" />, label: 'Play', category: 'happiness', stat: 'happiness' as const },
    { action: 'rest' as const, icon: <Moon className="w-5 h-5 text-foreground" />, label: 'Rest', category: 'energy', stat: 'energy' as const },
    { action: 'clean' as const, icon: <Sparkles className="w-5 h-5 text-foreground" />, label: 'Clean', category: 'cleanliness', stat: 'cleanliness' as const },
    { action: 'vet' as const, icon: <HeartPulse className="w-5 h-5 text-foreground" />, label: 'Vet', category: 'health', stat: 'health' as const },
  ];

  const CATEGORY_MAP: Record<string, string> = {
    feed: 'hunger',
    play: 'happiness',
    rest: 'energy',
    clean: 'cleanliness',
    vet: 'health',
  };

  const petDisplayPanel = (
    <div className="animate-fade-in-up" data-tutorial="pet-display">
      <PetDisplay onXpClick={handleOpenTasks} onFinanceClick={handleOpenFinance} showFinanceSnapshot={activeScreen === 'play'} />
    </div>
  );

  const carePanel = (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif font-semibold text-foreground">Care Actions</h3>
          <span className="text-sm text-muted-foreground font-mono">{state.dailyActionsRemaining} left today</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" data-tutorial="side-panel">
          {ACTION_BUTTONS.map(({ action, icon, label, category, stat }) => {
            const inventoryItem = state.inventory.find((item) => item.category === category && item.quantity > 0);
            const statValue = state.pet?.stats[stat] ?? 100;
            const needsAttention = statValue <= 40;
            const hasItems = !!inventoryItem;
            return (
              <button
                key={action}
                onClick={() => performAction(action)}
                disabled={!hasItems || state.dailyActionsRemaining <= 0}
                className={cn(
                  'rounded-xl border border-border bg-background hover:bg-accent transition-colors p-4 flex flex-col items-center gap-2 text-left',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  needsAttention && hasItems && 'ring-2 ring-amber-400 animate-pulse',
                )}
              >
                {icon}
                <span className="text-sm font-medium text-foreground">{label}</span>
                <span className={cn('text-xs', hasItems ? 'text-muted-foreground' : 'text-rose-500')}>
                  {hasItems ? inventoryItem!.name : 'No items'}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          className="w-full mt-3 rounded-xl border border-border hover:bg-accent text-foreground flex items-center gap-2"
          onClick={() => (state.petAsleep ? wakePetUp() : putPetToSleep())}
        >
          {state.petAsleep ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {state.petAsleep ? 'Wake Up' : 'Put to Sleep'}
        </Button>
      </div>

      <SidePanel />
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden w-full">
      {/* Page-level background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-0 right-0 w-[700px] h-[600px] bg-primary/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 w-full" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif text-xl font-bold text-foreground tracking-tight">Paws Up</span>
          </Link>

          <div className="hidden sm:flex items-center gap-3">
            <div
              ref={walletRef}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 bg-accent border border-border rounded-full text-sm transition-all duration-300', walletPulsing && 'animate-wallet-pulse')}
            >
              <DollarSign className="w-3.5 h-3.5 text-foreground/60" />
              <span className="font-mono font-semibold text-foreground tabular-nums">{state.money.toFixed(0)}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent border border-border rounded-full text-sm" title="Daily Actions Remaining">
              <Zap className="w-3.5 h-3.5 text-foreground/60" />
              <span className="font-mono font-semibold text-foreground tabular-nums">
                {state.dailyActionsRemaining}/{state.dailyActionsMax}
              </span>
            </div>

            <GameClock />

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent border border-border rounded-full text-sm">
              <Sun className="w-3.5 h-3.5 text-foreground/60" />
              <span className="font-mono font-medium text-foreground tabular-nums">Day {state.totalDaysPlayed}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative" ref={notificationPanelRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleOpenNotifications}
                className={cn('relative h-9 w-9 rounded-full transition-all duration-200', showNotificationPanel ? 'bg-primary/10' : 'hover:bg-accent')}
              >
                <Bell className={cn('w-4 h-4', unreadNotificationCount > 0 ? 'text-primary' : 'text-muted-foreground')} />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </Button>

              {showNotificationPanel && (
                <NotificationPanel
                  notifications={state.notifications}
                  onClose={() => setShowNotificationPanel(false)}
                  onClearAll={clearNotifications}
                />
              )}
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-accent">
                  <Menu className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-0 bg-background border border-border shadow-lg overflow-hidden">
                {state.pet && (
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Caring for</p>
                    <p className="font-serif font-semibold text-foreground">{state.pet.name}</p>
                  </div>
                )}
                <div className="py-1 border-b border-border/60">
                  <DropdownMenuItem onClick={saveGame} className="rounded-none cursor-pointer py-2.5 px-4 focus:bg-accent/40">
                    <Save className="w-4 h-4 mr-3 text-primary" />
                    <span className="text-sm font-medium">Save Game</span>
                  </DropdownMenuItem>
                </div>
                <div className="border-b border-border/60">
                  <div className="px-4 pt-2.5 pb-1">
                    <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Support</p>
                  </div>
                  <DropdownMenuItem asChild className="rounded-none cursor-pointer py-2.5 px-4 focus:bg-accent/40">
                    <Link to="/faq" className="flex items-center">
                      <HelpCircle className="w-4 h-4 mr-3 text-muted-foreground" />
                      <span className="text-sm">Help & FAQ</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={restartTutorial} className="rounded-none cursor-pointer py-2.5 px-4 focus:bg-accent/40">
                    <GraduationCap className="w-4 h-4 mr-3 text-muted-foreground" />
                    <span className="text-sm">Restart Tutorial</span>
                  </DropdownMenuItem>
                </div>
                <div>
                  <div className="px-4 pt-2.5 pb-1">
                    <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Account</p>
                  </div>
                  <DropdownMenuItem onClick={() => setShowResetDialog(true)} className="rounded-none cursor-pointer py-2.5 px-4 text-amber-600 focus:text-amber-600 focus:bg-amber-500/10">
                    <RotateCcw className="w-4 h-4 mr-3" />
                    <span className="text-sm">Reset Game</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-none cursor-pointer py-2.5 px-4 text-muted-foreground focus:text-foreground focus:bg-accent/40">
                    <LogOut className="w-4 h-4 mr-3" />
                    <span className="text-sm">Sign Out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Two-button screen nav - directly below header */}
        <div className="max-w-6xl mx-auto px-6 pb-3 pt-1 flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setActiveScreen('play')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium transition-all duration-200',
              activeScreen === 'play' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <PawPrint className="w-4 h-4" />
            Play
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveScreen('hub')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium transition-all duration-200',
              activeScreen === 'hub' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <ClipboardCheck className="w-4 h-4" />
            Manage
          </Button>
        </div>
      </header>

      {/* Reset Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="rounded-2xl border-border shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-lg">Reset Game?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to reset your game? All progress will be lost, including your pet, money, and achievements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Reset Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">

        {activeScreen === 'play' && (
          <Link to="/park" className="block animate-fade-in-up mb-6">
            <div className="rounded-xl border border-border bg-card shadow-sm p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center shrink-0">
                  <Trees className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif font-semibold text-base text-foreground">Go to Park</h3>
                  <p className="text-sm text-muted-foreground">Walk, play fetch, explore</p>
                </div>
                <Trees className="w-5 h-5 text-secondary group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            {petDisplayPanel}
          </div>

          <div className="lg:col-span-8 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            {activeScreen === 'play' ? (
              <>
              {/* Low-stat alert banner */}
              {needsAttentionCount > 0 && (
                <div className="border border-rose-200 bg-rose-50 dark:bg-rose-950/20 rounded-xl p-3 flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span className="text-sm text-rose-700 dark:text-rose-400">
                      {state.pet?.name} needs attention: {needsAttentionCount} {needsAttentionCount === 1 ? 'stat is' : 'stats are'} low.
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenCare}
                    className="shrink-0 border-rose-200 bg-white/80 text-rose-700 hover:bg-rose-100 hover:text-rose-800"
                  >
                    Go to Care
                  </Button>
                </div>
              )}

              <Tabs value={playTab} onValueChange={setPlayTab} className="flex flex-col min-h-0">
                <TabsList className="flex w-full h-auto bg-card p-1 rounded-xl border border-border gap-0.5 mb-4">
                  <TabsTrigger
                    value="tasks"
                    data-tutorial="tab-tasks"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger
                    value="games"
                    data-tutorial="tab-games"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    Play
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto">
                  <TabsContent value="tasks" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Tasks />
                  </TabsContent>
                  <TabsContent value="games" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <MiniGames />
                  </TabsContent>
                </div>
              </Tabs>
              </>
            ) : (
              <div className="space-y-5">
              {/* Manage header */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary mb-1">Manage</p>
                <h2 className="font-serif text-2xl font-bold text-foreground tracking-tight">
                  {state.pet?.name ?? 'Your pet'}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Track care costs, manage inventory, and review progress.
                </p>
              </div>

              {/* Budget snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">Balance</p>
                  <p className={cn('font-mono font-bold text-2xl', state.money < 20 ? 'text-rose-600' : 'text-foreground')}>
                    ${state.money.toFixed(0)}
                  </p>
                  {state.money < 20 ? (
                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Low funds
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Available funds</p>
                  )}
                </div>

                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">This Week</p>
                  <p className={cn('font-mono font-bold text-2xl', weeklyBudgetRemaining < 0 ? 'text-rose-600' : 'text-foreground')}>
                    {weeklyBudgetRemaining < 0
                      ? `Over $${Math.abs(weeklyBudgetRemaining).toFixed(0)}`
                      : `$${weeklyBudgetRemaining.toFixed(0)} left`}
                  </p>
                  <div className="mt-2 h-1.5 bg-accent rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', weeklyBudgetUsedPercent > 100 ? 'bg-rose-500' : 'bg-primary/70')}
                      style={{ width: `${Math.min(weeklyBudgetUsedPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    ${state.weeklySpent.toFixed(0)} of ${state.weeklyBudget} spent
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">Top Expense</p>
                  <p className="font-semibold text-sm text-foreground">{topExpenseLabel}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{financeLesson}</p>
                </div>
              </div>

              {/* Hub tabs */}
              <Tabs value={hubTab} onValueChange={setHubTab}>
                <TabsList className="flex w-full h-auto bg-card p-1 rounded-xl border border-border gap-0.5 mb-4">
                  <TabsTrigger
                    value="care"
                    data-tutorial="tab-care"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                  >
                    <Heart className="w-4 h-4" />
                    Care
                  </TabsTrigger>
                  <TabsTrigger
                    value="finance"
                    data-tutorial="tab-finance"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Report
                  </TabsTrigger>
                  <TabsTrigger
                    value="shop"
                    data-tutorial="tab-shop"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                  >
                    <Store className="w-4 h-4" />
                    Shop
                  </TabsTrigger>
                  <TabsTrigger
                    value="progress"
                    data-tutorial="tab-progress"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                  >
                    <Trophy className="w-4 h-4" />
                    Progress
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="care" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  {carePanel}
                </TabsContent>
                <TabsContent value="finance" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <FinancePanel />
                </TabsContent>
                <TabsContent value="shop" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <Shop />
                </TabsContent>
                <TabsContent value="progress" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <Achievements />
                </TabsContent>
              </Tabs>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Money earned animation overlay */}
      {moneyAnimations.map((animation) => (
        <div key={animation.id} className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div
            className="animate-money-swoop flex items-center gap-1.5"
            style={{ '--swoop-x': `${animation.swoopX}px`, '--swoop-y': `${animation.swoopY}px` } as React.CSSProperties}
          >
            <DollarSign className="w-6 h-6 text-emerald-500 drop-shadow-lg" />
            <span className="text-2xl font-mono font-black text-emerald-500 drop-shadow-lg">+${animation.amount}</span>
          </div>
        </div>
      ))}

      {showNewDayPopup && <NewDayPopup totalDaysPlayed={state.totalDaysPlayed} onClose={() => setShowNewDayPopup(false)} />}
      {state.petDead && state.pet && <PetDeathOverlay pet={state.pet} totalDaysPlayed={state.totalDaysPlayed} careStreak={state.careStreak} onReset={resetGame} />}
      {showTutorial && <TutorialOverlay onComplete={completeTutorial} onTabChange={(tab) => { if (['tasks', 'games'].includes(tab)) { setActiveScreen('play'); setPlayTab(tab); } else { setActiveScreen('hub'); setHubTab(tab === 'care' ? 'care' : tab === 'finance' ? 'finance' : tab === 'shop' ? 'shop' : tab === 'progress' ? 'progress' : 'finance'); } }} />}
      <EventModal />

      <PublicFooter />

      <FAQChatbot
        context={
          state.pet
            ? {
                pet: state.pet,
                money: state.money,
                careStreak: state.careStreak,
                totalDaysPlayed: state.totalDaysPlayed,
                inventoryCount: state.inventory.reduce((sum, item) => sum + item.quantity, 0),
                achievementsUnlocked: state.achievements.filter((achievement) => achievement.unlocked).length,
                totalAchievements: state.achievements.length,
              }
            : undefined
        }
      />
    </div>
  );
};

export default GameDashboard;
