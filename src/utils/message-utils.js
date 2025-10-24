/**
 * Message Utilities
 *
 * Helper functions for working with chat messages and detecting specific patterns
 */

import { trace, SpanStatusCode } from '@opentelemetry/api';
import { OTEL } from '../telemetry/standards.js';
import { createNarrativeLogger } from './trace-logger.js';

// Get tracer instance for message utility instrumentation
const tracer = trace.getTracer('commit-story-message-utils', '1.0.0');

/**
 * Checks if a content array contains a context capture tool call
 * @param {Array} content - Message content array
 * @returns {boolean} True if content contains journal_capture_context tool call
 */
export function contentHasContextCapture(content) {
  return tracer.startActiveSpan(OTEL.span.utils.messageUtils.contentHasContextCapture(), {
    attributes: {
      'code.function': 'contentHasContextCapture'
    }
  }, (span) => {
    const logger = createNarrativeLogger('message_utils.content_has_context_capture');
    const startTime = Date.now();

    try {
      const contentIsArray = Array.isArray(content);
      const contentItems = contentIsArray ? content.length : 0;

      logger.start('content context capture check', `Starting check for context capture tool call in ${contentIsArray ? 'array' : 'non-array'} content with ${contentItems} items`);

      if (!contentIsArray) {
        const checkDuration = Date.now() - startTime;
        const result = false;

        logger.decision('content type invalid', 'Content is not an array - returning false immediately');

        const attrs = OTEL.attrs.utils.messageUtils.contentHasContextCapture({
          contentIsArray,
          contentItems,
          hasContextCapture: result,
          checkDuration
        });
        span.setAttributes(attrs);

        // Emit correlated metrics
        Object.entries(attrs).forEach(([name, value]) => {
          if (typeof value === 'number') {
            OTEL.metrics.gauge(name, value);
          } else if (typeof value === 'boolean') {
            OTEL.metrics.gauge(name, value ? 1 : 0);
          }
        });

        logger.complete('content context capture check', `Check completed: no context capture found (non-array content) in ${checkDuration}ms`);

        span.setStatus({ code: SpanStatusCode.OK, message: 'Content check completed' });
        return result;
      }

      const result = content.some(item =>
        item.type === 'tool_use' &&
        item.name === 'mcp__commit-story__journal_capture_context'
      );

      const checkDuration = Date.now() - startTime;

      logger.progress('content items scanned', `Scanned ${contentItems} content items for tool_use with name='mcp__commit-story__journal_capture_context'`);
      logger.complete('content context capture check', `Check completed: ${result ? 'found' : 'no'} context capture in ${contentItems} items (${checkDuration}ms)`);

      const attrs = OTEL.attrs.utils.messageUtils.contentHasContextCapture({
        contentIsArray,
        contentItems,
        hasContextCapture: result,
        checkDuration
      });
      span.setAttributes(attrs);

      // Emit correlated metrics
      Object.entries(attrs).forEach(([name, value]) => {
        if (typeof value === 'number') {
          OTEL.metrics.gauge(name, value);
        } else if (typeof value === 'boolean') {
          OTEL.metrics.gauge(name, value ? 1 : 0);
        }
      });

      // Additional key business metrics
      OTEL.metrics.gauge('commit_story.message.content_check_duration_ms', checkDuration);
      OTEL.metrics.counter('commit_story.message.content_checks_total', 1);
      if (result) {
        OTEL.metrics.counter('commit_story.message.context_captures_found_total', 1);
      }

      span.setStatus({ code: SpanStatusCode.OK, message: 'Content check completed successfully' });
      return result;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      logger.error('content context capture check', 'Error during content check', error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Checks if a message contains a context capture tool call
 * @param {Object} message - Chat message object
 * @returns {boolean} True if message contains journal_capture_context tool call
 */
export function messageHasContextCapture(message) {
  return tracer.startActiveSpan(OTEL.span.utils.messageUtils.messageHasContextCapture(), {
    attributes: {
      'code.function': 'messageHasContextCapture'
    }
  }, (span) => {
    const logger = createNarrativeLogger('message_utils.message_has_context_capture');
    const startTime = Date.now();

    try {
      const messageType = message?.type || 'unknown';

      logger.start('message context capture check', `Starting check for context capture in ${messageType} message`);

      if (messageType !== 'assistant') {
        const checkDuration = Date.now() - startTime;
        const result = false;

        logger.decision('message type invalid', `Message type is '${messageType}' (not 'assistant') - returning false immediately`);

        const attrs = OTEL.attrs.utils.messageUtils.messageHasContextCapture({
          messageType,
          contentIsArray: false,
          hasContextCapture: result,
          checkDuration
        });
        span.setAttributes(attrs);

        // Emit correlated metrics
        Object.entries(attrs).forEach(([name, value]) => {
          if (typeof value === 'number') {
            OTEL.metrics.gauge(name, value);
          } else if (typeof value === 'boolean') {
            OTEL.metrics.gauge(name, value ? 1 : 0);
          }
        });

        logger.complete('message context capture check', `Check completed: no context capture (non-assistant message) in ${checkDuration}ms`);

        span.setStatus({ code: SpanStatusCode.OK, message: 'Message check completed' });
        return result;
      }

      const content = message.message?.content;
      const contentIsArray = Array.isArray(content);

      logger.progress('message content extracted', `Extracted content from assistant message: ${contentIsArray ? 'array' : 'non-array'} type`);

      const result = contentHasContextCapture(content);
      const checkDuration = Date.now() - startTime;

      logger.complete('message context capture check', `Check completed: ${result ? 'found' : 'no'} context capture in assistant message (${checkDuration}ms)`);

      const attrs = OTEL.attrs.utils.messageUtils.messageHasContextCapture({
        messageType,
        contentIsArray,
        hasContextCapture: result,
        checkDuration
      });
      span.setAttributes(attrs);

      // Emit correlated metrics
      Object.entries(attrs).forEach(([name, value]) => {
        if (typeof value === 'number') {
          OTEL.metrics.gauge(name, value);
        } else if (typeof value === 'boolean') {
          OTEL.metrics.gauge(name, value ? 1 : 0);
        }
      });

      // Additional key business metrics
      OTEL.metrics.gauge('commit_story.message.message_check_duration_ms', checkDuration);
      OTEL.metrics.counter('commit_story.message.message_checks_total', 1);

      span.setStatus({ code: SpanStatusCode.OK, message: 'Message check completed successfully' });
      return result;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      logger.error('message context capture check', 'Error during message check', error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Checks if an array of messages contains any context capture tool calls
 * @param {Array} messages - Array of chat message objects
 * @returns {boolean} True if any message contains journal_capture_context tool call
 */
export function messagesContainContextCapture(messages) {
  return tracer.startActiveSpan(OTEL.span.utils.messageUtils.messagesContainContextCapture(), {
    attributes: {
      'code.function': 'messagesContainContextCapture'
    }
  }, (span) => {
    const logger = createNarrativeLogger('message_utils.messages_contain_context_capture');
    const startTime = Date.now();

    try {
      const isArray = Array.isArray(messages);
      const totalCount = isArray ? messages.length : 0;

      logger.start('messages context capture check', `Starting check for context capture across ${isArray ? totalCount : 'non-array'} messages`);

      if (!isArray) {
        const checkDuration = Date.now() - startTime;
        const result = false;

        logger.decision('messages type invalid', 'Messages is not an array - returning false immediately');

        const attrs = OTEL.attrs.utils.messageUtils.messagesContainContextCapture({
          totalCount,
          isArray,
          checkedCount: 0,
          containContextCapture: result,
          checkDuration
        });
        span.setAttributes(attrs);

        // Emit correlated metrics
        Object.entries(attrs).forEach(([name, value]) => {
          if (typeof value === 'number') {
            OTEL.metrics.gauge(name, value);
          } else if (typeof value === 'boolean') {
            OTEL.metrics.gauge(name, value ? 1 : 0);
          }
        });

        logger.complete('messages context capture check', `Check completed: no context capture found (non-array messages) in ${checkDuration}ms`);

        span.setStatus({ code: SpanStatusCode.OK, message: 'Messages check completed' });
        return result;
      }

      let checkedCount = 0;
      const result = messages.some(msg => {
        checkedCount++;
        return messageHasContextCapture(msg);
      });

      const checkDuration = Date.now() - startTime;

      logger.progress('messages scanned', `Scanned ${checkedCount} messages for context capture tool calls`);
      logger.complete('messages context capture check', `Check completed: ${result ? 'found' : 'no'} context capture in ${checkedCount} messages (${checkDuration}ms)`);

      const attrs = OTEL.attrs.utils.messageUtils.messagesContainContextCapture({
        totalCount,
        isArray,
        checkedCount,
        containContextCapture: result,
        checkDuration
      });
      span.setAttributes(attrs);

      // Emit correlated metrics
      Object.entries(attrs).forEach(([name, value]) => {
        if (typeof value === 'number') {
          OTEL.metrics.gauge(name, value);
        } else if (typeof value === 'boolean') {
          OTEL.metrics.gauge(name, value ? 1 : 0);
        }
      });

      // Additional key business metrics
      OTEL.metrics.gauge('commit_story.messages.messages_check_duration_ms', checkDuration);
      OTEL.metrics.counter('commit_story.messages.messages_checks_total', 1);
      if (result) {
        OTEL.metrics.counter('commit_story.messages.context_captures_found_total', 1);
      }

      span.setStatus({ code: SpanStatusCode.OK, message: 'Messages check completed successfully' });
      return result;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      logger.error('messages context capture check', 'Error during messages check', error);
      throw error;
    } finally {
      span.end();
    }
  });
}
