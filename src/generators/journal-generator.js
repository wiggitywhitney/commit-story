/**
 * Unified Journal Generator
 * 
 * Orchestrates all three AI content generators and creates complete journal entries
 * with the four-section structure: Summary, Development Dialogue, Technical Decisions, Commit Details
 * 
 * Uses hybrid parallel/sequential approach:
 * 1. Run Summary + Technical Decisions in parallel (independent), generate Commit Details immediately
 * 2. Wait for Summary completion
 * 3. Run Development Dialogue with summary result
 */

import { generateSummary } from './summary-generator.js';
import { generateDevelopmentDialogue } from './dialogue-generator.js';
import { generateTechnicalDecisions } from './technical-decisions-generator.js';

/**
 * Generates a complete journal entry for a development session
 * 
 * @param {Object} context - The context object from context integrator
 * @param {Object} context.commit - Git commit data with hash, message, author, timestamp, files
 * @param {Array} context.chatMessages - Chat messages from development session
 * @param {Object} context.chatMetadata - Chat statistics and metrics
 * @param {Object|null} context.previousCommit - Previous commit data or null
 * @returns {Promise<Object>} Object containing all journal sections
 */
export async function generateJournalEntry(context) {
  try {
    console.log('🎯 Generating journal sections...');
    
    // Phase 1: Run independent generators in parallel + generate commit details immediately
    console.log('  📝 Starting summary and technical decisions in parallel...');
    const [summaryPromise, technicalDecisionsPromise] = [
      generateSummary(context),
      generateTechnicalDecisions(context)
    ];
    
    console.log('  📊 Generating commit details...');
    const commitDetails = generateCommitDetailsSection(context);
    
    // Phase 2: Wait for summary (needed for dialogue), let technical decisions continue
    console.log('  ⏳ Waiting for summary completion...');
    const summary = await summaryPromise;
    
    // Phase 3: Start dialogue with summary result
    console.log('  💬 Generating development dialogue...');
    const dialoguePromise = generateDevelopmentDialogue(context, summary);
    
    // Phase 4: Wait for all remaining generators to complete
    console.log('  ⏳ Waiting for remaining sections...');
    const [dialogue, technicalDecisions] = await Promise.all([
      dialoguePromise,
      technicalDecisionsPromise
    ]);
    
    // Return sections object for journal-manager to format
    const sections = {
      summary,
      dialogue,
      technicalDecisions,
      commitDetails
    };
    
    console.log('✅ Journal sections generated successfully');
    return sections;
    
  } catch (error) {
    console.error('❌ Error generating journal entry:', error.message);
    throw error;
  }
}

/**
 * Generates the programmatic Commit Details section from existing git context
 * 
 * @param {Object} context - The context object containing commit data
 * @returns {string} Formatted commit details section
 */
function generateCommitDetailsSection(context) {
  const { commit } = context;
  const { message, diff } = commit.data;
  
  // Extract file names from diff headers
  const files = extractFilesFromDiff(diff);
  
  // Count lines changed (rough estimate from diff)
  const linesChanged = countDiffLines(diff);
  
  // Get first line of commit message only
  const commitMessage = message.split('\n')[0];
  
  let detailsContent = '';
  
  // Files changed section
  if (files.length > 0) {
    detailsContent += '**Files Changed**:\n';
    files.forEach(file => {
      detailsContent += `- ${file}\n`;
    });
    detailsContent += '\n';
  }
  
  // Lines changed
  if (linesChanged > 0) {
    detailsContent += `**Lines Changed**: ~${linesChanged} lines\n`;
  }
  
  // Commit message (first line only)
  detailsContent += `**Message**: "${commitMessage}"\n`;
  
  return detailsContent.trim();
}

/**
 * Extract file paths from git diff headers
 * @param {string} diff - Git diff content
 * @returns {Array<string>} Array of file paths
 */
function extractFilesFromDiff(diff) {
  if (!diff) return [];
  
  const files = [];
  const lines = diff.split('\n');
  
  for (const line of lines) {
    // Look for diff headers: "diff --git a/path/file.js b/path/file.js"
    if (line.startsWith('diff --git ')) {
      const match = line.match(/diff --git a\/(.+) b\/.+/);
      if (match && match[1]) {
        files.push(match[1]);
      }
    }
  }
  
  return files;
}

/**
 * Count approximate lines changed from diff content
 * @param {string} diff - Git diff content
 * @returns {number} Approximate number of lines changed
 */
function countDiffLines(diff) {
  if (!diff) return 0;
  
  const lines = diff.split('\n');
  let count = 0;
  
  for (const line of lines) {
    // Count lines that start with + or - (but not +++ or ---)
    if ((line.startsWith('+') && !line.startsWith('+++')) || 
        (line.startsWith('-') && !line.startsWith('---'))) {
      count++;
    }
  }
  
  return count;
}

