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
import { selectContext } from './utils/context-selector.js';

/**
 * Generates development dialogue for a development session using summary-guided extraction
 * 
 * @param {Object} context - Self-documenting context object from context integrator
 * @param {string} summary - Generated summary of the development session
 * @returns {Promise<string>} Generated dialogue section
 */
export async function generateDevelopmentDialogue(context, summary) {
  // Select chat messages and metadata for dialogue extraction (ignore git data)
  const selected = selectContext(context, ['chatMessages', 'chatMetadata']);
  const cleanMessages = selected.data.chatMessages;
  
  // Check if any user messages are substantial enough for dialogue extraction (DD-054)
  if (context.chatMetadata.data.userMessages.overTwentyCharacters === 0) {
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
2. ${selected.description.replace('AVAILABLE DATA:\n- ', '')}

${dialoguePrompt}
  `.trim();

  // Prepare the context for AI processing
  // Calculate maximum quotes based on available content - prevents AI from fabricating 
  // quotes when few meaningful user messages exist. Cap at 8 to maintain quality focus.
  const maxQuotes = Math.min(context.chatMetadata.data.userMessages.overTwentyCharacters, 8);
  const contextForAI = {
    summary: summary,
    chat: cleanMessages,
    maxQuotes: maxQuotes
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
    // Add timeout wrapper (30 seconds)
    const completion = await Promise.race([
      openai.chat.completions.create(requestPayload),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      )
    ]);

    const dialogue = completion.choices[0].message.content.trim();
    
    // Clean up formatting in assistant quotes for readability
    const cleanedDialogue = dialogue
      .replace(/\\"/g, '"')        // Remove escape characters from quotes
      .replace(/\\n/g, '\n');      // Convert literal \n to actual newlines
    
    return cleanedDialogue;

  } catch (error) {
    console.error(`⚠️ Development Dialogue generation failed: ${error.message}`);
    return `[Development Dialogue generation failed: ${error.message}]`;
  }
}