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
- [x] Import SEMATTRS constants from `@opentelemetry/semantic-conventions` in standards.js
- [x] Focus on code, file, RPC, and service semantic conventions
- [x] Handle ES module import compatibility issues if they arise

#### FR2: Replace Hardcoded Attribute Strings
- [x] Replace `'code.function.name'` with `SEMATTRS_CODE_FUNCTION`
- [x] Replace `'file.path'` with `SEMATTRS_FILE_PATH`
- [x] Replace `'file.directory'` with `SEMATTRS_FILE_DIRECTORY`
- [x] Replace `'rpc.system'`, `'rpc.service'`, `'rpc.method'` with constants
- [x] Update GenAI attributes where official constants exist

#### FR3: Add Code Attributes to All Spans
- [x] Add `code.function` to every `tracer.startActiveSpan` call
- [x] Include `code.filepath` where file context is relevant
- [x] Consider adding `code.line.number` for error scenarios

#### FR4: Maintain Builder Pattern
- [x] Keep existing `OTEL.attrs.*` builder pattern
- [x] Use constants internally within builders
- [x] Preserve backward compatibility with existing telemetry

### Non-Functional Requirements

#### NFR1: Zero Breaking Changes
- [x] All existing telemetry must continue working
- [x] Maintain same span names and hierarchy
- [x] Keep existing metric names unchanged

#### NFR2: Performance
- [x] No measurable performance impact
- [x] Maintain efficient attribute building

#### NFR3: Maintainability
- [x] Document which constants are official vs custom
- [x] Add comments explaining convention choices
- [x] Update TELEMETRY.md with new patterns

### Success Criteria

1. **Datadog APM Features Enabled**
   - [x] Code navigation works (jump to source from traces)
   - [x] File/function context visible in error traces
   - [x] Proper service detection without "unknown_service"

2. **Standards Compliance**
   - [x] Uses official OpenTelemetry semantic convention constants
   - [x] Follows OpenTelemetry attribute naming patterns
   - [x] Passes telemetry validation script

3. **Demo Readiness**
   - [x] Can showcase proper import patterns
   - [x] Demonstrates builder pattern with constants
   - [x] Shows complete code-level observability

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
- **Decision**: Add code.function incrementally to each span
- **Rationale**: Ensures thorough coverage without missing spans
- **Alternative Considered**: Bulk find/replace (rejected - risk of errors)

**DD-079: Attributes-First Telemetry Philosophy** *(Implementation Discovery)*
- **Decision**: Prioritize structured attributes over narrative logging for AI-assisted development
- **Rationale**: AI can query structured attributes directly (@code.function:"generateSummary") but struggles with unstructured narrative logs
- **Impact**: Updated TELEMETRY.md to emphasize when to use narrative logging vs rich attributes
- **Status**: ✅ Implemented in TELEMETRY.md patterns

**DD-080: Discovery Commands Over Documentation Lists** *(Documentation Strategy)*
- **Decision**: Replace comprehensive metrics lists with discovery commands in TELEMETRY.md
- **Rationale**: Teaching AI to discover existing metrics (`grep -r "OTEL.metrics" src/`) is more maintainable than exhaustive lists
- **Impact**: Prevents documentation bloat while enabling metric discovery
- **Status**: ✅ Implemented - Added discovery commands section

**DD-081: Code Attribute Format Correction** *(Standards Compliance)*
- **Decision**: Use `code.function` attribute name instead of `code.function.name`
- **Rationale**: Aligns with actual OpenTelemetry semantic convention constant (SEMATTRS_CODE_FUNCTION = "code.function")
- **Impact**: Required fixing existing spans and documentation examples
- **Status**: ✅ Implemented - Fixed all existing spans and updated examples

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
- [x] Test semantic conventions import
- [x] Resolve any compatibility issues
- [x] Update standards.js imports

### Phase 2: Constants Integration (Day 1)
- [x] Replace hardcoded strings in builders
- [x] Test builder functions
- [x] Verify backward compatibility

### Phase 3: Span Enhancement (Day 2)
- [x] Add code.function to all spans
- [x] Add code.filepath where relevant
- [x] Test with sample traces

### Phase 4: Validation (Day 2)
- [x] Run telemetry validation
- [x] Test in Datadog environment
- [x] Verify APM features work

### Phase 5: Documentation (Day 2)
- [x] Update TELEMETRY.md
- [x] Add usage examples
- [x] Document patterns for team

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
- Number of spans with code.function: 45/45 ✅
- Hardcoded strings replaced: 10+/10+ ✅
- APM features enabled: 3/3 ✅

### Completion Checklist
- [x] Semantic conventions imported
- [x] Builders updated with constants
- [x] All spans have code attributes
- [x] Datadog APM features verified
- [x] Documentation updated
- [x] Validation passing

## Work Log

### 2025-09-22: Implementation Complete ✅
**Duration**: ~4 hours (estimated from conversation flow)
**Commits**: Multiple implementation commits
**Primary Focus**: OpenTelemetry semantic conventions integration with AI-optimized telemetry

**Completed PRD Items**:
- [x] **Semantic conventions imported** - Added SEMATTRS constants from @opentelemetry/semantic-conventions
- [x] **Builders updated internally** - Used constants while maintaining external API compatibility
- [x] **All spans enhanced** - Added code.function to 45+ spans across 14+ files
- [x] **APM features enabled** - Code navigation and file context now working in Datadog
- [x] **Standards compliance achieved** - Using official OpenTelemetry constants throughout
- [x] **Documentation rewritten** - TELEMETRY.md optimized for AI-assisted development
- [x] **Validation passing** - Script confirms proper implementation

**Key Discovery: Attributes-First Telemetry Philosophy**
- Implemented DD-079: Prioritize structured attributes over narrative logging for AI queryability
- Implemented DD-080: Discovery commands over exhaustive documentation lists
- Implemented DD-081: Corrected code.function attribute format (not code.function.name)

**Files Enhanced**:
- `src/telemetry/standards.js` - Core semantic conventions integration
- `src/index.js` - Main application spans
- `src/mcp/server.js` - MCP server spans (6 functions)
- `src/generators/*.js` - AI generation spans (3 files)
- `src/collectors/*.js` - Data collection spans
- `src/utils/*.js` - Utility function spans
- `TELEMETRY.md` - Complete rewrite with AI-friendly patterns

**Demo Ready**: ✅ All APM features working, proper semantic conventions, complete code-level observability

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
*Status: ✅ **COMPLETED***
*Owner: Whitney Lee*
*Completed: 2025-09-22*