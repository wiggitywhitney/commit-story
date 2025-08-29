/**
 * Development Dialogue Generator
 * 
 * Extracts interesting quotes and exchanges from development sessions
 * using OpenAI with the simple dialogue prompt architecture.
 */

import OpenAI from 'openai';
import { getAllGuidelines } from './prompts/guidelines/index.js';
import { dialoguePrompt } from './prompts/sections/dialogue-prompt.js';
import { getAvailableDataDescription } from '../integrators/context-integrator.js';
import { filterContext } from './filters/context-filter.js';

/**
 * Generates development dialogue for a development session
 * 
 * @param {Object} context - The context object from context integrator
 * @param {Object} context.commit - Git commit data
 * @param {Array} context.chatMessages - Chat messages from development session
 * @param {Object|null} context.previousCommit - Previous commit data or null
 * @returns {Promise<string>} Generated dialogue section
 */
export async function generateDevelopmentDialogue(context) {
  // Apply intelligent context filtering (DD-024)
  const filteredContext = filterContext(context);
  
  // Create fresh OpenAI instance (DD-016: prevent context bleeding)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Build the complete prompt (DD-018: compose guidelines + section prompt)
  const availableDataDescription = getAvailableDataDescription();
  const guidelines = getAllGuidelines();
  
  const systemPrompt = `
${availableDataDescription}

${dialoguePrompt}

${guidelines}
  `.trim();

  // Prepare the filtered context for the AI
  const contextForAI = {
    git: {
      hash: filteredContext.commit.hash,
      message: filteredContext.commit.message,
      author: filteredContext.commit.author,
      timestamp: filteredContext.commit.timestamp,
      diff: filteredContext.commit.diff,
    },
    chat: filteredContext.chatMessages.map(msg => ({
      type: msg.type,
      content: msg.message?.content,
      timestamp: msg.timestamp,
    }))
  };

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user', 
          content: `Extract interesting dialogue from this development session:\n\n${JSON.stringify(contextForAI, null, 2)}`
        }
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content.trim();

  } catch (error) {
    console.error('Error generating development dialogue:', error.message);
    throw new Error(`Failed to generate development dialogue: ${error.message}`);
  }
}