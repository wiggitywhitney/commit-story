#!/usr/bin/env node

/**
 * Test script for MCP reflection tool telemetry validation
 *
 * CRITICAL: Initialize tracing FIRST to ensure telemetry flows to Datadog
 * This test directly calls the reflection tool to validate telemetry
 */

// Initialize tracing BEFORE any other imports
import './src/tracing.js';

import { createReflectionTool } from './src/mcp/tools/reflection-tool.js';
import { trace } from '@opentelemetry/api';
import { promises as fs } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

const tracer = trace.getTracer('commit-story', '1.0.0');

async function testReflectionTool() {
  console.log('🧪 Testing MCP reflection tool with FULL telemetry validation...\n');

  try {
    console.log('📝 Testing reflection tool directly...');

    // Test 1: Basic reflection creation
    const result1 = await createReflectionTool({
      text: 'Testing the MCP reflection tool implementation. This validates both functionality and telemetry patterns for developer experience instrumentation.'
    });

    console.log('✅ Test 1 completed - Basic reflection');
    console.log('📄 Result:', result1.content[0].text.split('\n')[0]);

    // Test 2: Custom timestamp
    const customTime = new Date();
    customTime.setMinutes(customTime.getMinutes() - 30);

    const result2 = await createReflectionTool({
      text: 'Testing custom timestamp functionality. This reflection should appear 30 minutes in the past.',
      timestamp: customTime.toISOString()
    });

    console.log('✅ Test 2 completed - Custom timestamp');
    console.log('📄 Result:', result2.content[0].text.split('\n')[0]);

    // Test 3: Error handling
    try {
      const result3 = await createReflectionTool({
        text: ''  // Empty text should trigger validation error
      });
      console.log('❌ Test 3 failed - Should have thrown error');
    } catch (error) {
      console.log('✅ Test 3 completed - Error handling worked');
    }

    // Give time for telemetry to be sent to Datadog
    console.log('\n⏳ Waiting 10 seconds for telemetry to flush to Datadog...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('\n🔍 Telemetry Validation Queries:');
    console.log('Run these queries in Datadog to validate ALL telemetry types:');
    console.log('');
    console.log('📊 SPANS (traces):');
    console.log('1. Reflection tool spans:');
    console.log('   mcp__datadog__search_datadog_spans query:"service:commit-story-dev @resource_name:mcp.tool.journal_add_reflection"');
    console.log('');
    console.log('2. Journal path utility spans:');
    console.log('   mcp__datadog__search_datadog_spans query:"service:commit-story-dev @resource_name:utils.journal_paths.*"');
    console.log('');
    console.log('3. All recent spans:');
    console.log('   mcp__datadog__search_datadog_spans query:"service:commit-story-dev" from:"now-15m"');
    console.log('');
    console.log('📈 METRICS:');
    console.log('4. Reflection metrics:');
    console.log('   mcp__datadog__search_datadog_metrics name_filter:"commit_story.reflections"');
    console.log('');
    console.log('5. Journal path metrics:');
    console.log('   mcp__datadog__search_datadog_metrics name_filter:"commit_story.utils"');
    console.log('');
    console.log('📝 LOGS (narrative logging):');
    console.log('6. Reflection creation logs:');
    console.log('   mcp__datadog__search_datadog_logs query:"service:commit-story-dev @logger.name:reflection.creation"');
    console.log('');
    console.log('7. Journal path generation logs:');
    console.log('   mcp__datadog__search_datadog_logs query:"service:commit-story-dev @logger.name:journal.*"');

    // Check created files
    console.log('\n📁 Verifying reflection files were created...');
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const expectedPath = `journal/reflections/${year}-${month}/${year}-${month}-${day}.md`;

    try {
      const content = await fs.readFile(expectedPath, 'utf8');
      const entryCount = (content.match(/## \d{2}:\d{2}:\d{2}.*Manual Reflection/g) || []).length;
      console.log(`✅ Reflection file exists: ${expectedPath}`);
      console.log(`📊 Contains ${entryCount} reflection entries`);

      if (entryCount >= 2) {
        console.log('✅ Both test reflections were successfully written');
      }
    } catch (error) {
      console.log(`❌ Could not read reflection file: ${expectedPath}`, error.message);
    }

    console.log('\n✅ Test completed successfully!');
    console.log('🔍 Telemetry should now be visible in Datadog with the queries above.');
    console.log('💡 Look for spans, metrics, AND narrative logs from this test run.');

    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testReflectionTool();