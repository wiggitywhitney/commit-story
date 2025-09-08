#!/usr/bin/env node

// Initialize tracing FIRST before any other imports
import '../src/tracing-simple.js';

import { trace, SpanStatusCode } from '@opentelemetry/api';

// Get a tracer for this module
const tracer = trace.getTracer('commit-story-test', '1.0.0');

async function generateTestTraces() {
  console.log('\n🧪 Generating test traces for dual exporter validation...\n');
  
  // Test 1: Simple span
  const simpleSpan = tracer.startSpan('test-simple-span');
  simpleSpan.setAttributes({
    'test.type': 'simple',
    'test.id': 'test-001',
    'user.action': 'validation'
  });
  simpleSpan.addEvent('Test span created');
  simpleSpan.setStatus({ code: SpanStatusCode.OK, message: 'Test completed successfully' });
  simpleSpan.end();
  
  // Test 2: Parent-child span relationship
  const parentSpan = tracer.startSpan('test-parent-span');
  parentSpan.setAttributes({
    'test.type': 'parent',
    'operation': 'dual-exporter-validation'
  });
  
  // Create child span in the parent context
  const childSpan = tracer.startSpan('test-child-span', { parent: parentSpan });
  childSpan.setAttributes({
    'test.type': 'child',
    'child.operation': 'nested-validation'
  });
  childSpan.addEvent('Child operation started');
  
  // Simulate some async work
  await new Promise(resolve => setTimeout(resolve, 100));
  
  childSpan.addEvent('Child operation completed');
  childSpan.setStatus({ code: SpanStatusCode.OK });
  childSpan.end();
  
  parentSpan.addEvent('Parent operation completed');
  parentSpan.setStatus({ code: SpanStatusCode.OK });
  parentSpan.end();
  
  // Test 3: Error span to test error handling
  const errorSpan = tracer.startSpan('test-error-span');
  errorSpan.setAttributes({
    'test.type': 'error',
    'error.simulated': true
  });
  errorSpan.addEvent('Simulating error condition');
  errorSpan.recordException(new Error('Test error for validation'));
  errorSpan.setStatus({ 
    code: SpanStatusCode.ERROR, 
    message: 'Simulated error for testing' 
  });
  errorSpan.end();
  
  console.log('✅ Test traces generated successfully!');
  console.log('📊 Generated spans:');
  console.log('   - Simple span with attributes');
  console.log('   - Parent-child span relationship'); 
  console.log('   - Error span with exception recording');
  console.log('\n🔍 Check output above for console exporter traces');
  console.log('🌐 Check your Datadog dashboard for OTLP exporter traces');
  console.log('\n⏰ Waiting 3 seconds for trace export completion...');
  
  // Wait for traces to be exported
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('✅ Trace export completed!');
  
  // Graceful shutdown
  process.exit(0);
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the test
generateTestTraces().catch(console.error);