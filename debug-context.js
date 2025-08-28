#!/usr/bin/env node

/**
 * Message Structure Investigation
 * 
 * Analyzes actual Claude chat message structures to understand how to distinguish
 * tool calls from human dialogue for accurate filtering implementation.
 */

import { config } from 'dotenv';
import { gatherContextForCommit } from './src/integrators/context-integrator.js';

config();

function analyzeMessageStructure(messages) {
  const patterns = {
    byType: {},
    byContentType: {},
    examples: {
      human: [],
      assistant: [], 
      toolCalls: [],
      toolResults: [],
      meta: [],
      other: []
    }
  };
  
  for (const msg of messages) {
    // Analyze message.type
    patterns.byType[msg.type] = (patterns.byType[msg.type] || 0) + 1;
    
    // Analyze message.message.content type
    const content = msg.message?.content;
    const contentType = Array.isArray(content) ? 'array' : typeof content;
    patterns.byContentType[contentType] = (patterns.byContentType[contentType] || 0) + 1;
    
    // Categorize and collect examples
    let category = 'other';
    
    if (msg.isMeta) {
      category = 'meta';
    } else if (Array.isArray(content)) {
      // Check array elements for tool patterns
      const hasToolUse = content.some(item => item.type === 'tool_use');
      const hasToolResult = content.some(item => item.type === 'tool_result');
      
      if (hasToolUse) category = 'toolCalls';
      else if (hasToolResult) category = 'toolResults';
      else if (msg.type === 'user') category = 'human';
      else if (msg.type === 'assistant') category = 'assistant';
    } else if (typeof content === 'string') {
      if (msg.type === 'user') category = 'human';
      else if (msg.type === 'assistant') category = 'assistant';
    }
    
    // Collect examples (limit to avoid overwhelming output)
    if (patterns.examples[category].length < 2) {
      patterns.examples[category].push({
        type: msg.type,
        isMeta: msg.isMeta,
        contentType: contentType,
        contentStructure: Array.isArray(content) 
          ? content.map(item => ({ type: item.type, hasText: !!item.text, hasToolUseId: !!item.tool_use_id }))
          : null,
        contentPreview: Array.isArray(content) 
          ? `[${content.length} items]: ${content.map(item => item.type || 'text').join(', ')}`
          : typeof content === 'string' 
            ? content.length > 100 ? content.substring(0, 100) + '...' : content
            : String(content)
      });
    }
  }
  
  return patterns;
}

async function debugContext() {
  try {
    console.log('🔍 Investigating Claude chat message structure for filtering...\n');
    
    const context = await gatherContextForCommit();
    const messages = context.chatMessages;
    
    console.log(`📊 Total messages found: ${messages.length}\n`);
    
    const analysis = analyzeMessageStructure(messages);
    
    console.log('📋 MESSAGE TYPE DISTRIBUTION:');
    for (const [type, count] of Object.entries(analysis.byType)) {
      console.log(`   ${type}: ${count}`);
    }
    
    console.log('\n📦 CONTENT TYPE DISTRIBUTION:');
    for (const [type, count] of Object.entries(analysis.byContentType)) {
      console.log(`   ${type}: ${count}`);
    }
    
    console.log('\n🔍 MESSAGE CATEGORY EXAMPLES:');
    console.log('=' .repeat(80));
    
    for (const [category, examples] of Object.entries(analysis.examples)) {
      if (examples.length > 0) {
        console.log(`\n${category.toUpperCase()}:`);
        for (const example of examples) {
          console.log(`  Type: ${example.type}${example.isMeta ? ' (META)' : ''}`);
          console.log(`  Content: ${example.contentType}`);
          if (example.contentStructure) {
            console.log(`  Structure: ${JSON.stringify(example.contentStructure, null, 4)}`);
          }
          console.log(`  Preview: ${example.contentPreview}`);
          console.log('  ' + '-'.repeat(60));
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error investigating messages:', error.message);
  }
}

debugContext();