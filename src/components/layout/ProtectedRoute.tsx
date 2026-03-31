/**
 * @file ProtectedRoute.tsx
 *
 * Route guard that restricts access to authenticated users.
 * Redirects to `/login` if no active Supabase session exists.
 * Shows a loading indicator while auth state is resolving.
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { session, loading } = useAuth();

  // Show a loading state while Supabase resolves the session to avoid
  // an incorrect redirect to /login before auth state is known.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
