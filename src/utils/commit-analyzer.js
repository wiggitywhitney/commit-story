/**
 * Commit Analysis Utilities
 *
 * Analyzes git commits to determine what files changed and whether
 * the commit should trigger journal generation.
 */

import { execFileSync } from 'child_process';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { OTEL } from '../telemetry/standards.js';
import { createNarrativeLogger } from './trace-logger.js';

// Get tracer instance for commit analyzer instrumentation
const tracer = trace.getTracer('commit-story', '1.0.0');

/**
 * Get list of files changed in a commit
 * @param {string} commitRef - Git commit reference (e.g., 'HEAD', 'abc123')
 * @returns {string[]} Array of file paths that changed in the commit
 */
export function getChangedFilesInCommit(commitRef) {
  return tracer.startActiveSpan(OTEL.span.utils.commitAnalyzer.getChangedFiles(), {
    attributes: {
      'code.function': 'getChangedFilesInCommit'
    }
  }, (span) => {
    const logger = createNarrativeLogger('utils.commit_analyzer.get_changed_files');
    const startTime = Date.now();

    try {
      logger.start('Get changed files', `Analyzing changed files for commit: ${commitRef}`);

      // Validate commit ref format to prevent command injection
      // Allows: SHA hashes, HEAD, branch names with safe characters
      const refValid = /^[a-zA-Z0-9/_.-]+$/.test(commitRef);

      if (!refValid) {
        logger.decision('Invalid ref format', `Commit ref "${commitRef}" failed validation - returning empty array`, {
          commit_ref: commitRef,
          validation_failed: true,
          security_check: 'command_injection_prevention'
        });

        const analysisDuration = Date.now() - startTime;
        const attrs = OTEL.attrs.utils.commitAnalyzer.getChangedFiles({
          commitRef,
          refValid: false,
          filesChanged: 0,
          gitCommandDuration: 0,
          parseDuration: 0
        });

        span.setAttributes(attrs);

        // Emit metrics
        Object.entries(attrs).forEach(([name, value]) => {
          if (typeof value === 'number') {
            OTEL.metrics.histogram(name, value);
          } else if (typeof value === 'boolean') {
            OTEL.metrics.gauge(name, value ? 1 : 0);
          }
        });

        span.setStatus({ code: SpanStatusCode.OK, message: 'Invalid commit ref - returned empty array' });
        span.end();
        return [];
      }

      logger.progress('Executing git command', `Running git diff-tree for ${commitRef}`);

      // Use git diff-tree to get list of changed files
      // --no-commit-id: Suppress commit ID output
      // --name-only: Show only file names
      // -r: Recurse into subdirectories
      const gitStartTime = Date.now();
      const output = execFileSync(
        'git',
        ['diff-tree', '--no-commit-id', '--name-only', '-r', commitRef],
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      const gitCommandDuration = Date.now() - gitStartTime;

      logger.progress('Parsing output', `Git command completed in ${gitCommandDuration}ms, parsing file list`);

      const parseStartTime = Date.now();
      // Split by newlines and filter out empty strings
      const files = output
        .trim()
        .split('\n')
        .filter(file => file.length > 0);
      const parseDuration = Date.now() - parseStartTime;

      const analysisDuration = Date.now() - startTime;
      const attrs = OTEL.attrs.utils.commitAnalyzer.getChangedFiles({
        commitRef,
        refValid: true,
        filesChanged: files.length,
        gitCommandDuration,
        parseDuration: parseDuration
      });

      span.setAttributes(attrs);

      // Emit metrics for changed files analysis
      Object.entries(attrs).forEach(([name, value]) => {
        if (typeof value === 'number') {
          OTEL.metrics.histogram(name, value);
        } else if (typeof value === 'boolean') {
          OTEL.metrics.gauge(name, value ? 1 : 0);
        }
      });

      logger.complete('Files retrieved', `Found ${files.length} changed files in ${analysisDuration}ms`, {
        files_count: files.length,
        git_duration_ms: gitCommandDuration,
        parse_duration_ms: parseDuration,
        total_duration_ms: analysisDuration
      });

      span.setStatus({ code: SpanStatusCode.OK, message: `Retrieved ${files.length} changed files` });
      span.end();
      return files;

    } catch (error) {
      const analysisDuration = Date.now() - startTime;

      logger.error('Git command failed', 'Error retrieving changed files', error, {
        commit_ref: commitRef,
        error_type: error.code || 'unknown',
        duration_ms: analysisDuration
      });

      // On error, return empty array (safer to allow execution)
      // This handles cases like invalid commit refs or git command failures
      const attrs = OTEL.attrs.utils.commitAnalyzer.getChangedFiles({
        commitRef,
        refValid: true,
        filesChanged: 0,
        gitCommandDuration: 0,
        parseDuration: 0
      });

      span.setAttributes(attrs);
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.end();
      return [];
    }
  });
}

/**
 * Check if a commit is a merge commit
 *
 * A merge commit has multiple parent commits (2+ parents).
 * Regular commits have 1 parent, initial commits have 0 parents.
 *
 * @param {string} commitRef - Git commit reference
 * @returns {Object} Analysis result
 * @returns {boolean} return.isMerge - True if commit is a merge commit
 * @returns {number} return.parentCount - Number of parent commits
 */
export function isMergeCommit(commitRef) {
  return tracer.startActiveSpan(OTEL.span.utils.commitAnalyzer.isMergeCommit(), {
    attributes: {
      'code.function': 'isMergeCommit'
    }
  }, (span) => {
    const logger = createNarrativeLogger('utils.commit_analyzer.is_merge_commit');
    const startTime = Date.now();

    try {
      logger.start('Check merge commit', `Analyzing commit to determine if it's a merge: ${commitRef}`);

      // Validate commit ref format to prevent command injection
      // Allows: SHA hashes, HEAD, branch names with safe characters
      const refValid = /^[a-zA-Z0-9/_.-]+$/.test(commitRef);

      if (!refValid) {
        logger.decision('Invalid ref format', `Commit ref "${commitRef}" failed validation - returning non-merge`, {
          commit_ref: commitRef,
          validation_failed: true,
          security_check: 'command_injection_prevention'
        });

        const analysisDuration = Date.now() - startTime;
        const attrs = OTEL.attrs.utils.commitAnalyzer.isMergeCommit({
          commitRef,
          refValid: false,
          isMerge: false,
          parentCount: 0,
          gitCommandDuration: 0,
          parseDuration: 0
        });

        span.setAttributes(attrs);

        // Emit metrics
        Object.entries(attrs).forEach(([name, value]) => {
          if (typeof value === 'number') {
            OTEL.metrics.histogram(name, value);
          } else if (typeof value === 'boolean') {
            OTEL.metrics.gauge(name, value ? 1 : 0);
          }
        });

        span.setStatus({ code: SpanStatusCode.OK, message: 'Invalid commit ref - returned non-merge' });
        span.end();
        return { isMerge: false, parentCount: 0 };
      }

      logger.progress('Executing git command', `Running git rev-list to get parent commits for ${commitRef}`);

      // Use git rev-list to get parent commits
      // Format: commit_hash parent1_hash parent2_hash ...
      // For merge commits, there will be 2+ parent hashes
      const gitStartTime = Date.now();
      const output = execFileSync(
        'git',
        ['rev-list', '--parents', '-n', '1', commitRef],
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      const gitCommandDuration = Date.now() - gitStartTime;

      logger.progress('Parsing output', `Git command completed in ${gitCommandDuration}ms, parsing parent list`);

      const parseStartTime = Date.now();
      // Split output: first element is commit hash, rest are parents
      const parts = output.trim().split(' ');
      const parentCount = parts.length - 1;
      const isMerge = parentCount >= 2;
      const parseDuration = Date.now() - parseStartTime;

      const analysisDuration = Date.now() - startTime;
      const attrs = OTEL.attrs.utils.commitAnalyzer.isMergeCommit({
        commitRef,
        refValid: true,
        isMerge,
        parentCount,
        gitCommandDuration,
        parseDuration: parseDuration
      });

      span.setAttributes(attrs);

      // Emit metrics for merge commit analysis
      Object.entries(attrs).forEach(([name, value]) => {
        if (typeof value === 'number') {
          OTEL.metrics.histogram(name, value);
        } else if (typeof value === 'boolean') {
          OTEL.metrics.gauge(name, value ? 1 : 0);
        }
      });

      const commitType = isMerge ? `merge commit (${parentCount} parents)` : `regular commit (${parentCount} parent${parentCount === 1 ? '' : 's'})`;
      logger.complete('Merge analysis complete', `Determined commit is a ${commitType} in ${analysisDuration}ms`, {
        is_merge: isMerge,
        parent_count: parentCount,
        git_duration_ms: gitCommandDuration,
        parse_duration_ms: parseDuration,
        total_duration_ms: analysisDuration
      });

      span.setStatus({ code: SpanStatusCode.OK, message: `Analyzed commit: ${commitType}` });
      span.end();

      return {
        isMerge: isMerge,
        parentCount: parentCount
      };

    } catch (error) {
      const analysisDuration = Date.now() - startTime;

      logger.error('Git command failed', 'Error checking merge commit status', error, {
        commit_ref: commitRef,
        error_type: error.code || 'unknown',
        duration_ms: analysisDuration
      });

      // On error, return false (safer to allow execution)
      const attrs = OTEL.attrs.utils.commitAnalyzer.isMergeCommit({
        commitRef,
        refValid: true,
        isMerge: false,
        parentCount: 0,
        gitCommandDuration: 0,
        parseDuration: 0
      });

      span.setAttributes(attrs);
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.end();

      return {
        isMerge: false,
        parentCount: 0
      };
    }
  });
}

/**
 * Check if a commit only touches auto-generated journal entry files
 *
 * Returns true only if ALL changed files are under journal/entries/
 * This prevents recursive journal generation when commits only add journal entries.
 *
 * Important: Does NOT filter manual content:
 * - journal/reflections/** (manual user reflections)
 * - journal/context/** (manual context captures)
 * These should still trigger journal generation.
 *
 * @param {string} commitRef - Git commit reference
 * @returns {Object} Analysis result
 * @returns {boolean} return.isJournalOnly - True if commit only touches journal/entries/**
 * @returns {string[]} return.changedFiles - List of all changed files
 */
export function isJournalEntriesOnlyCommit(commitRef) {
  return tracer.startActiveSpan(OTEL.span.utils.commitAnalyzer.isJournalEntriesOnly(), {
    attributes: {
      'code.function': 'isJournalEntriesOnlyCommit'
    }
  }, (span) => {
    const logger = createNarrativeLogger('utils.commit_analyzer.is_journal_entries_only');
    const startTime = Date.now();

    try {
      logger.start('Journal entries check', `Checking if commit only touches journal/entries/: ${commitRef}`);

      const changedFiles = getChangedFilesInCommit(commitRef);

      // If no files changed, allow execution (edge case, but safer)
      if (changedFiles.length === 0) {
        logger.decision('No files changed', 'Commit has no changed files - allowing execution', {
          commit_ref: commitRef,
          files_changed: 0,
          edge_case: 'empty_commit'
        });

        const analysisDuration = Date.now() - startTime;
        const attrs = OTEL.attrs.utils.commitAnalyzer.isJournalEntriesOnly({
          commitRef,
          filesChanged: 0,
          journalEntriesCount: 0,
          isJournalOnly: false,
          analysisDuration
        });

        span.setAttributes(attrs);

        // Emit metrics
        Object.entries(attrs).forEach(([name, value]) => {
          if (typeof value === 'number') {
            OTEL.metrics.histogram(name, value);
          } else if (typeof value === 'boolean') {
            OTEL.metrics.gauge(name, value ? 1 : 0);
          }
        });

        logger.complete('Analysis complete', `No files changed - not journal-only commit`, {
          is_journal_only: false,
          files_changed: 0,
          duration_ms: analysisDuration
        });

        span.setStatus({ code: SpanStatusCode.OK, message: 'No files changed - allowed' });
        span.end();

        return {
          isJournalOnly: false,
          changedFiles: []
        };
      }

      logger.progress('Analyzing files', `Checking ${changedFiles.length} changed files for journal/entries/ pattern`);

      // Check if ALL files are under journal/entries/
      const journalEntriesFiles = changedFiles.filter(file =>
        file.startsWith('journal/entries/')
      );
      const allAreJournalEntries = journalEntriesFiles.length === changedFiles.length;

      const analysisDuration = Date.now() - startTime;
      const attrs = OTEL.attrs.utils.commitAnalyzer.isJournalEntriesOnly({
        commitRef,
        filesChanged: changedFiles.length,
        journalEntriesCount: journalEntriesFiles.length,
        isJournalOnly: allAreJournalEntries,
        analysisDuration
      });

      span.setAttributes(attrs);

      // Emit metrics for journal-only commit detection
      Object.entries(attrs).forEach(([name, value]) => {
        if (typeof value === 'number') {
          OTEL.metrics.histogram(name, value);
        } else if (typeof value === 'boolean') {
          OTEL.metrics.gauge(name, value ? 1 : 0);
        }
      });

      if (allAreJournalEntries) {
        logger.decision('Journal-only commit', `All ${changedFiles.length} files are journal entries - will skip execution`, {
          files_changed: changedFiles.length,
          journal_entries: journalEntriesFiles.length,
          skip_reason: 'prevent_recursive_generation'
        });
      } else {
        logger.decision('Mixed commit', `${journalEntriesFiles.length} of ${changedFiles.length} files are journal entries - will execute`, {
          files_changed: changedFiles.length,
          journal_entries: journalEntriesFiles.length,
          non_journal_files: changedFiles.length - journalEntriesFiles.length
        });
      }

      logger.complete('Analysis complete', `Determined commit is ${allAreJournalEntries ? 'journal-only' : 'mixed content'} in ${analysisDuration}ms`, {
        is_journal_only: allAreJournalEntries,
        files_changed: changedFiles.length,
        journal_entries: journalEntriesFiles.length,
        duration_ms: analysisDuration
      });

      span.setStatus({ code: SpanStatusCode.OK, message: `Analyzed ${changedFiles.length} files: ${allAreJournalEntries ? 'journal-only' : 'mixed'}` });
      span.end();

      return {
        isJournalOnly: allAreJournalEntries,
        changedFiles: changedFiles
      };

    } catch (error) {
      const analysisDuration = Date.now() - startTime;

      logger.error('Analysis failed', 'Error analyzing journal entries commit', error, {
        commit_ref: commitRef,
        error_type: error.code || 'unknown',
        duration_ms: analysisDuration
      });

      const attrs = OTEL.attrs.utils.commitAnalyzer.isJournalEntriesOnly({
        commitRef,
        filesChanged: 0,
        journalEntriesCount: 0,
        isJournalOnly: false,
        analysisDuration
      });

      span.setAttributes(attrs);
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.end();

      // On error, return false to allow execution (safer)
      return {
        isJournalOnly: false,
        changedFiles: []
      };
    }
  });
}
