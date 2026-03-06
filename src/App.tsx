/**
 * App - Root component that assembles the application's provider hierarchy
 * and defines the client-side route map.
 *
 * Provider nesting order (outermost → innermost):
 *  1. {@link ErrorBoundary} – catches uncaught render errors.
 *  2. QueryClientProvider – powers react-query data fetching.
 *  3. TooltipProvider – shadcn/ui tooltip context.
 *  4. {@link AuthProvider} – Supabase session state.
 *  5. {@link GameProvider} – virtual-pet game state & actions.
 *  6. BrowserRouter – react-router client-side navigation.
 *
 * Routes:
 *  - `/`          → Landing page (Index)
 *  - `/login`     → Login form
 *  - `/signup`    → Registration form
 *  - `/dashboard` → Protected game dashboard
 *  - `/privacy`   → Privacy policy
 *  - `/terms`     → Terms of service
 *  - `/faq`       → Frequently asked questions
 *  - `*`          → 404 catch-all
 *
 * @module App
 */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { GameProvider } from "@/context/GameContext";
import ErrorBoundary from "./components/layout/ErrorBoundary";
import ScrollToTop from "./components/layout/ScrollToTop";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FAQ from "./pages/FAQ";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Park from "./pages/Park";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <GameProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/faq" element={<FAQ />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/park"
                  element={
                    <ProtectedRoute>
                      <Park />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </GameProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

