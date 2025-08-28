#!/usr/bin/env node

/**
 * Test Harness for Prompt Validation
 * 
 * Enables rapid iteration on journal section prompts before system integration.
 * Usage: node test-prompt.js <commit> <section>
 * 
 * Examples:
 *   node test-prompt.js HEAD summary
 *   node test-prompt.js HEAD~1 summary
 *   node test-prompt.js abc1234 summary
 */

import { gatherContextForCommit } from './src/integrators/context-integrator.js';
import { generateSummary } from './src/generators/summary-generator.js';

async function main() {
  const [,, commitRef, section] = process.argv;
  
  if (!commitRef || !section) {
    console.error('Usage: node test-prompt.js <commit> <section>');
    console.error('Examples:');
    console.error('  node test-prompt.js HEAD summary');
    console.error('  node test-prompt.js HEAD~1 summary');
    process.exit(1);
  }
  
  if (section !== 'summary') {
    console.error('Only "summary" section is currently implemented');
    process.exit(1);
  }
  
  try {
    console.log(`🔄 Testing ${section} prompt with commit ${commitRef}...`);
    console.log('');
    
    // Gather context for the commit
    console.log('📊 Gathering context...');
    const context = await gatherContextForCommit();
    
    console.log(`✅ Found ${context.chatMessages.length} chat messages`);
    console.log(`✅ Commit: ${context.commit.hash.substring(0, 8)} - ${context.commit.message}`);
    console.log('');
    
    // Generate the summary
    console.log('🤖 Generating summary...');
    const summary = await generateSummary(context);
    
    console.log('');
    console.log('📝 Generated Summary:');
    console.log('━'.repeat(60));
    console.log(summary);
    console.log('━'.repeat(60));
    
  } catch (error) {
    console.error('❌ Error testing prompt:', error.message);
    process.exit(1);
  }
}

main();