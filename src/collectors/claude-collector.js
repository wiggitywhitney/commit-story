/**
 * Claude Code Chat Data Collector
 * Extracts chat messages from Claude Code JSONL files for git commit time windows
 * Based on research findings in /docs/claude-chat-research.md
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { OTEL } from '../telemetry/standards.js';
import { createNarrativeLogger } from '../utils/trace-logger.js';

// Get tracer instance for Claude collector instrumentation
const tracer = trace.getTracer('commit-story-claude-collector', '1.0.0');

/**
 * Extract chat messages for a specific commit time window
 * @param {Date} commitTime - Current commit timestamp (UTC)
 * @param {Date} previousCommitTime - Previous commit timestamp (UTC)
 * @param {string} repoPath - Full path to repository (for cwd filtering)
 * @returns {Array} Sorted array of complete chat message objects from the time window
 */
export async function extractChatForCommit(commitTime, previousCommitTime, repoPath) {
  return tracer.startActiveSpan(OTEL.span.collectors.claude(), {
    attributes: {
      [`${OTEL.NAMESPACE}.collector.repo_path`]: repoPath,
      [`${OTEL.NAMESPACE}.collector.time_window_start`]: previousCommitTime.toISOString(),
      [`${OTEL.NAMESPACE}.collector.time_window_end`]: commitTime.toISOString(),
      'code.function': 'extractChatForCommit'
    }
  }, async (span) => {
    const logger = createNarrativeLogger('claude.collect_messages');

    try {
      const messages = [];

      const timeWindowMinutes = Math.round((commitTime - previousCommitTime) / (1000 * 60));
      logger.start('chat message collection', `Collecting Claude messages for ${timeWindowMinutes}-minute commit window`);

      // 1. Find all Claude JSONL files
      const files = findClaudeFiles();
      const filesFoundMetric = files.length;

      span.setAttributes({
        [`${OTEL.NAMESPACE}.collector.files_found`]: filesFoundMetric
      });

      // Emit files_found as queryable metric
      OTEL.metrics.gauge(`${OTEL.NAMESPACE}.collector.files_found`, filesFoundMetric);

      logger.progress('chat message collection', `Found ${files.length} Claude JSONL files in ~/.claude/projects directories`);

      let processedFiles = 0;
      let skippedFiles = 0;
      let totalLines = 0;
      let validMessages = 0;
      let projectFilteredOut = 0;
      let timeFilteredOut = 0;

      if (files.length === 0) {
        logger.progress('chat message collection', 'No Claude JSONL files found in ~/.claude/projects - creating empty result');
      }

      // 2. Process each JSONL file
      for (const filePath of files) {
        try {
          const content = readFileSync(filePath, 'utf8');
          const lines = content.trim().split('\n');
          totalLines += lines.length;
          processedFiles++;

          for (const line of lines) {
            if (!line.trim()) continue; // Skip empty lines

            try {
              const message = JSON.parse(line);

              // 3. Filter by project using cwd field
              if (message.cwd !== repoPath) {
                projectFilteredOut++;
                continue;
              }

              // 4. Filter by time window
              const messageTime = parseTimestamp(message.timestamp);
              if (!messageTime) continue;

              if (previousCommitTime <= messageTime && messageTime <= commitTime) {
                messages.push(message); // Full message object
                validMessages++;
              } else {
                timeFilteredOut++;
              }
            } catch (parseError) {
              // Skip malformed JSON lines, continue processing
              continue;
            }
          }
        } catch (fileError) {
          // Skip files that can't be read, continue with other files
          skippedFiles++;
          continue;
        }
      }

      // Log processing results
      logger.progress('chat message collection', `Processed ${processedFiles} files (${skippedFiles} skipped), parsed ${totalLines} JSONL lines`);

      if (projectFilteredOut > 0 || timeFilteredOut > 0) {
        logger.progress('chat message collection', `Filtered out ${projectFilteredOut} messages (wrong project) + ${timeFilteredOut} messages (outside time window)`);
      }

      // Add final processing metrics
      const finalMetrics = {
        [`${OTEL.NAMESPACE}.collector.files_processed`]: processedFiles,
        [`${OTEL.NAMESPACE}.collector.files_skipped`]: skippedFiles,
        [`${OTEL.NAMESPACE}.collector.total_lines`]: totalLines,
        [`${OTEL.NAMESPACE}.collector.messages_collected`]: validMessages,
        [`${OTEL.NAMESPACE}.collector.messages_filtered`]: messages.length
      };

      span.setAttributes(finalMetrics);

      // Emit processing metrics as queryable metrics
      Object.entries(finalMetrics).forEach(([name, value]) => {
        OTEL.metrics.gauge(name, value);
      });

      // 5. Sort by timestamp in chronological order
      const sortedMessages = messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

      if (validMessages === 0) {
        logger.complete('chat message collection', 'No messages found in time window - empty result');
        span.setStatus({ code: SpanStatusCode.OK, message: 'Claude messages collected successfully' });
        return sortedMessages;
      }

      // 6. Session isolation - lightweight detection first
      const uniqueSessionIds = new Set(sortedMessages.map(msg => msg.sessionId).filter(Boolean));
      const sessionCount = uniqueSessionIds.size;

      if (sessionCount <= 1) {
        // Plan A: Single session fast path - zero overhead
        logger.complete('chat message collection', `Collected ${validMessages} messages, sorted chronologically`);
        span.setStatus({ code: SpanStatusCode.OK, message: 'Claude messages collected successfully' });
        return sortedMessages;
      }

      // Plan B: Multiple sessions detected - need AI filtering
      logger.progress('chat message collection', `Plan B: Multiple sessions detected (${sessionCount} sessions), using AI filter`);

      // Import AI filter module dynamically to avoid overhead for single sessions
      const { filterRelevantSessions } = await import('../utils/session-filter.js');
      const filteredMessages = await filterRelevantSessions(sortedMessages, uniqueSessionIds, repoPath, logger);

      const finalMessageCount = filteredMessages.length;
      logger.complete('chat message collection', `AI session filter selected ${finalMessageCount} messages from ${sessionCount} sessions`);

      span.setStatus({ code: SpanStatusCode.OK, message: 'Claude messages collected and session filtered successfully' });
      return filteredMessages;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      logger.error('chat message collection', 'Collection failed', error);
      return [];
    } finally {
      span.end();
    }
  });
}

/**
 * Find Claude Code session files modified around the commit time window
 * Uses file modification time to avoid processing all session files
 * @param {string} repoPath - Repository path for directory encoding
 * @param {Date} commitTime - Current commit timestamp
 * @param {Date} previousCommitTime - Previous commit timestamp  
 * @returns {Array<string>} Array of file paths to process
 */
function findClaudeFiles() {
  return tracer.startActiveSpan(OTEL.span.collectors.file_discovery(), {
    attributes: {
      'code.function': 'findClaudeFiles'
    }
  }, (span) => {
    const logger = createNarrativeLogger('claude.file_discovery');
    const startTime = Date.now();

    try {
      // Find all Claude Code JSONL files across all project directories
      const claudeProjectsDir = join(homedir(), '.claude', 'projects');

      logger.start('file discovery', `Searching for Claude JSONL files in ${claudeProjectsDir}`);

      if (!existsSync(claudeProjectsDir)) {
        logger.complete('file discovery', 'Claude projects directory does not exist - no files found');

        const discoveryData = {
          projectsChecked: 0,
          filesFound: 0,
          searchDuration: Date.now() - startTime,
          claudeProjectsDir
        };

        span.setAttributes(OTEL.attrs.fileDiscovery(discoveryData));

        // Emit metrics
        Object.entries(OTEL.attrs.fileDiscovery(discoveryData)).forEach(([name, value]) => {
          OTEL.metrics.gauge(name, value);
        });

        span.setStatus({ code: SpanStatusCode.OK, message: 'File discovery completed - no projects directory' });
        return [];
      }

      const allFiles = [];
      let projectsChecked = 0;

      try {
        const projectDirs = readdirSync(claudeProjectsDir);
        logger.progress('file discovery', `Found ${projectDirs.length} project directories to check`);

        for (const projectDir of projectDirs) {
          const projectPath = join(claudeProjectsDir, projectDir);
          projectsChecked++;

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
      } catch (error) {
        logger.error('file discovery', 'Failed to read projects directory', error);
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        return [];
      }

      const discoveryData = {
        projectsChecked,
        filesFound: allFiles.length,
        searchDuration: Date.now() - startTime,
        claudeProjectsDir
      };

      span.setAttributes(OTEL.attrs.fileDiscovery(discoveryData));

      // Emit metrics
      Object.entries(OTEL.attrs.fileDiscovery(discoveryData)).forEach(([name, value]) => {
        OTEL.metrics.gauge(name, value);
      });

      logger.complete('file discovery', `Found ${allFiles.length} JSONL files across ${projectsChecked} project directories`);
      span.setStatus({ code: SpanStatusCode.OK, message: 'File discovery completed successfully' });

      return allFiles;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      logger.error('file discovery', 'File discovery failed', error);
      return [];
    } finally {
      span.end();
    }
  });
}

/**
 * Parse Claude Code timestamp to UTC Date object
 * Claude timestamps: "2025-08-20T20:54:46.152Z" (UTC ISO format)
 * NOTE: No span instrumentation - this is a simple utility function called 60+ times per commit.
 * Aggregate metrics are tracked in the parent span (extractChatForCommit) to avoid span pollution.
 * @param {string} timestamp - Timestamp string from Claude message
 * @returns {Date|null} Parsed Date in UTC, or null if invalid
 */
function parseTimestamp(timestamp) {
  if (!timestamp) {
    // Emit aggregate metric for null inputs
    OTEL.metrics.counter('commit_story.timestamp.parse_attempts').add(1);
    OTEL.metrics.counter('commit_story.timestamp.null_inputs').add(1);
    return null;
  }

  try {
    // Claude timestamps: "2025-08-20T20:54:46.152Z" -> UTC Date
    const utcDate = new Date(timestamp.replace('Z', '+00:00'));
    const parseSuccess = !isNaN(utcDate.getTime());

    // Emit aggregate metrics
    OTEL.metrics.counter('commit_story.timestamp.parse_attempts').add(1);

    if (!parseSuccess) {
      OTEL.metrics.counter('commit_story.timestamp.parse_failures').add(1);
      return null;
    }

    OTEL.metrics.counter('commit_story.timestamp.parse_successes').add(1);
    return utcDate;

  } catch (error) {
    // Emit error metric and continue processing
    OTEL.metrics.counter('commit_story.timestamp.parse_attempts').add(1);
    OTEL.metrics.counter('commit_story.timestamp.parse_exceptions').add(1);
    return null;
  }
}