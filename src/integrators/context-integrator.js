/**
 * Context Integrator - Time-based Chat Context Matching
 * 
 * Orchestrates the collection of git commit data and chat messages,
 * correlating them by time windows to create unified context for AI processing.
 */

import { getLatestCommitData } from '../collectors/git-collector.js';
import { extractChatForCommit } from '../collectors/claude-collector.js';
import { execSync } from 'child_process';
import { filterContext } from '../generators/filters/context-filter.js';
import { redactSensitiveData } from '../generators/filters/sensitive-data-filter.js';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { OTEL } from '../telemetry/standards.js';

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
    
    // Filter sensitive data before AI processing
    cleanContent = redactSensitiveData(cleanContent);
    
    // Return minimal message object for AI processing (eliminates Claude Code metadata bloat)
    return {
      type: msg.type || 'assistant', // user or assistant
      message: {
        content: cleanContent
      },
      timestamp: msg.timestamp
    };
  });
}

/**
 * Calculates metadata about chat messages for context enrichment
 * 
 * @param {Array} messages - Array of clean messages from extractTextFromMessages()
 * @returns {Object} Metadata object with message statistics
 */
function calculateChatMetadata(messages) {
  const userMessages = messages.filter(msg => msg.type === 'user');
  const assistantMessages = messages.filter(msg => msg.type === 'assistant');
  
  const overTwentyCharMessages = userMessages.filter(msg => {
    const content = msg.message?.content || '';
    return content.length >= 20;
  });
  
  const userLengths = userMessages.map(msg => (msg.message?.content || '').length);
  const assistantLengths = assistantMessages.map(msg => (msg.message?.content || '').length);
  
  return {
    totalMessages: userMessages.length + assistantMessages.length,
    userMessageCount: userMessages.length,
    assistantMessageCount: assistantMessages.length,
    userMessages: {
      total: userMessages.length,
      overTwentyCharacters: overTwentyCharMessages.length,
      averageLength: userLengths.length > 0 ? Math.round(userLengths.reduce((a, b) => a + b, 0) / userLengths.length) : 0,
      maxLength: userLengths.length > 0 ? Math.max(...userLengths) : 0
    },
    assistantMessages: {
      total: assistantMessages.length,
      averageLength: assistantLengths.length > 0 ? Math.round(assistantLengths.reduce((a, b) => a + b, 0) / assistantLengths.length) : 0,
      maxLength: assistantLengths.length > 0 ? Math.max(...assistantLengths) : 0
    }
  };
}


// Get tracer instance for context integration instrumentation
const tracer = trace.getTracer('commit-story-context', '1.0.0');

/**
 * Gathers all context for a commit: git data and time-correlated chat messages
 * 
 * @param {string} commitRef - Git commit reference (HEAD, HEAD~1, hash, etc.)
 * @returns {Promise<Object>} Combined context object with commit data and chat messages
 * @returns {Object} context.commit - Current commit data from git-collector
 * @returns {Array} context.chatMessages - Chat messages from claude-collector  
 * @returns {Object|null} context.previousCommit - Previous commit basic data or null
 */
export async function gatherContextForCommit(commitRef = 'HEAD') {
  return await tracer.startActiveSpan(OTEL.span.context.gather(), {
    attributes: {
      ...OTEL.attrs.repository({ path: process.cwd() }),
      [`${OTEL.NAMESPACE}.commit.ref`]: commitRef
    }
  }, async (span) => {
    try {
      // Get current commit data (returns Date object for timestamp)
      const currentCommit = await getLatestCommitData(commitRef);
      if (!currentCommit) {
        throw new Error('❌ Failed to get current commit data');
      }
      
      // Add commit data to span
      span.setAttributes(OTEL.attrs.commit(currentCommit));

      // Get previous commit data for time window
      const previousCommit = await getPreviousCommitData(commitRef);
      
      if (previousCommit) {
        span.setAttributes({
          [`${OTEL.NAMESPACE}.previous_commit.hash`]: previousCommit.hash,
          [`${OTEL.NAMESPACE}.previous_commit.timestamp`]: previousCommit.timestamp.toISOString()
        });
      }
      
      // Extract chat messages using existing claude-collector API
      // Signature: extractChatForCommit(commitTime, previousCommitTime, repoPath)
      const rawChatMessages = await extractChatForCommit(
        currentCommit.timestamp,           // Date object - current commit time
        previousCommit?.timestamp || null, // Date object or null - previous commit time  
        process.cwd()                      // string - repo path for cwd filtering
      );
    
      // Extract clean text content from messages
      const cleanChatMessages = extractTextFromMessages(rawChatMessages || []);
      
      // Add raw message data to span
      const rawChatData = {
        raw: rawChatMessages?.length || 0,
        count: cleanChatMessages.length
      };
      span.setAttributes(OTEL.attrs.chat(rawChatData));

      // Dual emission: emit metrics alongside span attributes
      OTEL.metrics.gauge('commit_story.chat.raw_messages_count', rawChatData.raw);
      OTEL.metrics.gauge('commit_story.chat.messages_count', rawChatData.count);
      
      // Apply complete context preparation (consolidate all filtering and token management)
      const rawContext = {
        commit: currentCommit,
        chatMessages: cleanChatMessages
      };
      const filteredContext = filterContext(rawContext);
      
      // Calculate metadata from cleaned messages (before filtering for richer data)
      const metadata = calculateChatMetadata(cleanChatMessages);
      
      // Add final metadata to span
      const finalChatData = {
        total: metadata.totalMessages,
        userMessages: metadata.userMessageCount,
        assistantMessages: metadata.assistantMessageCount,
        userMessagesOverTwenty: metadata.userMessages.overTwentyCharacters,
        filtered: filteredContext.chatMessages.length
      };
      span.setAttributes(OTEL.attrs.chat(finalChatData));

      // Dual emission: emit key business metrics
      OTEL.metrics.gauge('commit_story.chat.total_messages', finalChatData.total);
      OTEL.metrics.gauge('commit_story.chat.user_messages', finalChatData.userMessages);
      OTEL.metrics.gauge('commit_story.chat.assistant_messages', finalChatData.assistantMessages);
      OTEL.metrics.gauge('commit_story.chat.user_messages_over_twenty', finalChatData.userMessagesOverTwenty);
      
      // Return self-documenting context object for journal generation
      const result = {
        commit: {
          data: filteredContext.commit,     // Filtered git data (hash, message, author, timestamp, diff)
          description: "Git commit: code changes (unified diff), commit message, and technical details of what files were modified"
        },
        chatMessages: {
          data: filteredContext.chatMessages, // Filtered chat messages with token optimization
          description: "Chat messages where type:'user' = HUMAN DEVELOPER input, type:'assistant' = AI ASSISTANT responses"
        },
        chatMetadata: {
          data: metadata,
          description: "Chat statistics: Message counts, lengths, and quality metrics for decision-making"
        }
      };
      
      span.setStatus({ code: SpanStatusCode.OK, message: 'Context gathered successfully' });
      return result;
      
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      console.error('Error gathering context for commit:', error.message);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Gets the previous commit data for time window calculation
 * 
 * @param {string} commitRef - Git commit reference to calculate previous from
 * @returns {Promise<Object|null>} Previous commit data or null if no previous commit
 */
async function getPreviousCommitData(commitRef = 'HEAD') {
  try {
    // Get previous commit hash and timestamp (one commit before the specified commit)
    const previousCommitInfo = execSync(
      `git log -1 --format="%H|%ct" ${commitRef}~1`, 
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