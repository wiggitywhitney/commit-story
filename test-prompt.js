#!/usr/bin/env node

/**
 * Test Harness for Prompt Validation
 * 
 * Enables rapid iteration on journal section prompts before system integration.
 * Usage: node test-prompt.js <commit> <section>
 * 
 * Examples:
 *   node test-prompt.js HEAD summary
 *   node test-prompt.js HEAD dialogue
 *   node test-prompt.js HEAD~1 summary
 *   node test-prompt.js abc1234 summary
 */

import { gatherContextForCommit } from './src/integrators/context-integrator.js';
import { generateSummary } from './src/generators/summary-generator.js';
import { generateDevelopmentDialogue } from './src/generators/dialogue-generator.js';

/**
 * Filters PRD files from git diff for testing prompt robustness
 * @param {string} diff - Original git diff content
 * @returns {string} Diff with PRD file changes removed
 */
function filterPrdFromDiff(diff) {
  const lines = diff.split('\n');
  const filteredLines = [];
  let skipMode = false;
  
  for (const line of lines) {
    // Check if we're starting a new file diff
    if (line.startsWith('diff --git')) {
      // Check if this is a PRD file
      skipMode = line.includes('prds/') || line.includes('.md') && line.toLowerCase().includes('prd');
    }
    
    // If we're not in skip mode, keep the line
    if (!skipMode) {
      filteredLines.push(line);
    }
  }
  
  return filteredLines.join('\n');
}

/**
 * Filters chat messages containing PRD codes for testing prompt robustness
 * @param {Array} messages - Original chat messages
 * @returns {Array} Messages with PRD-referencing messages removed
 */
function filterPrdFromChat(messages) {
  const prdPattern = /(?:TR|DD|FR|R)-\d+|M\d+\.\d+[a-z]?|PRD-\d+|prd-\d+|PRD\s*#\s*\d+/;
  
  return messages.filter(msg => {
    const content = msg.message?.content || '';
    return !prdPattern.test(content);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const commitRef = args[0];
  const section = args[1];
  const noPrdFlag = args.includes('--no-prd');
  
  if (!commitRef || !section) {
    console.error('Usage: node test-prompt.js <commit> <section> [--no-prd]');
    console.error('Examples:');
    console.error('  node test-prompt.js HEAD summary');
    console.error('  node test-prompt.js HEAD dialogue');
    console.error('  node test-prompt.js HEAD~1 summary');
    console.error('  node test-prompt.js HEAD summary --no-prd');
    process.exit(1);
  }
  
  if (section !== 'summary' && section !== 'dialogue') {
    console.error('Only "summary" and "dialogue" sections are currently implemented');
    process.exit(1);
  }
  
  try {
    console.log(`🔄 Testing ${section} prompt with commit ${commitRef}${noPrdFlag ? ' (excluding PRD)' : ''}...`);
    console.log('');
    
    // Gather context for the commit
    console.log('📊 Gathering context...');
    const context = await gatherContextForCommit(commitRef);
    
    // Apply PRD filtering if requested
    if (noPrdFlag) {
      console.log('🚫 Filtering PRD files from context...');
      context.commit.diff = filterPrdFromDiff(context.commit.diff);
      context.commit.message = null;
      
      const originalCount = context.chatMessages.length;
      context.chatMessages = filterPrdFromChat(context.chatMessages);
      const filteredCount = originalCount - context.chatMessages.length;
      console.log(`🚫 Filtered ${filteredCount} PRD-referencing chat messages`);
    }
    
    console.log(`✅ Found ${context.chatMessages.length} chat messages`);
    console.log(`✅ Commit: ${context.commit.hash.substring(0, 8)} - ${context.commit.message}`);
    console.log('');
    
    // Generate the requested section
    let result;
    if (section === 'summary') {
      console.log('🤖 Generating summary...');
      result = await generateSummary(context);
      
      console.log('');
      console.log('📝 Generated Summary:');
      console.log('━'.repeat(60));
      console.log(result);
      console.log('━'.repeat(60));
    } else if (section === 'dialogue') {
      console.log('🤖 Generating summary first (required for dialogue extraction)...');
      const summary = await generateSummary(context);
      
      console.log('🤖 Generating development dialogue using summary guidance...');
      result = await generateDevelopmentDialogue(summary, context.chatMessages);
      
      console.log('');
      console.log('📝 Summary (used as guidance):');
      console.log('─'.repeat(60));
      console.log(summary);
      console.log('─'.repeat(60));
      console.log('');
      console.log('💬 Generated Development Dialogue:');
      console.log('━'.repeat(60));
      console.log(result);
      console.log('━'.repeat(60));
    }
    
  } catch (error) {
    console.error('❌ Error testing prompt:', error.message);
    process.exit(1);
  }
}

main();