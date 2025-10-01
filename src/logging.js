import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import resourcePkg from '@opentelemetry/resources';
const { resourceFromAttributes, defaultResource } = resourcePkg;
import pkg from '@opentelemetry/semantic-conventions';
const { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } = pkg;
import fs from 'fs';

// Check dev mode from config file
let isDevMode = false;
try {
  const configPath = './commit-story.config.json';
  if (fs.existsSync(configPath)) {
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    isDevMode = configData.dev === true;
  }
} catch (error) {
  // Silently ignore config file errors - dev mode defaults to false
}

// Only initialize logging when dev mode is enabled
let logger = null;
let batchProcessor = null;

if (isDevMode) {
  // Create OTLP log exporter for local Datadog Agent (same as traces)
  const logExporter = new OTLPLogExporter({
    url: 'http://localhost:4318/v1/logs',
  });

  // Add error handler to catch silent export failures
  const originalExport = logExporter.export.bind(logExporter);
  logExporter.export = function(logs, resultCallback) {
    return originalExport(logs, (result) => {
      if (result.code !== 0) {
        console.error('❌ OTLP Log Export: FAILED', result);
      }
      resultCallback(result);
    });
  };

  // Configure resource attributes to match tracing setup
  const resourceAttributes = {
    [SEMRESATTRS_SERVICE_NAME]: 'commit-story-dev',
    [SEMRESATTRS_SERVICE_VERSION]: '1.0.0',
    environment: 'development',
  };

  const resource = defaultResource().merge(resourceFromAttributes(resourceAttributes));

  // Create batch processor for synchronous log export (race condition test)
  batchProcessor = new BatchLogRecordProcessor(logExporter, {
    maxExportBatchSize: 1, // Export each log immediately
    scheduledDelayMillis: 0, // No delay - synchronous export
  });

  // Create LoggerProvider with processor and resource
  const loggerProvider = new LoggerProvider({
    resource: resource,
    processors: [batchProcessor],
  });

  // Export logger instance for narrative logging
  logger = loggerProvider.getLogger('commit-story-narrative', '1.0.0');
} else {
  // When dev mode is disabled, provide a noop logger
  logger = {
    emit: () => {} // No-op function
  };
}

export { logger };

// Add graceful shutdown handler to flush logs and metrics (only when dev mode enabled)
export async function gracefulShutdown() {
  if (!isDevMode) {
    // No telemetry to shutdown, resolve immediately
    return Promise.resolve();
  }

  console.log('🔄 Shutting down logger, flushing logs...');
  return new Promise((resolve) => {
    // Force flush any remaining logs
    batchProcessor.forceFlush().then(() => {
      console.log('✅ Logs flushed successfully');

      // Import and shutdown OpenTelemetry SDK to flush metrics
      import('./tracing.js').then(({ default: sdk }) => {
        if (sdk) {
          return sdk.shutdown();
        } else {
          return Promise.resolve();
        }
      }).then(() => {
        console.log('✅ OpenTelemetry SDK shutdown, metrics flushed');
        resolve();
      }).catch((err) => {
        console.error('❌ Error shutting down SDK:', err);
        resolve();
      });
    }).catch((err) => {
      console.error('❌ Error flushing logs:', err);
      resolve();
    });
  });
}

// Only register shutdown handlers when dev mode is enabled
if (isDevMode) {
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  process.on('beforeExit', gracefulShutdown);
}

