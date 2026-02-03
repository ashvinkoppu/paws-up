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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PetDisplay from '@/components/PetDisplay';
import SidePanel from '@/components/SidePanel';
import Shop from '@/components/Shop';
import FinancePanel from '@/components/FinancePanel';
import MiniGames from '@/components/MiniGames';
import Achievements from '@/components/Achievements';
import Tasks from '@/components/Tasks';
import EventModal from '@/components/EventModal';
import NotificationsPanel from '@/components/NotificationsPanel';
import GameClock from '@/components/GameClock';
import TutorialOverlay from '@/components/TutorialOverlay';
import FAQChatbot from '@/components/FAQChatbot';
import { Save, RotateCcw, Zap, Store, Gamepad2, Trophy, Wallet, PawPrint, Bell, X, Sun, DollarSign, ClipboardCheck, LogOut, Menu, Settings, HelpCircle, ChevronRight, GraduationCap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const GameDashboard: React.FC = () => {
  const { state, saveGame, resetGame, triggerRandomEvent, markNotificationsRead, clearNotifications, completeTutorial, restartTutorial } = useGame();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const showTutorial = !state.tutorialCompleted;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showNewDayPopup, setShowNewDayPopup] = useState(false);
  const previousDaysPlayed = useRef(state.totalDaysPlayed);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const previousMoney = useRef(state.money);
  const [moneyAnimations, setMoneyAnimations] = useState<Array<{ id: number; amount: number; swoopX: number; swoopY: number }>>([]);
  const [walletPulsing, setWalletPulsing] = useState(false);
  const [activeTab, setActiveTab] = useState('shop');
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const [rightColumnHeight, setRightColumnHeight] = useState<number | null>(null);

  const unreadNotificationCount = state.notifications.filter(notification => !notification.read).length;

  // Detect when a new day starts
  useEffect(() => {
    if (state.totalDaysPlayed > previousDaysPlayed.current) {
      setShowNewDayPopup(true);
      const timer = setTimeout(() => setShowNewDayPopup(false), 4000);
      previousDaysPlayed.current = state.totalDaysPlayed;
      return () => clearTimeout(timer);
    }
    previousDaysPlayed.current = state.totalDaysPlayed;
  }, [state.totalDaysPlayed]);

  // Detect money earned and trigger swoop animation
  useEffect(() => {
    const earned = state.money - previousMoney.current;
    if (earned > 0) {
      const animationId = Date.now() + Math.random();

      // Calculate swoop target relative to viewport center
      // The animation starts near center of viewport and swoops toward the wallet
      let swoopX = 100;
      let swoopY = -300;
      if (walletRef.current) {
        const walletRect = walletRef.current.getBoundingClientRect();
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;
        swoopX = walletRect.left + walletRect.width / 2 - startX;
        swoopY = walletRect.top + walletRect.height / 2 - startY;
      }

      setMoneyAnimations((previous) => [...previous, { id: animationId, amount: Math.round(earned), swoopX, swoopY }]);

      // Pulse the wallet when animation arrives
      setTimeout(() => {
        setWalletPulsing(true);
        setTimeout(() => setWalletPulsing(false), 400);
      }, 1000);

      // Remove animation element after it completes
      setTimeout(() => {
        setMoneyAnimations((previous) => previous.filter((animation) => animation.id !== animationId));
      }, 1500);
    }
    previousMoney.current = state.money;
  }, [state.money]);

  // Count stats that need attention (below 40%)
  const needsAttentionCount = state.pet
    ? Object.values(state.pet.stats).filter((value) => value <= 40).length
    : 0;

  // Close notification panel when clicking outside
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

  useEffect(() => {
    const leftColumn = leftColumnRef.current;
    if (!leftColumn || typeof ResizeObserver === 'undefined') return;

    const updateHeight = () => {
      const nextHeight = Math.round(leftColumn.getBoundingClientRect().height);
      setRightColumnHeight((previous) => (previous === nextHeight ? previous : nextHeight));
    };

    updateHeight();
    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(leftColumn);
    window.addEventListener('resize', updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  const handleOpenNotifications = () => {
    setShowNotificationPanel(!showNotificationPanel);
    if (!showNotificationPanel && unreadNotificationCount > 0) {
      markNotificationsRead();
    }
  };

  const handleReset = () => {
    resetGame();
  };

  const handleTriggerEvent = () => {
    triggerRandomEvent();
    toast({
      title: "Something's happening...",
      description: "A random event has occurred!",
    });
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
      case 'alert': return 'bg-rose-500/15 text-rose-600 border-rose-500/30';
      case 'purchase': return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
      case 'event': return 'bg-violet-500/15 text-violet-600 border-violet-500/30';
      case 'milestone': return 'bg-sky-500/15 text-sky-600 border-sky-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // State for reset dialog (needed for menu)
  const [showResetDialog, setShowResetDialog] = useState(false);

  return (
    <div className="min-h-screen paper-texture relative overflow-x-hidden w-full">
      {/* Atmospheric background - simplified */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tl from-secondary/5 to-transparent blur-3xl" />
      </div>

      {/* Clean, minimal header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Left: Logo only */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-2 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl transition-all duration-300 group-hover:from-primary/25 group-hover:to-primary/10">
                <PawPrint className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-serif font-bold">
                <span className="bg-gradient-to-r from-primary to-chart-5 bg-clip-text text-transparent">Paws Up</span>
              </h1>
            </Link>

            {/* Center: Key info - wallet and day */}
            <div className="hidden sm:flex items-center gap-3">
              <div
                ref={walletRef}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bg-emerald-500/8 rounded-full border border-emerald-500/15 transition-all duration-300",
                  walletPulsing && "animate-wallet-pulse bg-emerald-500/15"
                )}
              >
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-semibold text-emerald-700">{state.money.toFixed(0)}</span>
              </div>

              <GameClock />

              <div className="flex items-center gap-1.5 px-3 py-2 bg-accent/30 rounded-full text-sm">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono text-muted-foreground">Day {state.totalDaysPlayed}</span>
              </div>
            </div>

            {/* Right: Notifications + Menu */}
            <div className="flex items-center gap-2">
              {/* Notification Bell - simplified */}
              <div className="relative" ref={notificationPanelRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenNotifications}
                  className={cn(
                    "relative h-9 w-9 rounded-full transition-all duration-200",
                    showNotificationPanel ? "bg-primary/10" : "hover:bg-muted/50"
                  )}
                >
                  <Bell className={cn("w-4 h-4", unreadNotificationCount > 0 ? "text-primary" : "text-muted-foreground")} />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </span>
                  )}
                </Button>

                {/* Notification Dropdown */}
                {showNotificationPanel && (
                  <div className="absolute right-0 top-full mt-2 w-80 max-h-96 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-up bg-card/95 backdrop-blur-xl border border-border/30">
                    <div className="sticky top-0 bg-card/90 backdrop-blur-md border-b border-border/30 px-4 py-3 flex items-center justify-between">
                      <h3 className="font-serif font-semibold text-sm">Notifications</h3>
                      <div className="flex items-center gap-1">
                        {state.notifications.length > 0 && (
                          <Button variant="ghost" size="sm" onClick={clearNotifications} className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive">
                            Clear all
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setShowNotificationPanel(false)} className="h-6 w-6 p-0">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-80">
                      {state.notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          {state.notifications.slice(0, 20).map((notification) => (
                            <div
                              key={notification.id}
                              className={cn(
                                "flex items-start gap-3 p-3 rounded-xl transition-colors duration-200",
                                notification.read ? "opacity-60" : "bg-accent/30"
                              )}
                            >
                              <span className="text-lg flex-shrink-0 mt-0.5">{notification.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-semibold text-xs text-foreground truncate">{notification.title}</span>
                                  <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded-full border capitalize flex-shrink-0",
                                    getNotificationTypeColor(notification.type)
                                  )}>
                                    {notification.type}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{notification.description}</p>
                                <span className="text-[10px] text-muted-foreground/60 mt-1 block">{formatTimeAgo(notification.timestamp)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Consolidated Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted/50">
                    <Menu className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                  {state.pet && (
                    <>
                      <div className="px-2 py-2 mb-1">
                        <p className="text-xs text-muted-foreground">Caring for</p>
                        <p className="font-semibold text-foreground">{state.pet.name}</p>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem onClick={saveGame} className="rounded-lg cursor-pointer">
                    <Save className="w-4 h-4 mr-2 text-secondary" />
                    <span>Save Game</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleTriggerEvent} className="rounded-lg cursor-pointer">
                    <Zap className="w-4 h-4 mr-2 text-violet-500" />
                    <span>Trigger Event</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link to="/faq" className="flex items-center">
                      <HelpCircle className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Help & FAQ</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={restartTutorial}
                    className="rounded-lg cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Restart Tutorial</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setShowResetDialog(true)}
                    className="rounded-lg cursor-pointer text-amber-600 focus:text-amber-600"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    <span>Reset Game</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="rounded-lg cursor-pointer text-muted-foreground focus:text-foreground"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Reset Dialog (moved outside header for menu trigger) */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="rounded-2xl border-border/50 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-lg">Reset Game?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to reset your game? All progress will be lost, including your pet, money, and achievements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Reset Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content - Cleaner layout */}
      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Pet + Status (narrower) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4" ref={leftColumnRef}>
            <div className="animate-fade-in-up" data-tutorial="pet-display">
              <PetDisplay onXpClick={() => setActiveTab('tasks')} onFinanceClick={() => setActiveTab('finance')} />
            </div>
            <div className="animate-fade-in-up" data-tutorial="side-panel" style={{ animationDelay: '0.1s' }}>
              <SidePanel onFinanceClick={() => setActiveTab('finance')} />
            </div>
          </div>

          {/* Right Column: Activity Hub (wider, cleaner tabs) */}
          <div
            className={cn(
              "lg:col-span-8 xl:col-span-9 animate-fade-in-up lg:flex lg:flex-col lg:overflow-hidden lg:h-[var(--right-column-h)]"
            )}
            style={{
              animationDelay: '0.15s',
              ...(rightColumnHeight ? { '--right-column-h': `${rightColumnHeight}px` } : {}),
            } as React.CSSProperties}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col min-h-0">
              {/* Simplified tab navigation - horizontal scroll on mobile, cleaner look */}
              <div className="mb-4 -mx-4 px-4 overflow-x-auto scrollbar-hide">
                <TabsList className="inline-flex w-auto min-w-full lg:w-full bg-card/50 backdrop-blur-sm p-1 rounded-xl border border-border/20 gap-1">
                  {/* Needs tab - only shows badge when there are issues */}
                  <TabsTrigger
                    value="alerts"
                    data-tutorial="tab-alerts"
                    className={cn(
                      "flex-1 min-w-[80px] flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-sm",
                      needsAttentionCount > 0 && "ring-2 ring-rose-500/30 data-[state=inactive]:bg-rose-500/10"
                    )}
                  >
                    <Bell className="w-4 h-4" />
                    <span>Needs</span>
                    {needsAttentionCount > 0 && (
                      <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 group-data-[state=active]:bg-white group-data-[state=active]:text-rose-500 text-white text-[10px] font-bold rounded-full">
                        {needsAttentionCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="shop"
                    data-tutorial="tab-shop"
                    className="flex-1 min-w-[80px] flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    <Store className="w-4 h-4" />
                    <span>Shop</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="games"
                    data-tutorial="tab-games"
                    className="flex-1 min-w-[80px] flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-violet-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Play</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="tasks"
                    data-tutorial="tab-tasks"
                    className="group flex-1 min-w-[80px] flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Tasks</span>
                    {state.dailyTasks.some(task => task.completed) && !state.dailyBonusClaimed && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 group-data-[state=active]:bg-white" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="finance"
                    data-tutorial="tab-finance"
                    className="flex-1 min-w-[80px] flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Budget</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="achievements"
                    data-tutorial="tab-achievements"
                    className="flex-1 min-w-[80px] flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-sky-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Awards</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab content with consistent card styling */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                <TabsContent value="alerts" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <NotificationsPanel />
                </TabsContent>

                <TabsContent value="shop" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <Shop />
                </TabsContent>

                <TabsContent value="games" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <MiniGames />
                </TabsContent>

                <TabsContent value="tasks" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <Tasks />
                </TabsContent>

                <TabsContent value="finance" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <FinancePanel />
                </TabsContent>

                <TabsContent value="achievements" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <Achievements />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Money earned animation overlay */}
      {moneyAnimations.map((animation) => (
        <div
          key={animation.id}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        >
          <div
            className="animate-money-swoop flex items-center gap-1.5"
            style={{
              '--swoop-x': `${animation.swoopX}px`,
              '--swoop-y': `${animation.swoopY}px`,
            } as React.CSSProperties}
          >
            <DollarSign className="w-6 h-6 text-emerald-500 drop-shadow-lg" />
            <span className="text-2xl font-mono font-black text-emerald-500 drop-shadow-lg">
              +${animation.amount}
            </span>
          </div>
        </div>
      ))}

      {/* New Day Popup Overlay */}
      {showNewDayPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer"
          onClick={() => setShowNewDayPopup(false)}
          style={{
            animation: 'newDayFadeIn 0.5s ease-out, newDayFadeOut 0.5s ease-in 3.5s forwards',
          }}
        >
          <div
            className="bg-card rounded-2xl shadow-xl border border-border/60 overflow-hidden"
            style={{
              animation: 'newDayPop 0.6s ease-out',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              maxWidth: '320px',
              width: '90vw',
            }}
          >
            <div className="bg-gradient-to-b from-amber-50 to-transparent px-10 py-8 flex flex-col items-center gap-5">
              <div
                className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center"
                style={{ animation: 'newDaySunSpin 1s ease-out' }}
              >
                <Sun className="w-7 h-7 text-amber-500" />
              </div>
              <div className="text-center">
                <h2 className="font-serif font-bold text-xl text-foreground mb-1">
                  A New Day Dawns!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Day <span className="font-mono font-bold text-amber-600">{state.totalDaysPlayed}</span> of your adventure
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-4 py-2 rounded-full">
                <span>💰</span>
                <span>Daily allowance received!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pet Death Overlay */}
      {state.petDead && state.pet && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md"
          style={{
            animation: 'deathFadeIn 1s ease-out',
          }}
        >
          <div
            className="bg-card rounded-3xl shadow-2xl border border-border/60 overflow-hidden max-w-md w-[90vw]"
            style={{
              animation: 'deathCardPop 0.8s ease-out 0.3s both',
            }}
          >
            <div className="bg-gradient-to-b from-rose-100/80 via-rose-50/50 to-transparent px-8 py-10 flex flex-col items-center gap-6">
              {/* Sad emoji with pulse */}
              <div
                className="w-24 h-24 rounded-full bg-rose-100 flex items-center justify-center"
                style={{ animation: 'deathHeartbeat 2s ease-in-out infinite' }}
              >
                <span className="text-5xl">😢</span>
              </div>

              {/* Message */}
              <div className="text-center">
                <h2 className="font-serif font-bold text-2xl text-foreground mb-2">
                  {state.pet.name} has passed away...
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Your pet was neglected for too long. All their stats became critically low at the same time.
                </p>
              </div>

              {/* Stats display (final state) */}
              <div className="w-full bg-rose-50/50 rounded-xl p-4 border border-rose-200/50">
                <p className="text-xs text-rose-600 font-medium mb-2 text-center">Final Stats</p>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div>
                    <span className="text-lg">🍖</span>
                    <p className="text-[10px] text-rose-700 font-mono">{Math.round(state.pet.stats.hunger)}%</p>
                  </div>
                  <div>
                    <span className="text-lg">😊</span>
                    <p className="text-[10px] text-rose-700 font-mono">{Math.round(state.pet.stats.happiness)}%</p>
                  </div>
                  <div>
                    <span className="text-lg">⚡</span>
                    <p className="text-[10px] text-rose-700 font-mono">{Math.round(state.pet.stats.energy)}%</p>
                  </div>
                  <div>
                    <span className="text-lg">🧼</span>
                    <p className="text-[10px] text-rose-700 font-mono">{Math.round(state.pet.stats.cleanliness)}%</p>
                  </div>
                  <div>
                    <span className="text-lg">❤️</span>
                    <p className="text-[10px] text-rose-700 font-mono">{Math.round(state.pet.stats.health)}%</p>
                  </div>
                </div>
              </div>

              {/* Adventure summary */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="text-center">
                  <p className="font-mono font-bold text-lg text-foreground">{state.totalDaysPlayed}</p>
                  <p className="text-[10px]">Days</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="font-mono font-bold text-lg text-foreground">{state.pet.level}</p>
                  <p className="text-[10px]">Level</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="font-mono font-bold text-lg text-foreground">{state.careStreak}</p>
                  <p className="text-[10px]">Best Streak</p>
                </div>
              </div>

              {/* Try Again button */}
              <Button
                onClick={resetGame}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-chart-5 hover:from-primary/90 hover:to-chart-5/90 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Again
              </Button>

              <p className="text-[10px] text-muted-foreground/60">
                This will reset all progress and start a new game.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay
          onComplete={completeTutorial}
          onTabChange={setActiveTab}
        />
      )}

      {/* Event Modal */}
      <EventModal />

      {/* Minimal Footer */}
      <footer className="mt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground/50">
            <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

      {/* AI Chatbot with pet context */}
      <FAQChatbot
        context={state.pet ? {
          pet: state.pet,
          money: state.money,
          careStreak: state.careStreak,
          totalDaysPlayed: state.totalDaysPlayed,
          inventoryCount: state.inventory.reduce((sum, item) => sum + item.quantity, 0),
          achievementsUnlocked: state.achievements.filter(a => a.unlocked).length,
          totalAchievements: state.achievements.length,
        } : undefined}
      />
    </div>
  );
};

export default GameDashboard;
