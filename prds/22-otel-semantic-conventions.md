# PRD-22: OpenTelemetry Semantic Convention Constants

**GitHub Issue**: [#22 - Add OpenTelemetry Semantic Convention Constants](https://github.com/wiggitywhitney/commit-story/issues/22)

## Executive Summary

Enhance the commit-story telemetry implementation by properly importing and using the official OpenTelemetry semantic conventions package (`@opentelemetry/semantic-conventions`). This improvement will demonstrate best practices for an upcoming Datadog presentation and enable advanced APM features like code navigation and profiling.

## Background & Context

### Current State
- **Excellent telemetry coverage**: 45+ spans across 22 files with comprehensive metrics
- **Package installed but unused**: `@opentelemetry/semantic-conventions` v1.37.0 is installed but not imported
- **Hardcoded convention strings**: Using literal strings like `'code.function.name'` instead of constants
- **Working but not optimal**: Telemetry works great but misses Datadog APM features

### Business Context
- **Datadog presentation in ~2 weeks**: Live demo showcasing OpenTelemetry best practices
- **Demo credibility**: As a Datadog employee, telemetry should exemplify standards compliance
- **Educational value**: Show proper semantic convention usage patterns

### Technical Context
- **Runtime analysis confirms**: Main app traces, OpenAI API calls, and MCP traces all working
- **Missing code attributes**: No `code.function.name`, `code.filepath`, or `code.line.number`
- **Opportunity for enhancement**: Add standards without breaking existing telemetry

## Requirements

### Functional Requirements

#### FR1: Import Semantic Convention Constants
- [ ] Import SEMATTRS constants from `@opentelemetry/semantic-conventions` in standards.js
- [ ] Focus on code, file, RPC, and service semantic conventions
- [ ] Handle ES module import compatibility issues if they arise

#### FR2: Replace Hardcoded Attribute Strings
- [ ] Replace `'code.function.name'` with `SEMATTRS_CODE_FUNCTION`
- [ ] Replace `'file.path'` with `SEMATTRS_FILE_PATH`
- [ ] Replace `'file.directory'` with `SEMATTRS_FILE_DIRECTORY`
- [ ] Replace `'rpc.system'`, `'rpc.service'`, `'rpc.method'` with constants
- [ ] Update GenAI attributes where official constants exist

#### FR3: Add Code Attributes to All Spans
- [ ] Add `code.function.name` to every `tracer.startActiveSpan` call
- [ ] Include `code.filepath` where file context is relevant
- [ ] Consider adding `code.line.number` for error scenarios

#### FR4: Maintain Builder Pattern
- [ ] Keep existing `OTEL.attrs.*` builder pattern
- [ ] Use constants internally within builders
- [ ] Preserve backward compatibility with existing telemetry

### Non-Functional Requirements

#### NFR1: Zero Breaking Changes
- [ ] All existing telemetry must continue working
- [ ] Maintain same span names and hierarchy
- [ ] Keep existing metric names unchanged

#### NFR2: Performance
- [ ] No measurable performance impact
- [ ] Maintain efficient attribute building

#### NFR3: Maintainability
- [ ] Document which constants are official vs custom
- [ ] Add comments explaining convention choices
- [ ] Update TELEMETRY.md with new patterns

### Success Criteria

1. **Datadog APM Features Enabled**
   - [ ] Code navigation works (jump to source from traces)
   - [ ] File/function context visible in error traces
   - [ ] Proper service detection without "unknown_service"

2. **Standards Compliance**
   - [ ] Uses official OpenTelemetry semantic convention constants
   - [ ] Follows OpenTelemetry attribute naming patterns
   - [ ] Passes telemetry validation script

3. **Demo Readiness**
   - [ ] Can showcase proper import patterns
   - [ ] Demonstrates builder pattern with constants
   - [ ] Shows complete code-level observability

## Technical Design

### Architecture Decisions

**AD-001: Import Strategy**
- **Decision**: Import constants at top of standards.js
- **Rationale**: Centralized location for all semantic conventions
- **Alternative Considered**: Import in each file (rejected - too distributed)

**AD-002: Builder Pattern Preservation**
- **Decision**: Use constants internally within existing builders
- **Rationale**: Maintains clean API while using standards
- **Alternative Considered**: Expose constants directly (rejected - breaks abstraction)

**AD-003: Incremental Addition**
- **Decision**: Add code.function.name incrementally to each span
- **Rationale**: Ensures thorough coverage without missing spans
- **Alternative Considered**: Bulk find/replace (rejected - risk of errors)

### Implementation Strategy

1. **Phase 1: Import Setup**
   - Test import compatibility
   - Add necessary constants
   - Handle any ES module issues

2. **Phase 2: Builder Updates**
   - Update attribute builders internally
   - Maintain existing API surface
   - Test each builder function

3. **Phase 3: Span Enhancement**
   - Add code.function.name to each span
   - Verify in test environment
   - Check Datadog visibility

4. **Phase 4: Documentation**
   - Update TELEMETRY.md
   - Add examples of new patterns
   - Document constant usage

## Content Location Map

| Content Type | Location | Status |
|-------------|----------|--------|
| Standards Module | `src/telemetry/standards.js` | To be updated |
| Telemetry Docs | `TELEMETRY.md` | To be updated |
| Import Fixes | `src/logging.js` | Reference only |
| Validation Script | `scripts/validate-telemetry.js` | May need updates |

## Implementation Plan

### Phase 1: Foundation (Day 1)
- [ ] Test semantic conventions import
- [ ] Resolve any compatibility issues
- [ ] Update standards.js imports

### Phase 2: Constants Integration (Day 1)
- [ ] Replace hardcoded strings in builders
- [ ] Test builder functions
- [ ] Verify backward compatibility

### Phase 3: Span Enhancement (Day 2)
- [ ] Add code.function.name to all spans
- [ ] Add code.filepath where relevant
- [ ] Test with sample traces

### Phase 4: Validation (Day 2)
- [ ] Run telemetry validation
- [ ] Test in Datadog environment
- [ ] Verify APM features work

### Phase 5: Documentation (Day 2)
- [ ] Update TELEMETRY.md
- [ ] Add usage examples
- [ ] Document patterns for team

## Risk Analysis

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Import compatibility issues | High | Medium | Test imports early, have fallback |
| Breaking existing telemetry | High | Low | Incremental changes, thorough testing |
| Missing demo deadline | Medium | Low | Simple changes, can partially implement |
| Performance degradation | Low | Low | Constants are compile-time |

## Dependencies

### Technical Dependencies
- `@opentelemetry/semantic-conventions` (already installed v1.37.0)
- OpenTelemetry SDK packages (already in use)

### External Dependencies
- None - all work is internal

## Progress Tracking

### Metrics
- Number of spans with code.function.name: 0/45
- Hardcoded strings replaced: 0/10+
- APM features enabled: 0/3

### Completion Checklist
- [ ] Semantic conventions imported
- [ ] Builders updated with constants
- [ ] All spans have code attributes
- [ ] Datadog APM features verified
- [ ] Documentation updated
- [ ] Validation passing

## Notes

### Why This Matters for the Demo
1. **Credibility**: Shows deep understanding of OpenTelemetry standards
2. **Best Practices**: Demonstrates proper semantic convention usage
3. **Features**: Enables Datadog APM capabilities that wow audiences
4. **Education**: Teaches patterns others can adopt

### Implementation Tips
- Start with one file to test the pattern
- Use validation script frequently
- Test in local Datadog agent before demo
- Keep changes minimal and focused

---

*Created: 2025-09-22*
*Status: Planning*
*Owner: Whitney Lee*