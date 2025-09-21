# PRD-14: OpenTelemetry Log/Trace Correlation

**Status**: ✅ Completed
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

### 2025-09-20: Implementation, Debugging & Completion
**Phase 1: Package Installation ✅**
- Installed `@opentelemetry/sdk-logs` and `@opentelemetry/exporter-logs-otlp-http`
- Both packages installed successfully (experimental status confirmed)

**Phase 2: Logging Setup ✅**
- Created `src/logging.js` with LoggerProvider and OTLP exporter targeting localhost:4318
- Configured BatchLogRecordProcessor for efficient log export
- Used same resource attributes as tracing setup for consistency

**Phase 3: Narrative Logger Integration ✅**
- Updated `src/utils/trace-logger.js` to emit via OTel Logs SDK
- Added dual output: OTel logs (to Datadog) + console logs (backward compatibility)
- Included proper trace correlation: `trace_id`, `span_id`, `dd.trace_id`, `dd.span_id`
- Used appropriate severity levels and structured attributes

**Phase 4: Debugging & Resolution ✅**
- **Import Issues**: Fixed ES6/CommonJS compatibility errors in `@opentelemetry/semantic-conventions` and `@opentelemetry/resources`
- **Critical Timestamp Bug**: Discovered double multiplication causing overflow (`ReadUint64: strconv.ParseUint: parsing "1758418254947000064000000": value out of range`)
- **Fix Applied**: Changed from `Date.now() * 1_000_000` to `Date.now()` in trace-logger.js (SDK handles nanosecond conversion)
- **Validation Results**: ✅ 41+ logs now appearing in Datadog with full trace correlation
- **Trace Correlation**: ✅ 40+ logs successfully linked to specific trace IDs

**Phase 5: Final Validation ✅**
- **Traces**: ✅ Working perfectly in Datadog
- **Logs**: ✅ Now appearing in Datadog with proper correlation
- **UI Navigation**: ✅ Can click between traces and logs in Datadog UI
- **Console Logs**: ✅ Backward compatibility maintained

## Current Status: ✅ COMPLETED

**What's Working:**
- ✅ Complete OpenTelemetry logs infrastructure implemented
- ✅ Trace correlation IDs properly included and working in Datadog UI
- ✅ Backward compatibility maintained (console output works)
- ✅ No performance impact observed
- ✅ Full trace-log correlation in Datadog UI
- ✅ 41+ log entries visible in Datadog
- ✅ 40+ logs correlated with specific trace IDs

**Implementation Success:**
- ✅ Logs reaching Datadog via OTLP endpoint (localhost:4318)
- ✅ Can navigate between traces and logs in Datadog UI
- ✅ Proper timestamp handling (milliseconds → SDK converts to nanoseconds)

## References

[1] OpenTelemetry JS Instrumentation Docs - "Logs" section empty, notes "still under development"
[2] Datadog: "Correlate OpenTelemetry Traces and Logs" - requires trace_id/span_id in specific format
[3] Datadog: "OpenTelemetry in Node.js" - focuses on traces only, no log guidance

## Alternative Approaches for Future Investigation

Since the experimental OpenTelemetry Logs SDK isn't compatible with Datadog's OTLP endpoint, consider these alternatives:

### Option 1: Direct Datadog Logs API
- Use Datadog's HTTP Logs API instead of OTLP
- Manually include trace correlation fields (`dd.trace_id`, `dd.span_id`)
- Higher compatibility but vendor lock-in

### Option 2: Wait for Stable OTel Logs SDK
- Monitor OpenTelemetry Logs SDK maturity
- Wait for Datadog to fully support OTLP logs protocol
- Maintain current console logging until then

### Option 3: File-Based Log Collection
- Write structured logs to files
- Use Datadog Agent's log file collection
- Configure log parsing pipeline in Datadog UI

## Conclusion

✅ **SUCCESS**: The OpenTelemetry logs infrastructure is fully implemented and working. The critical issue was a timestamp conversion bug causing overflow errors during log export. After fixing the double multiplication issue (SDK already handles nanosecond conversion), logs now appear in Datadog with full trace correlation.

**Key Learning**: The experimental SDK works perfectly with Datadog's OTLP endpoint - the issue was in our timestamp handling implementation, not SDK compatibility.

**Result**: 41+ logs visible in Datadog, 40+ correlated with trace IDs, full UI navigation between traces and logs enabled.