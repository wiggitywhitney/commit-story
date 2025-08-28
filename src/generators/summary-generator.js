/**
 * Summary Generator
 * 
 * Generates summary narratives using OpenAI with the refined prompt architecture.
 * Combines guidelines with section-specific prompts and dynamic context documentation.
 */

import OpenAI from 'openai';
import { getAllGuidelines } from './prompts/guidelines/index.js';
import { summaryPrompt } from './prompts/sections/summary-prompt.js';
import { getAvailableDataDescription } from '../integrators/context-integrator.js';

/**
 * Generates a summary narrative for a development session
 * 
 * @param {Object} context - The context object from context integrator
 * @param {Object} context.commit - Git commit data
 * @param {Array} context.chatMessages - Chat messages from development session
 * @param {Object|null} context.previousCommit - Previous commit data or null
 * @returns {Promise<string>} Generated summary paragraph
 */
export async function generateSummary(context) {
  // Create fresh OpenAI instance (DD-016: prevent context bleeding)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Build the complete prompt (DD-018: compose guidelines + section prompt)
  const availableDataDescription = getAvailableDataDescription();
  const guidelines = getAllGuidelines();
  
  const systemPrompt = `
${availableDataDescription}

${summaryPrompt}

${guidelines}
  `.trim();

  // Prepare the context for the AI
  const contextForAI = {
    git: {
      hash: context.commit.hash,
      message: context.commit.message,
      author: context.commit.author,
      timestamp: context.commit.timestamp,
      diff: context.commit.diff,
    },
    chat: context.chatMessages.map(msg => ({
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp,
    }))
  };

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user', 
          content: `Generate a summary for this development session:\n\n${JSON.stringify(contextForAI, null, 2)}`
        }
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content.trim();

  } catch (error) {
    console.error('Error generating summary:', error.message);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}