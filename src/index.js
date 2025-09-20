#!/usr/bin/env node

/**
 * Commit Story - Automated Git Journal System
 * Main entry point for CLI usage and git hook integration
 */

// Initialize tracing BEFORE any other imports to ensure auto-instrumentation works
import './tracing-simple.js';

import { config } from 'dotenv';
import OpenAI from 'openai';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { gatherContextForCommit } from './integrators/context-integrator.js';
import { generateJournalEntry } from './generators/journal-generator.js';
import { saveJournalEntry } from './managers/journal-manager.js';
import { OTEL } from './telemetry/standards.js';

config();

// Get tracer instance for manual instrumentation
const tracer = trace.getTracer('commit-story', '1.0.0');

/**
 * Main entry point - orchestrates the complete journal generation flow
 */
export default async function main(commitRef = 'HEAD') {
  return await tracer.startActiveSpan(OTEL.span.main(), {
    attributes: {
      ...OTEL.attrs.repository({ path: process.cwd() }),
      [`${OTEL.NAMESPACE}.commit.ref`]: commitRef
    }
  }, async (span) => {
    try {
      console.log(`🚀 Commit Story - Generating journal entry for ${commitRef}...`);
    
      // Gather all context for the specified commit
      const context = await gatherContextForCommit(commitRef);
      
      // Add context attributes to the span
      span.setAttributes({
        ...OTEL.attrs.commit(context.commit.data),
        ...OTEL.attrs.chat({
          count: context.chatMessages.data.length,
          total: context.chatMetadata.data.totalMessages
        })
      });
      
      // Validate repository-specific chat data availability (DD-068)
      if (context.chatMetadata.data.totalMessages === 0) {
        span.addEvent('no-chat-data-found', {
          'commit_story.repository.path': process.cwd(),
          'commit_story.commit.timestamp': context.commit.data.timestamp,
        });
        console.log(`⚠️  No chat data found for this repository and time window`);
        console.log(`   Repository: ${process.cwd()}`);
        console.log(`   Time window: ${context.commit.data.timestamp}`);
        console.log(`   This may indicate the commit was made outside of Claude Code sessions.`);
        span.setStatus({ code: SpanStatusCode.OK, message: 'No chat data found - graceful exit' });
        span.end();
        process.exit(0); // Graceful exit, not an error
      }
    
      console.log('📊 Context Summary:');
      console.log(`   Commit: ${context.commit.data.hash.substring(0, 8)} - "${context.commit.data.message}"`);
      console.log(`   Chat Messages: ${context.chatMessages.data.length} messages found`);
      
      // Validate OpenAI connectivity before expensive processing
      console.log('🔑 Validating OpenAI connectivity...');
      if (!process.env.OPENAI_API_KEY) {
        span.recordException(new Error('OPENAI_API_KEY not found in environment'));
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Missing OpenAI API key' });
        console.log(`⚠️  OPENAI_API_KEY not found in environment`);
        console.log(`   Set your API key in .env file or run: npm run journal-ai-connectivity`);
        span.end();
        process.exit(1);
      }
    
      try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        await tracer.startActiveSpan(OTEL.span.connectivity(), async (connectivitySpan) => {
          try {
            await client.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 1
            });
            connectivitySpan.setStatus({ code: SpanStatusCode.OK, message: 'OpenAI connectivity confirmed' });
            console.log('   ✅ OpenAI connectivity confirmed');
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
        console.log(`⚠️  OpenAI connectivity failed: ${error.message}`);
        console.log(`   Run: npm run journal-ai-connectivity for detailed diagnostics`);
        span.end();
        process.exit(1);
      }
    
      // Generate all journal sections using AI and programmatic content
      const sections = await generateJournalEntry(context);
      
      // Add sections metadata to span
      span.setAttributes(OTEL.attrs.sections({
        summary: sections.summary?.length || 0,
        dialogue: sections.dialogue?.length || 0,
        technical: sections.technicalDecisions?.length || 0,
        details: sections.commitDetails?.length || 0
      }));
      
      // Save the complete journal entry to daily file
      const filePath = await saveJournalEntry(
        context.commit.data.hash,
        context.commit.data.timestamp,
        context.commit.data.message,
        sections
      );
      
      // Add final attributes
      span.setAttributes(OTEL.attrs.journal({
        filePath: filePath,
        completed: true
      }));
      
      console.log(`✅ Journal entry saved to: ${filePath}`);
      span.setStatus({ code: SpanStatusCode.OK, message: 'Journal entry generated successfully' });
      
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      console.error('❌ Error generating journal entry:', error.message);
      process.exit(1);
    } finally {
      span.end();
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const commitRef = process.argv[2] || 'HEAD';
  main(commitRef);
}