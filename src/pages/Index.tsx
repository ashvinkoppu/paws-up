import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PetCreationWizard from '@/components/PetCreationWizard';
import GameDashboard from '@/components/GameDashboard';
import { PawPrint, Play, Sparkles, Heart, Coins, Gamepad2, Award } from 'lucide-react';


const Index: React.FC = () => {
  const { state, loadGame, resetGame } = useGame();
  const [showCreation, setShowCreation] = useState(false);
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('paws-and-prosper-save');
    setHasSave(!!saved);
  }, []);

  const handleContinue = () => {
    loadGame();
  };

  const handleNewGame = () => {
    resetGame();
    setShowCreation(true);
  };

  if (state.gameStarted && state.pet) {
    return <GameDashboard />;
  }

  if (showCreation) {
    return <PetCreationWizard onComplete={() => setShowCreation(false)} />;
  }

  const features = [
    { icon: Heart, label: 'Nurture', description: 'Care for your companion', color: 'text-chart-2' },
    { icon: Coins, label: 'Budget', description: 'Manage your finances', color: 'text-chart-1' },
    { icon: Gamepad2, label: 'Play', description: 'Earn through games', color: 'text-chart-3' },
    { icon: Award, label: 'Achieve', description: 'Unlock rewards', color: 'text-secondary' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 paper-texture relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-primary/5 blob-shape animate-breathe" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] bg-secondary/5 blob-shape animate-breathe" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[30%] right-[5%] w-[20vw] h-[20vw] bg-accent/40 blob-shape animate-breathe" style={{ animationDelay: '1s' }} />

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Title with decorative elements */}
        <div className="mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/60 rounded-full text-sm font-medium text-accent-foreground mb-4">
            <PawPrint className="w-4 h-4" />
            <span>A cozy pet care adventure</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 tracking-tight text-primary">
            Paws Up
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
            Adopt a furry friend and learn the art of caring while managing your budget wisely.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <Card className="bg-card/70 backdrop-blur-sm border-2 border-border/50 hover:border-primary/30 transition-all duration-300 card-hover">
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex p-3 rounded-2xl bg-background/80 mb-3 ${feature.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-foreground">{feature.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Action Card */}
        <Card
          className="bg-card/90 backdrop-blur-sm border-2 border-border shadow-xl animate-fade-in-up decorative-border"
          style={{ animationDelay: '0.5s' }}
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl">
              <div className="p-2 bg-primary/10 rounded-xl">
                <PawPrint className="w-6 h-6 text-primary" />
              </div>
              <span>Begin Your Journey</span>
            </CardTitle>
            <CardDescription className="text-base">
              Your new companion is waiting to meet you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-8">
            <Button
              size="lg"
              className="w-full text-lg h-14 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={handleNewGame}
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Start New Adventure
            </Button>

            {hasSave && (
              <Button
                size="lg"
                variant="outline"
                className="w-full text-lg h-14 border-2 hover:bg-accent/50 transition-all duration-300"
                onClick={handleContinue}
              >
                <Play className="w-5 h-5 mr-2" />
                Continue Your Story
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Tips Section */}
        <div className="mt-10 p-6 rounded-2xl bg-accent/30 border border-border/50 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <p className="text-sm font-medium text-foreground mb-3">Quick Tips to Get Started</p>
          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">01</span>
              <span>Keep stats above 30%</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">02</span>
              <span>$100 start + $150/week</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">03</span>
              <span>Play games for extra cash</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">04</span>
              <span>Progress saves automatically</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
