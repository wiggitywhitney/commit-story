#!/usr/bin/env node

/**
 * Commit Story - Automated Git Journal System
 * Main entry point for CLI usage and git hook integration
 */

// Initialize tracing BEFORE any other imports to ensure auto-instrumentation works
import './tracing.js';

import { config } from 'dotenv';
import OpenAI from 'openai';
import fs from 'fs';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { gatherContextForCommit } from './integrators/context-integrator.js';
import { generateJournalEntry } from './generators/journal-generator.js';
import { saveJournalEntry } from './managers/journal-manager.js';
import { OTEL } from './telemetry/standards.js';
import { getConfig } from './utils/config.js';
import { createNarrativeLogger } from './utils/trace-logger.js';

config({ quiet: true });

// Get configuration (using sync version for bootstrap)
const { debug: isDebugMode, dev: isDevMode } = (() => {
  try {
    const configPath = './commit-story.config.json';
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return {
        debug: configData.debug === true,
        dev: configData.dev === true
      };
    }
  } catch (error) {
    // Silently ignore config file errors - both modes default to false
  }
  return { debug: false, dev: false };
})();

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
 * Parses CLI arguments and executes journal generation with full telemetry correlation
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
export default async function main() {
  return await tracer.startActiveSpan(OTEL.span.main(), {
    attributes: {
      ...OTEL.attrs.repository({ path: process.cwd() }),
      'code.function': 'main'
    }
  }, async (span) => {

    // Parse CLI arguments with full telemetry correlation
    const { commitRef, isDryRun } = await tracer.startActiveSpan(OTEL.span.cli.parse_arguments(), {
      attributes: {
        'code.function': 'cli_argument_parsing'
      }
    }, (cliSpan) => {
      const logger = createNarrativeLogger('cli.parse_arguments');
      const startTime = Date.now();

      try {
        const args = process.argv.slice(2);
        const totalArguments = args.length;

        logger.start('CLI argument parsing', `Parsing ${totalArguments} command line arguments`, {
          total_args: totalArguments,
          raw_args: args.join(' ')
        });

        let commitRef = 'HEAD';
        let isDryRun = false;
        let processedArguments = 0;
        let unknownFlags = 0;
        let commitRefProvided = false;

        // Process arguments with detailed tracking
        for (const arg of args) {
          processedArguments++;

          if (arg === '--dry-run' || arg === '--test') {
            isDryRun = true;
            logger.decision('Flag processing', `Dry run mode enabled via ${arg} flag`, {
              flag: arg,
              dry_run_enabled: true,
              flag_type: arg === '--test' ? 'alias' : 'primary'
            });
          } else if (!arg.startsWith('--')) {
            commitRef = arg;
            commitRefProvided = true;
            logger.decision('Commit reference', `Using custom commit reference: ${arg}`, {
              commit_ref: arg,
              default_overridden: true
            });
          } else {
            unknownFlags++;
            logger.progress('Unknown flag', `Encountered unknown flag: ${arg}`, {
              unknown_flag: arg,
              action: 'ignored'
            });
          }
        }

        const parsingDuration = Date.now() - startTime;
        const attrs = OTEL.attrs.cli.parseArguments({
          totalArguments,
          processedArguments,
          dryRunFlag: isDryRun,
          commitRefProvided,
          commitRef,
          unknownFlags,
          parsingDuration
        });

        cliSpan.setAttributes(attrs);

        // Emit metrics for CLI argument analysis
        Object.entries(attrs).forEach(([name, value]) => {
          if (typeof value === 'number') {
            OTEL.metrics.histogram(name, value);
          } else if (typeof value === 'boolean') {
            OTEL.metrics.gauge(name, value ? 1 : 0);
          }
        });

        logger.complete('CLI parsing', `Arguments parsed successfully: commit=${commitRef}, dryRun=${isDryRun}`, {
          final_commit_ref: commitRef,
          final_dry_run: isDryRun,
          unknown_flags_count: unknownFlags,
          parsing_duration_ms: parsingDuration
        });

        cliSpan.setStatus({ code: SpanStatusCode.OK, message: 'CLI arguments parsed successfully' });
        cliSpan.end();

        return { commitRef, isDryRun };

      } catch (error) {
        const parsingDuration = Date.now() - startTime;

        logger.error('CLI parsing', 'Error parsing command line arguments', error, {
          error_type: 'cli_parsing_error',
          duration_ms: parsingDuration
        });

        cliSpan.recordException(error);
        cliSpan.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        cliSpan.end();

        throw error;
      }
    });

    // Add CLI results to main span
    span.setAttributes({
      [`${OTEL.NAMESPACE}.commit.ref`]: commitRef,
      [`${OTEL.NAMESPACE}.journal.dry_run`]: isDryRun
    });

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
  main();
}