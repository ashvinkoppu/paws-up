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
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('paws-up-save');
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
    { icon: Heart, label: 'Nurture', description: 'Care for your companion', color: 'chart-2', bg: 'bg-chart-2/10', border: 'border-chart-2/20', text: 'text-chart-2' },
    { icon: Coins, label: 'Budget', description: 'Manage your finances', color: 'chart-1', bg: 'bg-chart-1/10', border: 'border-chart-1/20', text: 'text-chart-1' },
    { icon: Gamepad2, label: 'Play', description: 'Earn through games', color: 'chart-3', bg: 'bg-chart-3/10', border: 'border-chart-3/20', text: 'text-chart-3' },
    { icon: Award, label: 'Achieve', description: 'Unlock rewards', color: 'secondary', bg: 'bg-secondary/10', border: 'border-secondary/20', text: 'text-secondary' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 paper-texture relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-primary/5 blob-shape animate-breathe" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] bg-secondary/5 blob-shape animate-breathe" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[30%] right-[5%] w-[20vw] h-[20vw] bg-accent/40 blob-shape animate-breathe" style={{ animationDelay: '1s' }} />

      {/* Mini circles matching button colors */}
      <div className="absolute top-[18%] left-[15%] w-16 h-16 rounded-full bg-chart-2/20 blur-[1px] animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-[12%] right-[18%] w-20 h-20 rounded-full bg-chart-1/20 blur-[1px] animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-[20%] left-[8%] w-24 h-24 rounded-full bg-chart-3/20 blur-[1px] animate-float" style={{ animationDelay: '2.5s' }} />
      <div className="absolute bottom-[15%] right-[25%] w-14 h-14 rounded-full bg-secondary/20 blur-[1px] animate-float" style={{ animationDelay: '3.5s' }} />
      
      {/* Smaller accents */}
      <div className="absolute top-[40%] left-[5%] w-8 h-8 rounded-full bg-chart-1/30 animate-float" style={{ animationDelay: '4s' }} />
      <div className="absolute top-[60%] right-[8%] w-10 h-10 rounded-full bg-chart-2/30 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[35%] left-[20%] w-6 h-6 rounded-full bg-secondary/30 animate-float" style={{ animationDelay: '1s' }} />

      <div className="max-w-2xl w-full text-center relative z-10 flex flex-col items-center justify-center min-h-[80vh]">
        {/* Title with decorative elements */}
        <div className="mb-8 animate-fade-in-up">
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

        {/* Feature Buttons - Uniform Size & Colored */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 w-full">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="animate-fade-in-up h-full"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <Card className={`h-full border-2 ${feature.bg} ${feature.border} hover:scale-105 transition-all duration-300 cursor-default`}>
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center gap-2">
                    <div className={`p-2.5 rounded-full bg-white/60 shadow-sm ${feature.text}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`font-bold ${feature.text}`}>{feature.label}</p>
                      <p className="text-xs text-muted-foreground/80 leading-tight">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Centered Action Section */}
        <div className="w-full max-w-md space-y-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <Button
            size="lg"
            className="w-full text-lg h-16 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
            onClick={handleNewGame}
          >
            <Sparkles className="w-6 h-6 mr-2 group-hover:animate-pulse" />
            Start New Adventure
          </Button>

          {hasSave && (
            <Button
              size="lg"
              variant="outline"
              className="w-full text-lg h-14 rounded-2xl border-2 hover:bg-accent/50 transition-all duration-300"
              onClick={handleContinue}
            >
              <Play className="w-5 h-5 mr-2" />
              Continue Your Story
            </Button>
          )}
        </div>


        
      </div>
    </div>
  );
};

export default Index;
