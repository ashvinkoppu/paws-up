import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PetDisplay from '@/components/PetDisplay';
import PetStats from '@/components/PetStats';
import ActionButtons from '@/components/ActionButtons';
import Shop from '@/components/Shop';
import FinancePanel from '@/components/FinancePanel';
import MiniGames from '@/components/MiniGames';
import Achievements from '@/components/Achievements';
import EventModal from '@/components/EventModal';
import { Save, RotateCcw, Zap, Store, Gamepad2, Trophy, Wallet, PawPrint } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const GameDashboard: React.FC = () => {
  const { state, saveGame, resetGame, triggerRandomEvent } = useGame();

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

  return (
    <div className="min-h-screen paper-texture relative">
      {/* Subtle decorative elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[40vw] h-[40vw] bg-primary/3 blob-shape" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[45vw] h-[45vw] bg-secondary/3 blob-shape" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/85 backdrop-blur-md border-b-2 border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <PawPrint className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl md:text-2xl font-serif font-bold tracking-tight">
                <span className="text-primary">Paws</span>
                <span className="text-foreground/30 mx-1">&</span>
                <span className="text-secondary">Prosper</span>
              </h1>
            </div>
            {state.pet && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-full">
                <span className="text-sm text-muted-foreground">Caring for</span>
                <span className="text-sm font-semibold text-foreground">{state.pet.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Budget Display */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-xl border border-border/50">
              <Wallet className="w-4 h-4 text-chart-1" />
              <span className="font-mono font-semibold text-foreground">${state.money.toFixed(0)}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerEvent}
              className="hidden md:flex items-center gap-2 border-2 hover:border-primary/50 hover:bg-primary/5"
            >
              <Zap className="w-4 h-4 text-chart-3" />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Pet & Stats */}
          <div className="lg:col-span-1 space-y-5">
            <div className="animate-fade-in-up">
              <PetDisplay />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <PetStats />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <ActionButtons />
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <Tabs defaultValue="shop" className="h-full">
              <TabsList className="grid w-full grid-cols-4 mb-5 bg-card/80 border-2 border-border/50 p-1.5 rounded-2xl">
                <TabsTrigger
                  value="shop"
                  className="flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  <Store className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Shop</span>
                </TabsTrigger>
                <TabsTrigger
                  value="games"
                  className="flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Games</span>
                </TabsTrigger>
                <TabsTrigger
                  value="finance"
                  className="flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Finance</span>
                </TabsTrigger>
                <TabsTrigger
                  value="achievements"
                  className="flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Awards</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="shop" className="mt-0">
                <Shop />
              </TabsContent>

              <TabsContent value="games" className="mt-0">
                <MiniGames />
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

      {/* Event Modal */}
      <EventModal />

      {/* Footer */}
      <footer className="border-t-2 border-border/50 bg-card/50 backdrop-blur-sm mt-8">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-1" />
                <span>Stats above 30%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-3" />
                <span>Play games for money</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span>Streaks = bonuses</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground/60">
              Day {state.totalDaysPlayed} of your adventure
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GameDashboard;
