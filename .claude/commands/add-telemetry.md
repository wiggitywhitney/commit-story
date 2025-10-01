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
mcp__datadog__search_datadog_services max_tokens:100
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

**Change Detection**: Use git diffs to identify which functions have significant changes and may need telemetry enhancements for new logic.

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

### Safety Checks
Before instrumenting any file, verify:
1. **Circular Dependency Prevention**: Check if the target file is imported by `tracing.js` or `logging.js`. If yes, skip instrumentation and explain why to avoid circular dependencies.
2. **Trace Correlation Enforcement**: Always add instrumentation inside existing traced functions rather than creating new trace entry points. Look for existing `tracer.startActiveSpan()` calls and nest new spans within them.

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

**REQUIREMENT**: You MUST validate 100% of added telemetry. Every span, metric, and log must be verified in Datadog before completing this command.

### 6.1 Create Validation Inventory
Before starting validation, create an inventory of ALL telemetry added in Step 5:
- **Spans**: List each function and its span name (e.g., `journal.discover_reflections`)
- **Metrics**: List each metric name (e.g., `commit_story.reflection.discovery_duration_ms`)
- **Logs**: List each narrative logger category (e.g., `journal.reflection_discovery`)

### 6.2 Static Validation
Run existing validation script to check syntax and imports:
```bash
npm run validate:telemetry
```
If this fails, fix the reported issues and re-run until it passes.

### 6.3 Execute Tests and Assess Coverage
Run the existing test and check console output for span names:
```bash
npm run test:trace
```
Review the trace output to see which of your instrumented functions were triggered. If none appear, you'll need custom tests for all of them.

### 6.4 Create and Run Custom Test Script (if needed)
For any instrumented functions NOT covered by Step 6.3, create and run a test script that imports and calls each uncovered function with realistic parameters. Verify that span traces appear in the console output before proceeding.

### 6.5 Wait for Datadog Ingestion
Wait 60 seconds for telemetry to reach Datadog:
```javascript
console.log("⏱️  Waiting 60 seconds for telemetry ingestion...");
console.log("   This ensures if data isn't found, it's an instrumentation or test coverage issue, not timing");
```

### 6.6 Query All Three Signals (100% Coverage Required)
**Initial Check**: `service:commit-story-dev from:now-5m` to confirm logs, metrics, and traces are flowing

For EVERY item in your validation inventory from Step 6.1, verify in Datadog:

1. **Find the spans** by searching for operation names
2. **Use trace IDs from those spans** to find correlated metrics and logs
3. **Verify every span, metric, and log** from your inventory is present

**REQUIREMENT**: Every single item must be found. No exceptions.

### 6.7 Fix Issues (if any failures)
If any telemetry is missing from Datadog, fix the instrumentation code and repeat the test-wait-verify cycle until 100% of your inventory is found.

**CRITICAL**: Do not mark this command as complete unless every span, metric, and log is validated in Datadog.

### 6.8 Cleanup
Remove any temporary test files created during validation (e.g., `test-otel-*.js` scripts).