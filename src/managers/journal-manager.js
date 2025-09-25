import { promises as fs } from 'fs';
import fsSync from 'fs';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { OTEL } from '../telemetry/standards.js';
import { createNarrativeLogger } from '../utils/trace-logger.js';
import { generateJournalPath, ensureJournalDirectory, getTimezonedTimestamp } from '../utils/journal-paths.js';

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
 * @param {Date|null} previousCommitTime - Previous commit timestamp for reflection window calculation
 * @returns {Promise<string>} - Path to the file where entry was saved
 */
export async function saveJournalEntry(commitHash, timestamp, commitMessage, sections, previousCommitTime = null) {
  return await tracer.startActiveSpan(OTEL.span.journal.save(), {
    attributes: {
      [`${OTEL.NAMESPACE}.commit.hash`]: commitHash,
      [`${OTEL.NAMESPACE}.commit.message`]: commitMessage?.split('\n')[0],
      'code.function': 'saveJournalEntry'
    }
  }, async (span) => {
    const logger = createNarrativeLogger('journal.save_entry');
    const startTime = Date.now();

    try {
      logger.start('journal entry save', `Saving journal entry for commit: ${commitHash.slice(0, 8)}`);

      const date = new Date(timestamp);

      // Use extracted utilities for path generation and directory creation
      const filePath = generateJournalPath('entries', date);
      const pathParts = filePath.split('/');
      const monthDir = pathParts[pathParts.length - 2];
      const fileName = pathParts[pathParts.length - 1];

      logger.progress('journal entry save', `Target file: ${monthDir}/${fileName}`);

      // Discover reflections within commit development window
      const reflections = await discoverReflections(date, previousCommitTime);
      logger.progress('journal entry save', `Found ${reflections.length} reflections for commit window`);

      // Format entry for file or stdout
      const formattedEntry = formatJournalEntry(timestamp, commitHash, commitMessage, sections, reflections);

      // Create directory structure if it doesn't exist using extracted utility
      const dirCreated = await ensureJournalDirectory(filePath);

      const entrySizeKB = Math.round(formattedEntry.length / 1024);
      logger.progress('journal entry save', `Writing ${entrySizeKB}KB journal entry to daily file`);

      // Append to daily file
      await fs.appendFile(filePath, formattedEntry, 'utf8');

      // Record successful save metrics
      const saveData = {
        filePath: filePath,
        entrySize: formattedEntry.length,
        dirCreated: dirCreated,
        writeDuration: Date.now() - startTime
      };
      span.setAttributes(OTEL.attrs.journal.save(saveData));

      // Dual emission: emit key journal metrics
      OTEL.metrics.gauge('commit_story.journal.entry_size', saveData.entrySize);
      OTEL.metrics.histogram('commit_story.journal.write_duration_ms', saveData.writeDuration);
      OTEL.metrics.counter('commit_story.journal.entries_saved', 1);

      logger.complete('journal entry save', `Journal entry saved successfully to ${fileName}`);

      span.setStatus({ code: SpanStatusCode.OK, message: 'Journal entry saved successfully' });
      return filePath;

    } catch (error) {
      // Record error metrics
      const errorAttrs = OTEL.attrs.journal.save({
        filePath: 'stdout (file write failed)',
        entrySize: 0,
        dirCreated: false,
        writeDuration: Date.now() - startTime
      });
      span.setAttributes(errorAttrs);

      // Emit error metrics for journal failure analysis
      Object.entries(errorAttrs).forEach(([name, value]) => {
        if (typeof value === 'number') {
          OTEL.metrics.gauge(name, value);
        } else if (typeof value === 'boolean') {
          OTEL.metrics.gauge(name, value ? 1 : 0);
        }
      });

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
 * @param {Array} reflections - Array of reflection objects
 * @returns {string} Complete formatted journal entry
 */
function formatJournalEntry(timestamp, commitHash, commitMessage, sections, reflections = []) {
  const date = new Date(timestamp);

  // Format time with user's local timezone using extracted utility
  const timeString = getTimezonedTimestamp(date);
  
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

  // Developer Reflections section (only if reflections exist)
  if (reflections.length > 0) {
    entry += `### Developer Reflections - ${shortHash}\n\n`;

    for (const reflection of reflections) {
      entry += `**${reflection.timeString}**\n\n`;
      entry += reflection.content.join('\n') + '\n\n';
    }
  }

  // Commit Details section
  entry += `### Commit Details - ${shortHash}\n\n`;
  entry += sections.commitDetails + '\n\n';
  
  // Separator for multiple entries in same day
  entry += '═══════════════════════════════════════\n\n';
  
  return entry;
}

/**
 * Discover reflections within a commit development window
 * @param {Date} commitTime - End time of the commit window
 * @param {Date|null} previousCommitTime - Start time of the commit window (or null for first commit)
 * @returns {Promise<Array>} Array of reflection objects with timestamp and content
 */
export async function discoverReflections(commitTime, previousCommitTime) {
  const reflections = [];
  // Use previous commit time as start, or default to 24 hours before if no previous commit
  const startTime = previousCommitTime || new Date(commitTime.getTime() - (24 * 60 * 60 * 1000));

  // Generate date range to check for reflection files
  const daysToCheck = Math.ceil((commitTime.getTime() - startTime.getTime()) / (24 * 60 * 60 * 1000)) + 1;

  for (let i = 0; i < daysToCheck; i++) {
    const checkDate = new Date(startTime.getTime() + (i * 24 * 60 * 60 * 1000));
    const reflectionPath = generateJournalPath('reflections', checkDate);

    try {
      if (fsSync.existsSync(reflectionPath)) {
        const content = await fs.readFile(reflectionPath, 'utf8');
        const reflectionEntries = parseReflectionFile(content, checkDate, startTime, commitTime);
        reflections.push(...reflectionEntries);
      }
    } catch (error) {
      // Silently ignore file read errors
    }
  }

  return reflections.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * Parse reflection file content and extract entries within time window
 * @param {string} content - File content
 * @param {Date} fileDate - Date of the reflection file
 * @param {Date} startTime - Start of search window
 * @param {Date} endTime - End of search window
 * @returns {Array} Array of reflection objects
 */
function parseReflectionFile(content, fileDate, startTime, endTime) {
  const reflections = [];
  const lines = content.split('\n');
  let currentReflection = null;

  for (const line of lines) {
    // Look for timestamp headers (## HH:MM:SS [TIMEZONE])
    const timestampMatch = line.match(/^## (\d{1,2}:\d{2}:\d{2} (?:AM|PM) [A-Z]{3,4})$/);

    if (timestampMatch) {
      // Save previous reflection if it exists
      if (currentReflection) {
        reflections.push(currentReflection);
      }

      // Parse timestamp and create full datetime
      const timeString = timestampMatch[1];
      const reflectionTime = parseReflectionTimestamp(fileDate, timeString);

      // Check if reflection falls within time window
      if (reflectionTime >= startTime && reflectionTime <= endTime) {
        currentReflection = {
          timestamp: reflectionTime,
          timeString: timeString,
          content: []
        };
      } else {
        currentReflection = null;
      }
    } else if (currentReflection && line.trim() && !line.match(/^═+$/)) {
      // Add content lines (skip empty lines and separators)
      currentReflection.content.push(line);
    }
  }

  // Don't forget the last reflection
  if (currentReflection) {
    reflections.push(currentReflection);
  }

  return reflections;
}

/**
 * Parse reflection timestamp string into Date object
 * @param {Date} fileDate - Date of the file containing the reflection
 * @param {string} timeString - Time string like "9:36:37 PM EDT"
 * @returns {Date} Full datetime object
 */
function parseReflectionTimestamp(fileDate, timeString) {
  // Simple parsing - assumes same date as file
  // Could be enhanced to handle timezone conversion if needed
  const [time, period, timezone] = timeString.split(' ');
  const [hours, minutes, seconds] = time.split(':').map(Number);

  let hour24 = hours;
  if (period === 'PM' && hours !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0;
  }

  const reflectionDate = new Date(fileDate);
  reflectionDate.setHours(hour24, minutes, seconds, 0);

  return reflectionDate;
}

/**
 * Utility function to get the file path for a given date
 * Useful for testing or checking if entries exist for a date
 * @param {Date} date - Date to get file path for
 * @returns {string} - File path for that date's journal
 */
export function getJournalFilePath(date) {
  // Use extracted utility for path generation
  return generateJournalPath('entries', date);
}