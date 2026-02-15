import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PawPrint, ArrowLeft, ChevronDown, Search, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import FAQChatbot from '@/components/chat/FAQChatbot';
import { cn } from '@/lib/utils';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([1]); // First one open by default
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    { id: 'all', label: 'All', emoji: '✨' },
    { id: 'getting-started', label: 'Getting Started', emoji: '🚀' },
    { id: 'pet-care', label: 'Pet Care', emoji: '🐾' },
    { id: 'finances', label: 'Money', emoji: '💰' },
    { id: 'games', label: 'Games', emoji: '🎮' },
    { id: 'account', label: 'Account', emoji: '👤' },
  ];

  const faqs: FAQItem[] = [
    {
      id: 1,
      question: 'How do I get started with Paws Up?',
      answer: 'Welcome to Paws Up! Getting started is easy:\n\n1. Create an account using your email\n2. Choose your virtual pet companion\n3. Give your pet a name and customize their appearance\n4. Start taking care of your pet and managing your virtual finances!\n\nThe game will guide you through your first steps with helpful tutorials.',
      category: 'getting-started'
    },
    {
      id: 2,
      question: 'What types of pets can I adopt?',
      answer: 'Currently, you can adopt dogs and cats in Paws Up! Each pet type has unique color options and accessories to choose from. We\'re always working on adding more furry friends to the game, so stay tuned for future updates with more pet varieties!',
      category: 'pet-care'
    },
    {
      id: 3,
      question: 'How do I keep my pet happy and healthy?',
      answer: 'Your pet has several needs to maintain:\n\n• **Hunger**: Feed your pet regularly with items from the shop\n• **Happiness**: Play with your pet and give them treats\n• **Cleanliness**: Bathe and groom your pet\n• **Health**: Monitor for any health issues and provide care\n• **Energy**: Make sure your pet gets enough rest\n\nKeep an eye on the status bars in your dashboard to track each stat!',
      category: 'pet-care'
    },
    {
      id: 4,
      question: 'How do I earn money in the game?',
      answer: 'There are several ways to earn virtual currency:\n\n• **Complete Daily Tasks**: Check your tasks each day for rewards\n• **Play Mini-Games**: Win games to earn coins\n• **Achievements**: Unlock achievements for bonus rewards\n• **Streaks**: Maintain daily login streaks for multiplied earnings\n\nManage your finances wisely to afford the best care for your pet!',
      category: 'finances'
    },
    {
      id: 5,
      question: 'What are mini-games and how do I play them?',
      answer: 'Mini-games are fun activities that help you earn coins! Available games include:\n\n• **Memory Match**: Find matching pairs of cards\n• **Quick Tap**: Test your reflexes by tapping targets\n• **Puzzle Challenges**: Solve puzzles for rewards\n\nAccess mini-games from your dashboard and compete to beat your high scores!',
      category: 'games'
    },
    {
      id: 6,
      question: 'How does the shop work?',
      answer: 'The shop offers various items for your pet organized by category:\n\n• **Hunger Items**: Food and treats to keep your pet fed\n• **Happiness Items**: Toys and treats for entertainment\n• **Cleanliness Items**: Grooming supplies\n• **Health Items**: Medicine and wellness products\n• **Energy Items**: Rest and relaxation items\n\nPurchase items with your earned coins and use them to care for your pet!',
      category: 'finances'
    },
    {
      id: 7,
      question: 'Can I customize my pet?',
      answer: 'Yes! Pet customization options include:\n\n• **Color Selection**: Choose from various color palettes\n• **Accessories**: Equip items like hats, collars, and more\n• **Gender Options**: Select male, female, or neutral\n\nNew customization options may be unlocked through achievements or available in the shop!',
      category: 'pet-care'
    },
    {
      id: 8,
      question: 'What happens if I neglect my pet?',
      answer: 'If your pet\'s needs aren\'t met, their stats will decrease over time. A neglected pet may become:\n\n• Hungry and lose health\n• Unhappy and less responsive\n• Dirty and more prone to illness\n\nDon\'t worry though — you can always restore your pet\'s stats by providing proper care! We\'ll also send you reminders to help you remember.',
      category: 'pet-care'
    },
    {
      id: 9,
      question: 'How do I change my account settings?',
      answer: 'You can manage your account from the dashboard settings:\n\n• Update your profile information\n• Change your password\n• Manage notification preferences\n• Delete your account (if needed)\n\nAccess settings through menus in your dashboard area.',
      category: 'account'
    },
    {
      id: 10,
      question: 'Is my data safe and private?',
      answer: 'Absolutely! We take your privacy seriously:\n\n• Your data is encrypted and stored securely\n• We never sell personal information\n• You control your data and can request deletion\n• We follow industry-standard security practices\n\nRead our full Privacy Policy for complete details on how we protect your information.',
      category: 'account'
    },
    {
      id: 11,
      question: 'What are achievements and how do I unlock them?',
      answer: 'Achievements are special milestones you can reach by playing the game:\n\n• **Pet Care Achievements**: Keep your pet healthy for consecutive days\n• **Finance Achievements**: Save or earn certain amounts\n• **Game Achievements**: Beat high scores or complete challenges\n• **Social Achievements**: Engage with various features\n\nEach achievement comes with bonus rewards when unlocked!',
      category: 'getting-started'
    },
    {
      id: 12,
      question: 'Can I play on multiple devices?',
      answer: 'Yes! Your progress is saved to your account, so you can:\n\n• Log in from any device with a web browser\n• Continue where you left off seamlessly\n• Keep all your progress, pets, and achievements\n\nJust sign in with the same account on your other device!',
      category: 'account'
    },
    {
      id: 13,
      question: 'How do daily tasks work?',
      answer: 'Daily tasks refresh every 24 hours and come in different difficulties:\n\n• **Easy Tasks**: Quick to complete, smaller rewards\n• **Medium Tasks**: Moderate effort, better rewards\n• **Hard Tasks**: Time-limited challenges with the best rewards\n\nComplete tasks before they expire to earn coins and boost your progress!',
      category: 'getting-started'
    },
    {
      id: 14,
      question: 'What do the different stats mean?',
      answer: 'Your pet has five main stats:\n\n• **Hunger (🍖)**: How full your pet is — feed regularly!\n• **Happiness (❤️)**: Your pet\'s mood — play and give treats\n• **Cleanliness (🛁)**: How clean your pet is — bathe often\n• **Health (💊)**: Overall wellness — keep other stats up\n• **Energy (⚡)**: How rested your pet is — let them sleep\n\nAll stats affect your pet\'s overall well-being!',
      category: 'pet-care'
    },
    {
      id: 15,
      question: 'Is Paws Up free to play?',
      answer: 'Yes, Paws Up is completely free to play! All game features are accessible without any real-money purchases. Earn virtual currency through gameplay and use it to care for your pet and unlock new items.',
      category: 'getting-started'
    }
  ];

  const toggleItem = (id: number) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const renderAnswer = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/20">
      {/* Subtle decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[10%] w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-primary/10 rounded-lg transition-colors group-hover:bg-primary/20">
              <PawPrint className="w-4 h-4 text-primary" />
            </div>
            <span className="font-serif font-bold bg-gradient-to-r from-primary to-chart-5 bg-clip-text text-transparent">
              Paws Up
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary border-0">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-full text-sm mb-6">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Help Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            How can we help?
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Find answers to common questions about caring for your virtual pet.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/60 z-10 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="relative z-0 pl-12 pr-4 py-6 text-base rounded-2xl border-border/30 bg-card/50 backdrop-blur-sm focus:bg-card transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeCategory === cat.id
                  ? "bg-foreground text-background shadow-lg"
                  : "bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/30"
              )}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-muted-foreground mb-4">No questions match your search.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openItems.includes(faq.id);
              const category = categories.find(c => c.id === faq.category);

              return (
                <div
                  key={faq.id}
                  className={cn(
                    "rounded-2xl border transition-all duration-300",
                    isOpen
                      ? "bg-card border-border/50 shadow-lg"
                      : "bg-card/30 border-border/20 hover:bg-card/60 hover:border-border/30"
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full text-left p-5 flex items-start gap-4"
                    aria-expanded={isOpen}
                  >
                    <span className="text-xl mt-0.5 flex-shrink-0">{category?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-semibold pr-8 transition-colors",
                        isOpen ? "text-foreground" : "text-foreground/80"
                      )}>
                        {faq.question}
                      </h3>
                    </div>
                    <ChevronDown className={cn(
                      "w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300",
                      isOpen && "rotate-180"
                    )} />
                  </button>

                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="px-5 pb-5 pl-14">
                      <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-[15px]">
                        {renderAnswer(faq.answer)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Results count */}
        {filteredFaqs.length > 0 && searchQuery && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Found {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
          </p>
        )}

        {/* Still need help? */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 rounded-3xl bg-gradient-to-br from-primary/5 via-accent/30 to-secondary/5 border border-border/20">
            <h2 className="font-serif font-semibold text-xl mb-2">Still have questions?</h2>
            <p className="text-muted-foreground mb-4">
              Try our AI assistant or check our policies below.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              <span className="text-border">•</span>
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            </div>
          </div>
        </div>
      </main>

      {/* AI Chatbot */}
      <FAQChatbot />
    </div>
  );
};

export default FAQ;
