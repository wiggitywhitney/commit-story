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
import { OTEL, getProviderFromModel } from '../telemetry/standards.js';
import { createNarrativeLogger } from '../utils/trace-logger.js';

// Get tracer instance for dialogue generation instrumentation
const tracer = trace.getTracer('commit-story-dialogue', '1.0.0');


/**
 * Generates development dialogue for a development session using summary-guided extraction
 *
 * @param {Object} context - Self-documenting context object from context integrator
 * @param {string} summary - Generated summary of the development session
 * @returns {Promise<string>} Generated dialogue section
 */
export async function generateDevelopmentDialogue(context, summary) {
  return await tracer.startActiveSpan(OTEL.span.ai.dialogue(), {
    attributes: {
      ...OTEL.attrs.commit(context.commit.data),
      ...OTEL.attrs.genAI.request(DEFAULT_MODEL, 0.7, context.chatMessages.data.length),
      ...OTEL.attrs.chat({ count: context.chatMessages.data.length })
    }
  }, async (span) => {
    const logger = createNarrativeLogger('ai.generate_dialogue');

    try {
      logger.start('dialogue generation', 'Starting dialogue extraction from chat messages');

      // Select chat messages and metadata for dialogue extraction (ignore git data)
      const selected = selectContext(context, ['chatMessages', 'chatMetadata']);
      const cleanMessages = selected.data.chatMessages;

      // Check if any user messages are substantial enough for dialogue extraction (DD-054)
      if (context.chatMetadata.data.userMessages.overTwentyCharacters === 0) {
        logger.decision('dialogue generation', 'No substantial user messages found - skipping dialogue generation');
        return "No significant dialogue found for this development session";
      }

      logger.progress('dialogue generation', `Found ${context.chatMetadata.data.userMessages.overTwentyCharacters} substantial user messages`);

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
      span.setAttributes(OTEL.attrs.genAI.request(
        requestPayload.model,
        requestPayload.temperature,
        requestPayload.messages.length
      ));

      // Add timeout wrapper (30 seconds)
      const completion = await Promise.race([
        openai.chat.completions.create(requestPayload),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
        )
      ]);

      const dialogue = completion.choices[0].message.content.trim();

      // Add response attributes to span
      span.setAttributes(OTEL.attrs.genAI.usage({
        model: completion.model,
        content: dialogue,
        usage: completion.usage
      }));

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