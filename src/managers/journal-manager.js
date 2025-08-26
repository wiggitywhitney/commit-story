import { promises as fs } from 'fs';
import { dirname, join } from 'path';

/**
 * Journal File Management System
 * Handles saving journal entries to daily markdown files with monthly directory organization
 */

/**
 * Saves a journal entry to the appropriate daily file
 * @param {string} commitHash - Git commit hash
 * @param {string} timestamp - ISO timestamp string
 * @param {string} entryContent - The journal entry content
 * @returns {Promise<string>} - Path to the file where entry was saved
 */
export async function saveJournalEntry(commitHash, timestamp, entryContent) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Build file path: journal/entries/YYYY-MM/YYYY-MM-DD.md
  const monthDir = `${year}-${month}`;
  const fileName = `${year}-${month}-${day}.md`;
  const filePath = join(process.cwd(), 'journal', 'entries', monthDir, fileName);
  
  // Create directory structure if it doesn't exist
  const dirPath = dirname(filePath);
  await fs.mkdir(dirPath, { recursive: true });
  
  // Format the entry with header
  const formattedTimestamp = date.toISOString().slice(0, 19).replace('T', ' ');
  const shortHash = commitHash.slice(0, 7);
  
  const entryHeader = `## ${formattedTimestamp} - Commit ${shortHash}\n\n`;
  const entryFooter = `\n---\n\n`;
  const fullEntry = entryHeader + entryContent + entryFooter;
  
  // Append to the daily file
  await fs.appendFile(filePath, fullEntry, 'utf8');
  
  return filePath;
}

/**
 * Utility function to get the file path for a given date
 * Useful for testing or checking if entries exist for a date
 * @param {Date} date - Date to get file path for
 * @returns {string} - File path for that date's journal
 */
export function getJournalFilePath(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const monthDir = `${year}-${month}`;
  const fileName = `${year}-${month}-${day}.md`;
  
  return join(process.cwd(), 'journal', 'entries', monthDir, fileName);
}