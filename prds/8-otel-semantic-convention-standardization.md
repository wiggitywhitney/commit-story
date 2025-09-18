# PRD-8: OpenTelemetry Semantic Convention Standardization

**GitHub Issue**: [#8](https://github.com/wiggitywhitney/commit-story/issues/8)
**Status**: Not Started
**Priority**: High
**Timeline**: 2-3 hours

## Executive Summary

This PRD addresses standardization of existing OpenTelemetry instrumentation to follow semantic conventions v1.37.0. Currently, 51 out of 58 attributes (88%) don't follow proper conventions, creating inconsistent telemetry data and reducing observability tool compatibility.

## Context & Motivation

### Current State Issues
- **Mixed Conventions**: `ai.*` and `gen_ai.*` attributes used together in AI generators
- **Missing Namespace**: 45 custom attributes lack proper `commit_story.*` prefix
- **Non-standard Span Names**: Using hyphens instead of underscores
- **Tool Compatibility**: Non-standard attributes reduce observability platform integration

### Research Foundation
Comprehensive research completed in PRD-7 DD-011 with documentation in:
- `docs/telemetry/research/otel-instrumentation-audit.md` - Complete attribute catalog
- `docs/telemetry/research/otel-semantic-conventions-research.md` - Standards analysis
- `docs/telemetry/research/attribute-mapping-table.md` - Detailed migration mapping
- `docs/telemetry/research/migration-plan.md` - Implementation approach

## Success Criteria

1. **100% Semantic Convention Compliance**: All attributes follow OpenTelemetry standards
2. **No Mixed Conventions**: Zero `ai.*` attributes in GenAI spans
3. **Consistent Namespace**: All custom attributes use `commit_story.*` prefix
4. **Standard Span Names**: All span names use underscores, not hyphens
5. **Tool Compatibility**: Improved integration with observability platforms

## Implementation Phases

### Phase 1: Mixed Convention Fixes
**Timeline**: 30 minutes
**Priority**: 🔴 HIGH
**Impact**: Immediate semantic convention compliance for GenAI operations

#### Scope
Fix mixed `ai.*` and `gen_ai.*` attribute usage in AI generators.

#### Files to Modify
- `src/generators/summary-generator.js`
- `src/generators/dialogue-generator.js`
- `src/generators/technical-decisions-generator.js`

#### Specific Changes
**📁 Reference**: See `docs/telemetry/research/attribute-mapping-table.md` Section "Mixed Convention Attributes"

```javascript
// Replace in all 3 files:
'ai.request.messages.count' → 'gen_ai.request.messages.count'
'ai.response.length' → 'gen_ai.response.length'
```

#### Deliverables
- [x] Update summary-generator.js (lines ~108, 123)
- [x] Update dialogue-generator.js (lines ~105, 120)
- [x] Update technical-decisions-generator.js (lines ~139, 154)
- [x] Run test validation to confirm GenAI compliance

### Phase 2: Custom Namespace Implementation
**Timeline**: 2 hours
**Priority**: 🟡 MEDIUM
**Impact**: Standardizes all 45 custom business attributes

#### Namespace Strategy
**Selected**: `commit_story.*` prefix for all custom attributes
**Rationale**: Consistent namespace, clear ownership, easier maintenance

#### Sub-phase 2A: Git/VCS Attributes (45 minutes)
**📁 Reference**: See `docs/telemetry/research/attribute-mapping-table.md` Section "Custom Attributes Needing Namespace"

```javascript
// VCS operations attributes:
'commit.hash' → 'commit_story.commit.hash'
'commit.ref' → 'commit_story.commit.ref'
'commit.message' → 'commit_story.commit.message'
'commit.timestamp' → 'commit_story.commit.timestamp'
'commit.author' → 'commit_story.commit.author'
'repo.path' → 'commit_story.repository.path'
'previous.commit.hash' → 'commit_story.previous_commit.hash'
'previous.commit.timestamp' → 'commit_story.previous_commit.timestamp'
```

#### Sub-phase 2B: Business Logic Attributes (45 minutes)
```javascript
// Chat and context attributes:
'chat.messages.count' → 'commit_story.chat.messages_count'
'chat.raw.messages.count' → 'commit_story.chat.raw_messages_count'
'chat.clean.messages.count' → 'commit_story.chat.clean_messages_count'
'chat.metadata.totalMessages' → 'commit_story.chat.total_messages'

// Context processing:
'context.commit.hash' → 'commit_story.context.commit_hash'
'context.messages.original' → 'commit_story.context.original_messages'
'context.tokens.reduction' → 'commit_story.context.token_reduction'
```

#### Sub-phase 2C: Section and Output Attributes (30 minutes)
```javascript
// Journal sections:
'sections.summary.length' → 'commit_story.sections.summary_length'
'sections.dialogue.length' → 'commit_story.sections.dialogue_length'
'sections.technicalDecisions.length' → 'commit_story.sections.technical_decisions_length'

// Output metadata:
'journal.filePath' → 'commit_story.journal.file_path'
'journal.completed' → 'commit_story.journal.completed'
```

#### Deliverables
- [x] Update all VCS attributes (8 attributes, 7 files)
- [x] Update all business logic attributes (15 attributes, 6 files)
- [x] Update section and output attributes (6 attributes, 2 files)
- [x] Validate all custom attributes have proper namespace

### Phase 3: Span Name Standardization
**Timeline**: 30 minutes
**Priority**: 🟢 LOW
**Impact**: Consistency improvements for span naming

#### Span Name Updates
```javascript
// Replace hyphens with underscores:
'commit-story.main' → 'commit_story.main'
'context.gather-for-commit' → 'context.gather_for_commit'
'context.filter-messages' → 'context.filter_messages'
'journal.generate-entry' → 'journal.generate_entry'
'technical-decisions.generate' → 'technical_decisions.generate'
'gen_ai.connectivity-test' → 'gen_ai.connectivity_test'
```

#### Files to Modify
**📁 Reference**: See `docs/telemetry/research/migration-plan.md` Phase 3 for detailed file locations

- `src/index.js`: Lines 27, 79
- `src/integrators/context-integrator.js`: Line 105
- `src/generators/filters/context-filter.js`: Line 185
- `src/generators/journal-generator.js`: Line 32
- `src/generators/technical-decisions-generator.js`: Line 43

#### Deliverables
- [ ] Update all 6 span names to use underscores
- [ ] Maintain trace hierarchy consistency
- [ ] Validate span naming conventions

## Architecture Decisions

### AD-001: Project Namespace Over VCS Namespace
**Decision**: Use `commit_story.*` prefix for all custom attributes instead of `vcs.*`
**Rationale**:
- No official OpenTelemetry VCS conventions exist
- Consistent namespace easier to maintain
- Clear project ownership and responsibility
- Avoids future conflicts if VCS conventions are standardized

### AD-002: No Backwards Compatibility
**Decision**: Direct attribute name changes without dual output or feature flags
**Rationale**:
- Instrumentation is new with minimal historical data
- No production dependencies on current attribute names
- Simplifies implementation and reduces complexity
- Clean migration path without technical debt

### AD-003: GenAI Experimental Convention Adoption
**Decision**: Use experimental GenAI semantic conventions with proper opt-in
**Rationale**:
- Following latest OpenTelemetry standards
- Provider-agnostic design already implemented
- Requires `OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental`
- Future-proof when conventions become stable

## Technical Implementation

### Environment Configuration
**📁 Reference**: See `docs/telemetry/research/otel-semantic-conventions-research.md` Section "Environment Variables"

```bash
# Required for GenAI semantic conventions
export OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental
```

### File Impact Analysis
**📁 Reference**: See `docs/telemetry/research/otel-instrumentation-audit.md` for complete file analysis

| File | Attributes Changed | Span Names | Effort |
|------|-------------------|------------|--------|
| `src/generators/summary-generator.js` | 12 | 0 | 30 min |
| `src/generators/dialogue-generator.js` | 12 | 0 | 30 min |
| `src/generators/technical-decisions-generator.js` | 12 | 1 | 35 min |
| `src/integrators/context-integrator.js` | 12 | 1 | 30 min |
| `src/generators/filters/context-filter.js` | 9 | 1 | 25 min |
| `src/index.js` | 6 | 2 | 20 min |
| `src/generators/journal-generator.js` | 5 | 1 | 15 min |

### Validation Strategy
1. **Attribute Validation**: Ensure no mixed conventions remain
2. **Namespace Validation**: All custom attributes have `commit_story.*` prefix
3. **Span Name Validation**: All names use underscores consistently
4. **Test Execution**: Run `npm run trace:test` after each phase
5. **Datadog Verification**: Confirm traces show new attribute names

## Risk Mitigation

### Low Risk Assessment
- **Simple Operations**: Find/replace operations with clear mapping
- **No Breaking Logic**: Only attribute name changes, no functional changes
- **Comprehensive Mapping**: All attributes documented in research
- **Test Coverage**: Existing test scripts validate instrumentation

### Rollback Plan
- **Git Branch**: Work on feature branch for easy rollback
- **Incremental Commits**: Commit after each phase for granular rollback
- **Test Validation**: Verify functionality after each phase

## Success Metrics

### Completion Criteria
- [x] **Zero mixed conventions**: No `ai.*` attributes in GenAI spans
- [x] **Complete namespace coverage**: All 45 custom attributes use `commit_story.*` (45/45 complete - 100%)
- [ ] **Standard span names**: All 6 span names use underscores
- [x] **Test validation**: All instrumentation tests pass (Phase 1, 2A, 2B, 2C validated)
- [ ] **Tool compatibility**: Improved Datadog/observability integration

### Quality Gates
1. ✅ **Phase 1 Gate**: No mixed `ai.*` and `gen_ai.*` attributes
2. ✅ **Phase 2 Gate**: All attributes have proper namespace prefix (100% complete)
3. ⏳ **Phase 3 Gate**: All span names follow underscore convention
4. ⏳ **Final Gate**: 100% semantic convention compliance validated

## Dependencies

### Prerequisites
- ✅ DD-011 research completed (PRD-7)
- ✅ Research documentation available in `docs/telemetry/research/`
- ✅ Attribute mapping table created
- ✅ Migration plan documented

### Environment Requirements
- Node.js environment with OpenTelemetry packages
- `OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental` configured
- Access to test scripts and validation tools

## Work Log

### Pre-Implementation Research - COMPLETE ✅
**Duration**: 3 hours (completed in PRD-7 DD-011)
**Deliverables**: Complete research foundation with 4 documentation files

**Research Completed**:
- ✅ Complete instrumentation audit (8 spans, 58 attributes cataloged)
- ✅ OpenTelemetry v1.37.0 semantic conventions research
- ✅ Detailed attribute mapping with 88% requiring updates
- ✅ Comprehensive migration plan with phase breakdown

**Next Steps**: Begin Phase 1 implementation with mixed convention fixes

### September 18, 2025: Phase 1 + Phase 2A Implementation - COMPLETE ✅
**Duration**: ~1 hour total
**Focus**: Mixed convention fixes and VCS attribute namespace implementation

#### Phase 1: Mixed Convention Fixes (30 minutes)
**Completed Items**:
- ✅ **src/generators/summary-generator.js** - Fixed mixed `ai.*` + `gen_ai.*` attributes
  - Line 108: `'ai.request.messages.count'` → `'gen_ai.request.messages.count'`
  - Line 123: `'ai.response.length'` → `'gen_ai.response.length'`
- ✅ **src/generators/dialogue-generator.js** - Fixed mixed `ai.*` + `gen_ai.*` attributes
  - Line 105: `'ai.request.messages.count'` → `'gen_ai.request.messages.count'`
  - Line 120: `'ai.response.length'` → `'gen_ai.response.length'`
- ✅ **src/generators/technical-decisions-generator.js** - Fixed mixed `ai.*` + `gen_ai.*` attributes
  - Line 139: `'ai.request.messages.count'` → `'gen_ai.request.messages.count'`
  - Line 154: `'ai.response.length'` → `'gen_ai.response.length'`
- ✅ **Validation**: `npm run trace:test` passed - all AI spans now use pure `gen_ai.*` attributes

#### Phase 2A: VCS Attributes Namespace Implementation (30 minutes)
**Completed Items**:
- ✅ **All 8 VCS attributes** updated across 7 files (17 total occurrences):
  - `commit.hash` → `commit_story.commit.hash` (7 files updated)
  - `commit.ref` → `commit_story.commit.ref` (2 files updated)
  - `commit.message` → `commit_story.commit.message` (2 files updated)
  - `commit.timestamp` → `commit_story.commit.timestamp` (2 files updated)
  - `commit.author` → `commit_story.commit.author` (1 file updated)
  - `repo.path` → `commit_story.repository.path` (2 files updated)
  - `previous.commit.hash` → `commit_story.previous_commit.hash` (1 file updated)
  - `previous.commit.timestamp` → `commit_story.previous_commit.timestamp` (1 file updated)

**Files Modified**:
- `src/index.js`: 4 VCS attributes updated
- `src/integrators/context-integrator.js`: 8 VCS attributes updated
- `src/generators/journal-generator.js`: 2 VCS attributes updated
- `src/generators/summary-generator.js`: 1 VCS attribute updated
- `src/generators/dialogue-generator.js`: 1 VCS attribute updated
- `src/generators/technical-decisions-generator.js`: 1 VCS attribute updated
- `src/generators/filters/context-filter.js`: 1 VCS attribute updated

**Validation Results**:
- ✅ Trace test passes with 11 spans generated successfully
- ✅ All VCS attributes now use `commit_story.*` namespace in trace output
- ✅ Zero old VCS attribute patterns remain (confirmed via grep)
- ✅ Established namespace pattern for remaining Phase 2B/2C work

#### Progress Impact
- **Semantic Convention Compliance**: 24% improvement (14 out of 58 total attributes now compliant)
- **Mixed Conventions**: Completely eliminated ✅
- **Custom Namespace Progress**: 18% complete (8 out of 45 custom attributes updated)
- **Phase 1 Gate**: ✅ Passed - No mixed conventions remain
- **Foundation Established**: `commit_story.*` namespace pattern ready for remaining attributes

#### September 18, 2025: Phase 2B + Phase 2C Implementation - COMPLETE ✅
**Duration**: ~45 minutes total
**Focus**: Business logic attributes and section/output attributes namespace implementation

#### Phase 2B: Business Logic Attributes (30 minutes)
**Completed Items**:
- ✅ **All chat message attributes** updated across 4 generator files:
  - `chat.messages.count` → `commit_story.chat.messages_count` (4 files)
  - `chat.metadata.totalMessages` → `commit_story.chat.total_messages` (1 file)
  - `chat.raw.messages.count` → `commit_story.chat.raw_messages_count` (1 file)
  - `chat.clean.messages.count` → `commit_story.chat.clean_messages_count` (1 file)

- ✅ **All context processing attributes** updated across 3 files (11 attributes total):
  - `context.chat.*` → `commit_story.context.chat_*` (5 attributes)
  - `context.messages.*` → `commit_story.context.*_messages` (4 attributes)
  - `context.tokens.*` → `commit_story.context.*_tokens` (6 attributes)
  - `context.aggressive_filtering` → `commit_story.context.aggressive_filtering` (1 attribute)

#### Phase 2C: Section and Output Attributes (15 minutes)
**Completed Items**:
- ✅ **All section length attributes** updated across 2 files:
  - `sections.summary.length` → `commit_story.sections.summary_length`
  - `sections.dialogue.length` → `commit_story.sections.dialogue_length`
  - `sections.technicalDecisions.length` → `commit_story.sections.technical_decisions_length`
  - `sections.commitDetails.length` → `commit_story.sections.commit_details_length`

- ✅ **All journal attributes** updated:
  - `journal.filePath` → `commit_story.journal.file_path`
  - `journal.completed` → `commit_story.journal.completed`

**Validation Results**:
- ✅ Trace test passes with all 45 custom attributes using `commit_story.*` namespace
- ✅ Phase 2 complete: 100% custom namespace implementation achieved
- ✅ Ready for Phase 3: Span name standardization

#### Progress Impact
- **Semantic Convention Compliance**: 81% overall completion (47 out of 58 total attributes now compliant)
- **Custom Namespace Progress**: 100% complete (45 out of 45 custom attributes updated)
- **Phase 2 Gate**: ✅ Passed - All custom attributes have proper namespace prefix

#### Next Session Priority
- **Phase 3**: Span name standardization (6 span names, underscores vs hyphens)
- **Final validation**: Complete semantic convention compliance

---

**PRD Created**: September 18, 2025
**Last Updated**: September 18, 2025
**Document Version**: 1.1