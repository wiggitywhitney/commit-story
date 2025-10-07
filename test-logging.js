import { initializeTelemetry } from './src/tracing.js';
import { createNarrativeLogger } from './src/utils/trace-logger.js';
import { getLogger } from './src/logging.js';
import { trace } from '@opentelemetry/api';

// Initialize telemetry
console.log('1. Starting telemetry initialization...');
await initializeTelemetry();
console.log('2. Telemetry initialized');

// Check logger status
console.log('3. Logger after init:', getLogger());

// Wait a moment for everything to be ready
await new Promise(resolve => setTimeout(resolve, 100));
console.log('4. Creating test span...');

// Create a test span and log
const tracer = trace.getTracer('test', '1.0.0');
await tracer.startActiveSpan('test.span', async (span) => {
  console.log('5. Inside active span, spanContext:', span.spanContext());
  const logger = createNarrativeLogger('test.operation');
  
  console.log('6. Calling logger.info...');
  logger.info('Test log message', { test: 'data' });
  
  console.log('7. Ending span...');
  span.end();
});

console.log('8. Waiting for export...');
await new Promise(resolve => setTimeout(resolve, 2000));

console.log('9. Done - check Datadog for logs');
process.exit(0);
