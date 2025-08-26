#!/usr/bin/env node

/**
 * Debug script to examine the actual context data being gathered
 */

import { config } from 'dotenv';
import { gatherContextForCommit } from './src/integrators/context-integrator.js';

config();

async function debugContext() {
  try {
    console.log('🔍 Debugging context gathering...\n');
    
    const context = await gatherContextForCommit();
    
    console.log('=== COMMIT DATA ===');
    console.log(`Hash: ${context.commit.hash}`);
    console.log(`Message: "${context.commit.message}"`);
    console.log(`Author: ${context.commit.author.name} <${context.commit.author.email}>`);
    console.log(`Timestamp: ${context.commit.timestamp}`);
    console.log(`Diff length: ${context.commit.diff.length} chars`);
    
    console.log('\n=== PREVIOUS COMMIT ===');
    if (context.previousCommit) {
      console.log(`Hash: ${context.previousCommit.hash}`);
      console.log(`Timestamp: ${context.previousCommit.timestamp}`);
    } else {
      console.log('No previous commit (first commit)');
    }
    
    console.log('\n=== TIME WINDOW ===');
    const startTime = context.previousCommit?.timestamp || new Date(context.commit.timestamp.getTime() - 24*60*60*1000);
    console.log(`Start: ${startTime}`);
    console.log(`End: ${context.commit.timestamp}`);
    console.log(`Duration: ${Math.round((context.commit.timestamp - startTime) / (1000 * 60))} minutes`);
    
    console.log('\n=== CHAT MESSAGES ===');
    console.log(`Total messages: ${context.chatMessages.length}`);
    
    // Filter for messages with actual content
    const messagesWithContent = context.chatMessages.filter(msg => {
      const content = msg.message?.content;
      const contentText = Array.isArray(content) ? content[0]?.text : content;
      return contentText && contentText.trim().length > 0;
    });
    
    console.log(`Messages with content: ${messagesWithContent.length} (${Math.round(100 * messagesWithContent.length / context.chatMessages.length)}%)`);
    
    if (messagesWithContent.length > 0) {
      console.log('\n=== ALL MEANINGFUL CONTENT ===');
      messagesWithContent.forEach((msg, i) => {
        console.log(`\n--- Message ${i+1}/${messagesWithContent.length} ---`);
        console.log(`Time: ${msg.timestamp}`);
        console.log(`Type: [${msg.type}] (${msg.message?.role})`);
        console.log(`Session: ${msg.sessionId?.substring(0, 8)}`);
        const content = msg.message?.content;
        const contentText = Array.isArray(content) ? content[0]?.text : content;
        console.log(`Content:`);
        console.log(contentText);
        console.log('---');
      });
    } else {
      console.log('No messages with meaningful content found');
    }
    
    // Show breakdown of message types
    console.log('\n=== MESSAGE TYPE BREAKDOWN ===');
    const typeBreakdown = {};
    context.chatMessages.forEach(msg => {
      const hasContent = msg.message?.content && (Array.isArray(msg.message.content) ? msg.message.content[0]?.text : msg.message.content);
      const key = `${msg.type}-${hasContent ? 'with-content' : 'empty'}`;
      typeBreakdown[key] = (typeBreakdown[key] || 0) + 1;
    });
    
    Object.entries(typeBreakdown).forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugContext();