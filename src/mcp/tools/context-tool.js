/**
 * Journal Context Capture Tool
 *
 * MCP tool for capturing AI working context during development sessions.
 * Provides temporary working memory that enhances journal generation.
 */

import { promises as fs } from 'fs';
import { generateJournalPath, ensureJournalDirectory, getTimezonedTimestamp } from '../../utils/journal-paths.js';

/**
 * Create a journal context capture entry
 * @param {Object} args - Tool arguments {text, session?, timestamp?}
 * @returns {Promise<Object>} MCP tool response
 */
export async function createContextTool(args) {
  try {
    // Validate input
    if (!args || typeof args !== 'object') {
      throw new Error('Invalid arguments: expected object with text property');
    }

    if (!args.text || typeof args.text !== 'string') {
      throw new Error('Missing or invalid text: context text is required');
    }

    if (args.text.trim().length === 0) {
      throw new Error('Empty context: text cannot be empty or whitespace only');
    }

    if (args.text.length > 10000) {
      throw new Error('Context too long: maximum 10,000 characters allowed');
    }

    // Parse timestamp (use provided or current time)
    const timestamp = args.timestamp ? new Date(args.timestamp) : new Date();

    if (isNaN(timestamp.getTime())) {
      throw new Error('Invalid timestamp format: use ISO 8601 format (e.g., "2025-09-22T10:30:00Z")');
    }

    // Parse session name (use provided or default to 'context')
    const sessionName = args.session && typeof args.session === 'string' && args.session.trim().length > 0
      ? args.session.trim()
      : 'context';

    const contextText = args.text.trim();

    // Generate context file path with session-based naming
    const basePath = generateJournalPath('context', timestamp);

    // Modify filename to include session name: YYYY-MM-DD-{session}.md
    const pathParts = basePath.split('/');
    const originalFilename = pathParts[pathParts.length - 1]; // e.g., "2025-10-13.md"
    const dateOnly = originalFilename.replace('.md', ''); // e.g., "2025-10-13"
    const sessionFilename = `${dateOnly}-${sessionName}.md`; // e.g., "2025-10-13-debugging.md"
    pathParts[pathParts.length - 1] = sessionFilename;
    const filePath = pathParts.join('/');

    // Ensure directory exists
    await ensureJournalDirectory(filePath);

    // Format context entry
    const formattedTimestamp = getTimezonedTimestamp(timestamp);
    const contextEntry = `## ${formattedTimestamp} - Context Capture: ${sessionName}

${contextText}

═══════════════════════════════════════

`;

    // Write context to file (always create new file for M1, append logic comes in M2)
    await fs.writeFile(filePath, contextEntry, 'utf8');

    return {
      content: [{
        type: 'text',
        text: '✅ Context captured successfully!'
      }],
      isError: false
    };

  } catch (error) {
    // Return MCP error response
    const errorMessage = `❌ **Failed to capture context**

🔍 **Error**: ${error.message}

💡 **Help**: Make sure your context text is not empty and any custom timestamp follows ISO 8601 format.`;

    return {
      content: [{
        type: 'text',
        text: errorMessage
      }],
      isError: true
    };
  }
}
