# PRD-15: Telemetry Spans to Queryable Metrics

**Status**: Implementation (Infrastructure Complete)
**Created**: 2025-09-20
**GitHub Issue**: [#15](https://github.com/wiggitywhitney/commit-story/issues/15)

## Problem Statement

Current telemetry implementation only emits data as span attributes, preventing statistical analysis and aggregation queries. Key business metrics like `commit_story.chat.user_messages_over_twenty` cannot be queried for averages, percentiles, or trends through Datadog's metrics API.

### Current State
- ✅ Rich telemetry as span attributes for debugging
- ❌ No aggregatable metrics for statistical analysis
- ❌ Cannot answer questions like "What's the average user messages per session?"
- ❌ No dashboards or alerting on business metrics

### Impact
- Manual trace sampling required for statistical analysis
- No operational visibility into usage patterns
- Difficult to validate dialogue quote limits against real usage data

## Success Criteria

1. **Complete Dual Emission**: ALL span attributes emitted as queryable metrics (100% coverage)
2. **API Queryable**: Metrics accessible via `avg:commit_story.chat.user_messages_over_twenty{*}`
3. **OTel Compliance**: All metrics follow OpenTelemetry semantic conventions
4. **Documentation**: TELEMETRY.md updated with metric emission patterns
5. **Statistical Analysis**: Can calculate averages, percentiles, and trends
6. **Dashboard Ready**: Metrics suitable for operational dashboards

## Scope

### In Scope
- Emit ALL span attributes as queryable metrics (100% coverage)
- Update telemetry standards module with metric patterns
- Document metric emission guidelines in TELEMETRY.md
- Validate metrics appear in Datadog UI
- OpenTelemetry semantic convention compliance verification
- Datadog MCP server verification for each implementation phase

### Out of Scope
- Removing existing span attributes (maintain dual emission)
- Historical metric backfill
- Custom dashboard creation
- Alerting setup

## Technical Approach

### Metrics to Emit
Based on codebase analysis, priority metrics:

**Chat/Context Metrics**:
- `commit_story.chat.user_messages_over_twenty` (gauge)
- `commit_story.chat.messages_count` (gauge)
- `commit_story.chat.total_messages` (gauge)

**Performance Metrics**:
- `commit_story.generation.duration_ms` (gauge)
- `commit_story.context.token_reduction_percent` (gauge)

**Business Metrics**:
- `commit_story.journal.entry_size` (gauge)
- `commit_story.sections.total_count` (gauge)

### Implementation Pattern

**Before**:
```javascript
span.setAttributes({
  'commit_story.chat.user_messages_over_twenty': userMessagesOverTwenty
});
```

**After**:
```javascript
span.setAttributes({
  'commit_story.chat.user_messages_over_twenty': userMessagesOverTwenty
});

// Also emit as metric
OTEL.metrics.gauge('commit_story.chat.user_messages_over_twenty', userMessagesOverTwenty, {
  tags: ['service:commit-story-dev']
});
```

### Architecture

1. **Extend OTEL Standards**: Add `OTEL.metrics.*` builders to telemetry/standards.js
2. **Dual Emission Pattern**: Emit both span attribute and metric simultaneously
3. **Consistent Naming**: Same metric names as span attributes for correlation
4. **Tag Strategy**: Include service, environment tags for filtering

## Implementation Plan

Based on trace analysis showing ~85% of span attributes are not emitted as metrics, this plan ensures 100% coverage across all instrumented files.

### Infrastructure Setup (COMPLETED ✅)
**Foundation for metrics emission - all items complete**
- [x] Research OpenTelemetry metrics SDK for Node.js
- [x] Install @opentelemetry/sdk-metrics and @opentelemetry/exporter-metrics-otlp-http packages
- [x] Configure OTLPMetricExporter with delta temporality (required for Datadog OTLP ingestion)
- [x] Set up PeriodicExportingMetricReader with 60-second export intervals (OTel best practice)
- [x] Extend `src/telemetry/standards.js` with OTEL.metrics.gauge(), .counter(), .histogram() builders
- [x] Add 'dev' flag to config.json for narrative logging control (separate from 'debug')
- [x] Update trace-logger.js to use 'dev' flag instead of 'debug' flag
- [x] Test and verify metrics export to Datadog via OTLP (localhost:4318)

### Initial Dual Emission Implementation (COMPLETED ✅)
**Proof of concept with ~15% span attribute coverage**
- [x] Add dual emission to context-integrator.js (chat metrics: user_messages_over_twenty, total_messages)
- [x] Add dual emission to journal-manager.js (business metrics: entry_size, write_duration_ms, entries_saved)
- [x] Add dual emission to index.js (section metrics: summary_length, dialogue_length, etc.)
- [x] Verify production metrics appearing in Datadog UI

### Phase 1: Data Collectors (git-collector.js, claude-collector.js)
**Target Attributes**: Repository, commit, chat data collection metrics
- [ ] Add dual emission for `commit_story.repository.*` attributes
- [ ] Add dual emission for `commit_story.commit.*` attributes
- [ ] Add dual emission for `commit_story.chat.raw.*` attributes
- [ ] **OTel Verification**: Verify metric names follow semantic conventions for git/repository data
- [ ] **Datadog MCP Verification**: Query new collector metrics via MCP server

### Phase 2: Context Processing (context-filter.js)
**Target Attributes**: Context filtering and token optimization metrics
- [ ] Add dual emission for `commit_story.context.*` attributes
- [ ] Add dual emission for token reduction and filtering metrics
- [ ] Add dual emission for message processing statistics
- [ ] **OTel Verification**: Verify processing metrics follow performance semantic conventions
- [ ] **Datadog MCP Verification**: Query context processing metrics via MCP server

### Phase 3: AI Generation (journal-generator.js, summary-generator.js, etc.)
**Target Attributes**: AI operation performance and GenAI semantic convention compliance
- [ ] Add dual emission for `gen_ai.*` attributes (model, tokens, temperature)
- [ ] Add dual emission for `commit_story.generation.*` attributes
- [ ] Add dual emission for AI response timing and quality metrics
- [ ] **OTel Verification**: Verify GenAI metrics comply with OpenTelemetry semantic conventions
- [ ] **Datadog MCP Verification**: Query AI performance metrics via MCP server

### Phase 4: Utilities and Support (trace-logger.js, etc.)
**Target Attributes**: Logging, debugging, and utility metrics
- [ ] Add dual emission for narrative logging statistics
- [ ] Add dual emission for error and debugging metrics
- [ ] Add dual emission for utility function performance
- [ ] **OTel Verification**: Verify utility metrics follow appropriate semantic conventions
- [ ] **Datadog MCP Verification**: Query utility and logging metrics via MCP server

### Phase 5: Main Execution Flow (index.js, journal-manager.js)
**Target Attributes**: Overall operation and business metrics
- [ ] Add dual emission for end-to-end operation metrics
- [ ] Add dual emission for journal file operations
- [ ] Add dual emission for main execution flow timing
- [ ] **OTel Verification**: Verify business metrics follow service/application conventions
- [ ] **Datadog MCP Verification**: Query main execution metrics via MCP server

### Final Verification
- [ ] **Complete Coverage Check**: Verify 100% of span attributes are emitted as metrics
- [ ] **OTel Compliance**: All metrics follow OpenTelemetry semantic conventions
- [ ] **Datadog MCP Full Test**: Query all metric namespaces via MCP server

## Key Technical Decisions

### OpenTelemetry Metrics SDK
**Decision**: Use OpenTelemetry Metrics SDK for consistency with existing tracing
**Rationale**:
- Consistent with current OTel tracing setup
- Same OTLP export endpoint (localhost:4318)
- Unified observability stack

### Dual Emission Strategy
**Decision**: Emit both span attributes AND metrics simultaneously
**Rationale**:
- Span attributes: Rich debugging context
- Metrics: Aggregatable data for analysis
- No breaking changes to existing telemetry

### Metric Naming Convention
**Decision**: Use identical names for metrics and span attributes
**Rationale**:
- Easy correlation between traces and metrics
- Consistent with existing `commit_story.*` namespace
- Clear mapping for troubleshooting

## Documentation Updates Required

### TELEMETRY.md Additions (COMPLETED ✅)

**Status**: Complete reorganization completed 2025-09-21 with comprehensive reference structure

Completed sections added:

**Metrics Emission Patterns**:
```markdown
## Metrics Emission

Emit key business and performance data as both span attributes and queryable metrics:

```javascript
// Dual emission pattern
const value = calculateBusinessMetric();

// 1. Span attribute (for debugging)
span.setAttributes({ 'commit_story.metric.name': value });

// 2. Metric (for aggregation)
OTEL.metrics.gauge('commit_story.metric.name', value, {
  tags: ['service:commit-story-dev', 'environment:development']
});
```

**When to Emit Metrics**:
- Business KPIs (user message counts, generation success rates)
- Performance indicators (duration, token counts)
- Error rates and status indicators
- Resource utilization metrics

**Metric Types**:
- `gauge`: Point-in-time values (message counts, durations)
- `counter`: Incrementing values (total generations, errors)
- `histogram`: Distribution data (response times, payload sizes)
```

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance overhead | Latency increase | Batch metric emission, async processing |
| Metric namespace collision | Data confusion | Use consistent `commit_story.*` prefix |
| Double storage costs | Increased billing | Monitor metric cardinality, implement retention policies |
| SDK compatibility issues | Implementation blocked | Test with current OpenTelemetry versions first |

## Validation Criteria

### Functional Tests
- [ ] Metrics appear in Datadog Metrics Explorer
- [ ] Aggregation queries return expected results
- [ ] Metrics correlate with corresponding span attributes
- [ ] Tags and metadata properly set

### Performance Tests
- [ ] No measurable latency impact from metric emission
- [ ] Memory usage remains within acceptable bounds
- [ ] Metric export doesn't block span processing

### Integration Tests
- [ ] Metrics work with existing OTLP exporter
- [ ] Both metrics and traces export successfully
- [ ] Error handling doesn't break either telemetry stream

## Success Metrics

### Primary KPIs
- **Query Success**: `avg:commit_story.chat.user_messages_over_twenty{*}` returns data
- **Correlation**: Metric values match span attribute values within 1% variance
- **Availability**: Metrics available within 60 seconds of emission

### Secondary KPIs
- **Performance**: <5ms latency impact from metric emission
- **Coverage**: 95% of key business metrics have dual emission
- **Documentation**: TELEMETRY.md covers all metric patterns

## References

- [OpenTelemetry Metrics SDK Documentation](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/#metrics)
- [Datadog OTLP Metrics Ingestion](https://docs.datadoghq.com/opentelemetry/otlp_ingest_in_the_agent/)
- [Current Telemetry Standards](../src/telemetry/standards.js)
- [GitHub Issue #15](https://github.com/wiggitywhitney/commit-story/issues/15)

## Work Log

### 2025-09-20: PRD Creation
- Analyzed current telemetry implementation gaps
- Researched OpenTelemetry Metrics SDK options
- Identified priority metrics for dual emission
- Created implementation phases and validation criteria

### 2025-09-20: Infrastructure Implementation (COMPLETED)
- ✅ Installed @opentelemetry/sdk-metrics and @opentelemetry/exporter-metrics-otlp-http
- ✅ Configured OTLPMetricExporter with delta temporality (required for Datadog)
- ✅ Extended OTEL standards with metrics.gauge(), .counter(), .histogram() builders
- ✅ Added 'dev' flag to config.json for narrative logging (separate from 'debug')
- ✅ Updated trace-logger.js to use 'dev' flag instead of 'debug'
- ✅ Verified metrics export to Datadog via OTLP (localhost:4318)

### 2025-09-20: Initial Dual Emission (COMPLETED)
- ✅ Added dual emission to context-integrator.js (chat metrics)
- ✅ Added dual emission to journal-manager.js (journal metrics)
- ✅ Added dual emission to index.js (section length metrics)
- ✅ Verified production metrics appearing in Datadog
- ✅ Current metric coverage: ~15% of span attributes

### 2025-09-20: Comprehensive Plan Creation & Progress Update
- ✅ Updated PRD with comprehensive dual emission plan for 100% coverage
- ✅ Added OpenTelemetry semantic convention verification to each phase
- ✅ Added Datadog MCP server verification steps for each phase
- ✅ **Progress Assessment**: Infrastructure 100% complete, Initial implementation 100% complete (~15% coverage)
- ✅ **Scope Expansion**: Identified need for 100% span attribute coverage (was ~85% missing)
- 📋 **Next Priority**: Implement Phase 1 (Data Collectors) for comprehensive coverage

### 2025-09-20: Current Status Summary
**✅ COMPLETED WORK**:
- Complete OpenTelemetry metrics infrastructure setup
- Proof-of-concept dual emission in 3 core files
- Delta temporality configuration for Datadog compatibility
- Narrative logging 'dev' flag separation from 'debug'
- Verified metrics appearing in Datadog production environment

**📊 CURRENT METRICS COVERAGE**: ~15% of span attributes (need 85% more)
- ✅ Chat metrics: user_messages_over_twenty, total_messages, raw_messages_count
- ✅ Journal metrics: entry_size, write_duration_ms, entries_saved
- ✅ Section metrics: summary_length, dialogue_length, technical_decisions_length, commit_details_length
- ❌ Missing: All collector attributes, context processing, AI generation, utilities

**🎯 PHASE 1 READY**: Infrastructure complete, moving to comprehensive collector instrumentation

### 2025-09-21: Telemetry Infrastructure Consolidation & Documentation (COMPLETED)
**Duration**: ~3 hours
**Commits**: Consolidated tracing infrastructure, cleaned validation commands, updated documentation
**Primary Focus**: Infrastructure cleanup, consolidation, and comprehensive documentation

**Completed PRD Items**:
- [x] **Infrastructure Stability & Cleanup** - Evidence: Consolidated tracing-simple.js and tracing.js into single working file with both traces and metrics
- [x] **Documentation Comprehensiveness** - Evidence: Complete TELEMETRY.md reorganization with existing spans/metrics/logs lists, patterns, validation
- [x] **Validation Command Cleanup** - Evidence: Removed duplicate validate:trace from package.json, kept test:trace
- [x] **Traces and Metrics Verification** - Evidence: Both confirmed working in Datadog after consolidation

**Infrastructure Improvements Completed**:
- ✅ **Tracing File Consolidation**: Merged duplicate tracing files, eliminated confusion between tracing.js vs tracing-simple.js
- ✅ **Service Name Fix**: Fixed "unknown_service:node" issue by using simple serviceName config instead of broken semantic-conventions import
- ✅ **Comprehensive Documentation**: Reorganized TELEMETRY.md with complete lists of existing spans, metrics, and narrative logs for AI guidance
- ✅ **Clean Validation Commands**: Consolidated duplicate test:trace/validate:trace commands
- ✅ **Journal Maintenance**: Removed 6 duplicate journal entries, cleaned up 414 lines of duplicate content

**Technical Discoveries**:
- **Root Cause Found**: Real commits were using tracing-simple.js (no metrics) while broken tracing.js had undefined service names
- **Manual vs OTel Standards**: Current approach of manually following semantic conventions in standards.js is cleaner than importing @opentelemetry/semantic-conventions package
- **Test vs Real Metrics**: All previous "successful" metrics were from test scripts, not actual commits - fixed by consolidation

**Infrastructure Status**:
- 🔧 **Tracing**: Single consolidated file with both traces and metrics working
- 📊 **Metrics**: 23 commit_story metrics confirmed in Datadog
- 📚 **Documentation**: TELEMETRY.md now provides complete reference for future AI instrumentation
- ✅ **Validation**: Clean command structure with test:trace and validate:telemetry

**Next Session Priorities**:
- **Phase 1**: Implement dual emission for data collectors (git-collector.js, claude-collector.js)
- **Coverage Analysis**: Build systematic verification that 100% of span attributes become metrics
- **Semantic Conventions**: Validate all metric names follow OpenTelemetry standards