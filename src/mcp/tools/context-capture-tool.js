/**
 * Journal Context Capture Tool
 *
 * MCP tool for capturing AI working context during development sessions.
 * Provides temporary working memory that enhances journal generation.
 */

import { promises as fs } from 'fs';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { generateJournalPath, ensureJournalDirectory, getTimezonedTimestamp } from '../../utils/journal-paths.js';

/**
 * Get the current Claude Code session ID from recent messages
 * Searches for messages in the last 30 seconds to find the active session
 * @returns {string|null} Session ID or null if not found
 */
function getCurrentSessionId() {
  try {
    const claudeProjectsDir = join(homedir(), '.claude', 'projects');

    if (!existsSync(claudeProjectsDir)) {
      return null;
    }

    // Get all JSONL files from all project directories
    const allFiles = [];
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

    // Time window: last 30 seconds
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30000);

    let mostRecentMessage = null;
    let mostRecentTime = null;

    // Search all files for the most recent message in the last 30 seconds
    for (const filePath of allFiles) {
      try {
        const content = readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n');

        // Process lines in reverse order to find most recent messages first
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i];
          if (!line.trim()) continue;

          try {
            const message = JSON.parse(line);

            // Parse timestamp: "2025-10-13T10:30:00.000Z"
            if (!message.timestamp || !message.sessionId) continue;

            const messageTime = new Date(message.timestamp.replace('Z', '+00:00'));

            // Check if message is within last 30 seconds
            if (messageTime >= thirtySecondsAgo && messageTime <= now) {
              // Track most recent message
              if (!mostRecentTime || messageTime > mostRecentTime) {
                mostRecentMessage = message;
                mostRecentTime = messageTime;
              }
            }
          } catch (parseError) {
            // Skip malformed JSON lines
            continue;
          }
        }
      } catch (fileError) {
        // Skip files that can't be read
        continue;
      }
    }

    return mostRecentMessage?.sessionId || null;

  } catch (error) {
    // Return null on any error - graceful degradation
    return null;
  }
}

/**
 * Create a journal context capture entry
 * @param {Object} args - Tool arguments {text} - empty/missing text triggers comprehensive dump prompt
 * @returns {Promise<Object>} MCP tool response
 */
export async function createContextTool(args) {
  try {
    // Validate input
    if (!args || typeof args !== 'object') {
      throw new Error('Invalid arguments: expected object');
    }

    // Mode detection: empty/missing text = dump mode, provided text = write mode
    const hasText = args.hasOwnProperty('text') &&
                    typeof args.text === 'string' &&
                    args.text.trim().length > 0;

    // Mode 1: Comprehensive Dump - return prompt
    if (!hasText) {
      return {
        content: [{
          type: 'text',
          text: 'Provide a comprehensive context capture of your current understanding of this project, recent development insights, and key context that would help a fresh AI understand where we are and how we got here.'
        }],
        isError: false
      };
    }

    // Mode 2: Direct Capture - proceed with file writing
    const timestamp = new Date();
    const contextText = args.text.trim();

    // Generate context file path using daily files (YYYY-MM-DD.md)
    const filePath = generateJournalPath('context', timestamp);

    // Ensure directory exists
    await ensureJournalDirectory(filePath);

    // Get current session ID (auto-detected from Claude Code)
    const sessionId = getCurrentSessionId();

    // Format context entry with session ID (if available)
    const formattedTimestamp = getTimezonedTimestamp(timestamp);
    const sessionLine = sessionId ? ` - Session: ${sessionId}` : '';
    const contextEntry = `## ${formattedTimestamp}${sessionLine}

${contextText}

═══════════════════════════════════════

`;

    // Check if file exists - append if it does, create if it doesn't
    try {
      await fs.access(filePath);
      // File exists - append to it
      await fs.appendFile(filePath, contextEntry, 'utf8');
    } catch (error) {
      // File doesn't exist - create new file
      await fs.writeFile(filePath, contextEntry, 'utf8');
    }

    return {
      content: [{
        type: 'text',
        text: '✅ Context captured successfully!'
      }],
      isError: false
    };

  } catch (error) {
    // Return MCP error response
    const errorMessage = `❌ **Failed to capture context**

🔍 **Error**: ${error.message}

💡 **Help**: Provide context text to write to file, or call with empty text to trigger comprehensive dump prompt.`;

    return {
      content: [{
        type: 'text',
        text: errorMessage
      }],
      isError: true
    };
  }
}
