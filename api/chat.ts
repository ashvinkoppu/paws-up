import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_MODEL = 'gpt-4o-mini';
const MAX_MESSAGES = 15;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_TOKENS_LIMIT = 300;

// Simple in-memory rate limiter (resets on cold start, which is acceptable for serverless)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per user

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // Verify Supabase JWT authentication
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  // Use service role key if available for server-side verification, otherwise fall back to anon key
  const verificationKey = supabaseServiceKey || supabaseAnonKey;

  if (!supabaseUrl || !verificationKey) {
    return response.status(500).json({ error: 'Server authentication not configured' });
  }

  const supabase = createClient(supabaseUrl, verificationKey);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return response.status(401).json({ error: 'Invalid or expired session' });
  }

  // Rate limit per authenticated user
  if (isRateLimited(user.id)) {
    return response.status(429).json({ error: 'Too many requests. Please wait a moment before trying again.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'OpenAI API key not configured on server' });
  }

  try {
    const { messages, max_tokens = MAX_TOKENS_LIMIT } = request.body;

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return response.status(400).json({ error: 'Messages must be a non-empty array' });
    }

    if (messages.length > MAX_MESSAGES) {
      return response.status(400).json({ error: `Too many messages. Maximum is ${MAX_MESSAGES}.` });
    }

    // Validate each message has required fields and reasonable content length
    for (const message of messages) {
      if (!message.role || !message.content) {
        return response.status(400).json({ error: 'Each message must have a role and content' });
      }
      if (!['system', 'user', 'assistant'].includes(message.role)) {
        return response.status(400).json({ error: 'Invalid message role' });
      }
      if (typeof message.content !== 'string' || message.content.length > MAX_MESSAGE_LENGTH) {
        return response.status(400).json({ error: `Message content must be a string under ${MAX_MESSAGE_LENGTH} characters` });
      }
    }

    // Clamp max_tokens to prevent abuse
    const clampedMaxTokens = Math.min(
      typeof max_tokens === 'number' ? max_tokens : MAX_TOKENS_LIMIT,
      MAX_TOKENS_LIMIT
    );

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: ALLOWED_MODEL,
        messages,
        max_tokens: clampedMaxTokens,
        temperature: 0.7
      })
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json().catch(() => ({}));
      return response.status(openAiResponse.status).json({ error: 'OpenAI API Error', details: errorData });
    }

    const data = await openAiResponse.json();
    return response.status(200).json(data);
  } catch (error) {
    console.error('Server error:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
