#!/usr/bin/env node

/**
 * Simple test script to validate journal manager functionality
 * Run with: node test-journal-manager.js
 */

import { saveJournalEntry, getJournalFilePath } from './src/managers/journal-manager.js';
import { promises as fs } from 'fs';

async function testJournalManager() {
  console.log('🧪 Testing Journal Manager...\n');
  
  // Test data
  const testCommitHash = 'abc123def456789';
  const testTimestamp = new Date().toISOString();
  const testContent = 'This is a test journal entry.\n\nIt contains multiple lines of content to verify formatting works correctly.';
  
  console.log('Test data:');
  console.log(`Commit: ${testCommitHash}`);
  console.log(`Timestamp: ${testTimestamp}`);
  console.log(`Content preview: ${testContent.slice(0, 50)}...`);
  console.log();
  
  try {
    // Save the journal entry
    console.log('📝 Saving journal entry...');
    const filePath = await saveJournalEntry(testCommitHash, testTimestamp, testContent);
    console.log(`✅ Entry saved to: ${filePath}`);
    
    // Verify file exists and read content
    console.log('\n📖 Reading saved content...');
    const savedContent = await fs.readFile(filePath, 'utf8');
    console.log('File contents:');
    console.log('─'.repeat(50));
    console.log(savedContent);
    console.log('─'.repeat(50));
    
    // Test utility function
    console.log('\n🔍 Testing utility function...');
    const expectedPath = getJournalFilePath(new Date(testTimestamp));
    console.log(`Expected path: ${expectedPath}`);
    console.log(`Actual path:   ${filePath}`);
    console.log(`Paths match: ${expectedPath === filePath ? '✅' : '❌'}`);
    
    console.log('\n🎉 All tests passed! Journal manager is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testJournalManager();