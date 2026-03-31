/**
 * FAQ - Frequently asked questions page.
 *
 * @module pages/FAQ
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LucideIcon } from "lucide-react";
import {
  PawPrint,
  ChevronDown,
  Search,
  MessageCircle,
  LayoutGrid,
  Rocket,
  Wallet,
  Gamepad2,
  UserRound,
} from "lucide-react";
import FAQChatbot from "@/components/chat/FAQChatbot";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useScrolled } from "@/hooks/use-scroll-state";
import AnimatedSection from "@/components/layout/AnimatedSection";
import PublicFooter from "@/components/layout/PublicFooter";

// ── Types ──────────────────────────────────────────────────────────────────────
interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
}

// ── Page ───────────────────────────────────────────────────────────────────────
const FAQ: React.FC = () => {
  const { user } = useAuth();
  const [openItems, setOpenItems] = useState<number[]>([1]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [mounted, setMounted] = useState(false);
  const scrolled = useScrolled();

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const heroStyle = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0px)" : "translateY(24px)",
    transition: `opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
  });

  const categories: Category[] = [
    { id: "all", label: "All questions", icon: LayoutGrid },
    { id: "getting-started", label: "Getting Started", icon: Rocket },
    { id: "pet-care", label: "Pet Care", icon: PawPrint },
    { id: "finances", label: "Money & Shop", icon: Wallet },
    { id: "games", label: "Mini-games", icon: Gamepad2 },
    { id: "account", label: "Account", icon: UserRound },
  ];

  const faqs: FAQItem[] = [
    {
      id: 1,
      question: "How do I get started with Paws Up?",
      answer:
        "Welcome to Paws Up! Getting started is easy:\n\n1. Create an account using **email or Google sign-in**\n2. Choose your virtual pet companion\n3. Give your pet a name and customize their appearance\n4. Start taking care of your pet and managing your virtual finances\n\nThe tutorial walks you through the main dashboard, daily tasks, and the first few care actions.",
      category: "getting-started",
    },
    {
      id: 11,
      question: "What are achievements and how do I unlock them?",
      answer:
        "Achievements are fixed milestones tied to real game progress. You unlock them by doing things like adopting your first pet, building care streaks, reaching teen and adult growth stages, maxing out your pet's stats, saving up money, recovering from a health scare, staying under budget, and winning mini-games.\n\nEach achievement gives you a **$10 bonus** when it unlocks.",
      category: "getting-started",
    },
    {
      id: 13,
      question: "How do daily tasks work?",
      answer:
        "You get **5 daily tasks** each day. The game picks a mix of easy and hard tasks from actions like feeding, playing, cleaning, resting, shopping, spending, mini-games, and vet care.\n\nSome hard tasks are timed for **10 minutes**, and one task each day can award a **shop discount** instead of just XP. If you finish all daily tasks, you can claim the daily bonus for **+30 XP and +$20**.",
      category: "getting-started",
    },
    {
      id: 15,
      question: "Is Paws Up free to play?",
      answer:
        "Yes, Paws Up is completely free to play! All game features are accessible without any real-money purchases. Earn virtual currency through gameplay and use it to care for your pet and unlock new items.",
      category: "getting-started",
    },
    {
      id: 2,
      question: "What types of pets can I adopt?",
      answer:
        "Right now you can adopt **dogs, cats, rabbits, and hamsters**. Every pet starts in the baby stage, and you can personalize them with a name, color, gender, and personality during setup.",
      category: "pet-care",
    },
    {
      id: 3,
      question: "How do I keep my pet happy and healthy?",
      answer:
        "Keep an eye on the five stats: **Hunger, Happiness, Cleanliness, Health, and Energy**. Feeding, playing, resting, cleaning, and vet care all use matching items from your inventory, so buy supplies from the shop first.\n\nSleeping helps recover several stats, and missing breakfast, lunch, or dinner windows causes a bigger hunger drop. Watching the stat bars regularly is the best way to stay ahead.",
      category: "pet-care",
    },
    {
      id: 7,
      question: "Can I customize my pet?",
      answer:
        "Yes. During pet creation you choose your pet's **species, name, color palette, gender, and personality**.\n\nAfter that, the **Wardrobe** lets you buy and equip accessories for the **head, neck, body, and tag** slots. Some accessories are filtered by gender, and a few only show when your pet's stats are high enough.",
      category: "pet-care",
    },
    {
      id: 8,
      question: "What happens if I neglect my pet?",
      answer:
        "Your pet's stats decay over time, and missed meal windows make **Hunger** drop faster. Low stats can make your pet act **sluggish, sad, grumpy, or disobedient**.\n\nYou can usually recover by caring for them, but extreme neglect can eventually lead to pet death if **all five stats** fall critically low. The game shows in-app warning notifications when things get dangerous.",
      category: "pet-care",
    },
    {
      id: 14,
      question: "What do the different stats mean?",
      answer:
        "Your pet has five main stats:\n\n• **Hunger**: How full your pet is - feed regularly!\n• **Happiness**: Your pet's mood - play and give treats\n• **Cleanliness**: How clean your pet is - bathe often\n• **Health**: Overall wellness - keep other stats up\n• **Energy**: How rested your pet is - let them sleep\n\nAll stats affect your pet's overall well-being!",
      category: "pet-care",
    },
    {
      id: 4,
      question: "How do I earn money in the game?",
      answer:
        "The main money sources are:\n\n• **Mini-Games**: Win a game to earn cash\n• **Achievements**: Each unlocked achievement gives **+$10**\n• **Milestones & Weekly Goals**: Bigger long-term rewards\n• **Level-Ups**: Reaching a new level gives **+$25**\n• **Daily Bonus**: Finish all daily tasks for **+$20**\n\nYou also start with **$100**, so early progress is about balancing care costs with the rewards you earn.",
      category: "finances",
    },
    {
      id: 6,
      question: "How does the shop work?",
      answer:
        "The Pet Shop has three sections:\n\n• **Shop**: Buy consumable items for Hunger, Happiness, Cleanliness, Health, and Energy\n• **Wardrobe**: Buy and equip cosmetic accessories\n• **Items**: Use the consumables you've already purchased\n\nSome daily tasks can activate a temporary discount, and the shop will even suggest cheaper alternatives when you're short on cash.",
      category: "finances",
    },
    {
      id: 5,
      question: "What are mini-games and how do I play them?",
      answer:
        "Mini-games are a quick way to earn money and boost your pet's happiness. The current games are:\n\n• **Catch the Treat**\n• **Memory Match**\n• **Pet Trivia**\n• **Whack-a-Critter**\n\nOpen the Mini Games panel from the dashboard, pick a game, and try to beat your high score. Each game currently has a **daily play limit of one run per day**.",
      category: "games",
    },
    {
      id: 9,
      question: "How do I change my account settings?",
      answer:
        "The in-app account controls are currently simple. From the dashboard menu you can **save your game, restart the tutorial, reset your game, open the FAQ, or sign out**.\n\nThere isn't a full profile/settings page in the game yet. Sign-in options such as password recovery are handled through the Supabase auth screens on the login/signup pages.",
      category: "account",
    },
    {
      id: 10,
      question: "Is my data safe and private?",
      answer:
        "Your account authentication and saved game data are handled through **Supabase**, and signed-in players can save progress to the cloud. For the exact details on what data is collected and how it is handled, check the **Privacy Policy** linked at the bottom of the site.",
      category: "account",
    },
    {
      id: 12,
      question: "Can I play on multiple devices?",
      answer:
        "Yes, if you're using the same signed-in account. Your game save is loaded from the cloud, so you can log in on another device and continue with the same pet, money, achievements, and progress.",
      category: "account",
    },
  ];

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const renderAnswer = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="text-foreground font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Questions matching the current search regardless of category (used for sidebar counts)
  const searchMatches = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : faqs;

  const getCategoryCount = (categoryId: string): number => {
    if (categoryId === "all") return searchMatches.length;
    return searchMatches.filter((faq) => faq.category === categoryId).length;
  };

  // Questions to actually display (search + category filter combined)
  const filteredFaqs = searchMatches.filter(
    (faq) => activeCategory === "all" || faq.category === activeCategory,
  );

  // Group filtered questions by category for rendering
  const nonAllCategories = categories.filter((cat) => cat.id !== "all");
  const groupedFaqs = nonAllCategories
    .map((cat) => ({
      ...cat,
      items: filteredFaqs.filter((faq) => faq.category === cat.id),
    }))
    .filter((group) => group.items.length > 0);

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
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif text-xl font-bold text-foreground tracking-tight">
              Paws Up
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Home
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full rounded-full" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button
                  size="sm"
                  className="h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-sm"
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-border pt-14 pb-10 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-primary/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[350px] bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 text-center relative">
          <div style={heroStyle(0.05)}>
            <div className="inline-flex items-center gap-2.5 text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-7 border border-primary/20">
              <MessageCircle className="w-4 h-4" />
              Help Center
            </div>
          </div>
          <div style={heroStyle(0.18)}>
            <h1 className="font-serif text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight mb-6">
              Frequently asked
              <br className="hidden sm:block" /> questions.
            </h1>
          </div>
          <div style={heroStyle(0.3)}>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-md mx-auto">
              Everything you need to know about Paws Up, your pet, and your
              virtual wallet.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="border-b border-border pt-10 pb-16 lg:pt-12 lg:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Mobile: horizontal scrollable category pills */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-10">
            {categories.map((cat) => {
              const count = getCategoryCount(cat.id);
              const Icon = cat.icon;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-200",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground border border-border",
                    count === 0 &&
                      activeCategory !== cat.id &&
                      "opacity-40 pointer-events-none",
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-16">
            {/* Desktop: sticky sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 px-3">
                  Browse by topic
                </p>
                <div className="space-y-0.5">
                  {categories.map((cat) => {
                    const count = getCategoryCount(cat.id);
                    const isActive = activeCategory === cat.id;
                    const isEmpty = count === 0;
                    const Icon = cat.icon;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        disabled={isEmpty && !isActive}
                        className={cn(
                          "w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                          isEmpty &&
                            !isActive &&
                            "opacity-35 cursor-not-allowed",
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <span className="flex-1 leading-tight">
                          {cat.label}
                        </span>
                        <span
                          className={cn(
                            "text-xs tabular-nums rounded-md px-1.5 py-0.5",
                            isActive
                              ? "bg-primary/15 text-primary"
                              : "text-muted-foreground/50",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Main: FAQ groups */}
            <main className="min-w-0">
              <AnimatedSection className="mb-8">
                <div className="relative max-w-2xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setActiveCategory("all");
                    }}
                    className="pl-12 pr-4 h-14 text-base rounded-xl border-border bg-background transition-colors"
                  />
                </div>
              </AnimatedSection>

              {filteredFaqs.length === 0 ? (
                <AnimatedSection className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl border border-border bg-accent/40 flex items-center justify-center">
                    <Search className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-3">
                    {searchQuery
                      ? `No matches for "${searchQuery}"`
                      : "No results found"}
                  </h3>
                  <p className="text-muted-foreground mb-7 max-w-sm mx-auto">
                    Try a different keyword, browse all topics, or ask the AI
                    chatbot in the bottom-right corner for help.
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("all");
                    }}
                  >
                    Clear search
                  </Button>
                </AnimatedSection>
              ) : (
                <div className="space-y-12">
                  {searchQuery && (
                    <p className="text-sm text-muted-foreground">
                      {filteredFaqs.length}{" "}
                      {filteredFaqs.length === 1 ? "result" : "results"} for{" "}
                      <span className="font-medium text-foreground">
                        "{searchQuery}"
                      </span>
                    </p>
                  )}
                  {groupedFaqs.map((group, groupIndex) => {
                    const Icon = group.icon;

                    return (
                      <AnimatedSection key={group.id} delay={groupIndex * 0.06}>
                        {/* Section header */}
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-primary uppercase tracking-widest leading-none mb-0.5">
                              {group.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {group.items.length}{" "}
                              {group.items.length === 1
                                ? "question"
                                : "questions"}
                            </p>
                          </div>
                        </div>

                        {/* Accordion container */}
                        <div className="rounded-xl border border-border overflow-hidden">
                          {group.items.map((faq, index) => {
                            const isOpen = openItems.includes(faq.id);

                            return (
                              <div
                                key={faq.id}
                                className={cn(
                                  "transition-colors duration-150",
                                  index > 0 && "border-t border-border",
                                  isOpen
                                    ? "bg-accent/30"
                                    : "bg-background hover:bg-accent/15",
                                )}
                              >
                                <button
                                  onClick={() => toggleItem(faq.id)}
                                  className="w-full text-left px-6 py-5 flex items-center gap-4"
                                  aria-expanded={isOpen}
                                >
                                  <span className="flex-1 font-medium text-foreground leading-snug">
                                    {faq.question}
                                  </span>
                                  <ChevronDown
                                    className={cn(
                                      "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
                                      isOpen && "rotate-180",
                                    )}
                                  />
                                </button>
                                <div
                                  className={cn(
                                    "overflow-hidden transition-all duration-300 ease-in-out",
                                    isOpen ? "max-h-[600px]" : "max-h-0",
                                  )}
                                >
                                  <div className="px-6 pb-6">
                                    <div className="pt-1 border-t border-border/50 pt-4 text-muted-foreground leading-relaxed whitespace-pre-line text-[15px]">
                                      {renderAnswer(faq.answer)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AnimatedSection>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      <PublicFooter />

      {/* AI Chatbot */}
      <FAQChatbot />
    </div>
  );
};

export default FAQ;
