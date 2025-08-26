/**
 * Debug script to isolate the issue
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const repoPath = '/Users/whitney.lee/Documents/Repositories/commit_story';
const commitTime = new Date('2025-08-20T20:53:49+00:00');
const previousCommitTime = new Date('2025-08-14T21:45:01+00:00');

console.log('🔍 Debug: Step by step parser testing\n');

// Step 1: Test path encoding
const encodedPath = repoPath.replace(/[/.]/g, '-');
console.log(`1. Path encoding:`);
console.log(`   Original: ${repoPath}`);
console.log(`   Encoded: ${encodedPath}`);

// Step 2: Test directory existence  
const claudeDir = join(homedir(), '.claude', 'projects', encodedPath);
console.log(`\n2. Directory check:`);
console.log(`   Path: ${claudeDir}`);
console.log(`   Exists: ${existsSync(claudeDir)}`);

// Step 3: Test time window calculation
const bufferMs = 24 * 60 * 60 * 1000;
const startTime = new Date(previousCommitTime.getTime() - bufferMs);
const endTime = new Date(commitTime.getTime() + bufferMs);

console.log(`\n3. Time window (with 24h buffer):`);
console.log(`   Start: ${startTime.toISOString()}`);  
console.log(`   End: ${endTime.toISOString()}`);

// Step 4: Test file discovery
console.log(`\n4. File discovery:`);
try {
  const allFiles = readdirSync(claudeDir);
  const jsonlFiles = allFiles.filter(file => file.endsWith('.jsonl'));
  console.log(`   Total files: ${allFiles.length}`);
  console.log(`   JSONL files: ${jsonlFiles.length}`);
  
  const filteredFiles = [];
  for (const file of jsonlFiles) {
    const filePath = join(claudeDir, file);
    try {
      const stats = statSync(filePath);
      const inRange = stats.mtime >= startTime && stats.mtime <= endTime;
      console.log(`   ${file.substring(0,8)}...: ${stats.mtime.toISOString()} ${inRange ? '✅' : '❌'}`);
      if (inRange) {
        filteredFiles.push(filePath);
      }
    } catch (error) {
      console.log(`   ${file}: ERROR - ${error.message}`);
    }
  }
  
  console.log(`\n5. Files to process: ${filteredFiles.length}`);
  
  if (filteredFiles.length > 0) {
    // Step 6: Test first file processing
    console.log(`\n6. Testing first file processing:`);
    const firstFile = filteredFiles[0];
    console.log(`   File: ${firstFile}`);
    
    const content = readFileSync(firstFile, 'utf8');
    const lines = content.trim().split('\n');
    console.log(`   Total lines: ${lines.length}`);
    
    let matchingMessages = 0;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      try {
        const message = JSON.parse(lines[i]);
        const matches = message.cwd === repoPath;
        console.log(`   Line ${i+1}: cwd=${message.cwd}, matches=${matches}`);
        if (matches) matchingMessages++;
      } catch (e) {
        console.log(`   Line ${i+1}: JSON parse error`);
      }
    }
    console.log(`   Matching messages in first 5 lines: ${matchingMessages}`);
  }
  
} catch (error) {
  console.error(`Error: ${error.message}`);
}