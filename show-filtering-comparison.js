#!/usr/bin/env node

/**
 * Show Filtering Comparison
 * 
 * Shows what gets filtered vs kept, with full message structure,
 * focusing on finding actual human text and identifying any unused fields.
 */

import { config } from 'dotenv';
import { gatherContextForCommit } from './src/integrators/context-integrator.js';
import { filterContext } from './src/generators/filters/context-filter.js';

config();

function analyzeMessage(msg) {
  const content = msg.message?.content;
  let category = 'unknown';
  let preview = '';
  
  if (msg.isMeta) {
    category = 'meta';
    preview = typeof content === 'string' ? content.substring(0, 100) : JSON.stringify(content).substring(0, 100);
  } else if (Array.isArray(content)) {
    if (content.some(item => item.type === 'tool_use')) {
      category = 'tool_call';
      const toolName = content.find(item => item.type === 'tool_use')?.name;
      preview = `Tool: ${toolName}`;
    } else if (content.some(item => item.type === 'tool_result')) {
      category = 'tool_result';
      const result = content.find(item => item.type === 'tool_result')?.content || '';
      preview = result.substring(0, 100);
    } else if (content.some(item => item.type === 'text')) {
      category = msg.type === 'assistant' ? 'assistant_text' : 'user_text';
      const text = content.find(item => item.type === 'text')?.text || '';
      preview = text.substring(0, 100);
    }
  } else if (typeof content === 'string') {
    category = msg.type === 'user' ? 'user_string' : 'assistant_string';
    preview = content.substring(0, 100);
  }
  
  return { category, preview };
}

function showMessageDetail(msg, index, label) {
  const { category, preview } = analyzeMessage(msg);
  
  console.log(`\n${label} #${index + 1}: [${msg.type}] ${category}`);
  console.log(`  Timestamp: ${msg.timestamp}`);
  console.log(`  Session: ${msg.sessionId?.substring(0, 8)}`);
  console.log(`  isMeta: ${msg.isMeta || false}`);
  console.log(`  Content: ${preview}${preview.length >= 100 ? '...' : ''}`);
  
  // Show all fields in the message to identify unused ones
  console.log(`  All fields: ${Object.keys(msg).join(', ')}`);
  if (msg.message) {
    console.log(`  Message fields: ${Object.keys(msg.message).join(', ')}`);
  }
  
  // Show full content structure for first few to understand format
  if (index < 3) {
    console.log(`  Full content structure:`);
    console.log(`    ${JSON.stringify(msg.message?.content, null, 2)}`);
  }
}

async function showFilteringComparison() {
  try {
    console.log('🔍 Analyzing what gets filtered vs kept...\n');
    
    const originalContext = await gatherContextForCommit();
    const filteredContext = filterContext(originalContext);
    
    const originalMessages = originalContext.chatMessages;
    const filteredMessages = filteredContext.chatMessages;
    
    console.log(`📊 FILTERING SUMMARY:`);
    console.log(`  Original: ${originalMessages.length} messages`);
    console.log(`  Kept: ${filteredMessages.length} messages`);
    console.log(`  Filtered: ${originalMessages.length - filteredMessages.length} messages`);
    
    // Create sets for comparison
    const keptIds = new Set(filteredMessages.map(m => m.uuid));
    const removedMessages = originalMessages.filter(m => !keptIds.has(m.uuid));
    
    // Categorize messages
    const categories = { kept: {}, removed: {} };
    
    filteredMessages.forEach(msg => {
      const { category } = analyzeMessage(msg);
      categories.kept[category] = (categories.kept[category] || 0) + 1;
    });
    
    removedMessages.forEach(msg => {
      const { category } = analyzeMessage(msg);
      categories.removed[category] = (categories.removed[category] || 0) + 1;
    });
    
    console.log(`\n📋 KEPT CATEGORIES:`);
    Object.entries(categories.kept).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
    
    console.log(`\n🗑️  REMOVED CATEGORIES:`);
    Object.entries(categories.removed).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
    
    // Show samples of kept messages (looking for actual human text)
    console.log(`\n✅ SAMPLE KEPT MESSAGES:`);
    console.log('='.repeat(80));
    
    const userTextMessages = filteredMessages.filter(msg => {
      const content = msg.message?.content;
      return msg.type === 'user' && typeof content === 'string' && content.length > 10;
    });
    
    const assistantTextMessages = filteredMessages.filter(msg => {
      const content = msg.message?.content;
      return msg.type === 'assistant' && Array.isArray(content) && 
             content.some(item => item.type === 'text' && item.text && item.text.length > 50);
    });
    
    console.log(`\nFound ${userTextMessages.length} user text messages with >10 chars:`);
    userTextMessages.slice(0, 3).forEach((msg, i) => showMessageDetail(msg, i, 'USER TEXT'));
    
    console.log(`\nFound ${assistantTextMessages.length} substantial assistant messages:`);
    assistantTextMessages.slice(0, 3).forEach((msg, i) => showMessageDetail(msg, i, 'ASSISTANT TEXT'));
    
    // Show samples of removed messages
    console.log(`\n\n🗑️  SAMPLE REMOVED MESSAGES:`);
    console.log('='.repeat(80));
    removedMessages.slice(0, 5).forEach((msg, i) => showMessageDetail(msg, i, 'REMOVED'));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

showFilteringComparison();