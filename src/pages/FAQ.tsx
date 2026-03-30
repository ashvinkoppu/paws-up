/**
 * FAQ - Frequently asked questions page.
 *
 * @module pages/FAQ
 */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { LucideIcon } from 'lucide-react';
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
} from 'lucide-react';
import FAQChatbot from '@/components/chat/FAQChatbot';
import { cn } from '@/lib/utils';

// ── Hooks ──────────────────────────────────────────────────────────────────────
const useScrolled = (threshold = 20): boolean => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);
  return scrolled;
};

const useInView = (threshold = 0.12): [React.RefObject<HTMLDivElement>, boolean] => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(element);
        }
      },
      { threshold }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
};

// ── Animated section wrapper ───────────────────────────────────────────────────
const AnimatedSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0px)' : 'translateY(32px)',
        transition: `opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.75s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

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
  const [openItems, setOpenItems] = useState<number[]>([1]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [mounted, setMounted] = useState(false);
  const scrolled = useScrolled();

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const heroStyle = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0px)' : 'translateY(24px)',
    transition: `opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
  });

  const categories: Category[] = [
    { id: 'all', label: 'All questions', icon: LayoutGrid },
    { id: 'getting-started', label: 'Getting Started', icon: Rocket },
    { id: 'pet-care', label: 'Pet Care', icon: PawPrint },
    { id: 'finances', label: 'Money & Shop', icon: Wallet },
    { id: 'games', label: 'Mini-games', icon: Gamepad2 },
    { id: 'account', label: 'Account', icon: UserRound },
  ];

  const faqs: FAQItem[] = [
    {
      id: 1,
      question: 'How do I get started with Paws Up?',
      answer:
        'Welcome to Paws Up! Getting started is easy:\n\n1. Create an account using your email\n2. Choose your virtual pet companion\n3. Give your pet a name and customize their appearance\n4. Start taking care of your pet and managing your virtual finances!\n\nThe game will guide you through your first steps with helpful tutorials.',
      category: 'getting-started',
    },
    {
      id: 11,
      question: 'What are achievements and how do I unlock them?',
      answer:
        'Achievements are special milestones you can reach by playing the game:\n\n• **Pet Care Achievements**: Keep your pet healthy for consecutive days\n• **Finance Achievements**: Save or earn certain amounts\n• **Game Achievements**: Beat high scores or complete challenges\n• **Social Achievements**: Engage with various features\n\nEach achievement comes with bonus rewards when unlocked!',
      category: 'getting-started',
    },
    {
      id: 13,
      question: 'How do daily tasks work?',
      answer:
        'Daily tasks refresh every 24 hours and come in different difficulties:\n\n• **Easy Tasks**: Quick to complete, smaller rewards\n• **Medium Tasks**: Moderate effort, better rewards\n• **Hard Tasks**: Time-limited challenges with the best rewards\n\nComplete tasks before they expire to earn coins and boost your progress!',
      category: 'getting-started',
    },
    {
      id: 15,
      question: 'Is Paws Up free to play?',
      answer:
        'Yes, Paws Up is completely free to play! All game features are accessible without any real-money purchases. Earn virtual currency through gameplay and use it to care for your pet and unlock new items.',
      category: 'getting-started',
    },
    {
      id: 2,
      question: 'What types of pets can I adopt?',
      answer:
        "Currently, you can adopt dogs and cats in Paws Up! Each pet type has unique color options and accessories to choose from. We're always working on adding more furry friends to the game, so stay tuned for future updates with more pet varieties!",
      category: 'pet-care',
    },
    {
      id: 3,
      question: 'How do I keep my pet happy and healthy?',
      answer:
        'Your pet has several needs to maintain:\n\n• **Hunger**: Feed your pet regularly with items from the shop\n• **Happiness**: Play with your pet and give them treats\n• **Cleanliness**: Bathe and groom your pet\n• **Health**: Monitor for any health issues and provide care\n• **Energy**: Make sure your pet gets enough rest\n\nKeep an eye on the status bars in your dashboard to track each stat!',
      category: 'pet-care',
    },
    {
      id: 7,
      question: 'Can I customize my pet?',
      answer:
        'Yes! Pet customization options include:\n\n• **Color Selection**: Choose from various color palettes\n• **Accessories**: Equip items like hats, collars, and more\n• **Gender Options**: Select male, female, or neutral\n\nNew customization options may be unlocked through achievements or available in the shop!',
      category: 'pet-care',
    },
    {
      id: 8,
      question: 'What happens if I neglect my pet?',
      answer:
        "If your pet's needs aren't met, their stats will decrease over time. A neglected pet may become:\n\n• Hungry and lose health\n• Unhappy and less responsive\n• Dirty and more prone to illness\n\nDon't worry though — you can always restore your pet's stats by providing proper care! We'll also send you reminders to help you remember.",
      category: 'pet-care',
    },
    {
      id: 14,
      question: 'What do the different stats mean?',
      answer:
        "Your pet has five main stats:\n\n• **Hunger**: How full your pet is — feed regularly!\n• **Happiness**: Your pet's mood — play and give treats\n• **Cleanliness**: How clean your pet is — bathe often\n• **Health**: Overall wellness — keep other stats up\n• **Energy**: How rested your pet is — let them sleep\n\nAll stats affect your pet's overall well-being!",
      category: 'pet-care',
    },
    {
      id: 4,
      question: 'How do I earn money in the game?',
      answer:
        'There are several ways to earn virtual currency:\n\n• **Complete Daily Tasks**: Check your tasks each day for rewards\n• **Play Mini-Games**: Win games to earn coins\n• **Achievements**: Unlock achievements for bonus rewards\n• **Streaks**: Maintain daily login streaks for multiplied earnings\n\nManage your finances wisely to afford the best care for your pet!',
      category: 'finances',
    },
    {
      id: 6,
      question: 'How does the shop work?',
      answer:
        'The shop offers various items for your pet organized by category:\n\n• **Hunger Items**: Food and treats to keep your pet fed\n• **Happiness Items**: Toys and treats for entertainment\n• **Cleanliness Items**: Grooming supplies\n• **Health Items**: Medicine and wellness products\n• **Energy Items**: Rest and relaxation items\n\nPurchase items with your earned coins and use them to care for your pet!',
      category: 'finances',
    },
    {
      id: 5,
      question: 'What are mini-games and how do I play them?',
      answer:
        'Mini-games are fun activities that help you earn coins! Available games include:\n\n• **Memory Match**: Find matching pairs of cards\n• **Quick Tap**: Test your reflexes by tapping targets\n• **Puzzle Challenges**: Solve puzzles for rewards\n\nAccess mini-games from your dashboard and compete to beat your high scores!',
      category: 'games',
    },
    {
      id: 9,
      question: 'How do I change my account settings?',
      answer:
        'You can manage your account from the dashboard settings:\n\n• Update your profile information\n• Change your password\n• Manage notification preferences\n• Delete your account (if needed)\n\nAccess settings through menus in your dashboard area.',
      category: 'account',
    },
    {
      id: 10,
      question: 'Is my data safe and private?',
      answer:
        'Absolutely! We take your privacy seriously:\n\n• Your data is encrypted and stored securely\n• We never sell personal information\n• You control your data and can request deletion\n• We follow industry-standard security practices\n\nRead our full Privacy Policy for complete details on how we protect your information.',
      category: 'account',
    },
    {
      id: 12,
      question: 'Can I play on multiple devices?',
      answer:
        'Yes! Your progress is saved to your account, so you can:\n\n• Log in from any device with a web browser\n• Continue where you left off seamlessly\n• Keep all your progress, pets, and achievements\n\nJust sign in with the same account on your other device!',
      category: 'account',
    },
  ];

  const toggleItem = (id: number) => {
    setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const renderAnswer = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
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
    if (categoryId === 'all') return searchMatches.length;
    return searchMatches.filter((faq) => faq.category === categoryId).length;
  };

  // Questions to actually display (search + category filter combined)
  const filteredFaqs = searchMatches.filter(
    (faq) => activeCategory === 'all' || faq.category === activeCategory,
  );

  // Group filtered questions by category for rendering
  const nonAllCategories = categories.filter((cat) => cat.id !== 'all');
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
              Frequently asked<br className="hidden sm:block" /> questions.
            </h1>
          </div>
          <div style={heroStyle(0.30)}>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-md mx-auto">
              Everything you need to know about Paws Up, your pet, and your virtual wallet.
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
                    'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-200',
                    activeCategory === cat.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground border border-border',
                    count === 0 && activeCategory !== cat.id && 'opacity-40 pointer-events-none',
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
                          'w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                          isActive
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                          isEmpty && !isActive && 'opacity-35 cursor-not-allowed',
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0',
                            isActive ? 'text-primary' : 'text-muted-foreground',
                          )}
                        />
                        <span className="flex-1 leading-tight">{cat.label}</span>
                        <span
                          className={cn(
                            'text-xs tabular-nums rounded-md px-1.5 py-0.5',
                            isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground/50',
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
                      setActiveCategory('all');
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
                    {searchQuery ? `No matches for "${searchQuery}"` : 'No results found'}
                  </h3>
                  <p className="text-muted-foreground mb-7 max-w-sm mx-auto">
                    Try a different keyword, browse all topics, or ask the AI chatbot in the bottom-right
                    corner for help.
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                  >
                    Clear search
                  </Button>
                </AnimatedSection>
              ) : (
                <div className="space-y-12">
                  {searchQuery && (
                    <p className="text-sm text-muted-foreground">
                      {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'} for{' '}
                      <span className="font-medium text-foreground">"{searchQuery}"</span>
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
                              {group.items.length} {group.items.length === 1 ? 'question' : 'questions'}
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
                                  'transition-colors duration-150',
                                  index > 0 && 'border-t border-border',
                                  isOpen ? 'bg-accent/30' : 'bg-background hover:bg-accent/15',
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
                                      'w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200',
                                      isOpen && 'rotate-180',
                                    )}
                                  />
                                </button>
                                <div
                                  className={cn(
                                    'overflow-hidden transition-all duration-300 ease-in-out',
                                    isOpen ? 'max-h-[600px]' : 'max-h-0',
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

      {/* Footer */}
      <div className="border-t border-border py-7">
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

      {/* AI Chatbot */}
      <FAQChatbot />
    </div>
  );
};

export default FAQ;
