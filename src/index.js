#!/usr/bin/env node

/**
 * Commit Story - Automated Git Journal System
 * Main entry point for CLI usage and git hook integration
 */

import { config } from 'dotenv';
import OpenAI from 'openai';
import { gatherContextForCommit } from './integrators/context-integrator.js';
import { generateJournalEntry } from './generators/journal-generator.js';
import { saveJournalEntry } from './managers/journal-manager.js';

config();

/**
 * Main entry point - orchestrates the complete journal generation flow
 */
export default async function main(commitRef = 'HEAD') {
  try {
    console.log(`🚀 Commit Story - Generating journal entry for ${commitRef}...`);
    
    // Gather all context for the specified commit
    const context = await gatherContextForCommit(commitRef);
    
    // Validate repository-specific chat data availability (DD-068)
    if (context.chatMetadata.data.totalMessages === 0) {
      console.log(`⚠️  No chat data found for this repository and time window`);
      console.log(`   Repository: ${process.cwd()}`);
      console.log(`   Time window: ${context.commit.data.timestamp}`);
      console.log(`   This may indicate the commit was made outside of Claude Code sessions.`);
      process.exit(0); // Graceful exit, not an error
    }
    
    console.log('📊 Context Summary:');
    console.log(`   Commit: ${context.commit.data.hash.substring(0, 8)} - "${context.commit.data.message}"`);
    console.log(`   Chat Messages: ${context.chatMessages.data.length} messages found`);
    
    // Validate OpenAI connectivity before expensive processing
    console.log('🔑 Validating OpenAI connectivity...');
    if (!process.env.OPENAI_API_KEY) {
      console.log(`⚠️  OPENAI_API_KEY not found in environment`);
      console.log(`   Set your API key in .env file or run: npm run journal-ai-connectivity`);
      process.exit(1);
    }
    
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      });
      console.log('   ✅ OpenAI connectivity confirmed');
    } catch (error) {
      console.log(`⚠️  OpenAI connectivity failed: ${error.message}`);
      console.log(`   Run: npm run journal-ai-connectivity for detailed diagnostics`);
      process.exit(1);
    }
    
    // Generate all journal sections using AI and programmatic content
    const sections = await generateJournalEntry(context);
    
    // Save the complete journal entry to daily file
    const filePath = await saveJournalEntry(
      context.commit.data.hash,
      context.commit.data.timestamp,
      sections
    );
    
    console.log(`✅ Journal entry saved to: ${filePath}`);
    
  } catch (error) {
    console.error('❌ Error generating journal entry:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const commitRef = process.argv[2] || 'HEAD';
  main(commitRef);
}