import { promises as fs } from 'fs';
import fsSync from 'fs';
import { dirname, join } from 'path';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { OTEL } from '../telemetry/standards.js';
import { createNarrativeLogger } from '../utils/trace-logger.js';

// Get tracer instance for manual instrumentation
const tracer = trace.getTracer('commit-story', '1.0.0');

// Debug mode detection from config file
let isDebugMode = false;
try {
  const configPath = './commit-story.config.json';
  if (fsSync.existsSync(configPath)) {
    const configData = JSON.parse(fsSync.readFileSync(configPath, 'utf8'));
    isDebugMode = configData.debug === true;
  }
} catch (error) {
  // Silently ignore config file errors - debug mode defaults to false
}

/**
 * Journal File Management System
 * Handles saving journal entries to daily markdown files with monthly directory organization
 */

/**
 * Saves a journal entry to the appropriate daily file
 * @param {string} commitHash - Git commit hash
 * @param {string} timestamp - ISO timestamp string
 * @param {string} commitMessage - First line of commit message
 * @param {Object} sections - Object containing all journal sections
 * @param {string} sections.summary - Generated summary content
 * @param {string} sections.dialogue - Generated dialogue content
 * @param {string} sections.technicalDecisions - Generated technical decisions content
 * @param {string} sections.commitDetails - Generated commit details content
 * @returns {Promise<string>} - Path to the file where entry was saved
 */
export async function saveJournalEntry(commitHash, timestamp, commitMessage, sections) {
  return await tracer.startActiveSpan(OTEL.span.journal.save(), {
    attributes: {
      [`${OTEL.NAMESPACE}.commit.hash`]: commitHash,
      [`${OTEL.NAMESPACE}.commit.message`]: commitMessage?.split('\n')[0]
    }
  }, async (span) => {
    const logger = createNarrativeLogger('journal.save_entry');
    const startTime = Date.now();

    try {
      logger.start('journal entry save', `Saving journal entry for commit: ${commitHash.slice(0, 8)}`);

      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      // Build file path: journal/entries/YYYY-MM/YYYY-MM-DD.md
      const monthDir = `${year}-${month}`;
      const fileName = `${year}-${month}-${day}.md`;
      const filePath = join(process.cwd(), 'journal', 'entries', monthDir, fileName);

      logger.progress('journal entry save', `Target file: ${monthDir}/${fileName}`);

      // Format entry for file or stdout
      const formattedEntry = formatJournalEntry(timestamp, commitHash, commitMessage, sections);

      // Create directory structure if it doesn't exist
      const dirPath = dirname(filePath);
      let dirCreated = false;
      try {
        await fs.mkdir(dirPath, { recursive: true });
        dirCreated = true;
        if (dirCreated) {
          logger.progress('journal entry save', `Created directory structure: ${monthDir}`);
        }
      } catch (dirError) {
        // Directory creation failed, but continue to try file write
        dirCreated = false;
        logger.progress('journal entry save', 'Directory already exists');
      }

      const entrySizeKB = Math.round(formattedEntry.length / 1024);
      logger.progress('journal entry save', `Writing ${entrySizeKB}KB journal entry to daily file`);

      // Append to daily file
      await fs.appendFile(filePath, formattedEntry, 'utf8');

      // Record successful save metrics
      span.setAttributes(OTEL.attrs.journal.save({
        filePath: filePath,
        entrySize: formattedEntry.length,
        dirCreated: dirCreated,
        writeDuration: Date.now() - startTime
      }));

      logger.complete('journal entry save', `Journal entry saved successfully to ${fileName}`);

      span.setStatus({ code: SpanStatusCode.OK, message: 'Journal entry saved successfully' });
      return filePath;

    } catch (error) {
      // Record error metrics
      span.setAttributes(OTEL.attrs.journal.save({
        filePath: 'stdout (file write failed)',
        entrySize: 0,
        dirCreated: false,
        writeDuration: Date.now() - startTime
      }));

      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });

      logger.error('journal entry save', 'File write failed - output to console instead', error, {
        targetPath: filePath
      });

      return 'stdout (file write failed)';
    } finally {
      span.end();
    }
  });
}

/**
 * Formats the complete journal entry
 * Uses time-only headers since date is provided by filename context
 *
 * @param {string} timestamp - ISO timestamp string
 * @param {string} commitHash - Git commit hash
 * @param {string} commitMessage - First line of commit message
 * @param {Object} sections - All journal sections
 * @returns {string} Complete formatted journal entry
 */
function formatJournalEntry(timestamp, commitHash, commitMessage, sections) {
  const date = new Date(timestamp);
  
  // Format time with user's local timezone
  const timeString = date.toLocaleTimeString('en-US', {
    hour12: true,
    timeZoneName: 'short'
  });
  
  const shortHash = commitHash.substring(0, 8);
  
  // Build journal entry with visual separation and four-section structure
  let entry = '\n\n';  // Newlines for visual separation between entries
  
  // Time-only header with commit label and message
  entry += `## ${timeString} - Commit: ${shortHash} - ${commitMessage}\n\n`;
  
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