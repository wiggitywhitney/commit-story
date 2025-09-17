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
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { DEFAULT_MODEL } from '../config/openai.js';

// Get tracer instance for dialogue generation instrumentation
const tracer = trace.getTracer('commit-story-dialogue', '1.0.0');

/**
 * Detects AI provider from model name for telemetry
 * @param {string} modelName - The model name (e.g., 'gpt-4o-mini', 'claude-3')
 * @returns {string} Provider name ('openai', 'anthropic', 'google', 'meta', 'unknown')
 */
function getProviderFromModel(modelName) {
  const model = modelName.toLowerCase();
  if (model.startsWith('gpt')) return 'openai';
  if (model.includes('claude')) return 'anthropic';
  if (model.includes('gemini')) return 'google';
  if (model.includes('llama')) return 'meta';
  return 'unknown';
}

/**
 * Generates development dialogue for a development session using summary-guided extraction
 *
 * @param {Object} context - Self-documenting context object from context integrator
 * @param {string} summary - Generated summary of the development session
 * @returns {Promise<string>} Generated dialogue section
 */
export async function generateDevelopmentDialogue(context, summary) {
  return await tracer.startActiveSpan('dialogue.generate', {
    attributes: {
      'commit.hash': context.commit.data.hash,
      'gen_ai.request.model': DEFAULT_MODEL,
      'gen_ai.operation.name': 'chat',
      'gen_ai.provider.name': getProviderFromModel(DEFAULT_MODEL),
      'chat.messages.count': context.chatMessages.data.length,
    }
  }, async (span) => {
    try {
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
        model: DEFAULT_MODEL,
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

      // Add request payload attributes to span
      span.setAttributes({
        'gen_ai.request.model': requestPayload.model,
        'gen_ai.request.temperature': requestPayload.temperature,
        'ai.request.messages.count': requestPayload.messages.length, // Keep custom metric
      });

      // Add timeout wrapper (30 seconds)
      const completion = await Promise.race([
        openai.chat.completions.create(requestPayload),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
        )
      ]);

      const dialogue = completion.choices[0].message.content.trim();

      // Add response attributes to span
      span.setAttributes({
        'ai.response.length': dialogue.length, // Keep custom metric
        'gen_ai.response.model': completion.model,
        'gen_ai.usage.input_tokens': completion.usage?.prompt_tokens || 0,
        'gen_ai.usage.output_tokens': completion.usage?.completion_tokens || 0,
      });

      // Clean up formatting in assistant quotes for readability
      const cleanedDialogue = dialogue
        .replace(/\\"/g, '"')        // Remove escape characters from quotes
        .replace(/\\n/g, '\n');      // Convert literal \n to actual newlines

      span.setStatus({ code: SpanStatusCode.OK, message: 'Dialogue generated successfully' });
      return cleanedDialogue;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      console.error(`⚠️ Development Dialogue generation failed: ${error.message}`);
      return `[Development Dialogue generation failed: ${error.message}]`;
    } finally {
      span.end();
    }
  });
}