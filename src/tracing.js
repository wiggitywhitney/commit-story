import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader, AggregationTemporality } from '@opentelemetry/sdk-metrics';
import fs from 'fs';

// Check if running from test script - only show console traces during testing
const isTestScript = process.argv[1]?.includes('test-otel');

// Config detection from config file
let isDebugMode = false;
let isDevMode = false;
try {
  const configPath = './commit-story.config.json';
  if (fs.existsSync(configPath)) {
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    isDebugMode = configData.debug === true;
    isDevMode = configData.dev === true;
  }
} catch (error) {
  // Silently ignore config file errors - both modes default to false
}

// Only initialize telemetry when dev mode is enabled
let sdk = null;

if (isDevMode) {
  // Create OTLP exporter for Datadog Agent (localhost:4318)
  const otlpTraceExporter = new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
    headers: {
      // Add any required headers for Datadog OTLP ingestion
    },
  });

  // Create OTLP metric exporter for Datadog Agent (localhost:4318)
  const otlpMetricExporter = new OTLPMetricExporter({
    url: 'http://localhost:4318/v1/metrics',
    temporalityPreference: AggregationTemporality.DELTA, // Required for Datadog OTLP ingest
    headers: {
      // Add any required headers for Datadog OTLP ingestion
    },
  });

  // Build span processors array - conditionally include console exporter
  const spanProcessors = [
    // OTLP exporter for Datadog with batching
    new BatchSpanProcessor(otlpTraceExporter, {
      maxExportBatchSize: 10, // Batch for efficiency
      scheduledDelayMillis: 1000, // 1 second delay for network calls
    }),
  ];

  // Only add console exporter when running test script
  if (isTestScript) {
    const consoleExporter = new ConsoleSpanExporter();
    spanProcessors.unshift(
      new BatchSpanProcessor(consoleExporter, {
        maxExportBatchSize: 1, // Export immediately for development
        scheduledDelayMillis: 100, // Minimal delay
      })
    );
  }

  // Initialize Node SDK with dual span processors and metrics
  sdk = new NodeSDK({
    serviceName: 'commit-story-dev',
    serviceVersion: '1.0.0',
    spanProcessors,
    // Configure dual metric readers
    metricReader: new PeriodicExportingMetricReader({
      exporter: otlpMetricExporter,
      exportIntervalMillis: 5000, // Export every 5 seconds for development (ensures short commits work)
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

  // Only show initialization messages in test script or debug mode
  if (isTestScript) {
    console.log('🔭 OpenTelemetry observability stack initialized:');
    console.log('  ✅ Traces: Console + OTLP to Datadog Agent (localhost:4318)');
    console.log('  ✅ Metrics: OTLP to Datadog Agent (localhost:4318)');
    console.log('  📊 Service: commit-story-dev');
  } else if (isDebugMode) {
    console.log('OpenTelemetry initialized');
  }
} else {
  // When dev mode is disabled, telemetry is completely disabled
  // No console output, no initialization, no noise
}

export default sdk;