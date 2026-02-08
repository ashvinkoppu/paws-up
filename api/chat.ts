import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_MODEL = 'gpt-5-nano';
const MAX_MESSAGES = 15;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_SYSTEM_MESSAGE_LENGTH = 3000;
const MAX_COMPLETION_TOKENS_LIMIT = 300;

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
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

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
    const { messages, max_tokens, max_completion_tokens } = request.body;

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
      const lengthLimit = message.role === 'system' ? MAX_SYSTEM_MESSAGE_LENGTH : MAX_MESSAGE_LENGTH;
      if (typeof message.content !== 'string' || message.content.length > lengthLimit) {
        return response.status(400).json({ error: `Message content must be a string under ${lengthLimit} characters` });
      }
    }

    // Clamp completion tokens to prevent abuse
    const requestedCompletionTokens =
      typeof max_completion_tokens === 'number'
        ? max_completion_tokens
        : typeof max_tokens === 'number'
          ? max_tokens
          : MAX_COMPLETION_TOKENS_LIMIT;
    const clampedCompletionTokens = Math.min(requestedCompletionTokens, MAX_COMPLETION_TOKENS_LIMIT);

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: ALLOWED_MODEL,
        messages,
        max_completion_tokens: clampedCompletionTokens,
        reasoning_effort: 'minimal',
      }),
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json().catch(() => ({}));
      const providerErrorMessage =
        typeof errorData?.error?.message === 'string' ? errorData.error.message : 'OpenAI API Error';
      return response.status(openAiResponse.status).json({ error: providerErrorMessage, details: errorData });
    }

    const data = await openAiResponse.json();
    return response.status(200).json(data);
  } catch (error) {
    console.error('Server error:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
