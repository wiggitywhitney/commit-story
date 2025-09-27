# PRD: Standardize Logs with OTEL Semantic Conventions

**Issue:** [#29](https://github.com/wiggitywhitney/commit-story/issues/29)
**Status:** Draft
**Created:** 2025-09-27
**Owner:** @wiggitywhitney

## Problem Statement

The commit-story codebase uses narrative-style logging that doesn't follow OpenTelemetry semantic conventions. Current logs are human-readable but lack:

- Proper severity levels (INFO, ERROR, etc.)
- Structured attributes for machine parsing
- Standard OTEL log conventions for better tooling support
- Consistent format for log analysis and searching

## Goal

Replace narrative logging with structured OTEL logs that follow semantic conventions, use proper severity levels, and provide structured attributes for better observability and analysis.

## Current State

- ❌ Uses narrative-style messages ("Found X of Y...", "Selecting context pieces...")
- ❌ Inconsistent severity handling
- ❌ Missing structured attributes
- ✅ Has OTEL logs infrastructure in place
- ✅ Trace correlation already working

Examples from current codebase:
```javascript
logger.start('context selection', 'Selecting context pieces: [commit, chatMessages]');
logger.progress('context selection', 'Found 2 of 2 requested context pieces');
```

Should become structured OTEL logs:
```javascript
logger.info('Context selection started', {
  'log.severity': 'INFO',
  'operation': 'context.selection',
  'selections.requested': ['commit', 'chatMessages'],
  'selections.count': 2
});
```

## Success Criteria

- [ ] All logs use proper OTEL severity levels
- [ ] Logs include structured attributes instead of narrative text
- [ ] Use standard OTEL log semantic conventions where applicable
- [ ] Maintain trace correlation (already working)
- [ ] Update log parsing/analysis tools
- [ ] Preserve searchability and debugging capability

## High-Level Implementation Approach

1. **Standards Module Update**: Define OTEL log conventions and structured attributes
2. **Logging Infrastructure Update**: Enhance existing OTEL logs setup
3. **Code Migration**: Replace narrative logs with structured logs
4. **Tool Updates**: Update any log parsing or analysis tools

## Milestones

### Milestone 1: Standards Module Update
- Update `src/telemetry/standards.js` with OTEL log conventions
- Define structured attribute patterns for common operations
- Establish severity level guidelines

### Milestone 2: /add-telemetry Command Update
- Update telemetry generation to create structured logs
- Ensure new instrumentation follows OTEL conventions

### Milestone 3: Infrastructure Enhancement
- Enhance `src/logging.js` and `src/utils/trace-logger.js`
- Improve structured logging capabilities
- Maintain trace correlation

### Milestone 4: Code Migration
- Migrate all narrative logging to structured logs
- Update all log statements across the codebase
- Validate log output and trace correlation

### Milestone 5: Tool Updates
- Update any log parsing/analysis dependencies
- Update documentation and examples
- Verify searchability and debugging workflows

## Risk Assessment

**Medium Risk** - This migration involves:
- Changing log format may affect log analysis workflows
- Need to maintain debugging and searchability
- Requires updating any log parsing tools
- Less risky than metrics but more than traces

## References

- [OpenTelemetry Log Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/general/logs/)
- [OTEL Log Data Model](https://opentelemetry.io/docs/specs/otel/logs/data-model/)
- Current implementation: `src/logging.js`, `src/utils/trace-logger.js`
- Current narrative logging patterns from codebase analysis