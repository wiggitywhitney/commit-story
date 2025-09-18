# OpenTelemetry Migration Plan

**Generated**: September 18, 2025
**Version**: 1.0
**Project**: commit-story OpenTelemetry standardization
**Priority**: DD-011 (OpenTelemetry Standards Research) → Implementation

## Executive Summary

This migration plan addresses **DD-011: Full OpenTelemetry Semantic Convention Compliance** by standardizing all 58 telemetry attributes across 8 spans in 6 instrumented files. The plan implements standards-compliant naming while maintaining backward compatibility and minimizing disruption to existing monitoring.

### Impact Assessment
- **Total Attributes**: 58 attributes require updates
- **Files Modified**: 7 instrumented files
- **Estimated Effort**: 4-5 hours implementation + 1 hour testing
- **Breaking Changes**: Attribute names (can be mitigated with dual output)

## Migration Phases

### Phase 1: Mixed Convention Fixes (Priority 1) 🔴
**Duration**: 30 minutes
**Impact**: HIGH - Fixes critical semantic convention violations
**Risk**: LOW - Simple find/replace operations

**Objective**: Eliminate mixed `ai.*` and `gen_ai.*` attribute usage in AI generators

#### Files to Modify
1. `src/generators/summary-generator.js`
2. `src/generators/dialogue-generator.js`
3. `src/generators/technical-decisions-generator.js`

#### Specific Changes
```javascript
// Find and replace in each file:

// Line ~108/105/139 area:
'ai.request.messages.count': requestPayload.messages.length,
// REPLACE WITH:
'gen_ai.request.messages.count': requestPayload.messages.length,

// Line ~123/120/154 area:
'ai.response.length': result.length,
// REPLACE WITH:
'gen_ai.response.length': result.length,
```

#### Validation Steps
1. Run `npm run trace:test` to verify changes
2. Check Datadog traces for consistent `gen_ai.*` attributes
3. Confirm no `ai.*` attributes remain in AI generators

### Phase 2: Custom Namespace Implementation (Priority 2) 🟡
**Duration**: 2-3 hours
**Impact**: MEDIUM - Standardizes all custom attributes
**Risk**: MEDIUM - Large number of changes, potential for missed references

**Objective**: Apply `commit_story.*` namespace to all 45 custom business attributes

#### Decision: Project Namespace Approach
**Selected**: `commit_story.*` prefix for all custom attributes
**Rationale**:
- Consistent namespace across all custom metrics
- No dependency on future VCS convention development
- Clear ownership and documentation responsibility
- Easier maintenance and discovery

#### Implementation Sub-phases

##### Sub-phase 2A: Git/VCS Attributes (1 hour)
**Files**: `src/index.js`, `src/integrators/context-integrator.js`, all generators

```javascript
// Current → New mapping:
'commit.hash' → 'commit_story.commit.hash'
'commit.ref' → 'commit_story.commit.ref'
'commit.message' → 'commit_story.commit.message'
'commit.timestamp' → 'commit_story.commit.timestamp'
'commit.author' → 'commit_story.commit.author'
'repo.path' → 'commit_story.repository.path'
'previous.commit.hash' → 'commit_story.previous_commit.hash'
'previous.commit.timestamp' → 'commit_story.previous_commit.timestamp'
```

##### Sub-phase 2B: Business Logic Attributes (45 minutes)
**Files**: All instrumented files

```javascript
// Chat and context attributes:
'chat.messages.count' → 'commit_story.chat.messages_count'
'chat.raw.messages.count' → 'commit_story.chat.raw_messages_count'
'chat.clean.messages.count' → 'commit_story.chat.clean_messages_count'
'chat.metadata.totalMessages' → 'commit_story.chat.total_messages'

// Context processing:
'context.commit.hash' → 'commit_story.context.commit_hash'
'context.commit.message' → 'commit_story.context.commit_message'
'context.chat.totalMessages' → 'commit_story.context.total_messages'
'context.chat.userMessages' → 'commit_story.context.user_messages'
'context.chat.assistantMessages' → 'commit_story.context.assistant_messages'
```

##### Sub-phase 2C: Processing and Section Attributes (45 minutes)
**Files**: `src/generators/filters/context-filter.js`, `src/generators/journal-generator.js`, `src/index.js`

```javascript
// Context filtering:
'context.messages.original' → 'commit_story.context.original_messages'
'context.messages.filtered' → 'commit_story.context.filtered_messages'
'context.messages.removed' → 'commit_story.context.removed_messages'
'context.tokens.reduction' → 'commit_story.context.token_reduction'

// Section metrics:
'sections.summary.length' → 'commit_story.sections.summary_length'
'sections.dialogue.length' → 'commit_story.sections.dialogue_length'
'sections.technicalDecisions.length' → 'commit_story.sections.technical_decisions_length'

// Journal output:
'journal.filePath' → 'commit_story.journal.file_path'
'journal.completed' → 'commit_story.journal.completed'
```

### Phase 3: Span Name Standardization (Priority 3) 🟢
**Duration**: 30 minutes
**Impact**: LOW - Cosmetic improvements for consistency
**Risk**: LOW - Clear find/replace operations

**Objective**: Replace hyphens with underscores in span names per OTel conventions

#### Span Name Updates
```javascript
// Current → Standardized:
'commit-story.main' → 'commit_story.main'
'context.gather-for-commit' → 'context.gather_for_commit'
'context.filter-messages' → 'context.filter_messages'
'journal.generate-entry' → 'journal.generate_entry'
'technical-decisions.generate' → 'technical_decisions.generate'
'gen_ai.connectivity-test' → 'gen_ai.connectivity_test'
```

#### Files to Modify
- `src/index.js`: Lines 27, 79
- `src/integrators/context-integrator.js`: Line 105
- `src/generators/filters/context-filter.js`: Line 185
- `src/generators/journal-generator.js`: Line 32
- `src/generators/technical-decisions-generator.js`: Line 43

### Phase 4: Enhanced GenAI Features (Priority 4) 🔵
**Duration**: 1 hour
**Impact**: LOW - Adds new capabilities, doesn't break existing
**Risk**: LOW - Additive changes only

**Objective**: Implement missing GenAI semantic convention features

#### Environment Configuration
```bash
# Add to deployment/development environment
export OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental
export OTEL_GENAI_CAPTURE_CONTENT=false  # Enable for debugging only
```

#### Feature Additions
1. **Content Events** (Optional):
   ```javascript
   // Add to AI generators:
   span.addEvent('gen_ai.content.prompt', {
     'gen_ai.content.prompt': JSON.stringify(requestPayload.messages)
   });

   span.addEvent('gen_ai.content.completion', {
     'gen_ai.content.completion': completion.choices[0].message.content
   });
   ```

2. **Message Attributes** (Optional):
   ```javascript
   // Add structured message content:
   span.setAttributes({
     'gen_ai.input.messages': JSON.stringify(requestPayload.messages),
     'gen_ai.output.messages': JSON.stringify(completion.choices)
   });
   ```

3. **Conversation ID Tracking**:
   ```javascript
   // Generate conversation ID in main function:
   const conversationId = crypto.randomUUID();

   // Pass through context and add to AI spans:
   span.setAttributes({
     'gen_ai.conversation.id': conversationId
   });
   ```

## Detailed Implementation Guide

### File-by-File Migration Checklist

#### src/generators/summary-generator.js
- [ ] **Phase 1**: Fix `ai.request.messages.count` → `gen_ai.request.messages.count`
- [ ] **Phase 1**: Fix `ai.response.length` → `gen_ai.response.length`
- [ ] **Phase 2**: Update `commit.hash` → `commit_story.commit.hash`
- [ ] **Phase 2**: Update `chat.messages.count` → `commit_story.chat.messages_count`
- [ ] **Phase 4**: Add conversation ID tracking (optional)

#### src/generators/dialogue-generator.js
- [ ] **Phase 1**: Fix `ai.request.messages.count` → `gen_ai.request.messages.count`
- [ ] **Phase 1**: Fix `ai.response.length` → `gen_ai.response.length`
- [ ] **Phase 2**: Update `commit.hash` → `commit_story.commit.hash`
- [ ] **Phase 2**: Update `chat.messages.count` → `commit_story.chat.messages_count`
- [ ] **Phase 4**: Add conversation ID tracking (optional)

#### src/generators/technical-decisions-generator.js
- [ ] **Phase 1**: Fix `ai.request.messages.count` → `gen_ai.request.messages.count`
- [ ] **Phase 1**: Fix `ai.response.length` → `gen_ai.response.length`
- [ ] **Phase 2**: Update `commit.hash` → `commit_story.commit.hash`
- [ ] **Phase 2**: Update `chat.messages.count` → `commit_story.chat.messages_count`
- [ ] **Phase 3**: Update span name `technical-decisions.generate` → `technical_decisions.generate`
- [ ] **Phase 4**: Add conversation ID tracking (optional)

#### src/integrators/context-integrator.js
- [ ] **Phase 2**: Update all commit attributes (8 attributes)
- [ ] **Phase 2**: Update all chat context attributes (5 attributes)
- [ ] **Phase 3**: Update span name `context.gather-for-commit` → `context.gather_for_commit`

#### src/generators/filters/context-filter.js
- [ ] **Phase 2**: Update context processing attributes (9 attributes)
- [ ] **Phase 3**: Update span name `context.filter-messages` → `context.filter_messages`

#### src/generators/journal-generator.js
- [ ] **Phase 2**: Update section length attributes (4 attributes)
- [ ] **Phase 2**: Update chat metadata attributes (2 attributes)
- [ ] **Phase 3**: Update span name `journal.generate-entry` → `journal.generate_entry`

#### src/index.js
- [ ] **Phase 2**: Update context and journal attributes (6 attributes)
- [ ] **Phase 3**: Update span names `commit-story.main` → `commit_story.main`
- [ ] **Phase 3**: Update span name `gen_ai.connectivity-test` → `gen_ai.connectivity_test`
- [ ] **Phase 4**: Add conversation ID generation (optional)

### Testing Strategy

#### Update Test Scripts
1. **scripts/test-traces.js** modifications:
   ```javascript
   // Add validation for new conventions:
   const validateConventions = (spans) => {
     const violations = [];

     spans.forEach(span => {
       // Check for mixed conventions
       const attributes = span.attributes;
       const hasAiAttrs = Object.keys(attributes).some(key => key.startsWith('ai.'));
       const hasGenAiAttrs = Object.keys(attributes).some(key => key.startsWith('gen_ai.'));

       if (hasAiAttrs && hasGenAiAttrs) {
         violations.push(`Mixed ai.* and gen_ai.* in span: ${span.name}`);
       }

       // Check custom attribute namespacing
       Object.keys(attributes).forEach(attr => {
         if (!attr.startsWith('gen_ai.') &&
             !attr.startsWith('commit_story.') &&
             !attr.startsWith('server.') &&
             !attr.startsWith('error.')) {
           violations.push(`Non-namespaced attribute: ${attr} in span: ${span.name}`);
         }
       });

       // Check span naming convention
       if (span.name.includes('-') && !span.name.startsWith('gen_ai.')) {
         violations.push(`Span name uses hyphens: ${span.name}`);
       }
     });

     return violations;
   };
   ```

2. **New validation script**: `scripts/validate-conventions.js`

#### Validation Checklist
- [ ] **No mixed conventions**: No spans have both `ai.*` and `gen_ai.*` attributes
- [ ] **Consistent namespacing**: All custom attributes use `commit_story.*` prefix
- [ ] **Standard span names**: All span names use underscores, not hyphens
- [ ] **GenAI compliance**: All AI spans follow semantic conventions
- [ ] **Attribute coverage**: All 58 attributes properly categorized and named

### Backward Compatibility Strategy

#### Option 1: Dual Attribute Output (Recommended)
```javascript
// During transition period, emit both old and new attributes:
span.setAttributes({
  // New standard attribute
  'commit_story.commit.hash': commitHash,
  // Deprecated (remove in future version)
  'commit.hash': commitHash,  // Add deprecation warning
});
```

#### Option 2: Feature Flag Approach
```javascript
// Use environment variable to control naming:
const useNewConventions = process.env.OTEL_USE_NEW_CONVENTIONS === 'true';

const commitHashAttr = useNewConventions ?
  'commit_story.commit.hash' : 'commit.hash';

span.setAttributes({
  [commitHashAttr]: commitHash
});
```

#### Migration Timeline
- **Week 1**: Implement dual output for all attributes
- **Week 2-3**: Monitor for issues, update dashboards/alerts
- **Week 4**: Remove old attribute names, keep new only

### Risk Mitigation

#### High-Risk Changes
1. **Phase 1 (Mixed conventions)**:
   - **Risk**: Breaking existing GenAI queries
   - **Mitigation**: Validate with test runs before deploy

2. **Phase 2 (Namespace changes)**:
   - **Risk**: Breaking Datadog dashboards and alerts
   - **Mitigation**: Document all attribute changes, provide dual output period

#### Rollback Plan
1. **Git branch strategy**: Create `feature/otel-conventions` branch
2. **Incremental deployment**: Deploy one phase at a time
3. **Quick rollback**: Keep old attribute names as backup for 1 release
4. **Monitoring**: Watch for telemetry volume/error changes

### Success Criteria

#### Phase 1 Success Metrics
- [ ] Zero `ai.*` attributes in AI generator spans
- [ ] All GenAI spans use consistent `gen_ai.*` attributes
- [ ] Test script passes with updated validations

#### Phase 2 Success Metrics
- [ ] All custom attributes use `commit_story.*` namespace
- [ ] No undefined/null attribute values
- [ ] Datadog queries updated and working

#### Phase 3 Success Metrics
- [ ] All span names use underscores consistently
- [ ] Trace hierarchy unchanged
- [ ] Performance impact < 5%

#### Phase 4 Success Metrics
- [ ] GenAI content events working (if enabled)
- [ ] Conversation ID tracking across related operations
- [ ] Environment variables properly configured

### Post-Migration Tasks

#### Documentation Updates
1. **Update PRD-7**: Reflect new attribute naming conventions
2. **Instrumentation guide**: Document new namespace patterns
3. **Datadog playbook**: Update query examples and dashboard configs
4. **Team training**: Share new attribute naming with team

#### Monitoring Setup
1. **Create alerts**: For convention violations in production
2. **Dashboard updates**: Migrate to new attribute names
3. **Query library**: Update saved searches and analysis queries
4. **Performance baseline**: Establish new performance metrics

#### Future Maintenance
1. **Convention validation**: Add to CI/CD pipeline
2. **New instrumentation guide**: Template for future telemetry additions
3. **Regular audits**: Quarterly review of semantic convention compliance

---

**Generated by**: OpenTelemetry Migration Planning
**For**: commit-story project DD-011 implementation
**Next Steps**: Begin Phase 1 implementation with mixed convention fixes
**Last Updated**: September 18, 2025