/**
 * Index - Landing page shown to unauthenticated visitors.
 *
 * Authenticated users are immediately redirected to /dashboard.
 *
 * @module pages/Index
 */
import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/layout/AnimatedSection";
import PublicFooter from "@/components/layout/PublicFooter";
import { useAuth } from "@/context/AuthContext";
import { useScrolled } from "@/hooks/use-scroll-state";
import { cn } from "@/lib/utils";

const ScreenshotPreview: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => (
  <div className={cn("relative w-full", className)}>
    <div className="pointer-events-none absolute inset-x-[12%] bottom-3 top-8 rounded-full bg-primary/10 blur-3xl" />
    <div className="relative rounded-[32px] border border-border/90 bg-[#fff9f3] p-1.5 shadow-[0_28px_70px_-44px_rgba(108,72,45,0.42)]">
      <div
        className="overflow-hidden rounded-[28px]"
        style={{ clipPath: "inset(0 round 28px)" }}
      >
        <img
          src={src}
          alt={alt}
          className="block h-auto w-full rounded-[28px]"
        />
      </div>
    </div>
  </div>
);

const Index: React.FC = () => {
  const { session, loading } = useAuth();
  const scrolled = useScrolled();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(timer);
  }, []);

  if (!loading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  const heroStyle = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0px)" : "translateY(24px)",
    transition: `opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

      <nav
        className={`sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm transition-all duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <PawPrint className="h-5 w-5 text-primary" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-foreground">
              Paws Up
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="group relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
              <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-200 group-hover:w-full" />
            </a>
            <a
              href="#how-it-works"
              className="group relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
              <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-200 group-hover:w-full" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-4 font-medium text-muted-foreground hover:text-foreground"
              >
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                size="sm"
                className="h-9 rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-border py-20 lg:py-28">
        <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[700px] -translate-y-1/3 translate-x-1/4 rounded-full bg-primary/6 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[500px] -translate-x-1/4 translate-y-1/3 rounded-full bg-secondary/5 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)] lg:gap-14">
          <div>
            <div style={heroStyle(0.05)}>
              <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Virtual pet · Real budgeting skills
              </div>
            </div>
            <div style={heroStyle(0.18)}>
              <h1 className="mb-6 font-serif text-6xl font-bold leading-[1.05] tracking-tight text-foreground lg:text-7xl">
                Care for your pet.
                <br />
                Track every <span className="italic text-primary">dollar spent.</span>
              </h1>
            </div>
            <div style={heroStyle(0.3)}>
              <p className="mb-9 max-w-md text-xl leading-relaxed text-muted-foreground">
                Paws Up is a virtual pet game that makes budgeting tangible.
                Adopt a companion, manage their care, and build real financial
                habits through play.
              </p>
            </div>
            <div style={heroStyle(0.42)}>
              <div className="flex items-center gap-3">
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="h-12 gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                  >
                    Start for free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="h-12 px-7 text-base text-muted-foreground hover:text-foreground"
                  >
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div style={heroStyle(0.25)} className="lg:justify-self-end">
            <ScreenshotPreview
              src="/landing-home.png"
              alt="Paws Up dashboard preview"
              className="max-w-[620px]"
            />
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-border py-20 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <AnimatedSection direction="left">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              Pet Care
            </p>
            <h2 className="mb-5 font-serif text-4xl font-bold leading-[1.1] tracking-tight text-foreground lg:text-5xl">
              Every meal, every game,
              <br />
              logged.
            </h2>
            <p className="mb-7 max-w-sm text-lg leading-relaxed text-muted-foreground">
              Track your pet&apos;s health, happiness, and hunger in real time.
              Set daily care routines and see exactly how your attention and
              spending affect your companion.
            </p>
            <ul className="space-y-3">
              {[
                "Health, happiness & hunger metrics updated in real time",
                "Daily care task checklist with completion tracking",
                "Pet mood shifts based on how often you check in",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-base text-muted-foreground"
                >
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </AnimatedSection>
          <AnimatedSection direction="right" delay={0.12}>
            <ScreenshotPreview
              src="/landing-health.png"
              alt="Pet health preview"
              className="max-w-[680px] lg:ml-auto"
            />
          </AnimatedSection>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-b border-border bg-accent/20 py-20 lg:py-28"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <AnimatedSection direction="left" className="order-2 lg:order-1">
            <ScreenshotPreview
              src="/landing-report.png"
              alt="Cost of care report preview"
              className="max-w-[680px]"
            />
          </AnimatedSection>
          <AnimatedSection
            direction="right"
            delay={0.12}
            className="order-1 lg:order-2"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              Budget Tracking
            </p>
            <h2 className="mb-5 font-serif text-4xl font-bold leading-[1.1] tracking-tight text-foreground lg:text-5xl">
              See where your
              <br />
              money actually goes.
            </h2>
            <p className="mb-7 max-w-sm text-lg leading-relaxed text-muted-foreground">
              Every item you buy for your pet is logged as a transaction. Watch
              your balance, break down expenses by category, and understand your
              spending through play.
            </p>
            <ul className="space-y-3">
              {[
                "Full transaction history with categories and timestamps",
                "Spending breakdown across food, health, and fun",
                "Weekly budget tracking with remaining balance",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-base text-muted-foreground"
                >
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </AnimatedSection>
        </div>
      </section>

      <section className="border-b border-border py-20 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <AnimatedSection direction="left">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              Progression
            </p>
            <h2 className="mb-5 font-serif text-4xl font-bold leading-[1.1] tracking-tight text-foreground lg:text-5xl">
              Play mini-games.
              <br />
              Earn coins. Level up.
            </h2>
            <p className="mb-7 max-w-sm text-lg leading-relaxed text-muted-foreground">
              Mini-games reward you with coins you can spend on your pet. Unlock
              achievements as you hit milestones. The more you play, the more
              your pet thrives.
            </p>
            <ul className="space-y-3">
              {[
                "Mini-games that pay out coins you actually spend",
                "Achievement system tied to real care milestones",
                "Level progression with unlockable items and pets",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-base text-muted-foreground"
                >
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </AnimatedSection>
          <AnimatedSection direction="right" delay={0.12}>
            <ScreenshotPreview
              src="/landing-progress.png"
              alt="Level and tasks preview"
              className="max-w-[680px] lg:ml-auto"
            />
          </AnimatedSection>
        </div>
      </section>

      <section className="relative overflow-hidden py-24 lg:py-36">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent/25 to-background" />
        <AnimatedSection className="relative mx-auto max-w-2xl px-6 text-center">
          <div className="mb-6 text-5xl">🐾</div>
          <h2 className="mb-5 font-serif text-5xl font-bold leading-[1.1] tracking-tight text-foreground lg:text-6xl">
            Start your pet care journey
          </h2>
          <p className="mb-10 text-xl leading-relaxed text-muted-foreground">
            Create a free account and adopt your first pet today.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="h-12 gap-2 rounded-xl bg-primary px-9 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </AnimatedSection>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Index;
