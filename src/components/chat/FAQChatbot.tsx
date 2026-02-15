/**
 * FAQChatbot - Floating AI chat assistant ("Paws") that answers game-related questions.
 *
 * Renders a fixed-position toggle button (bottom-right) that opens a chat window.
 * Messages are sent to a `/api/chat` serverless endpoint authenticated via Supabase JWT.
 * The system prompt is built dynamically from the player's current game context (pet stats,
 * money, care streak, etc.) so the assistant can give personalized advice.
 *
 * Features:
 * - Context-aware greeting that warns about low pet stats
 * - Suggested quick-question chips (change based on pet state and money)
 * - Message history limited to the last 10 messages sent to the API
 * - 500-character input limit
 * - Animated floating button with ambient glow, hover tooltip, and notification dot
 *
 * @prop {PetContext} [context] - Current game state snapshot for personalized responses.
 *
 * @module components/chat/FAQChatbot
 */
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, PawPrint } from 'lucide-react';
import { Pet, GameState } from '@/types/game';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const MAX_MESSAGE_LENGTH = 500;

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
  const [isHovering, setIsHovering] = useState(false);
  const { toast } = useToast();

  // Build a personalized greeting: if any pet stats are critically low (<=40%),
  // mention them so the player is nudged to take action.
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
        return `Hi! I noticed ${petName} might need some attention - they seem ${lowStats.join(' and ')}. How can I help you take better care of them?`;
      }
      return `Hey there! ${petName} looks happy and healthy! I'm Paws, your assistant. Ask me anything about caring for ${petName}, earning coins, or playing games!`;
    }
    return "Hi there! I'm Paws, your helpful assistant! Ask me anything about Paws Up - pet care, finances, mini-games, or how to get started. I'm here to help!";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: getGreeting(),
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

    if (inputValue.trim().length > MAX_MESSAGE_LENGTH) {
      toast({
        title: 'Message too long',
        description: `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`,
        variant: 'destructive',
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Retrieve Supabase JWT for authenticated API access to the chat endpoint
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          // Send the system prompt + last 10 messages for context window management
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...messages.slice(-10).map((message) => ({ role: message.role, content: message.content })),
            { role: 'user', content: userMessage.content },
          ],
          max_completion_tokens: 300,
        }),
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
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! I'm having trouble connecting right now. 🐾 Please try again in a moment, or check out the FAQ questions above for quick answers!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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

  // Generate up to 3 suggested questions. Priority is given to context-specific
  // suggestions (low stats, low money), backfilled with general questions.
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
        questions.push('How do I earn more coins?');
      }

      // Fill with general questions if needed
      if (questions.length < 3) {
        questions.push(`Tips for caring for ${petName}?`);
      }
      if (questions.length < 3) {
        questions.push('What games can I play?');
      }
      if (questions.length < 3) {
        questions.push('How do achievements work?');
      }

      return questions.slice(0, 3);
    }
    return ['How do I care for my pet?', 'How do I earn coins?', 'What are mini-games?'];
  };

  const suggestedQuestions = getSuggestedQuestions();

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50">
      {/* Decorative ambient particles when open */}
      {isOpen && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary/40"
              style={{
                right: `${-20 + Math.random() * 400}px`,
                bottom: `${50 + Math.random() * 450}px`,
                animationName: 'sparkle',
                animationDuration: `${2 + Math.random() * 2}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Chat Window */}
      <div
        className={cn(
          'absolute bottom-20 right-0 w-[380px] max-w-[calc(100vw-48px)] transition-all duration-500 origin-bottom-right',
          isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-90 translate-y-8 pointer-events-none',
        )}
      >
        {/* Main chat container with organic shape */}
        <div className="relative">
          {/* Main card */}
          <div className="relative bg-card/95 backdrop-blur-xl rounded-[1.5rem] border border-border/40 shadow-2xl overflow-hidden">
            {/* Decorative top edge with gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />

            {/* Header */}
            <div className="relative px-5 pt-5 pb-4">
              <div className="relative flex items-center gap-4">
                {/* Paws avatar */}
                <div className="relative">
                  <div className="relative w-12 h-12 bg-[#D96A4A]/15 rounded-2xl flex items-center justify-center">
                    <PawPrint className="w-6 h-6 text-[#D96A4A]" />
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#4CAF50] rounded-full border-2 border-card" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-bold text-lg text-foreground tracking-tight">Paws</h3>
                  <p className="text-xs text-muted-foreground">Your friendly guide</p>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
                  aria-label="Close chat"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="h-[340px] overflow-y-auto px-4 pb-3 space-y-3 scrollbar-hide">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn('flex gap-2.5', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                  style={{
                    animationName: 'fadeInUp',
                    animationDuration: '0.4s',
                    animationTimingFunction: 'ease-out',
                    animationFillMode: 'forwards',
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  {message.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-[#D96A4A]/15 flex items-center justify-center shrink-0">
                      <PawPrint className="w-4 h-4 text-[#D96A4A]" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] px-4 py-2.5 text-sm leading-relaxed',
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-br-lg shadow-md'
                        : 'bg-gradient-to-br from-muted/80 to-muted/40 text-foreground rounded-2xl rounded-bl-lg border border-border/30',
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#D96A4A]/15 flex items-center justify-center shrink-0">
                    <PawPrint className="w-4 h-4 text-[#D96A4A]" />
                  </div>
                  <div className="bg-gradient-to-br from-muted/80 to-muted/40 rounded-2xl rounded-bl-lg border border-border/30 px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-primary/60"
                            style={{
                              animationName: 'bounce',
                              animationDuration: '1.4s',
                              animationTimingFunction: 'ease-in-out',
                              animationIterationCount: 'infinite',
                              animationDelay: `${i * 0.16}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-3">
                <div className="flex flex-wrap gap-1.5">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputValue(question);
                        inputRef.current?.focus();
                      }}
                      className="text-xs px-3 py-1.5 rounded-full bg-accent/50 hover:bg-accent text-accent-foreground border border-border/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                      style={{
                        animationName: 'fadeInUp',
                        animationDuration: '0.3s',
                        animationTimingFunction: 'ease-out',
                        animationFillMode: 'forwards',
                        animationDelay: `${0.2 + index * 0.08}s`,
                        opacity: 0,
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="p-4 pt-2 border-t border-border/30 bg-muted/20">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask anything..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                    className="pr-4 rounded-xl bg-background/80 border-border/40 focus:border-primary/50 focus:bg-background focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200 placeholder:text-muted-foreground/60"
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className={cn(
                    'rounded-xl h-10 w-10 transition-all duration-300',
                    inputValue.trim()
                      ? 'bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 scale-100'
                      : 'bg-muted text-muted-foreground scale-95',
                  )}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toggle Button - Enchanted Creature Style */}
      <div className="relative">
        {/* Hover tooltip */}
        <div
          className={cn(
            'absolute bottom-full right-0 mb-3 whitespace-nowrap transition-all duration-300',
            isHovering && !isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none',
          )}
        >
          <div className="px-3 py-1.5 bg-card rounded-lg shadow-lg border border-border/50 text-sm font-medium">Need help? Ask Paws!</div>
          <div className="absolute -bottom-1 right-6 w-2 h-2 bg-card border-r border-b border-border/50 rotate-45" />
        </div>

        {/* Ambient glow ring */}
        <div
          className={cn('absolute inset-0 rounded-full transition-all duration-500', isOpen ? 'scale-100 opacity-0' : 'scale-150 opacity-100')}
          style={{
            background: 'radial-gradient(circle, rgba(217, 106, 74, 0.2) 0%, transparent 70%)',
            animation: !isOpen ? 'breathe 3s ease-in-out infinite' : 'none',
          }}
        />

        {/* Main button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={cn(
            'relative w-14 h-14 rounded-full shadow-xl transition-all duration-500 transform',
            'focus:outline-none focus:ring-2 focus:ring-[#D96A4A]/50 focus:ring-offset-2 focus:ring-offset-background',
            isOpen ? 'bg-muted hover:bg-muted/80 rotate-0 scale-90' : 'bg-[#D96A4A] hover:bg-[#C55A3A] hover:scale-110 hover:shadow-2xl hover:shadow-[#D96A4A]/40',
          )}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
          style={{
            animation: !isOpen && !isHovering ? 'float 4s ease-in-out infinite' : 'none',
          }}
        >
          {/* Button content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isOpen ? (
              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <PawPrint className="w-6 h-6 text-white" />
            )}
          </div>

          {/* Shine effect on hover */}
          {!isOpen && (
            <div
              className={cn(
                'absolute inset-0 rounded-full overflow-hidden',
                'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
                'before:translate-x-[-100%] before:transition-transform before:duration-700',
                isHovering && 'before:translate-x-[100%]',
              )}
            />
          )}
        </button>

        {/* Notification dot when closed */}
        {!isOpen && (
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white rounded-full border-2 border-background flex items-center justify-center shadow-sm">
            <div className="w-1.5 h-1.5 bg-[#D96A4A] rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQChatbot;
