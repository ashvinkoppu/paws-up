import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { Pet, GameState } from '@/types/game';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PetContext {
  pet: Pet | null;
  money: number;
  careStreak: number;
  totalDaysPlayed: number;
  inventoryCount: number;
  achievementsUnlocked: number;
  totalAchievements: number;
}

interface FAQChatbotProps {
  context?: PetContext;
}

const FAQChatbot: React.FC<FAQChatbotProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Build personalized greeting based on context
  const getGreeting = () => {
    if (context?.pet) {
      const petName = context.pet.name;
      const lowStats = [];
      if (context.pet.stats.hunger <= 40) lowStats.push('hungry');
      if (context.pet.stats.happiness <= 40) lowStats.push('sad');
      if (context.pet.stats.energy <= 40) lowStats.push('tired');
      if (context.pet.stats.cleanliness <= 40) lowStats.push('dirty');
      if (context.pet.stats.health <= 40) lowStats.push('unwell');
      
      if (lowStats.length > 0) {
        return `Hi! I noticed ${petName} might need some attention - they seem ${lowStats.join(' and ')}. 🐾 How can I help you take better care of them?`;
      }
      return `Hey there! ${petName} looks happy and healthy! 🐾 I'm Paws, your assistant. Ask me anything about caring for ${petName}, earning coins, or playing games!`;
    }
    return "Hi there! 🐾 I'm Paws, your helpful assistant! Ask me anything about Paws Up - pet care, finances, mini-games, or how to get started. I'm here to help!";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: getGreeting(),
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Build context-aware system prompt
  const buildSystemPrompt = () => {
    let basePrompt = `You are Paws, a friendly and helpful AI assistant for "Paws Up" - a virtual pet care and budgeting game. Your personality is warm, playful, and encouraging - like a helpful friend who loves pets!

Key information about Paws Up:
- Players adopt virtual pets (dogs and cats) and care for them
- Pets have 5 stats: Hunger, Happiness, Cleanliness, Health, and Energy
- Players earn virtual currency through daily tasks, mini-games, and achievements
- The shop sells items organized by category (Hunger, Happiness, Cleanliness, Health, Energy items)
- Mini-games include Memory Match, Quick Tap, and puzzle challenges
- Players can customize pets with colors, accessories, and gender options
- The game teaches budgeting skills while being fun and engaging
- All features are free to play`;

    // Add personalized context if available
    if (context?.pet) {
      const pet = context.pet;
      const stats = pet.stats;
      
      basePrompt += `

CURRENT USER CONTEXT (use this to personalize your responses):
- Pet Name: ${pet.name}
- Pet Type: ${pet.species} (${pet.gender})
- Pet Color: ${pet.color}
- Pet Level: ${pet.level}
- Current Stats:
  • Hunger: ${Math.round(stats.hunger)}% ${stats.hunger <= 40 ? '⚠️ LOW!' : stats.hunger >= 80 ? '✓ Great' : ''}
  • Happiness: ${Math.round(stats.happiness)}% ${stats.happiness <= 40 ? '⚠️ LOW!' : stats.happiness >= 80 ? '✓ Great' : ''}
  • Energy: ${Math.round(stats.energy)}% ${stats.energy <= 40 ? '⚠️ LOW!' : stats.energy >= 80 ? '✓ Great' : ''}
  • Cleanliness: ${Math.round(stats.cleanliness)}% ${stats.cleanliness <= 40 ? '⚠️ LOW!' : stats.cleanliness >= 80 ? '✓ Great' : ''}
  • Health: ${Math.round(stats.health)}% ${stats.health <= 40 ? '⚠️ LOW!' : stats.health >= 80 ? '✓ Great' : ''}
- User's Money: $${context.money}
- Care Streak: ${context.careStreak} days
- Days Playing: ${context.totalDaysPlayed}
- Items in Inventory: ${context.inventoryCount}
- Achievements: ${context.achievementsUnlocked}/${context.totalAchievements} unlocked

Use this context to give personalized advice. For example:
- If a stat is low, proactively suggest how to improve it
- Reference the pet by name (${pet.name})
- Consider their budget when suggesting purchases
- Encourage them about their care streak`;
    }

    basePrompt += `

Guidelines:
- Keep responses concise but helpful (2-4 sentences usually)
- Use emojis sparingly to be friendly 🐾 ❤️ ✨
- If asked about something unrelated to Paws Up, gently redirect to game topics
- Be encouraging and positive
- If unsure about specific game details, give general helpful guidance
${context?.pet ? `- Always refer to the pet as "${context.pet.name}" when relevant` : ''}`;

    return basePrompt;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call our own backend API instead of OpenAI directly
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Updated to a valid model name
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      const assistantContent = data.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again!";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! I'm having trouble connecting right now. 🐾 Please try again in a moment, or check out the FAQ questions above for quick answers!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Dynamic suggested questions based on context
  const getSuggestedQuestions = () => {
    if (context?.pet) {
      const petName = context.pet.name;
      const questions = [];
      
      // Add context-specific suggestions
      if (context.pet.stats.hunger <= 40) {
        questions.push(`What should I feed ${petName}?`);
      }
      if (context.pet.stats.happiness <= 40) {
        questions.push(`How can I make ${petName} happier?`);
      }
      if (context.money < 20) {
        questions.push("How do I earn more coins?");
      }
      
      // Fill with general questions if needed
      if (questions.length < 3) {
        questions.push(`Tips for caring for ${petName}?`);
      }
      if (questions.length < 3) {
        questions.push("What games can I play?");
      }
      if (questions.length < 3) {
        questions.push("How do achievements work?");
      }
      
      return questions.slice(0, 3);
    }
    return [
      "How do I care for my pet?",
      "How do I earn coins?",
      "What are mini-games?"
    ];
  };

  const suggestedQuestions = getSuggestedQuestions();

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isOpen 
            ? 'bg-muted text-muted-foreground rotate-0' 
            : 'bg-gradient-to-r from-primary to-chart-5 text-primary-foreground'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] transition-all duration-300 transform ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        <Card className="glass-card rounded-2xl shadow-2xl border-primary/20 overflow-hidden">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-primary to-chart-5 text-primary-foreground p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  Ask Paws
                  <Sparkles className="w-4 h-4" />
                </CardTitle>
                <p className="text-xs text-primary-foreground/80">AI-powered help assistant</p>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="p-0">
            <div className="h-[320px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/30">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-gradient-to-br from-amber-50 to-orange-50 text-foreground border border-amber-200/50 rounded-bl-md shadow-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                      <span className="text-sm text-amber-700">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputValue(question);
                      inputRef.current?.focus();
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border/50 bg-background">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your question..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="rounded-xl bg-gradient-to-r from-primary to-chart-5 hover:opacity-90 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default FAQChatbot;
