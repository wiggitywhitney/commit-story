/**
 * Summary Generator
 * 
 * Generates summary narratives using OpenAI with the refined prompt architecture.
 * Combines guidelines with section-specific prompts and dynamic context documentation.
 */

import OpenAI from 'openai';
import { getAllGuidelines } from './prompts/guidelines/index.js';
import { summaryPrompt } from './prompts/sections/summary-prompt.js';
import { selectContext } from './utils/context-selector.js';

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
  // Select both commit and chat data for summary generation
  const selected = selectContext(context, ['commit', 'chatMessages']);
  
  // Create fresh OpenAI instance (DD-016: prevent context bleeding)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Build the complete prompt (DD-018: compose guidelines + section prompt)
  const guidelines = getAllGuidelines();
  
  const systemPrompt = `
${selected.description}

${summaryPrompt}

${guidelines}
  `.trim();

  // Prepare the filtered context for the AI
  const contextForAI = {
    git: {
      hash: selected.data.commit.hash,
      ...(selected.data.commit.message !== null && { message: selected.data.commit.message }),
      author: selected.data.commit.author,
      timestamp: selected.data.commit.timestamp,
      diff: selected.data.commit.diff,
    },
    chat: selected.data.chatMessages.map(msg => ({
      type: msg.type,
      content: msg.message?.content,
      timestamp: msg.timestamp,
    }))
  };


  const requestPayload = {
    model: 'gpt-4o-mini',
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
  };


  try {
    // Add timeout wrapper (30 seconds)
    const completion = await Promise.race([
      openai.chat.completions.create(requestPayload),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      )
    ]);

    return completion.choices[0].message.content.trim();

  } catch (error) {
    console.error(`⚠️ Summary generation failed: ${error.message}`);
    return `[Summary generation failed: ${error.message}]`;
  }
}