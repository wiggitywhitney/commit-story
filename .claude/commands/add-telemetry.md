---
name: add-telemetry
description: AI-powered OpenTelemetry instrumentation tool - automatically adds telemetry to uninstrumented code
category: development
---

# Add Telemetry - AI-Powered OTEL Instrumentation

## Step 0: Check Datadog Connection

Verify the Datadog MCP server is connected before proceeding:

```javascript
// Test MCP connection
mcp__datadog__search_datadog_services query:"*" max_tokens:100
```

If this fails, exit immediately with an error message. 

## Step 1: Target Discovery

### Auto-Detection (Default)
When no target specified, find recently changed code:

```bash
# Check recent changes for JS/TS files
git diff --name-only HEAD~5..HEAD | grep -E '\.(js|ts)$'
```

## Step 2: Operation Analysis

Identify all uninstrumented functions in the target file(s):
- Functions with no `tracer.startActiveSpan()` calls
- Functions with existing spans that may have gained new operations

**Philosophy**: This is experimental telemetry for AI development assistance - identify ALL uninstrumented functions for comprehensive visibility unless they are high-frequency operations that would create excessive spans. Prioritize development insight over production performance.

## Step 3: Convention Discovery

Check which conventions are already available:

### Check Existing Standards
Read `src/telemetry/standards.js` to inventory what exists:
- What builders are available in `OTEL.attrs`?
- What span patterns exist in `OTEL.span`?

### Identify Missing Conventions
Compare operations from Step 2 against existing standards:
- List which operations already have builders (ready to use)
- List which operations need new conventions (proceed to Step 4)

If all needed conventions exist, skip to Step 5.

## Step 4: Standards Module Extension (Only if Missing Conventions)

For each missing convention identified in Step 3:

### Determine Convention Source
1. **Check SEMATTRS imports** - Can we import from `@opentelemetry/semantic-conventions`?
   - If YES → Import and add to standards module
   - If NO → Continue to step 2

2. **Research OTEL docs** - Is this an official convention not in SEMATTRS?
   - Use WebFetch to query: `https://opentelemetry.io/docs/specs/semconv/file/` (for file operations)
   - Use WebFetch to query: `https://opentelemetry.io/docs/specs/semconv/http/` (for network operations)
   - Use WebFetch to query: `https://opentelemetry.io/docs/specs/semconv/general/` (for general operations)
   - If YES → Add with official string (e.g., `'file.operation'`)
   - If NO → Create custom `commit_story.*` attribute

### Add to Standards Module
**All conventions (official and custom) must be added as builders to maintain the "no hardcoded strings" principle:**

- Add builder functions to `OTEL.attrs` following existing patterns
- Prefer SEMATTRS imports when available (more maintainable)
- Use official OTEL convention strings for documented conventions
- Use `commit_story.*` namespace only for truly custom attributes

## Step 5: Code Generation

Generate complete instrumentation with correlated spans, metrics, and logs for each uninstrumented function. The correlation is critical: metrics emitted within spans automatically inherit trace context, and logs can reference span IDs, allowing AI assistants to connect performance metrics with specific execution paths and log messages.

### Required Imports
Add these imports if not present:
- `trace` and `SpanStatusCode` from `@opentelemetry/api`
- `OTEL` from the telemetry standards module
- `createNarrativeLogger` from the trace logger utility
- Initialize tracer as `trace.getTracer('commit-story', '1.0.0')`

### Wrap Functions with Spans
Transform each function to:
1. Call `tracer.startActiveSpan()` with appropriate OTEL.span builder
2. Add `'code.function'` attribute with the function name
3. Add relevant attributes using OTEL.attrs builders
4. Wrap original logic in try/catch
5. Set success/error status appropriately
6. Return result through the span

### Add Metrics
Within each span, emit metrics using the dual emission pattern:
- Emit the same data as both span attributes AND metrics for key measurements
- Use `commit_story.*` namespace for custom metrics
- Use `OTEL.metrics.histogram()` for durations, `gauge()` for sizes/counts, `counter()` for totals
- Iterate over span attributes to emit them as metrics: `Object.entries(attrs).forEach(...)`
- This provides trace debugging (attributes) AND dashboard/alerting (metrics)

### Add Narrative Logs
Within each span, add narrative logging that tells the story of the operation:
- Create logger with `createNarrativeLogger('category.operation')` using meaningful operation names
- Add `logger.start()` at beginning with description of what's starting
- Add `logger.progress()` for significant milestones, data discoveries, or state changes
- Add `logger.decision()` when choosing between code paths or making important choices
- Add `logger.complete()` on success with summary of what was accomplished
- Add `logger.error()` on failure with context about what went wrong and why

The goal is to create a human-readable narrative that explains the reasoning and flow, not just events. Think "development story" rather than "technical log".

## Step 6: Validation

Ensure all generated telemetry works correctly and reaches Datadog:

### 6.1 Static Validation
Run existing validation script and fix any issues before proceeding:
```bash
npm run validate:telemetry
```
If this fails, fix the reported issues and re-run until it passes.

### 6.2 Execute Real Flow
Run the full telemetry test to capture spans in normal execution:
```bash
npm run test:trace
```

### 6.3 Wait for Datadog Ingestion
Wait 60 seconds for telemetry to reach Datadog:
```javascript
console.log("⏱️  Waiting 60 seconds for telemetry ingestion...");
console.log("   This ensures if data isn't found, it's an instrumentation issue, not timing");
```

### 6.4 Query All Three Signals
Query Datadog for the spans, metrics, and logs that were added. Use appropriate MCP queries based on the function names and metric names that were instrumented.

### 6.5 Fallback Testing (if any signal missing)
Create a temporary test script that imports and calls each instrumented function with appropriate mock parameters. Run the test script, then repeat steps 6.3 and 6.4.

### 6.6 Fix Issues
If validation fails, analyze the missing signals and fix the instrumentation accordingly.