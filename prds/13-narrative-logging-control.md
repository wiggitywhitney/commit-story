# PRD-13: Narrative Logging Control & Effectiveness Evaluation

**Status**: Active
**Created**: 2025-09-20
**Last Updated**: 2025-09-20
**Version**: 1.0
**GitHub Issue**: [#13](https://github.com/wiggitywhitney/commit-story/issues/13)

## Problem Statement

We've implemented experimental narrative logging throughout the commit-story system (PRD-7 Phase 4), but have critical gaps:

1. **Production Risk**: Narrative logs are enabled in all environments without performance testing
2. **Unknown Value**: No data on whether these logs actually help AI assistants
3. **Code Bloat**: Functions are ~2x longer with narrative logging - may not be justified
4. **No Standards**: Future developers lack guidance on when/how to add narrative logs

## Objectives

1. **Prevent Production Impact**: Gate narrative logging to development environments only
2. **Evaluate AI Assistance Value**: Collect data on effectiveness across three dimensions
3. **Optimize Based on Findings**: Remove unhelpful patterns, keep valuable ones
4. **Document Best Practices**: Provide clear guidance for future instrumentation

## Success Criteria

- [ ] Narrative logs completely disabled in production environments
- [ ] Clear binary assessment for each dimension: Code Discovery, Debugging, Code Validation
- [ ] Measurable code complexity reduction from removing ineffective patterns
- [ ] TELEMETRY.md updated with narrative logging standards
- [ ] Zero performance impact when logging is disabled

## Deliverables

### Phase 1: Environment Gating (Week 1)

#### 1.1 Update trace-logger.js Environment Control
- Add `ENABLE_NARRATIVE_LOGS` environment variable check
- Default behavior: OFF in production, ON in development/test
- Ensure zero overhead when disabled

#### 1.2 Test Environment Controls
- Verify logs are suppressed in production mode
- Verify logs work correctly in development mode
- Performance benchmark with logging on/off

### Phase 2: Effectiveness Evaluation (Weeks 2-4)

#### 2.1 Code Discovery Value Assessment
**Hypothesis**: Narrative logs help AI assistants understand codebase structure

**Test Methods**:
- Track AI queries that reference narrative log content
- Compare AI comprehension with/without telemetry data available
- Measure accuracy of AI responses about code flow

**Success Criteria**: AI demonstrates improved understanding of execution paths using narrative data

#### 2.2 Debugging Value Assessment
**Hypothesis**: Trace-correlated narrative logs help AI diagnose issues

**Test Methods**:
- Present AI with error scenarios, measure diagnostic accuracy
- Track time-to-resolution with/without narrative context
- Evaluate AI's use of trace correlation for root cause analysis

**Success Criteria**: AI correctly identifies failure points and causes using narrative traces

#### 2.3 Code Validation Value Assessment
**Hypothesis**: Telemetry helps AI verify code behavior matches intent

**Test Methods**:
- Ask AI to validate "Is this working correctly?" questions
- Compare AI validation accuracy with/without telemetry
- Measure AI's ability to spot unexpected behavior patterns

**Success Criteria**: AI accurately validates expected vs actual behavior using execution data

### Phase 3: Refactoring Based on Findings (Week 5)

#### 3.1 Remove Ineffective Patterns
- Remove narrative logs that don't contribute to AI assistance
- Simplify functions by removing unhelpful logging calls
- Measure code complexity reduction

#### 3.2 Optimize Valuable Patterns
- Enhance narrative logs that prove valuable
- Standardize messaging formats for helpful log types
- Improve performance of retained logging

### Phase 4: Documentation & Standards (Week 6)

#### 4.1 Update TELEMETRY.md
- Add "Narrative Logging Standards" section
- Document when to add narrative logs vs regular telemetry
- Provide examples of valuable vs noise patterns
- Include performance considerations

#### 4.2 Create Implementation Guidelines
- Best practices for future narrative logging
- Code review checklist for telemetry PRs
- Migration pattern for updating existing logs

## Evaluation Framework

### Independent Value Assessment

Each dimension receives a binary evaluation:

**✅ VALUABLE** - Keep investing in this type of telemetry
**❌ NOT VALUABLE** - Remove to reduce complexity

### Data Collection Methods

1. **Usage Tracking**: Log when AI queries reference telemetry data
2. **A/B Testing**: Compare AI performance with/without specific log types
3. **Performance Metrics**: Measure overhead of different logging patterns
4. **Developer Feedback**: Survey on debugging effectiveness improvements

### Decision Matrix

| Dimension | Value Test | Keep/Remove | Rationale |
|-----------|------------|-------------|-----------|
| Code Discovery | TBD | TBD | Based on AI comprehension improvements |
| Debugging | TBD | TBD | Based on diagnostic accuracy gains |
| Code Validation | TBD | TBD | Based on validation correctness improvements |

## Risk Assessment

### High Risk
- **Performance degradation** in production if gating fails
- **Data collection bias** from limited test scenarios

### Medium Risk
- **False negatives** - valuable patterns dismissed due to inadequate testing
- **Maintenance overhead** from complex evaluation framework

### Mitigation Strategies
- Multiple environment testing before production deployment
- Diverse test scenarios across different debugging situations
- Gradual rollout with monitoring

## Implementation Phases

### Phase 1: Environment Gating ⏳
**Timeline**: Week 1
**Dependencies**: None
**Owner**: Implementation team

**Tasks**:
- [ ] Update trace-logger.js with environment controls
- [ ] Add ENABLE_NARRATIVE_LOGS environment variable
- [ ] Test gating functionality
- [ ] Performance benchmarking

### Phase 2: Data Collection ⏳
**Timeline**: Weeks 2-4
**Dependencies**: Phase 1 complete
**Owner**: Experimentation team

**Tasks**:
- [ ] Set up usage tracking infrastructure
- [ ] Conduct Code Discovery value tests
- [ ] Conduct Debugging value tests
- [ ] Conduct Code Validation value tests
- [ ] Document findings

### Phase 3: Optimization ⏳
**Timeline**: Week 5
**Dependencies**: Phase 2 complete
**Owner**: Implementation team

**Tasks**:
- [ ] Analyze evaluation results
- [ ] Remove ineffective logging patterns
- [ ] Optimize valuable patterns
- [ ] Measure complexity reduction

### Phase 4: Documentation ⏳
**Timeline**: Week 6
**Dependencies**: Phase 3 complete
**Owner**: Documentation team

**Tasks**:
- [ ] Update TELEMETRY.md with narrative logging standards
- [ ] Create implementation guidelines
- [ ] Code review checklist for future telemetry

## Content Location Map

**Primary Documentation**: This PRD file
**Standards Documentation**: `TELEMETRY.md` (to be updated in Phase 4)
**Implementation**: `src/utils/trace-logger.js` (to be updated in Phase 1)

## Work Log

### 2025-09-20 - PRD Created
- Initial problem analysis and framework design
- GitHub issue #13 created
- Phase structure and deliverables defined
- Ready for Phase 1 implementation

## Related Documents

- **PRD-7**: OpenTelemetry Instrumentation (where narrative logging was first implemented)
- **TELEMETRY.md**: Current telemetry standards (to be updated)
- **GitHub Issue #13**: https://github.com/wiggitywhitney/commit-story/issues/13