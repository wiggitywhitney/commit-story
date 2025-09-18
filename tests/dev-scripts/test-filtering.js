#!/usr/bin/env node

/**
 * Test Context Filtering
 * 
 * Development script to validate that context filtering resolves the 169-message
 * token limit issue discovered during M2.2a testing.
 * 
 * Usage: node tests/dev-scripts/test-filtering.js <commit1> [commit2] [commit3] ...
 *
 * Examples:
 *   node tests/dev-scripts/test-filtering.js cbf15b1
 *   node tests/dev-scripts/test-filtering.js cbf15b1 151b761 08ed62f
 *   node tests/dev-scripts/test-filtering.js HEAD HEAD~1 HEAD~2
 */

import { execSync } from 'child_process';
import { extractChatForCommit } from '../../src/collectors/claude-collector.js';
import { filterContext } from '../../src/generators/filters/context-filter.js';

function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  return Math.ceil(text.length / 4);
}

function getMessageContentString(message) {
  if (!message.message || !message.message.content) return '';
  const content = message.message.content;
  return typeof content === 'string' ? content : JSON.stringify(content);
}

async function getCommitData(commitHash) {
  // Get specific commit data
  const commitInfo = execSync(
    `git log -1 --format="%H|%s|%an|%ct" ${commitHash}`, 
    { encoding: 'utf8', cwd: process.cwd() }
  ).trim();
  
  const [hash, message, author, timestamp] = commitInfo.split('|');
  
  // Get diff for this commit
  const diff = execSync(
    `git show --format="" ${commitHash}`, 
    { encoding: 'utf8', cwd: process.cwd(), maxBuffer: 10 * 1024 * 1024 }
  );
  
  return {
    hash,
    message,
    author,
    timestamp: new Date(parseInt(timestamp) * 1000),
    diff
  };
}

async function getPreviousCommitData(currentCommitHash) {
  try {
    const previousCommitInfo = execSync(
      `git log -1 --format="%H|%ct" ${currentCommitHash}~1`, 
      { encoding: 'utf8', cwd: process.cwd() }
    ).trim();
    
    const [hash, timestamp] = previousCommitInfo.split('|');
    
    return {
      hash,
      timestamp: new Date(parseInt(timestamp) * 1000)
    };
  } catch (error) {
    return null; // No previous commit
  }
}

async function testCommitFiltering(commitHash) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔍 TESTING: ${commitHash}`);
  console.log(`${'='.repeat(80)}`);
  
  try {
    // Get commit data
    const commit = await getCommitData(commitHash);
    const previousCommit = await getPreviousCommitData(commitHash);
    
    console.log(`📅 Commit: ${commit.hash.substring(0, 8)} - ${commit.message}`);
    console.log(`⏰ Time: ${commit.timestamp.toISOString()}`);
    
    // Get chat messages for this commit's time window
    const chatMessages = await extractChatForCommit(
      commit.timestamp,
      previousCommit?.timestamp || null,
      process.cwd()
    );
    
    // Create context object
    const originalContext = {
      commit,
      chatMessages: chatMessages || [],
      previousCommit
    };
    
    console.log('\n📊 ORIGINAL CONTEXT:');
    console.log(`   Messages: ${originalContext.chatMessages.length}`);
    
    const originalChatTokens = originalContext.chatMessages.reduce((sum, msg) => {
      return sum + estimateTokens(getMessageContentString(msg));
    }, 0);
    
    const originalDiffTokens = estimateTokens(originalContext.commit?.diff || '');
    const originalTotal = originalChatTokens + originalDiffTokens + 2000;
    
    console.log(`   Chat tokens: ~${originalChatTokens.toLocaleString()}`);
    console.log(`   Diff tokens: ~${originalDiffTokens.toLocaleString()}`);
    console.log(`   Total estimated: ~${originalTotal.toLocaleString()}`);
    console.log(`   Status: ${originalTotal > 128000 ? '❌ EXCEEDS LIMIT' : '✅ Within limits'}`);
    
    // Apply filtering if context is large
    if (originalTotal > 120000 || originalContext.chatMessages.length > 100) {
      console.log('\n🔄 Applying context filtering...');
      const filteredContext = filterContext(originalContext);
      
      console.log('\n📊 FILTERED CONTEXT:');
      console.log(`   Messages: ${filteredContext.chatMessages.length}`);
      
      const filteredChatTokens = filteredContext.chatMessages.reduce((sum, msg) => {
        return sum + estimateTokens(getMessageContentString(msg));
      }, 0);
      
      const filteredDiffTokens = estimateTokens(filteredContext.commit?.diff || '');
      const filteredTotal = filteredChatTokens + filteredDiffTokens + 2000;
      
      console.log(`   Chat tokens: ~${filteredChatTokens.toLocaleString()}`);
      console.log(`   Diff tokens: ~${filteredDiffTokens.toLocaleString()}`);  
      console.log(`   Total estimated: ~${filteredTotal.toLocaleString()}`);
      console.log(`   Status: ${filteredTotal > 128000 ? '❌ STILL EXCEEDS' : '✅ Within limits'}`);
      
      // Show reduction stats
      const messageReduction = ((originalContext.chatMessages.length - filteredContext.chatMessages.length) / originalContext.chatMessages.length * 100).toFixed(1);
      const tokenReduction = ((originalTotal - filteredTotal) / originalTotal * 100).toFixed(1);
      
      console.log('\n📉 REDUCTION STATS:');
      console.log(`   Messages filtered: ${originalContext.chatMessages.length - filteredContext.chatMessages.length} (${messageReduction}%)`);
      console.log(`   Tokens saved: ~${(originalTotal - filteredTotal).toLocaleString()} (${tokenReduction}%)`);
      
      // Show samples of filtered vs kept messages
      console.log('\n🗑️  SAMPLE FILTERED MESSAGES (what was removed):');
      console.log('━'.repeat(60));
      
      const filteredMessageIds = new Set(filteredContext.chatMessages.map(m => m.uuid));
      const removedMessages = originalContext.chatMessages.filter(m => !filteredMessageIds.has(m.uuid));
      
      for (const msg of removedMessages.slice(0, 3)) {
        const contentStr = getMessageContentString(msg);
        const preview = contentStr.length > 300 ? contentStr.substring(0, 300) + '...' : contentStr;
        console.log(`[${msg.type}${msg.isMeta ? ' META' : ''}] ${preview}\n`);
      }
      
      console.log('\n✅ SAMPLE KEPT MESSAGES (what was preserved):');
      console.log('━'.repeat(60));
      
      for (const msg of filteredContext.chatMessages.slice(0, 3)) {
        const contentStr = getMessageContentString(msg);
        const preview = contentStr.length > 300 ? contentStr.substring(0, 300) + '...' : contentStr;
        console.log(`[${msg.type}${msg.isMeta ? ' META' : ''}] ${preview}\n`);
      }
      
      return filteredTotal <= 128000;
    } else {
      console.log('\n✅ No filtering needed - already within limits');
      return true;
    }
    
  } catch (error) {
    console.error(`❌ Error testing ${commitHash}:`, error.message);
    return false;
  }
}

async function main() {
  const [,, ...commitHashes] = process.argv;
  
  if (commitHashes.length === 0) {
    console.error('Usage: node tests/dev-scripts/test-filtering.js <commit1> [commit2] [commit3] ...');
    console.error('Examples:');
    console.error('  node tests/dev-scripts/test-filtering.js cbf15b1');
    console.error('  node tests/dev-scripts/test-filtering.js cbf15b1 151b761 08ed62f');
    console.error('  node tests/dev-scripts/test-filtering.js HEAD HEAD~1 HEAD~2');
    process.exit(1);
  }
  
  console.log(`🔄 Testing context filtering with ${commitHashes.length} commit(s)...`);
  
  let allPassed = true;
  
  for (const commitHash of commitHashes) {
    const passed = await testCommitFiltering(commitHash);
    if (!passed) allPassed = false;
  }
  
  console.log(`\n${'='.repeat(80)}`);
  if (allPassed) {
    console.log('✅ SUCCESS: All tested commits work with filtering!');
  } else {
    console.log('❌ FAILURE: Some commits still exceed limits after filtering');
  }
  console.log(`${'='.repeat(80)}`);
}

main();