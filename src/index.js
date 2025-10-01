#!/usr/bin/env node

/**
 * Commit Story - Automated Git Journal System
 * Main entry point for CLI usage and git hook integration
 */

// Initialize tracing BEFORE any other imports to ensure auto-instrumentation works
import './tracing.js';

import { config } from 'dotenv';
import OpenAI from 'openai';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { gatherContextForCommit } from './integrators/context-integrator.js';
import { generateJournalEntry } from './generators/journal-generator.js';
import { saveJournalEntry } from './managers/journal-manager.js';
import { OTEL } from './telemetry/standards.js';
import { getConfig } from './utils/config.js';

config({ quiet: true });

// Get configuration
const { debug: isDebugMode, dev: isDevMode } = getConfig();

// Debug-only logging
const debugLog = (message) => {
  if (isDebugMode) {
    console.log(message);
  }
};

// Get tracer instance for manual instrumentation
const tracer = trace.getTracer('commit-story', '1.0.0');

/**
 * Main entry point - orchestrates the complete journal generation flow
 *
 * @param {string} commitRef - Git commit reference to generate journal for (default: 'HEAD')
 * @param {boolean} isDryRun - If true, generates journal content but doesn't save to file (default: false)
 *
 * CLI Usage:
 *   node src/index.js                    # Generate journal for HEAD commit
 *   node src/index.js abc123             # Generate journal for specific commit
 *   node src/index.js --dry-run          # Test generation without saving file
 *   node src/index.js --test             # Alias for --dry-run
 *   node src/index.js --dry-run abc123   # Test with specific commit
 *
 * Dry run mode:
 *   - Collects all context and generates journal content
 *   - Sends telemetry to Datadog (when dev: true)
 *   - Displays generated content instead of saving to file
 *   - Useful for testing without creating files to clean up
 */
export default async function main(commitRef = 'HEAD', isDryRun = false) {
  return await tracer.startActiveSpan(OTEL.span.main(), {
    attributes: {
      ...OTEL.attrs.repository({ path: process.cwd() }),
      [`${OTEL.NAMESPACE}.commit.ref`]: commitRef,
      [`${OTEL.NAMESPACE}.journal.dry_run`]: isDryRun,
      'code.function': 'main'
    }
  }, async (span) => {
    try {
      debugLog(`Starting context collection for commit ${commitRef.substring(0, 8)}`);
    
      // Gather all context for the specified commit
      const context = await gatherContextForCommit(commitRef);
      
      // Add context attributes to the span
      const contextAttrs = {
        ...OTEL.attrs.commit(context.commit.data),
        ...OTEL.attrs.chat({
          count: context.chatMessages.data.length,
          total: context.chatMetadata.data.totalMessages
        })
      };
      span.setAttributes(contextAttrs);

      // Emit context metrics for main execution analysis
      Object.entries(contextAttrs).forEach(([name, value]) => {
        if (typeof value === 'number') {
          OTEL.metrics.gauge(name, value);
        }
      });
      
      // Validate repository-specific chat data availability (DD-068)
      if (context.chatMetadata.data.totalMessages === 0) {
        span.addEvent('no-chat-data-found', {
          'commit_story.repository.path': process.cwd(),
          'commit_story.commit.timestamp': context.commit.data.timestamp,
        });
        debugLog(`❌ ERROR: No chat data found for this repository and time window`);
        span.setStatus({ code: SpanStatusCode.OK, message: 'No chat data found - graceful exit' });

        process.exit(0); // Graceful exit, not an error
      }
    
      debugLog(`Found ${context.chatMessages.data.length} chat messages`);
      debugLog('Found git metadata');
      
      // Validate OpenAI connectivity before expensive processing
      if (!process.env.OPENAI_API_KEY) {
        span.recordException(new Error('OPENAI_API_KEY not found in environment'));
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Missing OpenAI API key' });
        debugLog(`❌ ERROR: OPENAI_API_KEY not configured`);
        process.exit(1);
      }
    
      try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        await tracer.startActiveSpan(OTEL.span.connectivity(), {
          attributes: {
            'code.function': 'connectivity_test'
          }
        }, async (connectivitySpan) => {
          try {
            await client.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 1
            });
            connectivitySpan.setStatus({ code: SpanStatusCode.OK, message: 'OpenAI connectivity confirmed' });
            // OpenAI connectivity confirmed - no need to log in debug mode
          } catch (error) {
            connectivitySpan.recordException(error);
            connectivitySpan.setStatus({ code: SpanStatusCode.ERROR, message: 'OpenAI connectivity failed' });
            throw error;
          } finally {
            connectivitySpan.end();
          }
        });
      } catch (error) {
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'OpenAI connectivity failed' });
        debugLog(`❌ ERROR: OpenAI connectivity failed: ${error.message}`);
        process.exit(1);
      }
    
      // Generate all journal sections using AI and programmatic content
      const sections = await generateJournalEntry(context);
      
      // Add sections metadata to span
      const sectionsData = {
        summary: sections.summary?.length || 0,
        dialogue: sections.dialogue?.length || 0,
        technical: sections.technicalDecisions?.length || 0,
        details: sections.commitDetails?.length || 0
      };
      span.setAttributes(OTEL.attrs.sections(sectionsData));

      // Dual emission: emit section length metrics
      OTEL.metrics.gauge('commit_story.sections.summary_length', sectionsData.summary);
      OTEL.metrics.gauge('commit_story.sections.dialogue_length', sectionsData.dialogue);
      OTEL.metrics.gauge('commit_story.sections.technical_decisions_length', sectionsData.technical);
      OTEL.metrics.gauge('commit_story.sections.commit_details_length', sectionsData.details);
      OTEL.metrics.gauge('commit_story.sections.total_count', 4); // Always 4 sections
      
      // Save the complete journal entry to daily file (or show in dry-run mode)
      let filePath = null;
      if (isDryRun) {
        // Dry run mode: show the generated content without saving
        debugLog('--- DRY RUN MODE: Generated Journal Entry ---');
        console.log(sections);
        debugLog('--- End of Generated Content (not saved) ---');
        filePath = '[dry-run-no-file]';
      } else {
        // Normal mode: save to file
        filePath = await saveJournalEntry(
          context.commit.data.hash,
          context.commit.data.timestamp,
          context.commit.data.message,
          sections,
          context.previousCommit.data?.timestamp || null
        );
      }

      // Add final attributes
      const completionAttrs = OTEL.attrs.journal.completion({
        filePath: filePath,
        completed: !isDryRun
      });
      span.setAttributes(completionAttrs);

      // Emit completion metrics for main execution success tracking
      Object.entries(completionAttrs).forEach(([name, value]) => {
        if (typeof value === 'boolean') {
          OTEL.metrics.gauge(name, value ? 1 : 0);
        }
      });
      
      if (isDryRun) {
        debugLog('✅ Dry run complete: Journal generated successfully (not saved)');
      } else {
        debugLog(`✅ Journal saved to: ${filePath}`);
      }
      span.setStatus({ code: SpanStatusCode.OK, message: 'Journal entry generated successfully' });

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      console.error('❌ Error generating journal entry:', error.message);
      process.exit(1);
    } finally {
      // End span first, then let process handlers handle telemetry shutdown
      span.end();
      // Note: gracefulShutdown is handled by process event handlers in logging.js
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let commitRef = 'HEAD';
  let isDryRun = false;

  // Process arguments
  for (const arg of args) {
    if (arg === '--dry-run' || arg === '--test') {
      isDryRun = true;
    } else if (!arg.startsWith('--')) {
      commitRef = arg;
    }
  }

  main(commitRef, isDryRun);
}