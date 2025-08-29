/**
 * Development Dialogue Generator
 * 
 * Extracts supporting human quotes based on summary content
 * using the summary-guided extraction approach.
 */

import OpenAI from 'openai';
import { getAllGuidelines } from './prompts/guidelines/index.js';
import { dialoguePrompt } from './prompts/sections/dialogue-prompt.js';
import { extractTextFromMessages } from '../integrators/context-integrator.js';
import { filterContext } from './filters/context-filter.js';

/**
 * Generates development dialogue for a development session using summary-guided extraction
 * 
 * @param {string} summary - Generated summary of the development session
 * @param {Array} chatMessages - Chat messages from development session  
 * @returns {Promise<string>} Generated dialogue section
 */
export async function generateDevelopmentDialogue(summary, chatMessages) {
  // Apply context filtering to manage token limits (same as summary generator)
  const mockContext = { chatMessages: chatMessages };
  const filteredContext = filterContext(mockContext);
  
  // Extract clean text from filtered messages for AI processing
  const cleanMessages = extractTextFromMessages(filteredContext.chatMessages);
  
  // Check if any user messages are substantial enough for dialogue extraction (DD-054)
  const hasSubstantialInput = cleanMessages.some(msg => {
    if (msg.type === 'user') {
      const content = msg.message?.content || '';
      return content.length >= 20;
    }
    return false;
  });
  
  // Return early if no substantial user input exists
  if (!hasSubstantialInput) {
    return "No significant dialogue found for this development session";
  }
  
  // Create fresh OpenAI instance (DD-016: prevent context bleeding)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Build the complete prompt (DD-018: compose guidelines + section prompt)
  const guidelines = getAllGuidelines();
  
  const systemPrompt = `
You have access to:
1. A summary of this development session (as your guide for what matters)
2. Chat messages from the development session (as your source for quotes)

${dialoguePrompt}

${guidelines}
  `.trim();

  // Prepare the context for AI processing
  const contextForAI = {
    summary: summary,
    chat: cleanMessages
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
        content: `Extract supporting dialogue for this development session:\n\n${JSON.stringify(contextForAI, null, 2)}`
      }
    ],
    temperature: 0.7,
  };


  try {
    const completion = await openai.chat.completions.create(requestPayload);

    return completion.choices[0].message.content.trim();

  } catch (error) {
    console.error('Error generating development dialogue:', error.message);
    throw new Error(`Failed to generate development dialogue: ${error.message}`);
  }
}