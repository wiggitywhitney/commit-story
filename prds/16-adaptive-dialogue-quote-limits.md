# PRD-16: Adaptive Dialogue Quote Limits

**Status**: Planning
**Created**: 2025-09-20
**GitHub Issue**: [#16](https://github.com/wiggitywhitney/commit-story/issues/16)
**Dependencies**: PRD-15 (Queryable Metrics)

## Problem Statement

The dialogue generator currently hard-caps quotes at 8 maximum, regardless of session complexity or meaningful content available. This results in incomplete narrative capture for rich development sessions, particularly complex debugging work that generates extensive meaningful dialogue.

### Current State Analysis
- **Hard Limit**: 8 quotes maximum (line 73 in dialogue-generator.js)
- **Evidence of Inadequacy**:
  - Recent sessions: 14+ substantial user messages → only 8 quotes (43% coverage)
  - Complex sessions: 36+ substantial user messages → only 8 quotes (22% coverage)
  - 3-hour debugging sessions losing 28+ valuable quotes

### Impact on Journal Quality
- **Incomplete Stories**: Complex sessions appear artificially simple
- **Lost Context**: Key debugging insights and decision points missing
- **Reduced Value**: Journals less useful for future reference and learning

## Success Criteria

1. **Adaptive Scaling**: Quote limits scale with session complexity metrics
2. **Quality Maintenance**: Average quote quality remains high despite increased quantity
3. **Data-Driven**: Limits based on statistical analysis of message patterns
4. **Performance Stable**: No significant latency increase from dynamic calculation
5. **Backward Compatible**: Simple sessions maintain current behavior

## Technical Approach

### Current Implementation Analysis

**File**: `src/generators/dialogue-generator.js:73`
```javascript
const maxQuotes = Math.min(context.chatMetadata.data.userMessages.overTwentyCharacters, 8);
```

**Problems**:
- Fixed ceiling of 8 regardless of session richness
- Linear relationship doesn't account for diminishing returns
- No consideration of session duration or complexity

### Proposed Adaptive Algorithm

**Metric-Based Scaling**:
```javascript
const adaptiveMaxQuotes = calculateAdaptiveLimit({
  substantialMessages: context.chatMetadata.data.userMessages.overTwentyCharacters,
  totalMessages: context.chatMetadata.data.totalMessages,
  sessionDuration: calculateSessionDuration(context),
  complexityScore: calculateComplexityScore(context)
});
```

**Scaling Factors**:

1. **Base Scaling**: Substantial messages × scaling factor
2. **Complexity Bonus**: +20% for high-complexity sessions
3. **Duration Bonus**: +10% for sessions >2 hours
4. **Quality Gates**: Minimum 3, maximum 20 quotes

### Statistical Foundation

**Data Collection** (via PRD-15 metrics):
- `commit_story.chat.user_messages_over_twenty` distribution
- `commit_story.chat.total_messages` patterns
- `commit_story.generation.duration_ms` correlation
- Session complexity indicators

**Expected Metrics** (based on preliminary analysis):
- P50: 14 substantial messages → 10-12 quotes
- P75: 20 substantial messages → 14-16 quotes
- P95: 36 substantial messages → 18-20 quotes

### Algorithm Design

**Phase 1: Linear Scaling with Ceiling**
```javascript
function calculateAdaptiveLimit(metrics) {
  const baseQuotes = Math.min(metrics.substantialMessages * 0.7, 20);
  const complexityMultiplier = metrics.complexityScore > 0.8 ? 1.2 : 1.0;
  const durationBonus = metrics.sessionDuration > 7200000 ? 1.1 : 1.0; // 2 hours

  return Math.max(3, Math.floor(baseQuotes * complexityMultiplier * durationBonus));
}
```

**Phase 2: Curve-Based Scaling** (future iteration)
- Logarithmic scaling for very large sessions
- Quality-based dynamic adjustment
- Learning from user feedback

## Implementation Plan

### Phase 1: Metrics Foundation (Depends on PRD-15)
- [ ] Deploy queryable metrics for message patterns
- [ ] Collect 2 weeks of baseline data on session complexity
- [ ] Analyze distribution of `user_messages_over_twenty`
- [ ] Identify complexity indicators and thresholds

### Phase 2: Algorithm Development
- [ ] Implement adaptive limit calculation function
- [ ] Create complexity scoring mechanism
- [ ] Add session duration calculation
- [ ] Test algorithm with historical data

### Phase 3: Integration & Testing
- [ ] Replace fixed limit in dialogue-generator.js
- [ ] Add telemetry for new quote counts
- [ ] A/B test against fixed limit for quality comparison
- [ ] Validate performance impact is minimal

### Phase 4: Monitoring & Optimization
- [ ] Monitor quote quality metrics post-deployment
- [ ] Analyze user engagement with longer dialogues
- [ ] Fine-tune algorithm based on production data
- [ ] Document final algorithm for future maintenance

## Complexity Scoring Factors

### Technical Complexity Indicators
- **Error Keywords**: Presence of error, exception, bug, fail terms
- **Technical Terms**: API names, file paths, function names
- **Problem-Solving**: Words like "debug", "investigate", "analyze"
- **Multi-Step Processes**: Sequential action words

### Session Patterns
- **Back-and-forth**: High user/assistant message ratio
- **Deep Dives**: Long message threads on single topics
- **Multiple Topics**: Topic switching frequency
- **Resolution Patterns**: Problem → solution message flows

### Measurable Metrics
```javascript
function calculateComplexityScore(context) {
  return {
    technicalTerms: countTechnicalTerms(context.messages),
    errorIndicators: countErrorKeywords(context.messages),
    conversationDepth: calculateThreadDepth(context.messages),
    topicDiversity: calculateTopicSwitches(context.messages)
  };
}
```

## Quality Assurance Strategy

### Maintaining Quote Quality
1. **Quality Thresholds**: Minimum message length and relevance requirements
2. **Diversity Requirements**: Prevent quote clustering from single conversation thread
3. **Narrative Flow**: Ensure quotes tell coherent story across time
4. **Diminishing Returns**: Cap increases for very long sessions

### Validation Approach
- **A/B Testing**: Compare adaptive vs. fixed limits on same sessions
- **Quality Metrics**: Track quote relevance and narrative coherence
- **User Feedback**: Monitor engagement with generated journals
- **Performance Impact**: Measure generation time and resource usage

## Configuration Strategy

### Environment-Based Limits
```javascript
const QUOTE_LIMITS = {
  development: { min: 3, max: 25 }, // Higher for testing
  production: { min: 3, max: 20 },  // Conservative for reliability
  debug: { min: 3, max: 50 }        // Unlimited for analysis
};
```

### Configurable Parameters
- **Scaling Factor**: Base multiplier for substantial messages
- **Complexity Threshold**: When to apply complexity bonus
- **Duration Threshold**: Long session bonus trigger
- **Quality Minimum**: Minimum quote relevance score

## Risk Analysis & Mitigations

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Performance degradation | High | Low | Lightweight complexity calculation, caching |
| Quality degradation | High | Medium | A/B testing, quality gates, gradual rollout |
| Algorithm complexity | Medium | Medium | Start simple, iterate based on data |
| Metric dependency | Medium | Low | Graceful degradation to fixed limits |

### Product Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| User confusion | Low | Low | Transparent scaling, consistent quality |
| Longer generation time | Medium | Medium | Performance monitoring, timeout protections |
| Poor scaling decisions | High | Medium | Data-driven validation, feedback loops |

## Success Metrics & KPIs

### Primary Metrics
- **Coverage Improvement**: % increase in meaningful dialogue captured
- **Quality Maintenance**: Quote relevance scores remain ≥ current baseline
- **User Satisfaction**: Journal usefulness ratings from complex sessions

### Technical Metrics
- **Performance**: Generation time increase < 10%
- **Reliability**: Error rates remain unchanged
- **Scalability**: Algorithm handles edge cases gracefully

### Business Metrics
- **Journal Completeness**: User perception of story completeness
- **Reference Value**: How often users reference complex session journals
- **Development Insights**: Value of captured debugging conversations

## Validation Criteria

### Functional Validation
- [ ] Simple sessions (≤8 substantial messages) maintain current quote counts
- [ ] Complex sessions (>20 substantial messages) receive proportionally more quotes
- [ ] Very complex sessions (>30 substantial messages) cap at reasonable limits
- [ ] Quote quality metrics remain within acceptable ranges

### Performance Validation
- [ ] Adaptive calculation adds <50ms to generation time
- [ ] Memory usage increases <10% for complex sessions
- [ ] No degradation in concurrent session handling

### Quality Validation
- [ ] Increased quotes maintain narrative coherence
- [ ] No decrease in quote relevance scores
- [ ] Better coverage of session decision points and insights

## Rollout Strategy

### Phase 1: Canary (1 week)
- Deploy to development environment only
- Test with recent complex sessions
- Validate algorithm correctness and performance

### Phase 2: Limited Production (2 weeks)
- 20% of production sessions use adaptive limits
- Monitor quality and performance metrics
- Gather user feedback on journal completeness

### Phase 3: Full Rollout (1 week)
- Deploy to 100% of sessions
- Monitor for any regression signals
- Document final configuration and lessons learned

## Future Enhancements

### Advanced Algorithms (Post-MVP)
- **Machine Learning**: Train model on quote quality and user feedback
- **Context Awareness**: Factor in development phase (debugging vs. feature work)
- **User Preferences**: Allow personal customization of verbosity levels
- **Quality Feedback Loop**: Learn from user interactions with quotes

### Integration Opportunities
- **Summary Length**: Scale summary detail with quote count
- **Technical Decisions**: Correlate quote complexity with decision importance
- **Cross-Session Learning**: Use patterns across user's session history

## Documentation Updates

### Code Comments
```javascript
/**
 * Calculate adaptive quote limit based on session complexity
 *
 * Scales quote extraction based on:
 * - Number of substantial user messages (>20 chars)
 * - Session complexity indicators (errors, technical terms)
 * - Session duration for context depth
 *
 * Range: 3-20 quotes (configurable)
 * Default scaling: 0.7x substantial messages
 *
 * @param {Object} context - Session context with chat metadata
 * @returns {number} Adaptive quote limit for session
 */
function calculateAdaptiveQuoteLimit(context) { ... }
```

### Algorithm Documentation
- Document complexity scoring factors
- Explain scaling rationale and data sources
- Provide examples of limit calculations for typical sessions
- Include performance characteristics and edge cases

## References

- [Current Dialogue Generator](../src/generators/dialogue-generator.js#L73)
- [Dialogue Prompt Configuration](../src/generators/prompts/sections/dialogue-prompt.js#L66)
- [GitHub Issue #16](https://github.com/wiggitywhitney/commit-story/issues/16)
- [Dependency: PRD-15 Queryable Metrics](./15-telemetry-spans-to-queryable-metrics.md)

## Work Log

### 2025-09-20: PRD Creation & Analysis
- Analyzed current fixed limit implementation and impact
- Researched session complexity patterns from telemetry data
- Designed adaptive algorithm with quality safeguards
- Created phased implementation plan with proper dependencies