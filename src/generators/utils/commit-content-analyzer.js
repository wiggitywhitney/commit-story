/**
 * Commit Content Analyzer Utility
 *
 * Analyzes git diffs to categorize changed files as documentation vs functional code.
 * Used by generators to conditionally adjust prompts based on commit content.
 */

import { trace, SpanStatusCode } from '@opentelemetry/api';
import { OTEL } from '../../telemetry/standards.js';

const tracer = trace.getTracer('commit-story-commit-content-analyzer', '1.0.0');

/**
 * Analyzes a git diff to categorize changed files
 *
 * @param {string} diff - Git diff output
 * @returns {Object} Analysis results
 * @returns {string[]} return.changedFiles - All changed file paths
 * @returns {string[]} return.docFiles - Documentation files (.md, .txt, README, CHANGELOG)
 * @returns {string[]} return.functionalFiles - Non-documentation files (actual code)
 * @returns {boolean} return.hasFunctionalCode - True if any functional files changed
 * @returns {boolean} return.hasOnlyDocs - True if only documentation files changed
 */
export function analyzeCommitContent(diff) {
  return tracer.startActiveSpan('utils.commit_content_analyzer.analyze', (span) => {
    try {
      const diffLines = diff.split('\n');
      const changedFiles = diffLines
        .filter(line => line.startsWith('diff --git'))
        .map(line => line.match(/diff --git a\/(.+) b\/.+/)?.[1])
        .filter(Boolean);

      // Documentation files: .md, .txt, README, CHANGELOG
      const docFiles = changedFiles.filter(file =>
        file.endsWith('.md') || file.endsWith('.txt') ||
        file.includes('README') || file.includes('CHANGELOG')
      );

      const functionalFiles = changedFiles.filter(file => !docFiles.includes(file));

      const hasFunctionalCode = functionalFiles.length > 0;
      const hasOnlyDocs = changedFiles.length > 0 && functionalFiles.length === 0;

      const result = {
        changedFiles,
        docFiles,
        functionalFiles,
        hasFunctionalCode,
        hasOnlyDocs
      };

      // Add telemetry attributes
      span.setAttributes({
        'commit_story.files.total': changedFiles.length,
        'commit_story.files.documentation': docFiles.length,
        'commit_story.files.functional': functionalFiles.length,
        'commit_story.files.has_functional_code': hasFunctionalCode,
        'commit_story.files.only_documentation': hasOnlyDocs
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: `Commit content analysis failed: ${error.message}`
      });
      throw error;
    } finally {
      span.end();
    }
  });
}
