#!/usr/bin/env node

/**
 * Journal Statistics Test Script
 *
 * Generates fresh traces with the current attribute schema for M4 validation.
 * Tests comprehensive I/O data capture patterns for AI system intelligence.
 */

// Initialize tracing FIRST before any other imports
import '../src/tracing-simple.js';

import { trace, SpanStatusCode } from '@opentelemetry/api';
import { getJournalStatistics, testErrorCondition } from '../src/utils/journal-stats.js';

// Get a tracer for this test module
const tracer = trace.getTracer('journal-stats-test', '1.0.0');

async function runJournalStatsTests() {
  console.log('\n🧪 Running journal statistics tests with comprehensive tracing...\n');

  // Test 1: Basic analysis with default options
  await testBasicAnalysis();

  // Test 2: Analysis with content samples
  await testWithContentSamples();

  // Test 3: Analysis with limited file count
  await testLimitedFileCount();

  // Test 4: Performance measurement test
  await testPerformanceMeasurement();

  // Test 5: Error condition test
  await testErrorHandling();

  console.log('\n✅ All journal statistics tests completed!');
  console.log('🔍 Check console output above for OpenTelemetry traces');
  console.log('🌐 Check your Datadog dashboard for rich trace data');
  console.log('\n⏰ Waiting 5 seconds for trace export completion...');

  // Wait for traces to be exported
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('✅ Trace export completed!');
  process.exit(0);
}

async function testBasicAnalysis() {
  return tracer.startActiveSpan('test.journal_stats.basic_analysis', async (span) => {
    try {
      console.log('📊 Test 1: Basic journal analysis...');

      span.setAttributes({
        'test.type': 'basic_analysis',
        'test.description': 'Default journal statistics analysis',
        'test.start_time': new Date().toISOString(),
      });

      const startTime = Date.now();
      const stats = await getJournalStatistics();
      const duration = Date.now() - startTime;

      console.log(`   Found ${stats.totalFiles} files with ${stats.totalEntries} entries`);
      console.log(`   Date range: ${stats.dateRange.start} to ${stats.dateRange.end}`);
      console.log(`   Analysis completed in ${duration}ms`);

      // Capture test results
      span.setAttributes({
        'test.result.files': stats.totalFiles,
        'test.result.entries': stats.totalEntries,
        'test.result.duration_ms': duration,
        'test.result.date_range': JSON.stringify(stats.dateRange),
        'test.result.success': true,
      });

      span.addEvent('Basic analysis completed', {
        'test.summary': JSON.stringify({
          files: stats.totalFiles,
          entries: stats.totalEntries,
          timeMs: duration,
        }),
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return stats;

    } catch (error) {
      console.error(`   ❌ Error in basic analysis: ${error.message}`);
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

async function testWithContentSamples() {
  return tracer.startActiveSpan('test.journal_stats.with_content', async (span) => {
    try {
      console.log('📄 Test 2: Analysis with content samples...');

      span.setAttributes({
        'test.type': 'with_content_samples',
        'test.description': 'Journal analysis including content samples',
        'test.options': JSON.stringify({ includeContent: true }),
      });

      const startTime = Date.now();
      const stats = await getJournalStatistics({ includeContent: true });
      const duration = Date.now() - startTime;

      console.log(`   Analyzed ${stats.totalFiles} files with content sampling`);
      console.log(`   Total content length: ${stats.totalContentLength.toLocaleString()} chars`);
      console.log(`   Average content per file: ${stats.averageContentLength} chars`);
      console.log(`   Analysis with content completed in ${duration}ms`);

      span.setAttributes({
        'test.result.total_content_length': stats.totalContentLength,
        'test.result.average_content_length': stats.averageContentLength,
        'test.result.duration_ms': duration,
        'test.result.content_sampling_enabled': true,
      });

      span.addEvent('Content sampling analysis completed');
      span.setStatus({ code: SpanStatusCode.OK });
      return stats;

    } catch (error) {
      console.error(`   ❌ Error in content analysis: ${error.message}`);
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

async function testLimitedFileCount() {
  return tracer.startActiveSpan('test.journal_stats.limited_files', async (span) => {
    try {
      console.log('🔢 Test 3: Analysis with limited file count...');

      const maxFiles = 3;
      span.setAttributes({
        'test.type': 'limited_files',
        'test.description': 'Journal analysis with file count limit',
        'test.max_files': maxFiles,
        'test.options': JSON.stringify({ maxFiles }),
      });

      const startTime = Date.now();
      const stats = await getJournalStatistics({ maxFiles });
      const duration = Date.now() - startTime;

      console.log(`   Limited analysis to ${stats.totalFiles} files (max: ${maxFiles})`);
      console.log(`   Found ${stats.totalEntries} entries in recent files`);
      console.log(`   Limited analysis completed in ${duration}ms`);

      span.setAttributes({
        'test.result.files_processed': stats.totalFiles,
        'test.result.max_files_setting': maxFiles,
        'test.result.duration_ms': duration,
        'test.result.entries_in_subset': stats.totalEntries,
      });

      span.addEvent('Limited file analysis completed');
      span.setStatus({ code: SpanStatusCode.OK });
      return stats;

    } catch (error) {
      console.error(`   ❌ Error in limited analysis: ${error.message}`);
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

async function testPerformanceMeasurement() {
  return tracer.startActiveSpan('test.journal_stats.performance', async (span) => {
    try {
      console.log('⚡ Test 4: Performance measurement test...');

      span.setAttributes({
        'test.type': 'performance_measurement',
        'test.description': 'Measure instrumentation overhead',
        'test.iterations': 1,
      });

      // Measure memory before
      const memBefore = process.memoryUsage();

      const startTime = Date.now();
      const stats = await getJournalStatistics({ maxFiles: 5, includeContent: false });
      const duration = Date.now() - startTime;

      // Measure memory after
      const memAfter = process.memoryUsage();
      const memDelta = {
        rss: memAfter.rss - memBefore.rss,
        heapUsed: memAfter.heapUsed - memBefore.heapUsed,
        heapTotal: memAfter.heapTotal - memBefore.heapTotal,
      };

      console.log(`   Performance test: ${duration}ms for ${stats.totalFiles} files`);
      console.log(`   Memory delta - RSS: ${memDelta.rss}, Heap: ${memDelta.heapUsed}`);
      console.log(`   Processing rate: ${(stats.totalEntries / (duration / 1000)).toFixed(1)} entries/sec`);

      span.setAttributes({
        'test.result.duration_ms': duration,
        'test.result.memory_rss_delta': memDelta.rss,
        'test.result.memory_heap_delta': memDelta.heapUsed,
        'test.result.entries_per_second': parseFloat((stats.totalEntries / (duration / 1000)).toFixed(1)),
        'test.result.files_processed': stats.totalFiles,
      });

      span.addEvent('Performance measurement completed', {
        'performance.duration_ms': duration,
        'performance.memory_delta': JSON.stringify(memDelta),
        'performance.throughput': `${(stats.totalEntries / (duration / 1000)).toFixed(1)} entries/sec`,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return { stats, performance: { duration, memDelta } };

    } catch (error) {
      console.error(`   ❌ Error in performance test: ${error.message}`);
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

async function testErrorHandling() {
  return tracer.startActiveSpan('test.journal_stats.error_handling', async (span) => {
    try {
      console.log('🚨 Test 5: Error handling test...');

      span.setAttributes({
        'test.type': 'error_handling',
        'test.description': 'Test error condition tracing',
        'test.intentional_error': true,
      });

      const result = await testErrorCondition();

      console.log(`   Error test completed: ${result.purpose}`);
      console.log(`   Error captured: ${result.error}`);

      span.setAttributes({
        'test.result.error_captured': true,
        'test.result.error_message': result.error,
        'test.result.test_purpose': result.purpose,
      });

      span.addEvent('Error handling test completed', {
        'test.error_message': result.error,
        'test.success': true,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;

    } catch (error) {
      console.error(`   ❌ Unexpected error in error test: ${error.message}`);
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the tests
runJournalStatsTests().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});