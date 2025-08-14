/**
 * OpenAI Client Configuration
 * Handles API client setup with environment-based configuration
 */

import OpenAI from 'openai';

export function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is required. ' +
      'Please set it in your .env file or environment.'
    );
  }

  return new OpenAI({
    apiKey,
  });
}

export const DEFAULT_MODEL = 'gpt-4o-mini';