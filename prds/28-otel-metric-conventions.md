# PRD: Migrate Metrics to OTEL Semantic Conventions

**Issue:** [#28](https://github.com/wiggitywhitney/commit-story/issues/28)
**Status:** Draft
**Created:** 2025-09-27
**Owner:** @wiggitywhitney

## Problem Statement

The commit-story codebase uses a custom `commit_story.*` metric namespace that doesn't follow OpenTelemetry semantic conventions. This creates:

- Vendor lock-in and reduced portability
- Incompatibility with OTEL tooling and processors
- Non-standard naming that doesn't follow industry conventions
- Difficult migration to other observability platforms

## Goal

Migrate metrics from custom namespace to OTEL semantic conventions, following proper naming patterns, unit conventions, and standard attributes while maintaining dashboard/alert compatibility.

## Current State

- ❌ Uses custom `commit_story.*` namespace
- ❌ Inconsistent unit placement and naming
- ❌ Missing standard OTEL attributes for common operations
- ✅ Has working metric emission and collection

Examples from current codebase:
```javascript
OTEL.metrics.gauge('commit_story.sections.summary_length', value);
OTEL.metrics.gauge('commit_story.chat.messages_count', value);
OTEL.metrics.gauge('commit_story.context.processing_duration_ms', value);
```

Should become OTEL-compliant names like:
```javascript
OTEL.metrics.histogram('http.server.request.duration', value, { unit: 'ms' });
OTEL.metrics.counter('operations.completed.total', value);
```

## Success Criteria

- [ ] All metrics follow OTEL naming conventions (dots, units at end)
- [ ] Use standard OTEL attributes where applicable
- [ ] Maintain backward compatibility during transition period
- [ ] Update all dashboards and alerts
- [ ] Provide migration tooling/scripts
- [ ] Zero data loss during migration

## High-Level Implementation Approach

1. **Standards Module Update**: Define OTEL-compliant metric names and mappings
2. **Dual-Emit Strategy**: Emit both old and new metrics during transition
3. **Dashboard Migration**: Update all queries and visualizations
4. **Gradual Deprecation**: Remove old metrics after successful migration

## Milestones

### Milestone 1: Standards Module Update
- Update `src/telemetry/standards.js` with OTEL metric conventions
- Create mapping between old and new metric names
- Implement dual-emission capability

### Milestone 2: /add-telemetry Command Update
- Update telemetry generation to use OTEL metric conventions
- Ensure new instrumentation follows proper patterns

### Milestone 3: Dashboard and Alert Migration
- Identify all dashboard dependencies
- Create migration scripts for queries
- Update alerts and monitors

### Milestone 4: Code Migration
- Migrate existing metric instrumentation
- Implement dual-emission across codebase
- Validate metrics are emitted correctly

### Milestone 5: Legacy Cleanup
- Remove old metric emission after validation period
- Clean up deprecated code
- Update documentation

## Risk Assessment

**High Risk** - This is the most complex migration because:
- Breaking changes affect dashboards and alerts
- Requires careful coordination to avoid data loss
- Needs extensive validation of metric continuity
- May require extended dual-emission period

## References

- [OpenTelemetry Metric Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/general/metrics/)
- [OTEL Metric Naming Guidelines](https://opentelemetry.io/docs/specs/semconv/general/metrics/#general-guidelines)
- Current implementation: `src/telemetry/standards.js`
- Current metrics from telemetry data analysis