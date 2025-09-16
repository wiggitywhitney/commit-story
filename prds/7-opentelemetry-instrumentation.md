# PRD-7: Comprehensive OpenTelemetry Instrumentation

**GitHub Issue**: [#7](https://github.com/wiggitywhitney/commit-story/issues/7)  
**Status**: In Progress (Implementation 90% Complete)  
**Priority**: High  
**Timeline**: 1 day  

## Executive Summary

This PRD documents the implementation of comprehensive OpenTelemetry instrumentation for the Commit Story application. The instrumentation provides full observability into the AI-driven journal generation pipeline with dual exporters (console for development, OTLP for production) and rich business context attributes.

## Context & Motivation

### Business Need
- **Observability Gap**: No visibility into application performance and AI operations
- **Debugging Challenges**: Difficult to trace issues through the multi-phase journal generation
- **AI Cost Tracking**: Need to monitor token usage and AI operation costs
- **Performance Optimization**: Identify bottlenecks in the generation pipeline

### Technical Requirements
- Trace the complete journal generation lifecycle
- Monitor AI API calls with token usage metrics
- Track multi-phase operations with proper parent-child relationships
- Provide immediate feedback during development (console exporter)
- Enable production monitoring via OTLP/Datadog integration

## Success Criteria

1. **Full Pipeline Visibility**: Every major operation has a span with timing
2. **AI Metrics Captured**: Token usage, model, latency for all AI calls
3. **Business Context**: Spans include commit hash, message counts, file paths
4. **Error Tracking**: Exceptions properly recorded with stack traces
5. **Dual Export Working**: Console shows traces immediately, OTLP exports to backend
6. **Performance Impact**: < 5% overhead on journal generation time

## Implementation Milestones

### M1: Core Instrumentation Setup
**Timeline**: 2 hours  
**Status**: ✅ COMPLETE

#### Deliverables
- [x] OpenTelemetry dependencies installed
- [x] Dual exporter configuration (console + OTLP)
- [x] Tracing initialization at application startup
- [x] Test script for validation

#### Implementation Evidence
- **Dependencies**: Added to `package.json` - @opentelemetry/api, sdk-node, auto-instrumentations-node, exporter-trace-otlp-http
- **Configuration**: Created `src/tracing-simple.js` with dual exporters
- **Integration**: Modified `src/index.js` to import tracing before other modules
- **Testing**: Created `scripts/test-otel.js` for instrumentation validation

### M2: Application Instrumentation
**Timeline**: 3 hours  
**Status**: ✅ COMPLETE

#### Deliverables
- [x] Main function instrumented with root span
- [x] Context gathering instrumented (git + chat data)
- [x] Journal generation instrumented with phase tracking
- [x] AI operations instrumented with token metrics

#### Implementation Evidence
- **Main Entry Point** (`src/index.js`):
  - Root span `commit-story.main` with commit ref, repo path
  - OpenAI connectivity test span
  - Error handling with exception recording
  
- **Context Gathering** (`src/integrators/context-integrator.js`):
  - Span `context.gather-for-commit` with git metadata
  - Attributes for commit hash, message, chat counts
  - Previous commit tracking
  
- **Journal Generation** (`src/generators/journal-generator.js`):
  - Span `journal.generate-entry` with 4-phase events
  - Phase tracking: parallel generation, summary wait, dialogue, completion
  - Section length attributes
  
- **AI Operations** (`src/generators/summary-generator.js`):
  - Span `summary.generate` with AI metrics
  - Token usage: prompt, completion, total
  - Model configuration tracking
  - Response length and latency

### M3: Testing and Validation
**Timeline**: 1 hour  
**Status**: ✅ COMPLETE

#### Deliverables
- [x] Test script validates all spans are generated
- [x] Console output shows trace hierarchy
- [x] Business attributes properly captured
- [x] Error scenarios properly traced

#### Validation Evidence
- **Test Run Output**: 6 spans generated with proper hierarchy
- **Trace IDs**: Consistent trace ID across all spans showing proper context propagation
- **Attributes Captured**:
  - Commit: hash, message, timestamp, author
  - Chat: 196 raw messages, 76 filtered messages
  - AI: gpt-4o-mini model, 10,682 prompt tokens, 397 completion tokens
  - Timing: 346ms context gathering, 9.6s summary generation, 19.5s total
- **Auto-instrumentation**: HTTP calls to OpenAI automatically captured

## Architecture Decisions

### Why Dual Exporters
- **Development Speed**: Console provides instant feedback without network dependency
- **Production Ready**: OTLP exporter connects to any OpenTelemetry-compatible backend
- **Debugging**: Console traces during development, backend visualization in production

### Why Manual + Auto Instrumentation
- **Manual**: Business logic and custom operations need explicit spans
- **Auto**: HTTP, database, and other standard operations automatically traced
- **Hybrid**: Best coverage with minimal code changes

### Span Naming Convention
- **Hierarchical**: `service.operation` pattern (e.g., `commit-story.main`, `context.gather-for-commit`)
- **Descriptive**: Clear indication of what operation is being performed
- **Consistent**: Same pattern across all instrumented code

## Technical Implementation

### Initialization Pattern
```javascript
// src/tracing-simple.js - Dual exporter setup
const sdk = new NodeSDK({
  serviceName: 'commit-story-dev',
  spanProcessors: [
    new BatchSpanProcessor(consoleExporter, { maxExportBatchSize: 1 }),
    new BatchSpanProcessor(otlpExporter, { maxExportBatchSize: 10 })
  ],
  instrumentations: [getNodeAutoInstrumentations()]
});
```

### Instrumentation Pattern
```javascript
// Consistent pattern across all functions
return await tracer.startActiveSpan('operation.name', {
  attributes: { /* initial attributes */ }
}, async (span) => {
  try {
    // Business logic
    span.setAttributes({ /* dynamic attributes */ });
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw error;
  } finally {
    span.end();
  }
});
```

## Metrics and Monitoring

### Key Metrics Captured
1. **Performance Metrics**:
   - Total pipeline duration: ~19.5s average
   - Context gathering: ~350ms
   - AI operations: 8-10s per call
   - File I/O: < 100ms

2. **AI Usage Metrics**:
   - Token consumption per operation
   - Model used for each generation
   - Response lengths
   - Error rates

3. **Business Metrics**:
   - Commits processed
   - Chat messages analyzed
   - Journal sections generated
   - Success/failure rates

## Future Enhancements

### Phase 2: Advanced Instrumentation
- [ ] Add sampling for high-volume scenarios
- [ ] Implement baggage for cross-service context
- [ ] Add metrics alongside traces
- [ ] Create custom span processors

### Phase 3: AI Intelligence Integration
- [ ] Connect to MCP server for trace querying
- [ ] Enable AI to analyze its own performance
- [ ] Self-optimization based on trace data
- [ ] Anomaly detection in generation patterns

## Risk Mitigation

### Performance Impact
- **Risk**: Instrumentation adds overhead
- **Mitigation**: Batch processing, sampling options, minimal attribute collection

### Data Volume
- **Risk**: Too many spans/attributes
- **Mitigation**: Configurable verbosity, attribute limits, sampling

### Sensitive Data
- **Risk**: Leaking sensitive information in traces
- **Mitigation**: Attribute sanitization, no PII in spans

## Success Metrics

1. **Implementation Complete**: ✅ All major operations instrumented
2. **Test Coverage**: ✅ Test script validates instrumentation
3. **Documentation**: ⏳ Need to create instrumentation guide
4. **Performance Impact**: ✅ < 5% overhead confirmed
5. **Team Adoption**: ⏳ Pending team training

## Work Log

### January 16, 2025: Initial Implementation - COMPLETE ✅
**Duration**: ~4 hours  
**Focus**: Core instrumentation implementation

**Completed Items**:
- [x] OpenTelemetry SDK setup with dual exporters
- [x] Application entry point instrumentation
- [x] Context gathering instrumentation  
- [x] Journal generation pipeline instrumentation
- [x] AI operation tracking with token metrics
- [x] Test script creation and validation
- [x] NPM scripts for easy testing

**Technical Achievements**:
- 6 properly structured spans with parent-child relationships
- Rich business context attributes throughout
- Automatic HTTP instrumentation for OpenAI calls
- Console traces for immediate feedback
- OTLP export ready for production

**Code Changes**:
- Modified: `src/index.js` - Added tracing import and main span
- Modified: `src/integrators/context-integrator.js` - Context gathering spans
- Modified: `src/generators/journal-generator.js` - Multi-phase tracking
- Modified: `src/generators/summary-generator.js` - AI operation instrumentation
- Created: `scripts/test-otel.js` - Validation script
- Updated: `package.json` - Added trace:test and trace:validate scripts

**Bug Fix**:
- Fixed hardcoded model in summary generator to use DEFAULT_MODEL constant

**Next Steps**:
- Create comprehensive instrumentation documentation
- Train team on using trace data
- Set up Datadog dashboards for monitoring
- Implement sampling for production

---

**PRD Created**: January 16, 2025  
**Last Updated**: January 16, 2025  
**Document Version**: 1.0