#!/usr/bin/env node

/**
 * Show Raw Message Content
 * 
 * Displays actual Claude chat message content to understand the data format.
 */

import { config } from 'dotenv';
import { gatherContextForCommit } from '../../src/integrators/context-integrator.js';

config();

async function showRawMessages() {
  try {
    console.log('🔍 Showing actual Claude chat message content...\n');
    
    const context = await gatherContextForCommit();
    const messages = context.chatMessages;
    
    console.log(`📊 Total messages: ${messages.length}\n`);
    
    // Show first 10 messages with their full structure
    const sampleMessages = messages.slice(0, 10);
    
    for (let i = 0; i < sampleMessages.length; i++) {
      const msg = sampleMessages[i];
      
      console.log(`${'='.repeat(80)}`);
      console.log(`MESSAGE ${i + 1}:`);
      console.log(`${'='.repeat(80)}`);
      
      console.log('📋 Message Metadata:');
      console.log(`  Type: ${msg.type}`);
      console.log(`  isMeta: ${msg.isMeta || false}`);
      console.log(`  Timestamp: ${msg.timestamp}`);
      console.log(`  Session: ${msg.sessionId?.substring(0, 8)}`);
      
      console.log('\n📦 Message Content Structure:');
      console.log(`  Content Type: ${Array.isArray(msg.message?.content) ? 'array' : typeof msg.message?.content}`);
      
      if (Array.isArray(msg.message?.content)) {
        console.log(`  Array Length: ${msg.message.content.length}`);
        msg.message.content.forEach((item, idx) => {
          console.log(`  [${idx}] Item Type: ${item.type}`);
          if (item.type === 'text') {
            const text = item.text || '';
            console.log(`      Text Length: ${text.length}`);
            console.log(`      Text Preview: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
          } else if (item.type === 'tool_use') {
            console.log(`      Tool Name: ${item.name}`);
            console.log(`      Tool ID: ${item.id}`);
          } else if (item.type === 'tool_result') {
            console.log(`      Tool Use ID: ${item.tool_use_id}`);
            const content = item.content || '';
            console.log(`      Result Length: ${content.length}`);
            console.log(`      Result Preview: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
          }
        });
      } else if (typeof msg.message?.content === 'string') {
        const content = msg.message.content;
        console.log(`  String Length: ${content.length}`);
        console.log(`  String Content: ${content.substring(0, 300)}${content.length > 300 ? '...' : ''}`);
      }
      
      console.log('\n');
    }
    
  } catch (error) {
    console.error('❌ Error showing messages:', error.message);
  }
}

showRawMessages();