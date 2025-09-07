/**
 * Context Filter - Intelligent Token Management
 * 
 * Filters chat messages and git diffs to stay within AI model token limits
 * while preserving content quality for journal generation.
 * 
 * Based on message structure from /docs/claude-chat-research.md
 */

import { redactSensitiveData } from './sensitive-data-filter.js';

const MAX_TOKENS = 120000; // Leave 8k buffer under gpt-4o-mini's 128k limit
const AVG_CHARS_PER_TOKEN = 4; // Rough estimate for token counting

/**
 * Estimates token count for text content
 * @param {string} text - Text to estimate tokens for
 * @returns {number} Estimated token count
 */
function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  return Math.ceil(text.length / AVG_CHARS_PER_TOKEN);
}

/**
 * Extracts content string from message for token calculation
 * @param {Object} message - Claude message object
 * @returns {string} Content as string
 */
function getMessageContentString(message) {
  if (!message.message || !message.message.content) return '';
  
  const content = message.message.content;
  return typeof content === 'string' ? content : JSON.stringify(content);
}

/**
 * Checks if a message should be filtered out (tool calls, system messages, etc.)
 * Based on message structure analysis documented in /docs/claude-chat-research.md
 * 
 * @param {Object} message - Claude message object  
 * @returns {boolean} True if message should be filtered out
 */
function isNoisyMessage(message) {
  // Filter meta messages (system-level)
  if (message.isMeta) return true;
  
  const content = message.message?.content;
  
  // Empty or missing content
  if (!content) return true;
  
  // Check array content for tool patterns (most common case)
  if (Array.isArray(content)) {
    // Tool calls: assistant messages with tool_use items
    if (message.type === 'assistant' && content.some(item => item.type === 'tool_use')) {
      return true;
    }
    
    // Tool results: user messages with tool_result items  
    if (message.type === 'user' && content.some(item => item.type === 'tool_result')) {
      return true;
    }
    
    // Keep assistant text responses and user text input
    return false;
  }
  
  // String content filtering
  if (typeof content === 'string') {
    // Empty or very short messages (likely single chars like "y", "n")
    if (content.trim().length < 3) return true;
    
    // Command/system patterns  
    if (content.includes('<command-name>') || 
        content.includes('<system') ||
        content.includes('<local-command') ||
        content.includes('<command-') ||
        content.startsWith('Caveat: The messages below') ||
        content.startsWith('#')) return true;
    
    // Keep meaningful string content
    return false;
  }
  
  // Filter unknown content types
  return true;
}

/**
 * Filters chat messages to reduce token usage while preserving meaningful dialogue
 * @param {Array} messages - Original chat messages from claude-collector
 * @returns {Array} Filtered messages
 */
function filterChatMessages(messages) {
  const filtered = [];
  
  for (const msg of messages) {
    // Skip noisy messages (tool calls, system messages, empty content)
    if (isNoisyMessage(msg)) {
      continue;
    }
    
    const contentStr = getMessageContentString(msg);
    const tokens = estimateTokens(contentStr);
    
    // For very large messages (>2000 tokens), truncate while preserving structure
    if (tokens > 2000) {
      const truncated = contentStr.substring(0, 1000) + '\n\n[... content truncated for brevity ...]';
      filtered.push({
        ...msg,
        message: {
          ...msg.message,
          content: truncated
        }
      });
    } else {
      filtered.push(msg);
    }
  }
  
  return filtered;
}

/**
 * Filters git diff content to reduce token usage
 * @param {string} diff - Git diff content
 * @returns {string} Filtered diff
 */
function filterGitDiff(diff) {
  if (!diff) return diff;
  
  // Filter sensitive data first
  const filteredDiff = redactSensitiveData(diff);
  
  const tokens = estimateTokens(filteredDiff);
  
  // If diff is reasonable size, keep it as-is
  if (tokens <= 15000) {
    return filteredDiff;
  }
  
  // For large diffs, create a summary
  const lines = filteredDiff.split('\n');
  const fileChanges = [];
  let currentFile = null;
  let addedLines = 0;
  let removedLines = 0;
  
  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      // New file being processed
      if (currentFile) {
        fileChanges.push(`${currentFile}: +${addedLines} -${removedLines}`);
      }
      currentFile = line.match(/b\/(.+)$/)?.[1] || 'unknown';
      addedLines = 0;
      removedLines = 0;
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      addedLines++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      removedLines++;
    }
  }
  
  // Add final file
  if (currentFile) {
    fileChanges.push(`${currentFile}: +${addedLines} -${removedLines}`);
  }
  
  // Return summary instead of full diff
  return `[Large diff summarized - ${fileChanges.length} files changed]\n\nFile changes:\n${fileChanges.join('\n')}\n\n[Full diff available in git history]`;
}

/**
 * Applies intelligent filtering to context to stay within token limits
 * @param {Object} context - Context object (handles both old and new structure)
 * @returns {Object} Filtered context object
 */
export function filterContext(context) {
  // Handle both old structure (context.chatMessages) and new structure (context.chatMessages.data)
  const chatMessages = context.chatMessages?.data || context.chatMessages || [];
  const commit = context.commit?.data || context.commit;
  
  // Filter chat messages  
  const filteredChatMessages = filterChatMessages(chatMessages);
  
  // Filter git diff if needed
  const filteredDiff = filterGitDiff(commit?.diff);
  
  // Calculate token usage after initial filtering
  const chatTokens = filteredChatMessages.reduce((sum, msg) => {
    return sum + estimateTokens(getMessageContentString(msg));
  }, 0);
  
  const diffTokens = estimateTokens(filteredDiff || '');
  const systemPromptTokens = 2000; // Estimate for system prompt overhead
  const totalTokens = chatTokens + diffTokens + systemPromptTokens;
  
  // If still too large, apply more aggressive filtering (keep most recent)
  let finalChatMessages = filteredChatMessages;
  if (totalTokens > MAX_TOKENS) {
    // Keep only the most recent messages that fit in budget
    const availableTokens = MAX_TOKENS - diffTokens - systemPromptTokens;
    let usedTokens = 0;
    const recentMessages = [];
    
    // Process messages in reverse chronological order (newest first)
    for (let i = filteredChatMessages.length - 1; i >= 0; i--) {
      const msg = filteredChatMessages[i];
      const msgTokens = estimateTokens(getMessageContentString(msg));
      
      if (usedTokens + msgTokens <= availableTokens) {
        recentMessages.unshift(msg); // Add to beginning to maintain chronological order
        usedTokens += msgTokens;
      } else {
        break;
      }
    }
    
    finalChatMessages = recentMessages;
  }
  
  // Return filtered context maintaining original structure
  return {
    ...context,
    chatMessages: finalChatMessages,
    commit: {
      ...commit,
      diff: filteredDiff
    }
  };
}