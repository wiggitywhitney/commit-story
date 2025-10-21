/**
 * Commit Analysis Utilities
 *
 * Analyzes git commits to determine what files changed and whether
 * the commit should trigger journal generation.
 */

import { execSync } from 'child_process';

/**
 * Get list of files changed in a commit
 * @param {string} commitRef - Git commit reference (e.g., 'HEAD', 'abc123')
 * @returns {string[]} Array of file paths that changed in the commit
 */
export function getChangedFilesInCommit(commitRef) {
  try {
    // Use git diff-tree to get list of changed files
    // --no-commit-id: Suppress commit ID output
    // --name-only: Show only file names
    // -r: Recurse into subdirectories
    const output = execSync(
      `git diff-tree --no-commit-id --name-only -r ${commitRef}`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );

    // Split by newlines and filter out empty strings
    const files = output
      .trim()
      .split('\n')
      .filter(file => file.length > 0);

    return files;
  } catch (error) {
    // On error, return empty array (safer to allow execution)
    // This handles cases like invalid commit refs or git command failures
    return [];
  }
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
  try {
    // Use git rev-list to get parent commits
    // Format: commit_hash parent1_hash parent2_hash ...
    // For merge commits, there will be 2+ parent hashes
    const output = execSync(
      `git rev-list --parents -n 1 ${commitRef}`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );

    // Split output: first element is commit hash, rest are parents
    const parts = output.trim().split(' ');
    const parentCount = parts.length - 1;

    return {
      isMerge: parentCount >= 2,
      parentCount: parentCount
    };
  } catch (error) {
    // On error, return false (safer to allow execution)
    return {
      isMerge: false,
      parentCount: 0
    };
  }
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
  const changedFiles = getChangedFilesInCommit(commitRef);

  // If no files changed, allow execution (edge case, but safer)
  if (changedFiles.length === 0) {
    return {
      isJournalOnly: false,
      changedFiles: []
    };
  }

  // Check if ALL files are under journal/entries/
  const allAreJournalEntries = changedFiles.every(file =>
    file.startsWith('journal/entries/')
  );

  return {
    isJournalOnly: allAreJournalEntries,
    changedFiles: changedFiles
  };
}
