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
import { selectContext } from './utils/context-selector.js';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { DEFAULT_MODEL } from '../config/openai.js';
import { OTEL, getProviderFromModel } from '../telemetry/standards.js';

// Get tracer instance for technical decisions generation instrumentation
const tracer = trace.getTracer('commit-story-technical-decisions', '1.0.0');


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
  return await tracer.startActiveSpan(OTEL.span.ai.technical(), {
    attributes: {
      ...OTEL.attrs.commit(context.commit.data),
      ...OTEL.attrs.genAI.request(DEFAULT_MODEL, 0.1, context.chatMessages.data.length),
      ...OTEL.attrs.chat({ count: context.chatMessages.data.length })
    }
  }, async (span) => {
    try {
      // Select both commit and chat data for technical decisions analysis
      const selected = selectContext(context, ['commit', 'chatMessages']);
      const cleanMessages = selected.data.chatMessages;

      // Check if any user messages are substantial enough for technical decisions analysis
      if (context.chatMetadata.data.userMessages.overTwentyCharacters === 0) {
        return "No significant technical decisions documented for this development session";
      }

      // Analyze file types to determine implementation status
      const diffLines = selected.data.commit.diff.split('\n');
      const changedFiles = diffLines
        .filter(line => line.startsWith('diff --git'))
        .map(line => line.match(/diff --git a\/(.+) b\/.+/)?.[1])
        .filter(Boolean);

      // Simple approach: documentation files are .md, .txt, README, CHANGELOG
      const docFiles = changedFiles.filter(file =>
        file.endsWith('.md') || file.endsWith('.txt') ||
        file.includes('README') || file.includes('CHANGELOG')
      );
      const nonDocFiles = changedFiles.filter(file => !docFiles.includes(file));

      // Generate dynamic prompt addition based on file analysis
      let implementationGuidance = '';
      if (nonDocFiles.length > 0) {
        implementationGuidance = `

IMPLEMENTED vs DISCUSSED:
- "Implemented" = Related to changed non-documentation files: ${nonDocFiles.join(', ')}
- "Discussed" = Related only to documentation files (${docFiles.join(', ')}) or no related files changed

INSTRUCTION: Mark decisions as "Implemented" only if they relate to these changed files: ${nonDocFiles.join(', ')}`;
      } else {
        implementationGuidance = `

INSTRUCTION: This commit only changes documentation files (${docFiles.join(', ')}). Mark ALL technical decisions as "Discussed" since no functional code was changed.`;
      }

      // Create fresh OpenAI instance (DD-016: prevent context bleeding)
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Build the complete prompt (DD-018: compose guidelines + section prompt)
      const guidelines = getAllGuidelines();

      const systemPrompt = `
${selected.description}

${technicalDecisionsPrompt}${implementationGuidance}

${guidelines}
  `.trim();

      // Prepare the filtered context for the AI
      const contextForAI = {
        git: {
          hash: selected.data.commit.hash,
          ...(selected.data.commit.message !== null && { message: selected.data.commit.message }),
          author: selected.data.commit.author,
          timestamp: selected.data.commit.timestamp,
          diff: selected.data.commit.diff
        },
        chat: cleanMessages
      };

      // Prepare request payload
      const requestPayload = {
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Here is the development session data:\n\n${JSON.stringify(contextForAI, null, 2)}` }
        ],
        temperature: 0.1, // Low temperature for consistent, factual extraction
      };

      // Add request payload attributes to span
      span.setAttributes(OTEL.attrs.genAI.request(
        requestPayload.model,
        requestPayload.temperature,
        requestPayload.messages.length
      ));

      // Add timeout wrapper (30 seconds)
      const response = await Promise.race([
        openai.chat.completions.create(requestPayload),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
        )
      ]);

      const technicalDecisions = response.choices[0].message.content.trim();

      // Add response attributes to span
      span.setAttributes(OTEL.attrs.genAI.usage({
        model: response.model,
        content: technicalDecisions,
        usage: response.usage
      }));

      span.setStatus({ code: SpanStatusCode.OK, message: 'Technical decisions generated successfully' });
      return technicalDecisions;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      console.error(`⚠️ Technical Decisions generation failed: ${error.message}`);
      return `[Technical Decisions generation failed: ${error.message}]`;
    } finally {
      span.end();
    }
  });
}