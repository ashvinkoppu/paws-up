import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { PawPrint, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Login: React.FC = () => {
  const { session, loading } = useAuth();
  const { setGuestMode } = useGame();
  const navigate = useNavigate();

  const handleGuestMode = () => {
    setGuestMode(true);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 paper-texture relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-primary/8 via-primary/4 to-transparent blur-3xl animate-breathe" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-secondary/8 via-secondary/4 to-transparent blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <PawPrint className="w-8 h-8 text-primary" />
            <span className="text-2xl font-serif font-bold bg-gradient-to-br from-primary to-chart-5 bg-clip-text text-transparent">
              Paws Up
            </span>
          </Link>
          <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to continue your adventure</p>
        </div>

        <div className="glass-card rounded-2xl p-6 shadow-xl">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '0.75rem',
                    buttonBorderRadius: '0.75rem',
                    inputBorderRadius: '0.75rem',
                  },
                },
              },
            }}
            providers={['google']}
            view="sign_in"
            showLinks={true}
            redirectTo={`${window.location.origin}/dashboard`}
          />
        </div>

        {/* Guest Mode Option */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground">or</span>
            </div>
          </div>
          <Button
            onClick={handleGuestMode}
            variant="outline"
            className="w-full mt-4 h-12 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
          >
            <User className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Continue Without Account</span>
          </Button>
          <p className="text-[11px] text-center text-muted-foreground/70 mt-2">
            Your progress will be saved locally only
          </p>
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>

        <div className="flex items-center justify-center gap-4 mt-8 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
