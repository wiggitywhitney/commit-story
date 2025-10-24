/**
 * Message Utilities
 *
 * Helper functions for working with chat messages and detecting specific patterns
 */

/**
 * Checks if a content array contains a context capture tool call
 * @param {Array} content - Message content array
 * @returns {boolean} True if content contains journal_capture_context tool call
 */
export function contentHasContextCapture(content) {
  if (!Array.isArray(content)) {
    return false;
  }

  return content.some(item =>
    item.type === 'tool_use' &&
    item.name === 'mcp__commit-story__journal_capture_context'
  );
}

/**
 * Checks if a message contains a context capture tool call
 * @param {Object} message - Chat message object
 * @returns {boolean} True if message contains journal_capture_context tool call
 */
export function messageHasContextCapture(message) {
  if (message.type !== 'assistant') {
    return false;
  }

  return contentHasContextCapture(message.message?.content);
}

/**
 * Checks if an array of messages contains any context capture tool calls
 * @param {Array} messages - Array of chat message objects
 * @returns {boolean} True if any message contains journal_capture_context tool call
 */
export function messagesContainContextCapture(messages) {
  if (!Array.isArray(messages)) {
    return false;
  }

  return messages.some(msg => messageHasContextCapture(msg));
}
