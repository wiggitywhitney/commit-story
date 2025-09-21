# PRD-15: Telemetry Spans to Queryable Metrics

**Status**: Planning
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

1. **Dual Emission**: Key span attributes also emitted as queryable metrics
2. **API Queryable**: Metrics accessible via `avg:commit_story.chat.user_messages_over_twenty{*}`
3. **Documentation**: TELEMETRY.md updated with metric emission patterns
4. **Statistical Analysis**: Can calculate averages, percentiles, and trends
5. **Dashboard Ready**: Metrics suitable for operational dashboards

## Scope

### In Scope
- Emit key business metrics alongside existing span attributes
- Update telemetry standards module with metric patterns
- Document metric emission guidelines in TELEMETRY.md
- Validate metrics appear in Datadog UI

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

### Phase 1: Infrastructure Setup
- [ ] Research OpenTelemetry metrics SDK for Node.js
- [ ] Extend `src/telemetry/standards.js` with metrics patterns
- [ ] Create metrics emission utilities
- [ ] Test metric export to Datadog

### Phase 2: Core Metrics Implementation
- [ ] Add dual emission to context-integrator.js (chat metrics)
- [ ] Add dual emission to journal-generator.js (business metrics)
- [ ] Add dual emission to AI generators (performance metrics)
- [ ] Validate metrics appear in Datadog UI

### Phase 3: Documentation & Validation
- [ ] Update TELEMETRY.md with metric emission patterns
- [ ] Create validation queries for key metrics
- [ ] Document best practices for future development
- [ ] Test aggregation queries work correctly

### Phase 4: Verification
- [ ] Verify statistical queries work: `avg:commit_story.chat.user_messages_over_twenty{*}`
- [ ] Confirm metrics correlation with span attributes
- [ ] Validate metric retention and historical data
- [ ] Document operational runbook for metrics

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

### TELEMETRY.md Additions

New sections to add:

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