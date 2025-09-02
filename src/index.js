#!/usr/bin/env node

/**
 * Commit Story - Automated Git Journal System
 * Main entry point for CLI usage and git hook integration
 */

import { config } from 'dotenv';
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