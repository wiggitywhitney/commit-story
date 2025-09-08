import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

// Create console exporter for immediate development feedback
const consoleExporter = new ConsoleSpanExporter();

// Create OTLP exporter for Datadog Agent (localhost:4318)
const otlpExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
});

// Initialize Node SDK with dual span processors
const sdk = new NodeSDK({
  serviceName: 'commit-story-dev',
  serviceVersion: '1.0.0',
  spanProcessors: [
    // Console exporter for immediate feedback
    new BatchSpanProcessor(consoleExporter, {
      maxExportBatchSize: 1, // Export immediately for development
      scheduledDelayMillis: 100, // Minimal delay
    }),
    // OTLP exporter for Datadog with batching
    new BatchSpanProcessor(otlpExporter, {
      maxExportBatchSize: 10, // Batch for efficiency
      scheduledDelayMillis: 1000, // 1 second delay for network calls
    }),
  ],
  instrumentations: [
    // Auto-instrument common libraries (minimal set)
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-dns': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
    }),
  ],
});

// Initialize tracing
sdk.start();

console.log('🔭 OpenTelemetry dual exporters initialized:');
console.log('  ✅ Console exporter - immediate terminal feedback');
console.log('  ✅ OTLP exporter - Datadog Agent (localhost:4318)');
console.log('  📊 Service: commit-story-dev');

export default sdk;