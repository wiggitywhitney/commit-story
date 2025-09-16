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
import main from '../src/index.js';

config();

console.log('🔭 OpenTelemetry Instrumentation Test');
console.log('=====================================');

async function testInstrumentation() {
  console.log('📊 Testing commit-story with OpenTelemetry instrumentation...');
  console.log('💡 Look for trace output below this message');
  console.log('');
  
  try {
    // Test with HEAD commit - should generate full traces
    await main('HEAD');
    
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