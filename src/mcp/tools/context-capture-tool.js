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
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { OTEL } from '../../telemetry/standards.js';
import { createNarrativeLogger } from '../../utils/trace-logger.js';
import { generateJournalPath, ensureJournalDirectory, getTimezonedTimestamp } from '../../utils/journal-paths.js';

// Initialize telemetry
const tracer = trace.getTracer('commit-story', '1.0.0');

// Dev mode detection from config file
let isDevMode = false;
try {
  const configPath = './commit-story.config.json';
  if (existsSync(configPath)) {
    const configData = JSON.parse(readFileSync(configPath, 'utf8'));
    isDevMode = configData.dev === true;
  }
} catch (error) {
  // Silently ignore config file errors - dev mode defaults to false
}

/**
 * Get the current Claude Code session ID from recent messages
 * Searches for messages in the last 30 seconds to find the active session
 * @returns {string|null} Session ID or null if not found
 */
function getCurrentSessionId() {
  return tracer.startActiveSpan(OTEL.span.mcp.tool.session_id_detection(), {
    attributes: {
      'code.function': 'getCurrentSessionId'
    }
  }, (span) => {
    const logger = createNarrativeLogger('mcp.session_detection');
    const startTime = Date.now();

    try {
      logger.start('session detection', 'Starting Claude Code session ID detection from recent messages');

      const claudeProjectsDir = join(homedir(), '.claude', 'projects');

      if (!existsSync(claudeProjectsDir)) {
        logger.decision('session detection', 'Claude projects directory not found - session ID unavailable');
        span.setStatus({ code: SpanStatusCode.OK, message: 'No projects directory' });
        return null;
      }

      // Get all JSONL files from all project directories
      const allFiles = [];
      const projectDirs = readdirSync(claudeProjectsDir);

      logger.progress('session detection', `Scanning ${projectDirs.length} project directories for JSONL files`);

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

      logger.progress('session detection', `Found ${allFiles.length} JSONL files to scan`);

      // Time window: last 30 seconds
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30000);

      let mostRecentMessage = null;
      let mostRecentTime = null;
      let messagesChecked = 0;

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
              messagesChecked++;

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

      const sessionId = mostRecentMessage?.sessionId || null;
      const detectionDuration = Date.now() - startTime;

      // Add session detection telemetry
      const sessionAttrs = OTEL.attrs.mcp.sessionDetection({
        filesScanned: allFiles.length,
        messagesChecked: messagesChecked,
        sessionFound: !!sessionId,
        timeWindowSeconds: 30,
        detectionDuration: detectionDuration
      });
      span.setAttributes(sessionAttrs);

      // Emit metrics for session detection analytics
      Object.entries(sessionAttrs).forEach(([name, value]) => {
        if (typeof value === 'number') {
          OTEL.metrics.gauge(name, value);
        }
      });

      OTEL.metrics.counter('commit_story.session.detection_attempts', 1, {
        'session.found': sessionId ? 'true' : 'false'
      });

      if (sessionId) {
        logger.complete('session detection', `Successfully detected session ID: ${sessionId.substring(0, 8)}...`, {
          files_scanned: allFiles.length,
          messages_checked: messagesChecked,
          detection_duration_ms: detectionDuration
        });
      } else {
        logger.decision('session detection', 'No recent session found in time window', {
          files_scanned: allFiles.length,
          messages_checked: messagesChecked,
          detection_duration_ms: detectionDuration
        });
      }

      span.setStatus({ code: SpanStatusCode.OK });
      return sessionId;

    } catch (error) {
      const detectionDuration = Date.now() - startTime;

      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });

      span.setAttributes({
        [`${OTEL.NAMESPACE}.session.detection_duration_ms`]: detectionDuration
      });

      logger.error('session detection', 'Failed to detect session ID', error, {
        duration_ms: detectionDuration
      });

      OTEL.metrics.counter('commit_story.session.detection_errors', 1, {
        'error.type': error.name
      });

      // Return null on any error - graceful degradation
      return null;
    } finally {
      span.end();
    }
  });
}

/**
 * Create a journal context capture entry
 * @param {Object} args - Tool arguments {text} - context text to capture
 * @param {import('@opentelemetry/api').Span} parentSpan - Parent MCP span
 * @returns {Promise<Object>} MCP tool response
 */
export async function createContextTool(args, parentSpan) {
  return tracer.startActiveSpan(OTEL.span.mcp.tool.journal_capture_context(), {
    attributes: {
      'code.function': 'createContextTool'
    },
    parent: parentSpan
  }, async (span) => {
    const startTime = Date.now();
    const logger = createNarrativeLogger('context.creation');

    try {
      // Validate input
      if (!args || typeof args !== 'object') {
        throw new Error('Invalid arguments: expected object with text property');
      }

      if (!args.hasOwnProperty('text') || typeof args.text !== 'string') {
        throw new Error('Invalid arguments: text parameter is required and must be a string');
      }

      const contextText = args.text.trim();

      if (contextText.length === 0) {
        throw new Error('Invalid arguments: text parameter cannot be empty');
      }

      if (contextText.length > 50000) {
        throw new Error('Context text too long: maximum 50,000 characters allowed');
      }

      logger.start('context creation', 'Creating journal context capture entry', {
        text_length: contextText.length
      });

      // Proceed with file writing
      const timestamp = new Date();

      // Generate context file path using daily files (YYYY-MM-DD.md)
      const filePath = generateJournalPath('context', timestamp);

      // Ensure directory exists
      await ensureJournalDirectory(filePath);

      logger.progress('context creation', `Context directory prepared: ${filePath}`);

      // Get current session ID (auto-detected from Claude Code)
      const sessionId = getCurrentSessionId();

      if (sessionId) {
        logger.progress('context creation', `Session ID detected: ${sessionId.substring(0, 8)}...`);
      } else {
        logger.decision('context creation', 'No session ID detected - context will be saved without session association');
      }

      // Format context entry with session ID (if available)
      const formattedTimestamp = getTimezonedTimestamp(timestamp);
      const sessionLine = sessionId ? ` - Session: ${sessionId}` : '';
      const contextEntry = `## ${formattedTimestamp}${sessionLine}

${contextText}

═══════════════════════════════════════

`;

      // Check if file exists - append if it does, create if it doesn't
      let fileCreated = false;
      try {
        await fs.access(filePath);
        logger.progress('context creation', 'Appending to existing context file');
      } catch (error) {
        fileCreated = true;
        logger.progress('context creation', 'Creating new context file');
      }

      // Write context to file with telemetry
      await tracer.startActiveSpan(OTEL.span.utils.journal_paths.write_file(), {
        attributes: {
          'code.function': 'writeContextFile',
          'code.filepath': filePath,
          'file.operation': 'append',
          [`${OTEL.NAMESPACE}.context.file_created`]: fileCreated,
          [`${OTEL.NAMESPACE}.context.content_size`]: contextEntry.length
        }
      }, async (writeSpan) => {
        try {
          await fs.appendFile(filePath, contextEntry, 'utf8');
          writeSpan.setStatus({ code: SpanStatusCode.OK });
        } catch (error) {
          writeSpan.recordException(error);
          writeSpan.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
          throw error;
        } finally {
          writeSpan.end();
        }
      });

      const processingDuration = Date.now() - startTime;

      // Set comprehensive telemetry attributes
      const directory = filePath.substring(0, filePath.lastIndexOf('/'));
      const telemetryData = {
        textLength: contextText.length,
        timestamp: timestamp.toISOString(),
        fileCreated: fileCreated,
        sessionId: sessionId,
        sessionDetected: !!sessionId,
        filePath: filePath,
        directory: directory
      };

      span.setAttributes({
        ...OTEL.attrs.mcp.context(telemetryData),
        [`${OTEL.NAMESPACE}.context.processing_duration_ms`]: processingDuration
      });

      // Emit metrics for dual visibility
      OTEL.metrics.counter('commit_story.context.captured', 1, {
        'context.file_created': fileCreated.toString(),
        'context.session_detected': (!!sessionId).toString()
      });

      OTEL.metrics.gauge('commit_story.context.size', contextText.length, {
        'context.timestamp': timestamp.toISOString().split('T')[0] // Date only
      });

      OTEL.metrics.histogram('commit_story.context.processing_duration_ms', processingDuration, {
        'context.operation': fileCreated ? 'create' : 'append'
      });

      logger.complete('context creation', 'Journal context captured successfully', {
        file_path: filePath,
        text_length: contextText.length,
        file_created: fileCreated,
        session_detected: !!sessionId,
        processing_duration_ms: processingDuration
      });

      span.setStatus({ code: SpanStatusCode.OK });

      // Extract trace ID for dev mode display
      const traceId = span.spanContext().traceId;
      const successMessage = isDevMode && traceId
        ? `✅ Context captured successfully!\n📊 Trace: ${traceId}`
        : '✅ Context captured successfully!';

      return {
        content: [{
          type: 'text',
          text: successMessage
        }],
        isError: false
      };

    } catch (error) {
      const processingDuration = Date.now() - startTime;

      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });

      span.setAttributes({
        [`${OTEL.NAMESPACE}.context.processing_duration_ms`]: processingDuration,
        [`${OTEL.NAMESPACE}.context.error_type`]: error.name
      });

      logger.error('context creation', 'Failed to capture context', error, {
        text_length: args?.text?.length || 0,
        has_text: !!args?.text,
        processing_duration_ms: processingDuration
      });

      OTEL.metrics.counter('commit_story.context.errors', 1, {
        'error.type': error.name,
        'error.validation': error.message.includes('Invalid') || error.message.includes('Missing') ? 'true' : 'false'
      });

      // Return MCP error response
      const errorMessage = `❌ **Failed to capture context**

🔍 **Error**: ${error.message}

💡 **Help**: Provide development context text to capture. For comprehensive context, include: current understanding of project, recent development insights, and key context that would help a fresh AI understand where we are and how we got here.`;

      return {
        content: [{
          type: 'text',
          text: errorMessage
        }],
        isError: true
      };
    } finally {
      span.end();
    }
  });
}
