import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PawPrint, ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import FAQChatbot from '@/components/FAQChatbot';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Questions', icon: '🌟' },
    { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
    { id: 'pet-care', label: 'Pet Care', icon: '🐾' },
    { id: 'finances', label: 'Finances', icon: '💰' },
    { id: 'games', label: 'Mini-Games', icon: '🎮' },
    { id: 'account', label: 'Account', icon: '👤' },
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

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const expandAll = () => setOpenItems(filteredFaqs.map(faq => faq.id));
  const collapseAll = () => setOpenItems([]);

  return (
    <div className="min-h-screen flex flex-col paper-texture relative overflow-hidden">
      {/* Atmospheric background layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-chart-3/8 via-chart-3/4 to-transparent blur-3xl animate-breathe" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-primary/8 via-primary/4 to-transparent blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[15%] left-[12%] text-chart-3/15 text-3xl animate-gentle-drift" style={{ animationDelay: '0s' }}>❓</div>
        <div className="absolute bottom-[25%] right-[15%] text-primary/10 text-2xl animate-gentle-drift" style={{ animationDelay: '3s' }}>💡</div>
        <div className="absolute top-[40%] right-[8%] text-secondary/10 text-2xl animate-gentle-drift" style={{ animationDelay: '5s' }}>🐾</div>
      </div>

      {/* Top nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <PawPrint className="w-6 h-6 text-primary" />
          <Link to="/" className="text-xl font-serif font-bold bg-gradient-to-br from-primary to-chart-5 bg-clip-text text-transparent">
            Paws Up
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="rounded-xl gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="rounded-xl">
              Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center p-4 pb-12 relative z-10">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-card rounded-full text-sm font-medium text-accent-foreground mb-6 shadow-sm">
              <HelpCircle className="w-4 h-4 text-chart-3" />
              <span>Got questions? We've got answers!</span>
              <Sparkles className="w-4 h-4 text-chart-1" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-br from-chart-3 via-primary to-chart-5 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Find answers to common questions about Paws Up! If you can't find what you're looking for, feel free to reach out.
            </p>
          </div>

          {/* Search and Controls */}
          <Card className="glass-card rounded-2xl shadow-lg mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl border-border/50 bg-background/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={expandAll} className="rounded-xl text-xs">
                    Expand All
                  </Button>
                  <Button variant="outline" size="sm" onClick={collapseAll} className="rounded-xl text-xs">
                    Collapse All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-xl gap-1.5 transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-primary to-chart-5 text-primary-foreground shadow-md'
                    : 'hover:bg-primary/10'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </Button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <Card className="glass-card rounded-2xl shadow-lg animate-fade-in-up">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-muted-foreground">No questions found matching your search.</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    className="text-primary mt-2"
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredFaqs.map((faq, index) => (
                <Card
                  key={faq.id}
                  className={`glass-card rounded-2xl shadow-lg animate-fade-in-up overflow-hidden transition-all duration-300 ${
                    openItems.includes(faq.id) ? 'ring-2 ring-primary/30' : ''
                  }`}
                  style={{ animationDelay: `${0.2 + index * 0.03}s` }}
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full text-left p-4 md:p-5 flex items-start gap-4 hover:bg-primary/5 transition-colors duration-200"
                    aria-expanded={openItems.includes(faq.id)}
                  >
                    <div className={`p-2 rounded-xl transition-colors duration-200 ${
                      openItems.includes(faq.id)
                        ? 'bg-gradient-to-br from-primary to-chart-5 text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-sm md:text-base">
                        {faq.question}
                      </h3>
                      <span className="text-xs text-muted-foreground mt-1 inline-block">
                        {categories.find(c => c.id === faq.category)?.icon}{' '}
                        {categories.find(c => c.id === faq.category)?.label}
                      </span>
                    </div>
                    <div className={`transition-transform duration-200 ${openItems.includes(faq.id) ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openItems.includes(faq.id) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-4 md:px-5 pb-4 md:pb-5 ml-12 md:ml-14">
                      <div className="p-4 bg-muted/30 rounded-xl border border-border/30">
                        <p className="text-foreground/90 leading-relaxed whitespace-pre-line text-sm md:text-base">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Results Count */}
          {filteredFaqs.length > 0 && (
            <div className="mt-6 text-center text-sm text-muted-foreground animate-fade-in-up">
              Showing {filteredFaqs.length} of {faqs.length} questions
            </div>
          )}

          {/* Footer links */}
          <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <p className="text-muted-foreground text-sm mb-4">
              Still have questions? Check out our other resources:
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <FAQChatbot />
    </div>
  );
};

export default FAQ;
