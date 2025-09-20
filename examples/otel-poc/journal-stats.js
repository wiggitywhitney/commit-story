import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { promises as fs } from 'fs';
import { join } from 'path';

// Get a tracer for this module
const tracer = trace.getTracer('journal-stats', '1.0.0');

/**
 * Journal Statistics Utility with Rich OpenTelemetry Instrumentation
 *
 * This utility demonstrates comprehensive I/O data capture patterns for AI system intelligence.
 * Every significant operation is traced with full input/output data in span attributes.
 */

/**
 * Analyzes journal entries and returns statistics
 * @param {Object} options - Analysis options
 * @param {number} options.maxFiles - Maximum number of files to process (default: 10)
 * @param {boolean} options.includeContent - Include entry content samples (default: false)
 * @returns {Promise<Object>} Statistics about journal entries
 */
export async function getJournalStatistics(options = {}) {
  const { maxFiles = 10, includeContent = false } = options;

  // Start main span with full input capture
  return tracer.startActiveSpan('journal.stats.analyze', async (span) => {
    try {
      // Capture all inputs as span attributes
      span.setAttributes({
        'journal.stats.input.max_files': maxFiles,
        'journal.stats.input.include_content': includeContent,
        'journal.stats.input.timestamp': new Date().toISOString(),
        'journal.stats.input.working_dir': process.cwd(),
      });

      // Phase 1: Discover journal files
      const files = await discoverJournalFiles(maxFiles);

      // Phase 2: Process files and extract data
      const processedData = await processJournalFiles(files, includeContent);

      // Phase 3: Generate statistics
      const statistics = await generateStatistics(processedData);

      // Capture full output in span attributes
      span.setAttributes({
        'journal.stats.output.total_files': statistics.totalFiles,
        'journal.stats.output.total_entries': statistics.totalEntries,
        'journal.stats.output.date_range': JSON.stringify(statistics.dateRange),
        'journal.stats.output.commits_analyzed': statistics.totalCommits,
        'journal.stats.output.execution_time_ms': statistics.executionTimeMs,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      span.addEvent('Analysis completed successfully', {
        'journal.stats.summary': JSON.stringify({
          files: statistics.totalFiles,
          entries: statistics.totalEntries,
          timeMs: statistics.executionTimeMs,
        }),
      });

      return statistics;

    } catch (error) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Recursively finds markdown files in a directory
 */
async function findMarkdownFiles(dir) {
  const files = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recursively search subdirectories
        const subFiles = await findMarkdownFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory might not exist, return empty array
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  return files;
}

/**
 * Discovers journal files in the journal directory
 */
async function discoverJournalFiles(maxFiles) {
  return tracer.startActiveSpan('journal.stats.discover_files', async (span) => {
    try {
      const startTime = Date.now();

      // Capture discovery parameters
      span.setAttributes({
        'journal.discovery.max_files': maxFiles,
        'journal.discovery.pattern': 'journal/entries/**/*.md',
        'journal.discovery.start_time': new Date().toISOString(),
      });

      // Find all journal markdown files using recursive directory traversal
      const journalDir = join(process.cwd(), 'journal', 'entries');
      const allFiles = await findMarkdownFiles(journalDir);

      // Sort by name (which includes date) and limit
      const files = allFiles
        .sort()
        .reverse() // Most recent first
        .slice(0, maxFiles);

      // Get file stats for each
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const stats = await fs.stat(file);
          return {
            path: file,
            size: stats.size,
            modified: stats.mtime.toISOString(),
          };
        })
      );

      const discoveryTime = Date.now() - startTime;

      // Capture discovery results
      span.setAttributes({
        'journal.discovery.files_found': allFiles.length,
        'journal.discovery.files_selected': files.length,
        'journal.discovery.total_size_bytes': fileStats.reduce((sum, f) => sum + f.size, 0),
        'journal.discovery.file_paths': JSON.stringify(files.map(f => f.replace(process.cwd(), '.'))),
        'journal.discovery.execution_time_ms': discoveryTime,
      });

      span.addEvent('Files discovered', {
        'journal.discovery.count': files.length,
        'journal.discovery.search_method': 'recursive_directory_traversal',
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return fileStats;

    } catch (error) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: `File discovery failed: ${error.message}`,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Processes journal files to extract entry data
 */
async function processJournalFiles(files, includeContent) {
  return tracer.startActiveSpan('journal.stats.process_files', async (span) => {
    try {
      span.setAttributes({
        'journal.processing.file_count': files.length,
        'journal.processing.include_content': includeContent,
        'journal.processing.start_time': new Date().toISOString(),
      });

      const processedData = [];

      for (const file of files) {
        const fileData = await processFileWithSpan(file, includeContent);
        processedData.push(fileData);
      }

      // Aggregate processing results
      const totalEntries = processedData.reduce((sum, fd) => sum + fd.entries.length, 0);
      const totalCommits = processedData.reduce((sum, fd) => sum + fd.commitCount, 0);

      span.setAttributes({
        'journal.processing.total_entries': totalEntries,
        'journal.processing.total_commits': totalCommits,
        'journal.processing.files_processed': processedData.length,
      });

      span.addEvent('Processing completed', {
        'journal.processing.entries': totalEntries,
        'journal.processing.commits': totalCommits,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return processedData;

    } catch (error) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: `File processing failed: ${error.message}`,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Process a single file with its own span
 */
async function processFileWithSpan(file, includeContent) {
  const fileName = file.path.split('/').pop();

  return tracer.startActiveSpan(`journal.stats.read_file`, async (span) => {
    try {
      span.setAttributes({
        'journal.file.path': file.path.replace(process.cwd(), '.'),
        'journal.file.size_bytes': file.size,
        'journal.file.modified': file.modified,
        'journal.file.name': fileName,
      });

      // Read file content
      const content = await fs.readFile(file.path, 'utf8');

      // Parse entries (look for headers with commit hashes)
      const entryMatches = content.matchAll(/## .+ - Commit: ([a-f0-9]{8})/g);
      const entries = Array.from(entryMatches).map(match => ({
        commitHash: match[1],
        header: match[0],
      }));

      // Extract date from filename (YYYY-MM-DD.md)
      const dateMatch = fileName.match(/(\d{4}-\d{2}-\d{2})\.md/);
      const fileDate = dateMatch ? dateMatch[1] : 'unknown';

      // Count sections
      const summaryCount = (content.match(/### Summary -/g) || []).length;
      const dialogueCount = (content.match(/### Development Dialogue -/g) || []).length;
      const technicalCount = (content.match(/### Technical Decisions -/g) || []).length;
      const detailsCount = (content.match(/### Commit Details -/g) || []).length;

      const result = {
        path: file.path,
        date: fileDate,
        entries: entries,
        commitCount: entries.length,
        sections: {
          summary: summaryCount,
          dialogue: dialogueCount,
          technical: technicalCount,
          details: detailsCount,
        },
        contentLength: content.length,
      };

      // Include content sample if requested
      if (includeContent && content.length > 0) {
        result.contentSample = content.substring(0, 500);
        span.setAttribute('journal.file.content_sample', result.contentSample);
      }

      // Capture processing results
      span.setAttributes({
        'journal.file.date': fileDate,
        'journal.file.entry_count': entries.length,
        'journal.file.commit_hashes': JSON.stringify(entries.map(e => e.commitHash)),
        'journal.file.content_length': content.length,
        'journal.file.sections': JSON.stringify(result.sections),
      });

      span.addEvent('File processed', {
        'journal.file.entries': entries.length,
        'journal.file.date': fileDate,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;

    } catch (error) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: `Failed to process ${fileName}: ${error.message}`,
      });
      // Return partial data on error
      return {
        path: file.path,
        date: 'error',
        entries: [],
        commitCount: 0,
        error: error.message,
      };
    } finally {
      span.end();
    }
  });
}

/**
 * Generates statistics from processed data
 */
async function generateStatistics(processedData) {
  return tracer.startActiveSpan('journal.stats.generate_summary', async (span) => {
    try {
      const startTime = Date.now();

      span.setAttributes({
        'journal.summary.input_files': processedData.length,
        'journal.summary.start_time': new Date().toISOString(),
      });

      // Extract all dates
      const dates = processedData
        .map(d => d.date)
        .filter(d => d !== 'unknown' && d !== 'error')
        .sort();

      // Count totals
      const totalFiles = processedData.length;
      const totalEntries = processedData.reduce((sum, d) => sum + d.entries.length, 0);
      const totalCommits = processedData.reduce((sum, d) => sum + d.commitCount, 0);
      const totalContentLength = processedData.reduce((sum, d) => sum + (d.contentLength || 0), 0);

      // Section totals
      const sectionTotals = processedData.reduce((acc, d) => {
        if (d.sections) {
          acc.summary += d.sections.summary || 0;
          acc.dialogue += d.sections.dialogue || 0;
          acc.technical += d.sections.technical || 0;
          acc.details += d.sections.details || 0;
        }
        return acc;
      }, { summary: 0, dialogue: 0, technical: 0, details: 0 });

      // Get all unique commits
      const allCommits = processedData.flatMap(d =>
        d.entries.map(e => e.commitHash)
      );
      const uniqueCommits = [...new Set(allCommits)];

      // Files with errors
      const errorFiles = processedData.filter(d => d.error).map(d => ({
        path: d.path.replace(process.cwd(), '.'),
        error: d.error,
      }));

      const executionTimeMs = Date.now() - startTime;

      const statistics = {
        totalFiles,
        totalEntries,
        totalCommits,
        uniqueCommits: uniqueCommits.length,
        totalContentLength,
        dateRange: {
          start: dates[0] || null,
          end: dates[dates.length - 1] || null,
        },
        sectionTotals,
        averageEntriesPerFile: totalFiles > 0 ? (totalEntries / totalFiles).toFixed(2) : 0,
        averageContentLength: totalFiles > 0 ? Math.round(totalContentLength / totalFiles) : 0,
        errorCount: errorFiles.length,
        errors: errorFiles,
        executionTimeMs,
        processedAt: new Date().toISOString(),
      };

      // Capture summary results
      span.setAttributes({
        'journal.summary.total_files': totalFiles,
        'journal.summary.total_entries': totalEntries,
        'journal.summary.unique_commits': uniqueCommits.length,
        'journal.summary.date_range_start': statistics.dateRange.start || 'none',
        'journal.summary.date_range_end': statistics.dateRange.end || 'none',
        'journal.summary.section_totals': JSON.stringify(sectionTotals),
        'journal.summary.error_count': errorFiles.length,
        'journal.summary.execution_time_ms': executionTimeMs,
      });

      // Add rich event with full summary
      span.addEvent('Statistics generated', {
        'journal.summary.result': JSON.stringify({
          files: totalFiles,
          entries: totalEntries,
          commits: uniqueCommits.length,
          dateRange: `${statistics.dateRange.start} to ${statistics.dateRange.end}`,
        }),
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return statistics;

    } catch (error) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: `Statistics generation failed: ${error.message}`,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Test function to intentionally create an error trace
 */
export async function testErrorCondition() {
  return tracer.startActiveSpan('journal.stats.test_error', async (span) => {
    try {
      span.setAttributes({
        'test.type': 'intentional_error',
        'test.purpose': 'Validate error trace capture',
      });

      // Intentionally throw an error
      throw new Error('This is an intentional test error for trace validation');

    } catch (error) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });

      // Add error details as event
      span.addEvent('Test error triggered', {
        'error.type': error.constructor.name,
        'error.message': error.message,
        'error.stack_preview': error.stack?.substring(0, 200),
      });

      return {
        success: false,
        error: error.message,
        purpose: 'Error trace validation',
      };
    } finally {
      span.end();
    }
  });
}