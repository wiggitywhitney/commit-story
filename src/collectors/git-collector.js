/**
 * Git Commit Data Collector
 * Extracts data from the latest commit for git hook processing
 */

import { execSync } from 'child_process';
import { redactSensitiveData } from '../generators/filters/sensitive-data-filter.js';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { OTEL } from '../telemetry/standards.js';

// Get tracer instance for Git collector instrumentation
const tracer = trace.getTracer('commit-story-git-collector', '1.0.0');

/**
 * Get data for the specified commit (defaults to HEAD)
 * This is called by the git post-commit hook or test harness
 * @param {string} commitRef - Git commit reference (HEAD, HEAD~1, hash, etc.)
 * @returns {Object|null} Commit data or null if error
 */
export function getLatestCommitData(commitRef = 'HEAD') {
  return tracer.startActiveSpan(OTEL.span.collectors.git(), {
    attributes: {
      [`${OTEL.NAMESPACE}.collector.commit_ref`]: commitRef
    }
  }, (span) => {
    try {
      // Get commit metadata: hash|author_name|author_email|timestamp|subject
      const metadataOutput = execSync(`git show --format=format:"%H|%an|%ae|%at|%s" --no-patch ${commitRef}`, { encoding: 'utf8' }).trim();

      // Parse metadata - handle potential issues with pipe characters in commit message
      const parts = metadataOutput.split('|');
      const hash = parts[0];
      const authorName = parts[1];
      const authorEmail = parts[2];
      const timestamp = parts[3];
      const message = redactSensitiveData(parts.slice(4).join('|')); // Rejoin in case message contains pipes, then filter

      // Get full diff content for the specified commit
      const diff = execSync(`git diff-tree -p ${commitRef}`, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 }); // 10MB buffer

      const commitData = {
        hash,
        message,
        author: {
          name: authorName,
          email: '[REDACTED_EMAIL]'
        },
        timestamp: new Date(parseInt(timestamp) * 1000),
        diff
      };

      // Add commit attributes using OTEL builder
      span.setAttributes(OTEL.attrs.commit(commitData));

      // Add git-specific collection metrics
      span.setAttributes({
        [`${OTEL.NAMESPACE}.collector.diff_size_chars`]: diff.length,
        [`${OTEL.NAMESPACE}.collector.diff_size_lines`]: diff.split('\n').length,
        [`${OTEL.NAMESPACE}.collector.message_redacted`]: message.includes('[REDACTED]')
      });

      span.setStatus({ code: SpanStatusCode.OK, message: 'Git commit data collected successfully' });
      return commitData;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      console.error(`❌ Git data collection failed: ${error.message}`);
      return null;
    } finally {
      span.end();
    }
  });
}