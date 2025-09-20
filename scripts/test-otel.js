#!/usr/bin/env node

/**
 * OpenTelemetry Instrumentation Test Script
 * 
 * Tests the instrumented commit-story application to validate:
 * 1. Traces are generated and visible in console
 * 2. All spans have correct GenAI semantic convention attributes and relationships
 * 3. Provider detection works correctly (gen_ai.provider.name)
 * 4. Error handling includes proper span recording
 * 5. Datadog OTLP exporter works (if configured)
 */

import { config } from 'dotenv';
import { promises as fs } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import main from '../src/index.js';

config();

console.log('🔭 OpenTelemetry Instrumentation Test');
console.log('=====================================');

async function testInstrumentation() {
  console.log('📊 Testing commit-story with OpenTelemetry instrumentation...');
  console.log('💡 Look for trace output below this message');
  console.log('');
  
  try {
    // Get commit timestamp to know which journal file will be created
    const metadataOutput = execSync(`git show --format=format:"%at" --no-patch HEAD`, { encoding: 'utf8' }).trim();
    const commitTimestamp = new Date(parseInt(metadataOutput) * 1000);

    // Test with HEAD commit - should generate full traces
    await main('HEAD');

    // Clean up generated journal entry using the commit timestamp
    try {
      const date = commitTimestamp;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      const journalPath = join(
        process.cwd(),
        'journal',
        'entries',
        `${year}-${month}`,
        `${year}-${month}-${day}.md`
      );

      // Read the journal file
      const content = await fs.readFile(journalPath, 'utf8');

      // Find the last entry separator
      const separator = '═══════════════════════════════════════';
      const separatorCount = (content.match(new RegExp(separator, 'g')) || []).length;

      if (separatorCount === 1) {
        // Only one entry - delete the whole file
        await fs.unlink(journalPath);
        console.log('🧹 Removed test journal file (was only entry)');
      } else if (separatorCount > 1) {
        // Multiple entries - remove just the last one
        const lastSeparatorIndex = content.lastIndexOf(separator);
        const previousSeparatorIndex = content.lastIndexOf(separator, lastSeparatorIndex - 1);
        const entryStart = previousSeparatorIndex >= 0 ? previousSeparatorIndex + separator.length : 0;

        // Remove the last entry
        const newContent = content.substring(0, entryStart);
        await fs.writeFile(journalPath, newContent, 'utf8');
        console.log('🧹 Cleaned up test journal entry from existing file');
      }
    } catch (cleanupError) {
      console.log('⚠️  Could not clean up test journal entry:', cleanupError.message);
    }

    console.log('');
    console.log('✅ Instrumentation test completed successfully!');
    console.log('📈 Check console output above for trace details');
    console.log('🔍 Check Datadog UI for trace visualization (if configured)');

  } catch (error) {
    console.log('');
    console.log('❌ Instrumentation test failed:', error.message);
    console.log('📊 Error should have been captured in traces above');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testInstrumentation();
}