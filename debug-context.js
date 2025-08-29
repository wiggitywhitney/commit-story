#!/usr/bin/env node

import { gatherContextForCommit } from './src/integrators/context-integrator.js';
import { filterContext } from './src/generators/filters/context-filter.js';

async function main() {
  console.log('🔍 Debugging context structure...\n');
  
  const context = await gatherContextForCommit();
  const filteredContext = filterContext(context);
  
  console.log(`Found ${filteredContext.chatMessages.length} filtered messages\n`);
  
  // Show first 3 messages to see structure
  for (let i = 0; i < Math.min(3, filteredContext.chatMessages.length); i++) {
    const msg = filteredContext.chatMessages[i];
    console.log(`--- Message ${i + 1} ---`);
    console.log('Type:', msg.type);
    console.log('Content type:', typeof msg.message?.content);
    console.log('Content preview:', JSON.stringify(msg.message?.content, null, 2).substring(0, 200) + '...');
    console.log('');
  }
  
  // Show what we send to AI (same format as dialogue generator)
  console.log('=== What gets sent to AI (dialogue generator format) ===');
  const contextForAI = {
    chat: filteredContext.chatMessages.slice(0, 3).map(msg => ({
      type: msg.type,
      content: msg.message?.content,
      timestamp: msg.timestamp,
    }))
  };
  
  console.log(JSON.stringify(contextForAI, null, 2));
  
  console.log('\n=== Content types check ===');
  for (let i = 0; i < Math.min(3, filteredContext.chatMessages.length); i++) {
    const msg = filteredContext.chatMessages[i];
    console.log(`Message ${i + 1}: ${msg.type}`);
    console.log(`Content is: ${typeof msg.message?.content}`);
    console.log(`Content: "${msg.message?.content?.substring(0, 100)}..."`);
    console.log('---');
  }
}

main().catch(console.error);
