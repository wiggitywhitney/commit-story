/**
 * Git Commit Data Collector
 * Extracts data from the latest commit for git hook processing
 */

import { execSync } from 'child_process';

/**
 * Get data for the latest commit (HEAD)
 * This is called by the git post-commit hook
 * @returns {Object|null} Latest commit data or null if error
 */
export function getLatestCommitData() {
  try {
    // Get commit metadata: hash|author_name|author_email|timestamp|subject
    const metadataOutput = execSync('git show --format=format:"%H|%an|%ae|%at|%s" --no-patch HEAD', { encoding: 'utf8' }).trim();
    
    // Parse metadata - handle potential issues with pipe characters in commit message
    const parts = metadataOutput.split('|');
    const hash = parts[0];
    const authorName = parts[1];
    const authorEmail = parts[2];
    const timestamp = parts[3];
    const message = parts.slice(4).join('|'); // Rejoin in case message contains pipes
    
    // Get full diff content for the latest commit
    const diff = execSync('git diff-tree -p HEAD', { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 }); // 10MB buffer
    
    return {
      hash,
      message,
      author: {
        name: authorName,
        email: authorEmail
      },
      timestamp: new Date(parseInt(timestamp) * 1000),
      diff
    };
    
  } catch (error) {
    console.error('Git collector error:', error.message);
    return null;
  }
}