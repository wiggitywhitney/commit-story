/**
 * Claude Code Chat Data Collector
 * Extracts chat messages from Claude Code JSONL files for git commit time windows
 * Based on research findings in /docs/claude-chat-research.md
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

/**
 * Extract chat messages for a specific commit time window
 * @param {Date} commitTime - Current commit timestamp (UTC)
 * @param {Date} previousCommitTime - Previous commit timestamp (UTC)
 * @param {string} repoPath - Full path to repository (for cwd filtering)
 * @returns {Array} Sorted array of complete chat message objects from the time window
 */
export function extractChatForCommit(commitTime, previousCommitTime, repoPath) {
  const messages = [];
  
  // 1. Find all Claude JSONL files
  const files = findClaudeFiles();
  
  // 2. Process each JSONL file
  for (const filePath of files) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue; // Skip empty lines
        
        try {
          const message = JSON.parse(line);
          
          // 3. Filter by project using cwd field
          if (message.cwd !== repoPath) continue;
          
          // 4. Filter by time window
          const messageTime = parseTimestamp(message.timestamp);
          if (!messageTime) continue;
          
          if (previousCommitTime <= messageTime && messageTime <= commitTime) {
            messages.push(message); // Full message object
          }
        } catch (parseError) {
          // Skip malformed JSON lines, continue processing
          continue;
        }
      }
    } catch (fileError) {
      // Skip files that can't be read, continue with other files
      continue;
    }
  }
  
  // 5. Sort by timestamp in chronological order
  return messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/**
 * Find Claude Code session files modified around the commit time window
 * Uses file modification time to avoid processing all session files
 * @param {string} repoPath - Repository path for directory encoding
 * @param {Date} commitTime - Current commit timestamp
 * @param {Date} previousCommitTime - Previous commit timestamp  
 * @returns {Array<string>} Array of file paths to process
 */
function findClaudeFiles() {
  // Find all Claude Code JSONL files across all project directories
  const claudeProjectsDir = join(homedir(), '.claude', 'projects');
  
  if (!existsSync(claudeProjectsDir)) {
    return [];
  }
  
  const allFiles = [];
  
  try {
    const projectDirs = readdirSync(claudeProjectsDir);
    
    for (const projectDir of projectDirs) {
      const projectPath = join(claudeProjectsDir, projectDir);
      
      try {
        if (existsSync(projectPath)) {
          const files = readdirSync(projectPath)
            .filter(file => file.endsWith('.jsonl'))
            .map(file => join(projectPath, file));
          
          allFiles.push(...files);
        }
      } catch (error) {
        // Skip directories that can't be read
        continue;
      }
    }
  } catch (error) {
    return [];
  }
  
  return allFiles;
}

/**
 * Parse Claude Code timestamp to UTC Date object
 * Claude timestamps: "2025-08-20T20:54:46.152Z" (UTC ISO format)
 * @param {string} timestamp - Timestamp string from Claude message
 * @returns {Date|null} Parsed Date in UTC, or null if invalid
 */
function parseTimestamp(timestamp) {
  if (!timestamp) return null;
  
  // Claude timestamps: "2025-08-20T20:54:46.152Z" -> UTC Date
  return new Date(timestamp.replace('Z', '+00:00'));
}