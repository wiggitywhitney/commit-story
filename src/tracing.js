import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader, ConsoleMetricExporter, AggregationTemporality } from '@opentelemetry/sdk-metrics';
import resourcePkg from '@opentelemetry/resources';
const { resourceFromAttributes, defaultResource } = resourcePkg;
import pkg from '@opentelemetry/semantic-conventions';
const { SEMATTRS_SERVICE_NAME, SEMATTRS_SERVICE_VERSION } = pkg;

// Create console exporter for immediate development feedback
const consoleExporter = new ConsoleSpanExporter();

// Create OTLP exporter for Datadog Agent (localhost:4318)
const otlpExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
  headers: {
    // Add any required headers for Datadog OTLP ingestion
  },
});

// Create console metric exporter for development feedback
const consoleMetricExporter = new ConsoleMetricExporter();

// Create OTLP metric exporter for Datadog Agent (localhost:4318)
const otlpMetricExporter = new OTLPMetricExporter({
  url: 'http://localhost:4318/v1/metrics',
  temporalityPreference: AggregationTemporality.DELTA, // Required for Datadog OTLP ingest
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

const resource = defaultResource().merge(resourceFromAttributes(resourceAttributes));

// Initialize Node SDK with dual span processors and metrics
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
  // Configure dual metric readers
  metricReader: new PeriodicExportingMetricReader({
    exporter: otlpMetricExporter,
    exportIntervalMillis: 60000, // Export every 60 seconds (OpenTelemetry best practice)
  }),
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

console.log('🔭 OpenTelemetry observability stack initialized:');
console.log('  ✅ Traces: Console + OTLP to Datadog Agent (localhost:4318)');
console.log('  ✅ Metrics: OTLP to Datadog Agent (localhost:4318)');
console.log('  📊 Service: commit-story-dev');

export default sdk;