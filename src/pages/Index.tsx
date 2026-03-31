/**
 * Index - Landing page shown to unauthenticated visitors.
 *
 * Authenticated users are immediately redirected to /dashboard.
 *
 * @module pages/Index
 */
import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useScrolled } from "@/hooks/use-scroll-state";
import AnimatedSection from "@/components/layout/AnimatedSection";
import PublicFooter from "@/components/layout/PublicFooter";
import { PawPrint, ArrowRight } from "lucide-react";

// ── Product mockup ─────────────────────────────────────────────────────────────
const ProductMockup: React.FC = () => (
  <div className="relative">
    <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />
    <div className="relative rounded-xl overflow-hidden border border-zinc-200 shadow-2xl shadow-zinc-200">
      {/* Browser chrome */}
      <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
        </div>
        <div className="flex-1 bg-white rounded border border-zinc-200 px-3 py-0.5 text-xs text-zinc-400">
          pawsup.vercel.app/dashboard
        </div>
      </div>

      {/* Dashboard */}
      <div className="bg-zinc-50 p-3">
        {/* Header strip */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold text-zinc-800">Paws Up</span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-white border border-zinc-200 rounded-full text-[10px] font-mono font-bold text-zinc-700 tabular-nums">
              $120
            </div>
            <div className="flex items-center gap-0.5 px-2 py-0.5 bg-white border border-zinc-200 rounded-full text-[10px] text-zinc-500">
              ⚡ 3/5
            </div>
            <div className="flex items-center gap-0.5 px-2 py-0.5 bg-white border border-zinc-200 rounded-full text-[10px] text-zinc-500">
              ☀ Day 4
            </div>
          </div>
        </div>

        {/* Play / Manage toggle */}
        <div className="flex gap-1.5 mb-3">
          <div className="px-3 py-1 bg-primary text-white rounded-lg text-[10px] font-semibold">
            Play
          </div>
          <div className="px-3 py-1 bg-white border border-zinc-200 rounded-lg text-[10px] text-zinc-500">
            Manage
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {/* Pet column */}
          <div className="col-span-2 space-y-2">
            <div className="bg-white rounded-lg border border-zinc-200 p-2">
              <div className="w-full aspect-square bg-amber-50 rounded-lg flex items-center justify-center text-4xl mb-1.5 border border-amber-100">
                🐱
              </div>
              <p className="text-[10px] font-bold text-zinc-800 text-center leading-tight">
                Whiskers
              </p>
              <p className="text-[8px] text-zinc-400 text-center">Lv.3 Cat</p>
            </div>
          </div>

          {/* Stats + Tasks column */}
          <div className="col-span-3 space-y-2">
            {/* 5-stat vital signs */}
            <div className="bg-white rounded-lg border border-zinc-200 p-2 space-y-1.5">
              {[
                { label: "Hunger", width: "78%", color: "bg-orange-400" },
                { label: "Happy", width: "65%", color: "bg-yellow-400" },
                { label: "Energy", width: "82%", color: "bg-violet-400" },
                { label: "Clean", width: "55%", color: "bg-sky-400" },
                { label: "Health", width: "90%", color: "bg-emerald-400" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] text-zinc-500">
                      {stat.label}
                    </span>
                    <span className="text-[9px] text-zinc-400 tabular-nums">
                      {stat.width}
                    </span>
                  </div>
                  <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stat.color} rounded-full`}
                      style={{ width: stat.width }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Today's tasks */}
            <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
              <div className="px-2.5 py-1.5 border-b border-zinc-100">
                <p className="text-[9px] font-semibold text-zinc-600">
                  Today's Tasks
                </p>
              </div>
              {[
                { task: "Feed Whiskers", done: true },
                { task: "Play session", done: true },
                { task: "Grooming", done: false },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 ${index < 2 ? "border-b border-zinc-50" : ""}`}
                >
                  <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] shrink-0 ${
                      item.done
                        ? "bg-emerald-100 text-emerald-600"
                        : "border border-zinc-300"
                    }`}
                  >
                    {item.done ? "✓" : ""}
                  </div>
                  <p
                    className={`text-[10px] leading-tight ${item.done ? "text-zinc-400 line-through" : "text-zinc-700"}`}
                  >
                    {item.task}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ── Feature visuals ────────────────────────────────────────────────────────────
const CareLogVisual: React.FC = () => (
  <div className="bg-white rounded-xl border border-zinc-200 p-5">
    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">
      Care Actions
    </p>
    <div className="grid grid-cols-3 gap-2 mb-5">
      {[
        { emoji: "🍖", label: "Feed", stat: "Hunger", active: true },
        { emoji: "🏃", label: "Play", stat: "Happiness", active: false },
        { emoji: "🌙", label: "Rest", stat: "Energy", active: false },
        { emoji: "✨", label: "Clean", stat: "Cleanliness", active: true },
        { emoji: "💊", label: "Vet", stat: "Health", active: false },
      ].map((action) => (
        <div
          key={action.label}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${
            action.active
              ? "bg-primary/5 border-primary/20"
              : "bg-zinc-50 border-zinc-100"
          }`}
        >
          <span className="text-xl">{action.emoji}</span>
          <p className="text-[11px] font-medium text-zinc-700">
            {action.label}
          </p>
          <p className="text-[9px] text-zinc-400">{action.stat}</p>
        </div>
      ))}
    </div>
    <div className="space-y-2.5">
      {[
        { label: "Hunger", width: "78%", color: "bg-orange-400" },
        { label: "Energy", width: "45%", color: "bg-violet-400", low: true },
        { label: "Health", width: "90%", color: "bg-emerald-400" },
      ].map((stat) => (
        <div key={stat.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-500">{stat.label}</span>
            <span
              className={`text-xs tabular-nums ${stat.low ? "text-amber-500 font-medium" : "text-zinc-400"}`}
            >
              {stat.width}
            </span>
          </div>
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${stat.color} rounded-full`}
              style={{ width: stat.width }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const BudgetVisual: React.FC = () => (
  <div className="bg-white rounded-xl border border-zinc-200 p-5">
    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">
      Cost of Care Report
    </p>
    <div className="flex items-end justify-between mb-4">
      <div>
        <p className="text-3xl font-bold text-zinc-900 tabular-nums">$48.50</p>
        <p className="text-xs text-zinc-400 mt-0.5">spent this week</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-zinc-500">Weekly budget</p>
        <p className="text-sm font-semibold text-zinc-600 tabular-nums">
          $75.00
        </p>
      </div>
    </div>
    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden mb-1.5">
      <div
        className="h-full bg-primary/70 rounded-full"
        style={{ width: "65%" }}
      />
    </div>
    <p className="text-[10px] text-zinc-400 tabular-nums mb-4">
      65% of budget used - $26.50 remaining
    </p>
    <div className="space-y-2.5">
      {[
        {
          color: "bg-orange-400",
          label: "Hunger",
          value: "$18.00",
          pct: "37%",
        },
        { color: "bg-rose-400", label: "Health", value: "$15.50", pct: "32%" },
        { color: "bg-violet-400", label: "Energy", value: "$9.00", pct: "19%" },
        {
          color: "bg-sky-400",
          label: "Cleanliness",
          value: "$6.00",
          pct: "12%",
        },
      ].map((category) => (
        <div key={category.label} className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-sm shrink-0 ${category.color}`}
              />
              <span className="text-xs text-zinc-600">{category.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 tabular-nums">
                {category.pct}
              </span>
              <span className="text-xs font-medium text-zinc-600 tabular-nums w-12 text-right">
                {category.value}
              </span>
            </div>
          </div>
          <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${category.color} rounded-full`}
              style={{ width: category.pct }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AchievementsVisual: React.FC = () => (
  <div className="bg-white rounded-xl border border-zinc-200 p-5">
    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">
      Achievements
    </p>
    <div className="grid grid-cols-3 gap-2.5 mb-4">
      {[
        { emoji: "🏆", label: "First Pet", unlocked: true },
        { emoji: "💰", label: "Saver", unlocked: true },
        { emoji: "🎮", label: "Gamer", unlocked: true },
        { emoji: "⭐", label: "All-Star", unlocked: false },
        { emoji: "🌟", label: "Legend", unlocked: false },
        { emoji: "👑", label: "Champion", unlocked: false },
      ].map((achievement, index) => (
        <div
          key={index}
          className={`flex flex-col items-center gap-1 p-2.5 rounded-lg transition-colors ${achievement.unlocked ? "bg-amber-50 border border-amber-100" : "bg-zinc-50 border border-zinc-100 opacity-40"}`}
        >
          <span className="text-xl">{achievement.emoji}</span>
          <p className="text-[10px] text-zinc-600 text-center leading-tight">
            {achievement.label}
          </p>
        </div>
      ))}
    </div>
    <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-zinc-700">Level 3 → 4</p>
        <p className="text-xs text-zinc-500 tabular-nums">1,240 / 2,000 XP</p>
      </div>
      <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
        <div className="h-full w-[62%] bg-primary rounded-full" />
      </div>
    </div>
  </div>
);

// ── Page ───────────────────────────────────────────────────────────────────────
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
      {/* Accent top line */}
      <div className="h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 w-full" />

      {/* Navbar */}
      <nav
        className={`border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50 transition-all duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif text-xl font-bold text-foreground tracking-tight">
              Paws Up
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Features
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full rounded-full" />
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              How it works
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full rounded-full" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-9 px-4 font-medium"
              >
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                size="sm"
                className="h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-sm"
              >
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-border py-20 lg:py-28 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[700px] h-[600px] bg-primary/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative">
          <div>
            <div style={heroStyle(0.05)}>
              <div className="inline-flex items-center gap-2.5 text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-7 border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Virtual pet · Real budgeting skills
              </div>
            </div>
            <div style={heroStyle(0.18)}>
              <h1 className="font-serif text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] tracking-tight mb-6">
                Care for your pet.
                <br />
                Track every{" "}
                <span className="text-primary italic">dollar spent.</span>
              </h1>
            </div>
            <div style={heroStyle(0.3)}>
              <p className="text-xl text-muted-foreground leading-relaxed mb-9 max-w-md">
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
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-7 h-12 rounded-xl gap-2 font-semibold shadow-sm text-base"
                  >
                    Start for free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-muted-foreground hover:text-foreground px-7 h-12 text-base"
                  >
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div style={heroStyle(0.25)}>
            <ProductMockup />
          </div>
        </div>
      </section>

      {/* Feature 1: Care tracking */}
      <section id="features" className="border-b border-border py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <AnimatedSection direction="left">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
              Pet Care
            </p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground leading-[1.1] tracking-tight mb-5">
              Every meal, every game,
              <br />
              logged.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-7 max-w-sm">
              Track your pet's health, happiness, and hunger in real time. Set
              daily care routines and see exactly how your attention and
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
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </AnimatedSection>
          <AnimatedSection direction="right" delay={0.12}>
            <CareLogVisual />
          </AnimatedSection>
        </div>
      </section>

      {/* Feature 2: Budget */}
      <section
        id="how-it-works"
        className="border-b border-border py-20 lg:py-28 bg-accent/20"
      >
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <AnimatedSection direction="left" className="order-2 lg:order-1">
            <BudgetVisual />
          </AnimatedSection>
          <AnimatedSection
            direction="right"
            delay={0.12}
            className="order-1 lg:order-2"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
              Budget Tracking
            </p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground leading-[1.1] tracking-tight mb-5">
              See where your
              <br />
              money actually goes.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-7 max-w-sm">
              Every item you buy for your pet is logged as a transaction. Watch
              your balance, break down expenses by category, and understand your
              spending through play.
            </p>
            <ul className="space-y-3">
              {[
                "Full transaction history with categories and timestamps",
                "Spending breakdown across food, health, and fun",
                "Monthly budget tracking with remaining balance",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-base text-muted-foreground"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </AnimatedSection>
        </div>
      </section>

      {/* Feature 3: Earn & achieve */}
      <section className="border-b border-border py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <AnimatedSection direction="left">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
              Progression
            </p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground leading-[1.1] tracking-tight mb-5">
              Play mini-games.
              <br />
              Earn coins. Level up.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-7 max-w-sm">
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
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </AnimatedSection>
          <AnimatedSection direction="right" delay={0.12}>
            <AchievementsVisual />
          </AnimatedSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 lg:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/25 to-background pointer-events-none" />
        <AnimatedSection className="max-w-2xl mx-auto px-6 text-center relative">
          <div className="text-5xl mb-6">🐾</div>
          <h2 className="font-serif text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-5">
            Start your pet care journey
          </h2>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Create a free account and adopt your first pet today.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-9 h-12 rounded-xl text-base gap-2 font-semibold shadow-sm"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </AnimatedSection>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Index;
