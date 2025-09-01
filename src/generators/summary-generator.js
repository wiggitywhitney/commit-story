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

  // DEBUG: Log what the generator sees
  console.log('\n=== SUMMARY GENERATOR DEBUG ===');
  console.log('1. SELECTED CONTEXT:');
  console.log(JSON.stringify(selected, null, 2));
  console.log('\n2. FINAL AI PROMPT:');
  console.log('System:', systemPrompt);
  console.log('\nUser:', `Generate a summary for this development session:\n\n${JSON.stringify(contextForAI, null, 2)}`);
  console.log('=== END DEBUG ===\n');

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
    const completion = await openai.chat.completions.create(requestPayload);

    return completion.choices[0].message.content.trim();

  } catch (error) {
    console.error('Error generating summary:', error.message);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}