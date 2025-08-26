/**
 * Test script for Claude Code JSONL Parser
 * Tests against real data from research findings
 */

import { extractChatForCommit } from './src/collectors/claude-collector.js';

console.log('🧪 Testing Claude Code JSONL Parser\n');

// Most recent commit validation
const commitTime = new Date('2025-08-20T16:40:45-05:00');        // f5bd975
const previousCommitTime = new Date('2025-08-20T15:53:49-05:00'); // b535d74  
const repoPath = '/Users/whitney.lee/Documents/Repositories/commit_story';

console.log('Test Parameters:');
console.log(`  Commit time: ${commitTime.toISOString()}`);
console.log(`  Previous commit: ${previousCommitTime.toISOString()}`);
console.log(`  Repository: ${repoPath}`);
console.log(`  Time window: ${Math.round((commitTime - previousCommitTime) / (1000 * 60 * 60 * 24))} days\n`);

console.log('⏳ Extracting messages...\n');

try {
  const messages = extractChatForCommit(commitTime, previousCommitTime, repoPath);
  
  console.log('✅ Extraction Results:');
  console.log(`  Messages found: ${messages.length}`);
  console.log(`  Expected from research: ~233 messages`);
  
  if (messages.length > 0) {
    console.log('\n📝 First message sample:');
    const first = messages[0];
    console.log(`  Timestamp: ${first.timestamp}`);
    console.log(`  Type: ${first.type}`);
    console.log(`  Role: ${first.message?.role}`);
    console.log(`  CWD: ${first.cwd}`);
    console.log(`  Session: ${first.sessionId?.substring(0, 8)}...`);
    
    console.log('\n📝 Last message sample:');  
    const last = messages[messages.length - 1];
    console.log(`  Timestamp: ${last.timestamp}`);
    console.log(`  Type: ${last.type}`);
    console.log(`  Role: ${last.message?.role}`);
    
    console.log('\n📊 Message Distribution:');
    const userMsgs = messages.filter(m => m.type === 'user').length;
    const assistantMsgs = messages.filter(m => m.type === 'assistant').length;
    console.log(`  User messages: ${userMsgs}`);
    console.log(`  Assistant messages: ${assistantMsgs}`);
    
    // Validate time filtering
    console.log('\n🕒 Time Validation:');
    const firstTime = new Date(first.timestamp.replace('Z', '+00:00'));
    const lastTime = new Date(last.timestamp.replace('Z', '+00:00'));
    const inRange = firstTime >= previousCommitTime && lastTime <= commitTime;
    console.log(`  First message time: ${firstTime.toISOString()}`);
    console.log(`  Last message time: ${lastTime.toISOString()}`);
    console.log(`  All messages in range: ${inRange ? '✅' : '❌'}`);
    
  } else {
    console.log('\n⚠️  No messages found - this could indicate:');
    console.log('  - Claude directory not found for this project');
    console.log('  - No chat activity during this time window');
    console.log('  - Path encoding or filtering issue');
  }
  
} catch (error) {
  console.error('❌ Test failed with error:');
  console.error(error);
}

console.log('\n🏁 Test complete');