/**
 * Technical Decisions Generator
 * 
 * Documents technical decisions and reasoning with distinction between
 * implemented changes and discussed-only ideas.
 */

import OpenAI from 'openai';
import { getAllGuidelines } from './prompts/guidelines/index.js';
import { technicalDecisionsPrompt } from './prompts/sections/technical-decisions-prompt.js';
import { extractTextFromMessages } from '../integrators/context-integrator.js';
import { filterContext } from './filters/context-filter.js';
import { hasSubstantialUserInput } from '../utils/message-validation.js';

/**
 * Generates technical decisions documentation for a development session
 * 
 * @param {Object} context - The context object from context integrator
 * @param {Object} context.commit - Git commit data
 * @param {Array} context.chatMessages - Chat messages from development session
 * @param {Object|null} context.previousCommit - Previous commit data or null
 * @returns {Promise<string>} Generated technical decisions section
 */
export async function generateTechnicalDecisions(context) {
  // Apply intelligent context filtering (same as summary generator)
  const filteredContext = filterContext(context);
  
  // Extract clean text from filtered messages for AI processing
  const cleanMessages = extractTextFromMessages(filteredContext.chatMessages);
  
  // Check if any user messages are substantial enough for technical decisions analysis
  if (!hasSubstantialUserInput(cleanMessages)) {
    return "No significant technical decisions documented for this development session";
  }
  
  // Create fresh OpenAI instance (DD-016: prevent context bleeding)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Build the complete prompt (DD-018: compose guidelines + section prompt)
  const guidelines = getAllGuidelines();
  
  const systemPrompt = `
You have access to:
1. Git commit data including code changes (diffs)
2. Chat messages from the development session

${technicalDecisionsPrompt}

${guidelines}
  `.trim();

  // Prepare the filtered context for the AI
  const contextForAI = {
    git: {
      hash: filteredContext.commit.hash,
      ...(filteredContext.commit.message !== null && { message: filteredContext.commit.message }),
      author: filteredContext.commit.author,
      timestamp: filteredContext.commit.timestamp,
      diff: filteredContext.commit.diff
    },
    chat: cleanMessages
  };

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Here is the development session data:\n\n${JSON.stringify(contextForAI, null, 2)}` }
      ],
      temperature: 0.1, // Low temperature for consistent, factual extraction
    });

    const technicalDecisions = response.choices[0].message.content.trim();
    return technicalDecisions;

  } catch (error) {
    console.error('Technical decisions generation failed:', error);
    return "Error generating technical decisions documentation";
  }
}