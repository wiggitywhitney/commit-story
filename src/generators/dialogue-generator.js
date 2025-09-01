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

  // DEBUG: Log what the generator sees
  console.log('\n=== DIALOGUE GENERATOR DEBUG ===');
  console.log('1. SELECTED CONTEXT:');
  console.log(JSON.stringify(selected, null, 2));
  console.log('\n2. FINAL AI PROMPT:');
  console.log('System:', systemPrompt);
  console.log('\nUser:', `Extract supporting dialogue for this development session:\n\n${JSON.stringify(contextForAI, null, 2)}`);
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
        content: `Extract supporting dialogue for this development session:\n\n${JSON.stringify(contextForAI, null, 2)}`
      }
    ],
    temperature: 0.7,
  };


  try {
    const completion = await openai.chat.completions.create(requestPayload);

    const dialogue = completion.choices[0].message.content.trim();
    
    // Clean up formatting in assistant quotes for readability
    const cleanedDialogue = dialogue
      .replace(/\\"/g, '"')        // Remove escape characters from quotes
      .replace(/\\n/g, '\n');      // Convert literal \n to actual newlines
    
    return cleanedDialogue;

  } catch (error) {
    console.error('Error generating development dialogue:', error.message);
    throw new Error(`Failed to generate development dialogue: ${error.message}`);
  }
}