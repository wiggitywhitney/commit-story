/**
 * Message Validation Utilities
 * 
 * Shared validation logic for determining when there is substantial user input
 * for AI processing across different generators.
 */

/**
 * Checks if the messages contain substantial user input worth processing
 * 
 * @param {Array} messages - Array of clean messages from extractTextFromMessages()
 * @returns {boolean} True if any user message is substantial (≥20 characters)
 */
export function hasSubstantialUserInput(messages) {
  return messages.some(msg => {
    if (msg.type === 'user') {
      const content = msg.message?.content || '';
      return content.length >= 20;
    }
    return false;
  });
}