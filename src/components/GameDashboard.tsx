import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PetDisplay from '@/components/PetDisplay';
import SidePanel from '@/components/SidePanel';
import Shop from '@/components/Shop';
import FinancePanel from '@/components/FinancePanel';
import MiniGames from '@/components/MiniGames';
import Achievements from '@/components/Achievements';
import Tasks from '@/components/Tasks';
import EventModal from '@/components/EventModal';
import NotificationsPanel from '@/components/NotificationsPanel';
import { Save, RotateCcw, Zap, Store, Gamepad2, Trophy, Wallet, PawPrint, Bell, X, Sun, DollarSign, ClipboardCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const GameDashboard: React.FC = () => {
  const { state, saveGame, resetGame, triggerRandomEvent, markNotificationsRead, clearNotifications } = useGame();
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showNewDayPopup, setShowNewDayPopup] = useState(false);
  const previousDaysPlayed = useRef(state.totalDaysPlayed);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const previousMoney = useRef(state.money);
  const [moneyAnimations, setMoneyAnimations] = useState<Array<{ id: number; amount: number; swoopX: number; swoopY: number }>>([]);
  const [walletPulsing, setWalletPulsing] = useState(false);
  const [activeTab, setActiveTab] = useState('shop');

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

  const handleOpenNotifications = () => {
    setShowNotificationPanel(!showNotificationPanel);
    if (!showNotificationPanel && unreadNotificationCount > 0) {
      markNotificationsRead();
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your game? All progress will be lost!')) {
      resetGame();
    }
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

  return (
    <div className="min-h-screen paper-texture relative">
      {/* Atmospheric background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-primary/6 to-transparent blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-secondary/6 to-transparent blur-3xl" />
        <div className="absolute top-[25%] right-[2%] w-[28vw] h-[28vw] rounded-full bg-gradient-to-bl from-violet-500/4 to-transparent blur-2xl" />
      </div>

      {/* Header - Glass morphism */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/30 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-xl shadow-sm ring-1 ring-primary/10">
                <PawPrint className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl md:text-2xl font-serif font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary to-chart-5 bg-clip-text text-transparent">Paws Up</span>
              </h1>
            </div>
            {state.pet && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-accent/40 backdrop-blur-sm rounded-full border border-accent-foreground/8">
                <span className="text-sm text-muted-foreground">Caring for</span>
                <span className="text-sm font-semibold text-foreground">{state.pet.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Budget Display */}
            <div
              ref={walletRef}
              className={cn(
                "hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/12 via-emerald-500/8 to-emerald-500/4 rounded-xl border border-emerald-500/20 shadow-sm",
                walletPulsing && "animate-wallet-pulse"
              )}
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span className="font-mono font-bold text-emerald-700 tracking-wide">${state.money.toFixed(0)}</span>
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notificationPanelRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenNotifications}
                className={cn(
                  "relative border-2 transition-all duration-200",
                  showNotificationPanel
                    ? "border-primary/50 bg-primary/5"
                    : "hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                <Bell className={cn("w-4 h-4", unreadNotificationCount > 0 ? "text-primary" : "text-muted-foreground")} />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg ring-2 ring-card notification-badge-pulse">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </Button>

              {/* Notification Dropdown */}
              {showNotificationPanel && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-up bg-card border border-border/50">
                  <div className="sticky top-0 bg-card/90 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center justify-between">
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
                            <span className="text-xl flex-shrink-0 mt-0.5">{notification.icon}</span>
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
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerEvent}
              className="hidden md:flex items-center gap-2 border-2 hover:border-violet-500/50 hover:bg-violet-500/5"
            >
              <Zap className="w-4 h-4 text-violet-500" />
              <span>Event</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={saveGame}
              className="flex items-center gap-2 border-2 hover:border-secondary/50 hover:bg-secondary/5"
            >
              <Save className="w-4 h-4 text-secondary" />
              <span className="hidden md:inline">Save</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Pet Status - left of pet on xl, above pet on lg */}
          <div className="hidden xl:block xl:col-span-1 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <SidePanel />
          </div>

          {/* Pet Display */}
          <div className="lg:col-span-1 xl:col-span-1">
            <div className="animate-fade-in-up">
              <PetDisplay onXpClick={() => setActiveTab('tasks')} />
            </div>
            {/* SidePanel below pet on lg, hidden on xl (shown in its own column) */}
            <div className="mt-5 xl:hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <SidePanel />
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2 xl:col-span-3 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-6 mb-5 glass-card p-1.5 rounded-2xl h-auto shadow-md">
                <TabsTrigger
                  value="alerts"
                  className="group w-full flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3"
                >
                  <Bell className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Needs</span>
                  {needsAttentionCount > 0 && (
                    <span className="ml-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 group-data-[state=active]:bg-white group-data-[state=active]:text-rose-500 text-white text-[10px] font-bold rounded-full">
                      {needsAttentionCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="shop"
                  className="w-full flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3"
                >
                  <Store className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Shop</span>
                </TabsTrigger>
                <TabsTrigger
                  value="games"
                  className="w-full flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-violet-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Games</span>
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="group w-full flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Tasks</span>
                  {state.dailyTasks.some(task => task.completed) && !state.dailyBonusClaimed && (
                    <span className="ml-1 w-2.5 h-2.5 rounded-full bg-orange-500 group-data-[state=active]:bg-white" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="finance"
                  className="w-full flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Finance</span>
                </TabsTrigger>
                <TabsTrigger
                  value="achievements"
                  className="w-full flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-sky-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Awards</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="alerts" className="mt-0 h-full">
                <NotificationsPanel />
              </TabsContent>

              <TabsContent value="shop" className="mt-0">
                <Shop />
              </TabsContent>

              <TabsContent value="games" className="mt-0">
                <MiniGames />
              </TabsContent>

              <TabsContent value="tasks" className="mt-0">
                <Tasks />
              </TabsContent>

              <TabsContent value="finance" className="mt-0">
                <FinancePanel />
              </TabsContent>

              <TabsContent value="achievements" className="mt-0">
                <Achievements />
              </TabsContent>
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

      {/* Event Modal */}
      <EventModal />

      {/* Footer */}
      <footer className="border-t border-border/30 glass-card mt-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-400 shadow-sm shadow-rose-400/40" />
                <span>Stats above 30%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-violet-400 shadow-sm shadow-violet-400/40" />
                <span>Play games for money</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/40" />
                <span>Streaks = bonuses</span>
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground/50 font-mono tracking-wide">
              Day {state.totalDaysPlayed} of your adventure
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GameDashboard;
