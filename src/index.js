#!/usr/bin/env node

/**
 * Commit Story - Automated Git Journal System
 * Main entry point for CLI usage and git hook integration
 */

import { config } from 'dotenv';
import { gatherContextForCommit } from './integrators/context-integrator.js';

config();

/**
 * Main entry point - orchestrates the complete journal generation flow
 */
export default async function main() {
  try {
    console.log('🚀 Commit Story - Generating journal entry...');
    
    // Gather all context for the latest commit
    const context = await gatherContextForCommit();
    
    console.log('📊 Context Summary:');
    console.log(`   Commit: ${context.commit.hash.substring(0, 8)} - "${context.commit.message}"`);
    console.log(`   Chat Messages: ${context.chatMessages.length} messages found`);
    console.log(`   Previous Commit: ${context.previousCommit ? context.previousCommit.hash.substring(0, 8) : 'none (first commit)'}`);
    
    // TODO: M2.2 - Pass context to AI content generator
    // TODO: M2.3 - Save generated content to journal via journal-manager
    
    console.log('✅ Context gathering complete - ready for AI processing');
    
  } catch (error) {
    console.error('❌ Error generating journal entry:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}