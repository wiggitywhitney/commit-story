# PRD: Refactor Traces to Use OTEL Semantic Convention Imports

**Issue:** [#27](https://github.com/wiggitywhitney/commit-story/issues/27)
**Status:** Draft
**Created:** 2025-09-27
**Owner:** @wiggitywhitney

## Problem Statement

The commit-story codebase currently follows OpenTelemetry trace conventions but uses manual string attributes instead of official OTEL semantic convention imports. While traces are mostly compliant, using manual strings creates:

- Risk of typos and inconsistencies
- Missing updates when OTEL conventions change
- Harder maintenance and less IDE support
- Non-standard attribute names that don't match OTEL specs exactly

## Goal

Refactor all trace instrumentation to use official OpenTelemetry semantic convention imports (`SEMATTR_*`) for better compliance, maintainability, and consistency with industry standards.

## Current State

- ✅ Traces follow OTEL span naming conventions
- ✅ Has trace correlation working properly
- ❌ Uses manual string attributes instead of SEMATTR imports
- ❌ Some custom attributes that could use standard OTEL conventions

From `src/telemetry/standards.js`:
```javascript
// Current approach - manual strings
[SEMATTRS_CODE_FUNCTION]: toolData.name // Only some attributes use SEMATTR

// vs manual strings elsewhere
[`${OTEL.NAMESPACE}.mcp.tool_name`]: toolData.name
```

## Success Criteria

- [ ] All trace attributes use appropriate SEMATTR imports where available
- [ ] Custom attributes only used where no OTEL standard exists
- [ ] Trace instrumentation passes OTEL validation
- [ ] No breaking changes to existing trace data
- [ ] Documentation updated to reflect new conventions

## High-Level Implementation Approach

1. **Update Standards Module**: Refactor `src/telemetry/standards.js` to use more SEMATTR imports
2. **Update /add-telemetry Command**: Generate traces using proper OTEL imports
3. **Migrate Existing Code**: Update all trace instrumentation points
4. **Update Documentation**: Reflect new conventions in telemetry docs

## Milestones

### Milestone 1: Standards Module Update
- Update `src/telemetry/standards.js` with SEMATTR imports
- Maintain backward compatibility during transition

### Milestone 2: /add-telemetry Command Update
- Update telemetry generation to use proper OTEL imports
- Ensure new instrumentation follows conventions

### Milestone 3: Existing Code Migration
- Migrate all existing trace instrumentation
- Update all files that create spans or add trace attributes

### Milestone 4: Documentation Update
- Update telemetry documentation
- Update code examples and best practices

## Risk Assessment

**Low Risk** - This is primarily a refactoring effort that:
- Doesn't change trace behavior or data structure
- Maintains existing attribute names where possible
- Can be implemented incrementally
- Already has good trace coverage for testing

## References

- [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)
- [OTEL Semantic Conventions Package](https://www.npmjs.com/package/@opentelemetry/semantic-conventions)
- Current implementation: `src/telemetry/standards.js`