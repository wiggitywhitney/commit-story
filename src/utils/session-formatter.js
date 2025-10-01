/**
 * Session Formatter Utility
 *
 * Transforms session-grouped chat messages into a consistent format for AI processing
 */

/**
 * Formats session groups for AI consumption with consistent structure
 * @param {Array} sessions - Array of session objects with messages
 * @returns {Array} Formatted sessions with session_id, session_start, message_count, and messages
 */
export function formatSessionsForAI(sessions) {
  return sessions.map((session, index) => ({
    session_id: `Session ${index + 1}`,
    session_start: session.startTime,
    message_count: session.messageCount,
    messages: session.messages.map(msg => ({
      type: msg.type,
      content: msg.message?.content,
      timestamp: msg.timestamp,
    }))
  }));
}