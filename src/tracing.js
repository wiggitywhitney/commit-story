import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { defaultResource } from '@opentelemetry/resources';
import { SEMATTRS_SERVICE_NAME, SEMATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

// Create console exporter for immediate development feedback
const consoleExporter = new ConsoleSpanExporter();

// Create OTLP exporter for Datadog Agent (localhost:4318)
const otlpExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
  headers: {
    // Add any required headers for Datadog OTLP ingestion
  },
});

// Configure resource attributes for service identification - using default resource with merge
const resourceAttributes = {
  [SEMATTRS_SERVICE_NAME]: 'commit-story-dev',
  [SEMATTRS_SERVICE_VERSION]: '1.0.0',
  environment: 'development',
};

const resource = defaultResource.merge({
  attributes: resourceAttributes,
});

// Initialize Node SDK with dual span processors
const sdk = new NodeSDK({
  resource: resource,
  spanProcessors: [
    // Console exporter for immediate feedback
    new BatchSpanProcessor(consoleExporter, {
      maxExportBatchSize: 1, // Export immediately for development
      scheduledDelayMillis: 0, // No delay for console output
    }),
    // OTLP exporter for Datadog with batching
    new BatchSpanProcessor(otlpExporter, {
      maxExportBatchSize: 10, // Batch for efficiency
      scheduledDelayMillis: 1000, // 1 second delay for network calls
    }),
  ],
  instrumentations: [
    // Auto-instrument common libraries
    getNodeAutoInstrumentations({
      // Disable instrumentations we don't need yet
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