# PRD-14: OpenTelemetry Log/Trace Correlation

**Status**: Planning
**Created**: 2025-09-20
**GitHub Issue**: [#14](https://github.com/wiggitywhitney/commit-story/issues/14)

## Problem Statement

Traces work perfectly in Datadog, but narrative logs only go to console. We need logs in Datadog with trace correlation to enable clicking between traces and logs in the UI.

### Current State (Verified 2025-09-20)
- **✅ Traces**: Sending to Datadog via OTLP port 4318
- **❌ Logs**: Only console output, not in Datadog
- **❌ Correlation**: Impossible without logs in Datadog

## Success Criteria

**Success = Can see correlated trace/log data in Datadog UI**
- Click trace span → see related logs
- Click log entry → see related trace
- Logs have trace_id and span_id

## Research Findings

### OpenTelemetry Logs SDK Status
**Finding**: Logs SDK for Node.js is experimental/incomplete
**Source**: OpenTelemetry docs state "The logging library for OpenTelemetry for Node.js is still under development" [1]
**Impact**: Must use experimental packages, API may change

### Required NPM Packages
Based on package registry and OTel docs research:
- `@opentelemetry/sdk-logs` - LoggerProvider (experimental)
- `@opentelemetry/exporter-logs-otlp-http` - OTLP log exporter

### Datadog Correlation Requirements
**Source**: Datadog documentation [2][3]
- Logs must include `trace_id` and `span_id` (32-char and 16-char hex)
- Can use `dd.trace_id`/`dd.span_id` for automatic correlation
- Need log pipeline with trace/span ID remappers

### Current Code Analysis
**File**: `src/utils/trace-logger.js`
- Already extracts traceId/spanId from active span
- Outputs to console.log as JSON
- Just needs to emit via OTel Logs API instead

**File**: `src/tracing.js`
- Has OTLP trace exporter to localhost:4318
- Need parallel logs setup

## Implementation Plan

### Phase 1: Install & Setup Logs SDK
```bash
npm install @opentelemetry/sdk-logs @opentelemetry/exporter-logs-otlp-http
```

Create `src/logging.js`:
```javascript
import { LoggerProvider } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';

const logExporter = new OTLPLogExporter({
  url: 'http://localhost:4318/v1/logs', // Same OTLP endpoint
});

const loggerProvider = new LoggerProvider();
loggerProvider.addLogRecordProcessor(
  new BatchLogRecordProcessor(logExporter)
);

export const logger = loggerProvider.getLogger('commit-story-narrative');
```

### Phase 2: Update Narrative Logger
Modify `src/utils/trace-logger.js` to emit logs:
```javascript
import { logger } from '../logging.js';

function narrativeLog(level, operation, message, context = {}) {
  const span = trace.getActiveSpan();
  const spanContext = span?.spanContext();

  // Emit to OTel (goes to Datadog)
  logger.emit({
    severityText: level.toUpperCase(),
    body: message,
    attributes: {
      'operation': operation,
      'trace_id': spanContext?.traceId,
      'span_id': spanContext?.spanId,
      'dd.trace_id': spanContext?.traceId,  // Datadog format
      'dd.span_id': spanContext?.spanId,
      ...context
    }
  });

  // Keep console output for debugging
  console.log(JSON.stringify({...}));
}
```

### Phase 3: Configure Datadog

1. **Verify Agent accepts OTLP logs** (should work on port 4318)

2. **Create log pipeline in Datadog UI**:
   - Add Trace ID remapper: `trace_id` → `dd.trace_id`
   - Add Span ID remapper: `span_id` → `dd.span_id`
   - Add service remapper: `service.name` → `service`

## Key Technical Decisions

**Use experimental SDK**: No stable alternative exists for Node.js
**Dual output**: Keep console.log for backward compatibility
**Include both formats**: `trace_id` (OTel) and `dd.trace_id` (Datadog)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| SDK API changes | Breaking changes | Pin versions, document upgrade path |
| Performance impact | Latency/overhead | Use batching, async processing |
| Datadog Agent compatibility | Logs don't appear | Test with current Agent version |

## Work Log

### 2025-09-20: Research & PRD Creation
- Verified traces working in Datadog (18 spans visible)
- Confirmed logs only going to console
- Researched OTel Logs SDK status (experimental)
- Found Datadog correlation requirements
- Created GitHub Issue #14

## References

[1] OpenTelemetry JS Instrumentation Docs - "Logs" section empty, notes "still under development"
[2] Datadog: "Correlate OpenTelemetry Traces and Logs" - requires trace_id/span_id in specific format
[3] Datadog: "OpenTelemetry in Node.js" - focuses on traces only, no log guidance

## Next Steps

1. Install packages and test basic log emission
2. Update trace-logger.js to use Logs SDK
3. Configure Datadog pipeline
4. Validate correlation in UI