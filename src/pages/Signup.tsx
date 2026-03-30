import React, { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Signup: React.FC = () => {
  const { session, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Accent top line */}
      <div className="h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 w-full" />

      {/* Navbar */}
      <nav
        className={`border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50 transition-all duration-300 ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif text-xl font-bold text-foreground tracking-tight">Paws Up</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">Already have an account?</span>
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-9 px-4 font-medium"
              >
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-0 right-0 w-[700px] h-[600px] bg-primary/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4.5rem)] px-6 py-16">
        <div
          className="w-full max-w-md"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0px)' : 'translateY(24px)',
            transition: 'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.05s, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.05s',
          }}
        >
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight leading-[1.1] mb-3">
              Create your account
            </h1>
            <p className="text-lg text-muted-foreground">
              Start your pet care{' '}
              <span className="text-primary italic">adventure.</span>
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6">
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
              view="sign_up"
              showLinks={true}
              redirectTo={`${window.location.origin}/dashboard`}
            />
          </div>

          <div className="flex items-center justify-center gap-5 mt-8 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <span className="text-border">·</span>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-7 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PawPrint className="w-4 h-4" />
            <span className="font-medium">Paws Up</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
