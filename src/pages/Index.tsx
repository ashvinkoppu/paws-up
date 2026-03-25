/**
 * Index - Landing page shown to unauthenticated visitors.
 *
 * Displays marketing copy, feature highlights, and call-to-action buttons for
 * Login and Sign Up. Authenticated users are immediately redirected to
 * /dashboard so they never see this page after logging in.
 *
 * @module pages/Index
 */
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { PawPrint, Sparkles, Heart, Coins, Gamepad2, Award, LogIn, UserPlus } from 'lucide-react';

const Index: React.FC = () => {
  const { session, loading } = useAuth();

  if (!loading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    { icon: Heart, label: 'Nurture', description: 'Care for your companion', color: 'chart-2', bg: 'bg-chart-2/10', border: 'border-chart-2/20', text: 'text-chart-2' },
    { icon: Coins, label: 'Budget', description: 'Manage your finances', color: 'chart-1', bg: 'bg-chart-1/10', border: 'border-chart-1/20', text: 'text-chart-1' },
    { icon: Gamepad2, label: 'Play', description: 'Earn through games', color: 'chart-3', bg: 'bg-chart-3/10', border: 'border-chart-3/20', text: 'text-chart-3' },
    { icon: Award, label: 'Achieve', description: 'Unlock rewards', color: 'secondary', bg: 'bg-secondary/10', border: 'border-secondary/20', text: 'text-secondary' },
  ];

  return (
    <div className="min-h-screen flex flex-col paper-texture relative overflow-hidden">
      {/* Atmospheric background layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-primary/8 via-primary/4 to-transparent blur-3xl animate-breathe" />
        <div
          className="absolute bottom-[-20%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-secondary/8 via-secondary/4 to-transparent blur-3xl animate-breathe"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute top-[20%] right-[0%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-bl from-accent/30 via-accent/10 to-transparent blur-2xl animate-breathe"
          style={{ animationDelay: '1s' }}
        />
        <div className="absolute top-[15%] left-[12%] text-primary/10 text-3xl animate-gentle-drift" style={{ animationDelay: '0s' }}>
          🐾
        </div>
        <div className="absolute top-[25%] right-[15%] text-secondary/10 text-2xl animate-gentle-drift" style={{ animationDelay: '2s' }}>
          🐾
        </div>
        <div className="absolute bottom-[25%] left-[8%] text-chart-1/10 text-4xl animate-gentle-drift" style={{ animationDelay: '4s' }}>
          🐾
        </div>
        <div className="absolute bottom-[20%] right-[20%] text-chart-2/10 text-2xl animate-gentle-drift" style={{ animationDelay: '6s' }}>
          🐾
        </div>
        <div className="absolute top-[30%] left-[25%] w-2 h-2 rounded-full bg-primary/40 animate-sparkle" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[18%] right-[30%] w-1.5 h-1.5 rounded-full bg-chart-3/50 animate-sparkle" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[35%] left-[18%] w-2.5 h-2.5 rounded-full bg-secondary/40 animate-sparkle" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[50%] right-[12%] w-2 h-2 rounded-full bg-chart-2/40 animate-sparkle" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-[15%] right-[35%] w-1.5 h-1.5 rounded-full bg-accent-foreground/20 animate-sparkle" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Top nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <PawPrint className="w-6 h-6 text-primary" />
          <span className="text-xl font-serif font-bold bg-gradient-to-br from-primary to-chart-5 bg-clip-text text-transparent">Paws Up</span>
        </div>
        <div className="flex items-center gap-3">
          <>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="rounded-xl gap-1.5">
                <LogIn className="w-4 h-4" />
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="default" size="sm" className="rounded-xl gap-1.5">
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Button>
            </Link>
          </>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="max-w-2xl w-full text-center flex flex-col items-center justify-center">
          <div className="mb-10 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-card rounded-full text-sm font-medium text-accent-foreground mb-6 shadow-sm">
              <PawPrint className="w-4 h-4 text-primary" />
              <span>A cozy pet care adventure</span>
              <span className="animate-sparkle inline-block">✨</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-5 tracking-tight">
              <span className="bg-gradient-to-br from-primary via-primary to-chart-5 bg-clip-text text-transparent drop-shadow-sm">Paws Up</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed font-light">Adopt a furry friend and learn the art of caring while managing your budget wisely.</p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 w-full">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="animate-fade-in-up h-full" style={{ animationDelay: `${0.15 + index * 0.08}s` }}>
                  <Card
                    className={`h-full border ${feature.border} ${feature.bg} backdrop-blur-sm hover:scale-[1.04] hover:-translate-y-1 transition-all duration-300 cursor-default shadow-sm hover:shadow-lg rounded-2xl`}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center gap-2.5">
                      <div className={`p-3 rounded-2xl bg-white/50 shadow-sm ${feature.text} ring-1 ring-white/20`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${feature.text}`}>{feature.label}</p>
                        <p className="text-[11px] text-muted-foreground/80 leading-snug mt-0.5">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="w-full max-w-md space-y-3 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <Link to={session ? '/dashboard' : '/signup'} className="block">
              <Button
                size="lg"
                className="w-full text-lg h-16 rounded-2xl bg-gradient-to-r from-primary to-chart-5 hover:from-primary/90 hover:to-chart-5/90 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group btn-press font-semibold tracking-wide"
              >
                <Sparkles className="w-5 h-5 mr-2.5 group-hover:animate-pulse" />
                Get Started
              </Button>
            </Link>
          </div>

          {/* Footer links */}
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
