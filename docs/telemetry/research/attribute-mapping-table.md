# OpenTelemetry Attribute Mapping Table

**Generated**: September 18, 2025
**Version**: 1.0
**Purpose**: Comprehensive mapping of current commit-story attributes to OpenTelemetry semantic conventions

## Migration Summary

| Category | Current Count | Issues Found | Action Required |
|----------|---------------|--------------|-----------------|
| ✅ **Compliant** | 7 | None | Keep as-is |
| ⚠️ **Mixed Conventions** | 6 | Using `ai.*` with `gen_ai.*` | Fix naming |
| ❌ **Custom (No Namespace)** | 45 | No proper namespace | Add namespace |
| **Total Attributes** | **58** | **51 need changes** | **88% require updates** |

## Detailed Attribute Mapping

### ✅ Already Compliant Attributes (Keep as-is)

| Current Attribute | Status | Spans Used In | Notes |
|-------------------|--------|---------------|-------|
| `gen_ai.request.model` | ✅ Correct | summary, dialogue, technical-decisions | Follows GenAI conventions |
| `gen_ai.response.model` | ✅ Correct | summary, dialogue, technical-decisions | Follows GenAI conventions |
| `gen_ai.operation.name` | ✅ Correct | summary, dialogue, technical-decisions | Set to "chat" appropriately |
| `gen_ai.provider.name` | ✅ Correct | summary, dialogue, technical-decisions | Provider detection working |
| `gen_ai.usage.input_tokens` | ✅ Correct | summary, dialogue, technical-decisions | Standard usage metric |
| `gen_ai.usage.output_tokens` | ✅ Correct | summary, dialogue, technical-decisions | Standard usage metric |
| `gen_ai.request.temperature` | ✅ Correct | summary, dialogue, technical-decisions | Standard request parameter |

### ⚠️ Mixed Convention Attributes (Fix immediately)

| Current Attribute | Issue | Recommended Change | Spans Affected | Priority |
|-------------------|-------|-------------------|----------------|----------|
| `ai.request.messages.count` | Mixed with GenAI | `gen_ai.request.messages.count` | summary, dialogue, technical-decisions | 🔴 HIGH |
| `ai.response.length` | Mixed with GenAI | `gen_ai.response.length` | summary, dialogue, technical-decisions | 🔴 HIGH |

**Files to Update:**
- `src/generators/summary-generator.js:108,123`
- `src/generators/dialogue-generator.js:105,120`
- `src/generators/technical-decisions-generator.js:139,154`

### ❌ Custom Attributes Needing Namespace

#### Option A: VCS Namespace (Recommended for Git Operations)
| Current Attribute | Recommended Change | Rationale | Spans Used In |
|-------------------|-------------------|-----------|---------------|
| `commit.hash` | `vcs.commit.id` | Future VCS convention compatibility | commit-story.main, context.gather-for-commit, all generators |
| `commit.ref` | `vcs.branch.ref` | Standard VCS terminology | commit-story.main, context.gather-for-commit |
| `commit.message` | `vcs.commit.message` | Standard VCS terminology | context.gather-for-commit, journal.generate-entry |
| `commit.timestamp` | `vcs.commit.timestamp` | Standard VCS terminology | context.gather-for-commit |
| `commit.author` | `vcs.commit.author.name` | Standard VCS terminology | context.gather-for-commit |
| `repo.path` | `vcs.repository.path` | Standard VCS terminology | commit-story.main, context.gather-for-commit |
| `previous.commit.hash` | `vcs.previous_commit.id` | Consistent with VCS pattern | context.gather-for-commit |
| `previous.commit.timestamp` | `vcs.previous_commit.timestamp` | Consistent with VCS pattern | context.gather-for-commit |

#### Option B: Project Namespace (Consistent Approach)
| Current Attribute | Recommended Change | Rationale | Spans Used In |
|-------------------|-------------------|-----------|---------------|
| `commit.hash` | `commit_story.commit.hash` | Consistent project namespace | commit-story.main, context.gather-for-commit, all generators |
| `commit.ref` | `commit_story.commit.ref` | Project-specific terminology | commit-story.main, context.gather-for-commit |
| `commit.message` | `commit_story.commit.message` | Project-specific terminology | context.gather-for-commit, journal.generate-entry |
| `commit.timestamp` | `commit_story.commit.timestamp` | Project-specific terminology | context.gather-for-commit |
| `commit.author` | `commit_story.commit.author` | Project-specific terminology | context.gather-for-commit |
| `repo.path` | `commit_story.repository.path` | Project-specific terminology | commit-story.main, context.gather-for-commit |
| `previous.commit.hash` | `commit_story.previous_commit.hash` | Consistent with project pattern | context.gather-for-commit |
| `previous.commit.timestamp` | `commit_story.previous_commit.timestamp` | Consistent with project pattern | context.gather-for-commit |

### Business Logic Attributes (Project Namespace Required)

| Current Attribute | Recommended Change | Rationale | Spans Used In |
|-------------------|-------------------|-----------|---------------|
| `chat.messages.count` | `commit_story.chat.messages_count` | Custom business metric | summary, dialogue, technical-decisions, journal.generate-entry |
| `chat.raw.messages.count` | `commit_story.chat.raw_messages_count` | Custom business metric | context.gather-for-commit |
| `chat.clean.messages.count` | `commit_story.chat.clean_messages_count` | Custom business metric | context.gather-for-commit |
| `chat.metadata.totalMessages` | `commit_story.chat.total_messages` | Custom business metric | journal.generate-entry |
| `context.commit.hash` | `commit_story.context.commit_hash` | Context-specific data | commit-story.main |
| `context.commit.message` | `commit_story.context.commit_message` | Context-specific data | commit-story.main |
| `context.chat.totalMessages` | `commit_story.context.total_messages` | Context-specific data | context.gather-for-commit |
| `context.chat.userMessages` | `commit_story.context.user_messages` | Context-specific data | context.gather-for-commit |
| `context.chat.assistantMessages` | `commit_story.context.assistant_messages` | Context-specific data | context.gather-for-commit |

### Context Processing Attributes

| Current Attribute | Recommended Change | Rationale | Spans Used In |
|-------------------|-------------------|-----------|---------------|
| `context.messages.original` | `commit_story.context.original_messages` | Processing metric | context.filter-messages |
| `context.messages.filtered` | `commit_story.context.filtered_messages` | Processing metric | context.filter-messages |
| `context.messages.removed` | `commit_story.context.removed_messages` | Processing metric | context.filter-messages |
| `context.messages.final` | `commit_story.context.final_messages` | Processing metric | context.filter-messages |
| `context.aggressive_filtering` | `commit_story.context.aggressive_filtering` | Processing flag | context.filter-messages |
| `context.tokens.original_chat` | `commit_story.context.original_chat_tokens` | Token metric | context.filter-messages |
| `context.tokens.filtered_chat` | `commit_story.context.filtered_chat_tokens` | Token metric | context.filter-messages |
| `context.tokens.final_chat` | `commit_story.context.final_chat_tokens` | Token metric | context.filter-messages |
| `context.tokens.reduction` | `commit_story.context.token_reduction` | Processing efficiency | context.filter-messages |

### Section and Journal Attributes

| Current Attribute | Recommended Change | Rationale | Spans Used In |
|-------------------|-------------------|-----------|---------------|
| `sections.summary.length` | `commit_story.sections.summary_length` | Business metric | journal.generate-entry, commit-story.main |
| `sections.dialogue.length` | `commit_story.sections.dialogue_length` | Business metric | journal.generate-entry, commit-story.main |
| `sections.technicalDecisions.length` | `commit_story.sections.technical_decisions_length` | Business metric | journal.generate-entry, commit-story.main |
| `sections.commitDetails.length` | `commit_story.sections.commit_details_length` | Business metric | journal.generate-entry |
| `journal.filePath` | `commit_story.journal.file_path` | Output location | commit-story.main |
| `journal.completed` | `commit_story.journal.completed` | Completion status | commit-story.main |

## Span Name Analysis

### Current Span Names vs Conventions

| Current Span Name | Convention Check | Recommendation | Notes |
|------------------|------------------|----------------|-------|
| `commit-story.main` | ⚠️ Hyphens | `commit_story.main` | Use underscores per OTel convention |
| `context.gather-for-commit` | ⚠️ Hyphens | `context.gather_for_commit` | Use underscores per OTel convention |
| `context.filter-messages` | ⚠️ Hyphens | `context.filter_messages` | Use underscores per OTel convention |
| `journal.generate-entry` | ⚠️ Hyphens | `journal.generate_entry` | Use underscores per OTel convention |
| `summary.generate` | ✅ Correct | Keep as-is | Follows conventions |
| `dialogue.generate` | ✅ Correct | Keep as-is | Follows conventions |
| `technical-decisions.generate` | ⚠️ Mixed | `technical_decisions.generate` | Use underscores consistently |
| `gen_ai.connectivity-test` | ⚠️ Mixed | `gen_ai.connectivity_test` | Use underscores consistently |

## Migration Implementation Plan

### Phase 1: Mixed Convention Fixes (30 minutes)
**Priority**: 🔴 HIGH - Blocking other AI operations visibility

**Files to modify:**
1. `src/generators/summary-generator.js`
2. `src/generators/dialogue-generator.js`
3. `src/generators/technical-decisions-generator.js`

**Changes per file:**
```javascript
// Line ~108/105/139 - Request attributes
'ai.request.messages.count': requestPayload.messages.length, // OLD
'gen_ai.request.messages.count': requestPayload.messages.length, // NEW

// Line ~123/120/154 - Response attributes
'ai.response.length': result.length, // OLD
'gen_ai.response.length': result.length, // NEW
```

**Validation**: Update `scripts/test-traces.js` to verify `gen_ai.*` consistency

### Phase 2: Namespace Decision and Implementation (2-3 hours)
**Decision Required**: Choose Option A (VCS namespace) or Option B (Project namespace)

**Recommendation**: **Option B (Project namespace)** for consistency
- **Rationale**: Single namespace easier to maintain, no risk of future VCS convention conflicts
- **Pattern**: `commit_story.*` for all custom attributes

**Implementation order:**
1. **Git/VCS attributes** (8 attributes, 4 files)
2. **Business logic attributes** (9 attributes, 6 files)
3. **Context processing attributes** (9 attributes, 1 file)
4. **Section/journal attributes** (6 attributes, 2 files)

### Phase 3: Span Name Standardization (30 minutes)
**Changes required:**
```javascript
// Current → Recommended
'commit-story.main' → 'commit_story.main'
'context.gather-for-commit' → 'context.gather_for_commit'
'context.filter-messages' → 'context.filter_messages'
'journal.generate-entry' → 'journal.generate_entry'
'technical-decisions.generate' → 'technical_decisions.generate'
'gen_ai.connectivity-test' → 'gen_ai.connectivity_test'
```

### Phase 4: Enhanced GenAI Features (1 hour)
**Add missing GenAI capabilities:**
1. **Content Events**: `gen_ai.content.prompt`, `gen_ai.content.completion`
2. **Message Attributes**: `gen_ai.input.messages`, `gen_ai.output.messages`
3. **Conversation Tracking**: `gen_ai.conversation.id`
4. **Environment Variables**: `OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental`

## File Impact Analysis

### High Impact Files (Multiple Changes)
| File | Changes Required | Attributes | Span Names |
|------|------------------|------------|------------|
| `src/generators/summary-generator.js` | 14 | 12 attributes + 2 GenAI fixes | 0 |
| `src/generators/dialogue-generator.js` | 14 | 12 attributes + 2 GenAI fixes | 0 |
| `src/generators/technical-decisions-generator.js` | 14 | 12 attributes + 2 GenAI fixes | 1 span name |
| `src/integrators/context-integrator.js` | 13 | 12 attributes | 1 span name |
| `src/generators/filters/context-filter.js` | 10 | 9 attributes | 1 span name |

### Medium Impact Files
| File | Changes Required | Attributes | Span Names |
|------|------------------|------------|------------|
| `src/index.js` | 8 | 6 attributes | 2 span names |
| `src/generators/journal-generator.js` | 6 | 5 attributes | 1 span name |

## Testing Strategy

### Update Test Scripts
1. **scripts/test-traces.js**: Add convention validation
2. **New validation checks**:
   - All `gen_ai.*` attributes use consistent naming
   - All custom attributes use `commit_story.*` namespace
   - All span names use underscores, not hyphens
   - No mixed `ai.*` and `gen_ai.*` in same spans

### Validation Checklist
- [ ] No `ai.*` attributes remain (except in comments)
- [ ] All custom attributes have `commit_story.*` prefix
- [ ] All span names use underscores consistently
- [ ] GenAI attributes follow semantic conventions
- [ ] Test script passes with new conventions

## Breaking Changes Assessment

### User Impact
- **Datadog queries**: Will need updates for new attribute names
- **Custom dashboards**: Need to reference new attribute names
- **Alerts**: May need updating for new attribute patterns

### Backward Compatibility
- **Recommendation**: Deploy with dual attributes temporarily
- **Gradual migration**: Support both old and new names for 1-2 versions
- **Deprecation notices**: Log warnings for old attribute usage

## Environment Variables

### Required for GenAI Compliance
```bash
# Enable latest experimental GenAI conventions
export OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental

# Optional: Enable content capture for debugging
export OTEL_GENAI_CAPTURE_CONTENT=true
```

---

**Generated by**: OpenTelemetry Attribute Mapping Analysis
**For**: commit-story project OpenTelemetry standardization
**Last Updated**: September 18, 2025