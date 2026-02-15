/**
 * AuthContext - Provides authentication state to the entire application.
 *
 * Wraps Supabase's auth session management in a React context so any
 * component can access the current user, session, loading flag, and a
 * sign-out helper via the {@link useAuth} hook.
 *
 * On mount the provider fetches the initial session and subscribes to
 * Supabase `onAuthStateChange` events so the context stays in sync with
 * OAuth redirects, token refreshes, and manual sign-outs.
 *
 * @module context/AuthContext
 */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/** Shape of the value provided by AuthContext */
interface AuthContextType {
  /** The current Supabase session (null when signed out) */
  session: Session | null;
  /** Convenience accessor for session.user */
  user: User | null;
  /** True while the initial session is being fetched */
  loading: boolean;
  /** Signs the user out of Supabase */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
