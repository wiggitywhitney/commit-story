/**
 * Context Integrator - Time-based Chat Context Matching
 * 
 * Orchestrates the collection of git commit data and chat messages,
 * correlating them by time windows to create unified context for AI processing.
 */

import { getLatestCommitData } from '../collectors/git-collector.js';
import { extractChatForCommit } from '../collectors/claude-collector.js';
import { execSync } from 'child_process';

/**
 * Extracts clean text content from Claude messages, handling mixed content formats
 * 
 * @param {Array} messages - Array of Claude message objects
 * @returns {Array} Messages with normalized content (always strings)
 */
export function extractTextFromMessages(messages) {
  return messages.map(msg => {
    const content = msg.message?.content;
    let cleanContent = '';
    
    if (!content) {
      cleanContent = '';
    } else if (typeof content === 'string') {
      cleanContent = content;
    } else if (Array.isArray(content)) {
      // Extract text from array format: [{type: "text", text: "actual content"}]
      cleanContent = content
        .filter(item => item.type === 'text' && item.text)
        .map(item => item.text)
        .join(' ');
    } else {
      // Fallback for unknown content types
      cleanContent = JSON.stringify(content);
    }
    
    return {
      ...msg,
      message: {
        ...msg.message,
        content: cleanContent
      }
    };
  });
}

/**
 * Generates dynamic documentation of what data is available in context objects
 * 
 * @returns {string} Documentation describing available context data
 */
export function getAvailableDataDescription() {
  return `AVAILABLE DATA:  
- git: The actual code changes (unified diff), commit message, and technical details of what files were modified
- chat: Developer conversations with AI assistant(s) during this development session`;
}

/**
 * Gathers all context for a commit: git data and time-correlated chat messages
 * 
 * @returns {Promise<Object>} Combined context object with commit data and chat messages
 * @returns {Object} context.commit - Current commit data from git-collector
 * @returns {Array} context.chatMessages - Chat messages from claude-collector  
 * @returns {Object|null} context.previousCommit - Previous commit basic data or null
 */
export async function gatherContextForCommit() {
  try {
    // Get current commit data (returns Date object for timestamp)
    const currentCommit = await getLatestCommitData();
    if (!currentCommit) {
      throw new Error('Failed to get current commit data');
    }

    // Get previous commit data for time window
    const previousCommit = await getPreviousCommitData();
    
    // Extract chat messages using existing claude-collector API
    // Signature: extractChatForCommit(commitTime, previousCommitTime, repoPath)
    const rawChatMessages = await extractChatForCommit(
      currentCommit.timestamp,           // Date object - current commit time
      previousCommit?.timestamp || null, // Date object or null - previous commit time  
      process.cwd()                      // string - repo path for cwd filtering
    );
    
    // Extract clean text content from messages (DD-034)
    const cleanChatMessages = extractTextFromMessages(rawChatMessages || []);
    
    return {
      commit: currentCommit,              // Full git data (hash, message, author, timestamp, diff)
      chatMessages: cleanChatMessages,    // Array of chat messages with clean text content
      previousCommit: previousCommit      // { hash, timestamp } or null
    };
    
  } catch (error) {
    console.error('Error gathering context for commit:', error.message);
    throw error;
  }
}

/**
 * Gets the previous commit data for time window calculation
 * 
 * @returns {Promise<Object|null>} Previous commit data or null if no previous commit
 */
async function getPreviousCommitData() {
  try {
    // Get previous commit hash and timestamp (HEAD~1)
    const previousCommitInfo = execSync(
      'git log -1 --format="%H|%ct" HEAD~1', 
      { encoding: 'utf8', cwd: process.cwd() }
    ).trim();
    
    if (!previousCommitInfo) {
      return null; // No previous commit (first commit in repo)
    }
    
    const [hash, timestamp] = previousCommitInfo.split('|');
    
    return {
      hash: hash,
      timestamp: new Date(parseInt(timestamp) * 1000) // Convert to Date object like git-collector
    };
    
  } catch (error) {
    // No previous commit exists (first commit in repo)
    return null;
  }
}