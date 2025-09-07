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
 * @param {Object} sections - Object containing all journal sections
 * @param {string} sections.summary - Generated summary content
 * @param {string} sections.dialogue - Generated dialogue content  
 * @param {string} sections.technicalDecisions - Generated technical decisions content
 * @param {string} sections.commitDetails - Generated commit details content
 * @returns {Promise<string>} - Path to the file where entry was saved
 */
export async function saveJournalEntry(commitHash, timestamp, sections) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Build file path: journal/entries/YYYY-MM/YYYY-MM-DD.md
  const monthDir = `${year}-${month}`;
  const fileName = `${year}-${month}-${day}.md`;
  const filePath = join(process.cwd(), 'journal', 'entries', monthDir, fileName);
  
  // Format entry for file or stdout
  const formattedEntry = formatJournalEntry(timestamp, commitHash, sections);
  
  try {
    // Create directory structure if it doesn't exist
    const dirPath = dirname(filePath);
    await fs.mkdir(dirPath, { recursive: true });
    
    // Append to daily file
    await fs.appendFile(filePath, formattedEntry, 'utf8');
    
    return filePath;
  } catch (error) {
    console.error(`⚠️ Cannot write journal file: ${error.message}`);
    console.error('Journal entry content (save manually if needed):');
    console.log('--- JOURNAL ENTRY START ---');
    console.log(formattedEntry);
    console.log('--- JOURNAL ENTRY END ---');
    
    return 'stdout (file write failed)';
  }
}

/**
 * Formats the complete journal entry
 * Uses time-only headers since date is provided by filename context
 * 
 * @param {string} timestamp - ISO timestamp string
 * @param {string} commitHash - Git commit hash
 * @param {Object} sections - All journal sections
 * @returns {string} Complete formatted journal entry
 */
function formatJournalEntry(timestamp, commitHash, sections) {
  const date = new Date(timestamp);
  
  // Format time with user's local timezone
  const timeString = date.toLocaleTimeString('en-US', {
    hour12: true,
    timeZoneName: 'short'
  });
  
  const shortHash = commitHash.substring(0, 8);
  
  // Build journal entry with visual separation and four-section structure
  let entry = '\n\n';  // Newlines for visual separation between entries
  
  // Time-only header with commit label
  entry += `## ${timeString} - Commit: ${shortHash}\n\n`;
  
  // Summary section
  entry += `### Summary - ${shortHash}\n\n`;
  entry += sections.summary + '\n\n';
  
  // Development Dialogue section
  entry += `### Development Dialogue - ${shortHash}\n\n`;
  entry += sections.dialogue + '\n\n';
  
  // Technical Decisions section  
  entry += `### Technical Decisions - ${shortHash}\n\n`;
  entry += sections.technicalDecisions + '\n\n';
  
  // Commit Details section
  entry += `### Commit Details - ${shortHash}\n\n`;
  entry += sections.commitDetails + '\n\n';
  
  // Separator for multiple entries in same day
  entry += '═══════════════════════════════════════\n\n';
  
  return entry;
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