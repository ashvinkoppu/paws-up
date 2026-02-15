/**
 * @file ProtectedRoute.tsx
 *
 * Route guard that restricts access to authenticated users and guest-mode
 * players. Wraps child routes and checks two conditions:
 *   1. The user has an active Supabase session (logged in), OR
 *   2. The game state has `isGuestMode` enabled (playing without an account).
 *
 * If neither condition is met, the user is redirected to `/login`.
 * While the auth session is still loading, a centered loading indicator is
 * shown to prevent a flash of the login redirect.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();
  const { state } = useGame();

  // Show a loading state while Supabase resolves the session to avoid
  // an incorrect redirect to /login before auth state is known.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Allow access if user is logged in OR in guest mode
  if (!session && !state.isGuestMode) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
