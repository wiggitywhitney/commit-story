/**
 * trace-logger.js - Narrative logging for AI trace correlation
 *
 * This utility creates structured JSON logs that tell the "story" of execution
 * alongside OpenTelemetry traces. While traces capture metrics and timing,
 * these logs capture business logic decisions, state changes, and searchable
 * context for AI assistants to understand system behavior.
 *
 * Output follows OpenTelemetry conventions for trace correlation.
 */

import { trace } from '@opentelemetry/api';
import fs from 'fs';
import path from 'path';

/**
 * Detect if we're in debug mode by checking the config file
 * This follows the same pattern used in other modules
 */
function isDebugMode() {
  try {
    const configPath = path.join(process.cwd(), 'commit-story.config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.debug === true;
    }
  } catch (error) {
    // If config can't be read, default to false
  }
  return false;
}

/**
 * Create narrative log entry with OpenTelemetry trace correlation
 *
 * @param {string} level - Log level (info, warn, error, debug)
 * @param {string} operation - Operation name (matches span name convention)
 * @param {string} message - Human-readable narrative message
 * @param {Object} context - Additional context data (optional)
 */
function narrativeLog(level, operation, message, context = {}) {
  // Only output in debug mode (when logs are visible to users)
  if (!isDebugMode()) {
    return;
  }

  const span = trace.getActiveSpan();
  const spanContext = span?.spanContext();

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level,
    service: 'commit-story',
    operation: operation,
    message: message,
    traceId: spanContext?.traceId || 'no-trace',
    spanId: spanContext?.spanId || 'no-span',
    ...context
  };

  // Output structured JSON for AI consumption
  console.log(JSON.stringify(logEntry));
}


/**
 * Create narrative logger for a specific operation
 * Returns an object with level-specific logging functions
 *
 * @param {string} operation - Operation name (e.g., 'claude.collect_messages')
 * @returns {Object} Logger with info, warn, error, debug methods
 */
export function createNarrativeLogger(operation) {
  return {
    // Narrative-specific methods for operation tracking
    start: (operationDesc, message, context) => narrativeLog('info', operation, message, { operationDesc, phase: 'start', ...context }),
    progress: (operationDesc, message, context) => narrativeLog('info', operation, message, { operationDesc, phase: 'progress', ...context }),
    complete: (operationDesc, message, context) => narrativeLog('info', operation, message, { operationDesc, phase: 'complete', ...context }),
    decision: (operationDesc, message, context) => narrativeLog('info', operation, message, { operationDesc, phase: 'decision', ...context }),

    // Standard logging methods
    info: (message, context) => narrativeLog('info', operation, message, context),
    warn: (message, context) => narrativeLog('warn', operation, message, context),
    error: (operationDesc, message, error, context) => narrativeLog('error', operation, message, { operationDesc, error: error?.message, stack: error?.stack, ...context }),
    debug: (message, context) => narrativeLog('debug', operation, message, context)
  };
}

/**
 * Convenience functions for common logging patterns
 */
export const narrativeLogger = {
  /**
   * Log the start of an operation
   */
  start: (operation, message, context) => narrativeLog('info', operation, `Starting: ${message}`, context),

  /**
   * Log a state change or intermediate result
   */
  progress: (operation, message, context) => narrativeLog('info', operation, message, context),

  /**
   * Log a business logic decision
   */
  decision: (operation, message, context) => narrativeLog('info', operation, `Decision: ${message}`, context),

  /**
   * Log completion of an operation
   */
  complete: (operation, message, context) => narrativeLog('info', operation, `Completed: ${message}`, context),

  /**
   * Log an error with trace correlation
   */
  error: (operation, message, error, context = {}) => {
    const errorContext = {
      error: error?.message,
      stack: error?.stack,
      ...context
    };
    narrativeLog('error', operation, `Error: ${message}`, errorContext);
  }
};

export default narrativeLogger;