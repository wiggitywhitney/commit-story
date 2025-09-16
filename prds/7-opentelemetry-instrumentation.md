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

## Design Decisions (Post-Implementation)

### DD-001: Adopt OpenTelemetry GenAI Semantic Conventions
**Decision**: Update attribute naming to align with emerging OpenTelemetry GenAI semantic conventions  
**Rationale**: 
- OpenTelemetry released official GenAI semantic conventions in 2024-2025
- Standardizes attribute naming across AI operations (`gen_ai.*` prefix)
- Ensures future compatibility as conventions stabilize
- Improves interoperability with other OTel-compliant tools

**Current State**: `ai.model` → Should be `gen_ai.request.model`  
**Impact**: Minor breaking change in attribute names, improved standardization  
**Status**: ⏳ Outstanding - requires implementation

### DD-002: Add Event Recording for Prompts/Completions
**Decision**: Implement OpenTelemetry events to capture prompt and completion content  
**Rationale**:
- Events provide structured way to capture AI conversation flow
- Enables debugging of AI operations beyond just metrics
- Follows OpenTelemetry event conventions for GenAI
- Can be controlled via environment variable for privacy/volume concerns

**Implementation**: Record `gen_ai.content.prompt` and `gen_ai.content.completion` events  
**Impact**: Increased telemetry data, better AI operation visibility  
**Status**: ⏳ Outstanding - requires implementation

### DD-003: Implement Conversation ID Tracking
**Decision**: Track conversation context across related AI operations  
**Rationale**:
- Links multiple AI calls that are part of same journal generation
- Enables tracing complete "conversations" rather than individual API calls
- Aligns with GenAI semantic conventions for conversation tracking
- Improves analysis of multi-turn AI interactions

**Implementation**: Generate unique ID per journal session, pass through context  
**Impact**: Better traceability of related operations  
**Status**: ⏳ Outstanding - requires implementation

### DD-004: Manual Instrumentation Over Third-Party Libraries
**Decision**: Continue with manual instrumentation rather than adopting Elastic's `@opentelemetry/instrumentation-openai`  
**Rationale**:
- Existing manual implementation already comprehensive and working
- Full control over what gets instrumented and how
- Avoids dependency on third-party instrumentation library
- Can implement GenAI conventions precisely as needed
- Reduces complexity and potential version conflicts

**Impact**: More maintenance but greater control and customization  
**Status**: ✅ Implemented - continuing with current approach

### DD-005: JSON-Structured Log-Trace Correlation  
**Decision**: Implement structured JSON logging with automatic trace context injection  
**Rationale**:
- Current console.log string format makes correlation difficult in Datadog UI
- JSON structure enables structured queries and machine-readable parsing
- Automatic trace_id/span_id injection ensures every log correlates to traces
- Supports both OpenTelemetry standards and Datadog-specific formats

**Critical Technical Considerations**:
- **ID Format Decision**: Choose between OpenTelemetry hex format vs Datadog decimal format
- **Collection Path**: Evaluate current OTLP→Datadog Agent vs direct OTLP to Datadog
- **Log Volume**: Structured logging increases payload size but improves queryability
- **Performance**: JSON serialization vs string concatenation trade-offs

**ID Format Options Analysis**:
```javascript
// Option A: Pure OpenTelemetry (Recommended)
{ "trace_id": "74fdaeff1e1ee4a17d48c82f146b96ee", "span_id": "313d27de3a7b8658" }

// Option B: Datadog-optimized  
{ "dd.trace_id": "8425453548476893918", "dd.span_id": "3551737831793339238" }

// Option C: Hybrid (Maximum Compatibility)
{ "trace_id": "74fdaeff1e1ee4a17d48c82f146b96ee", "dd.trace_id": "8425453548476893918" }
```

**Recommended Approach**: Pure OpenTelemetry format (Option A) with simplified JSON structure:
```javascript
{
  "timestamp": "2025-01-16T18:35:43.000Z",
  "level": "info", 
  "trace_id": "74fdaeff1e1ee4a17d48c82f146b96ee",
  "span_id": "313d27de3a7b8658",
  "service": "commit-story",
  "message": "Operation completed",
  "context": { /* additional fields */ }
}
```

**Impact**: Better observability correlation, increased log parsing capabilities  
**Status**: ⏳ Outstanding - requires implementation

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

### Phase 2: GenAI Semantic Convention Alignment
**Timeline**: 1-2 hours  
**Priority**: Medium  
**Dependencies**: DD-001, DD-002, DD-003

#### Implementation Tasks
- [ ] Update attribute names to GenAI conventions (DD-001):
  - [ ] Rename `ai.model` → `gen_ai.request.model` in summary-generator.js
  - [ ] Rename `ai.operation` → `gen_ai.operation.name` in all generators
  - [ ] Add `gen_ai.provider.name: "openai"` to all AI operations
  - [ ] Update `ai.usage.*` → `gen_ai.usage.*` attributes
  - [ ] Update `ai.request.*` → `gen_ai.request.*` attributes
  - [ ] Update `ai.response.*` → `gen_ai.response.*` attributes

- [ ] Add event recording for prompts/completions (DD-002):
  - [ ] Add environment variable `OTEL_GENAI_CAPTURE_CONTENT=true` control
  - [ ] Record `gen_ai.content.prompt` event before API calls
  - [ ] Record `gen_ai.content.completion` event after API calls
  - [ ] Include token counts and model parameters in events

- [ ] Implement conversation ID tracking (DD-003):
  - [ ] Generate unique conversation ID in main function
  - [ ] Pass conversation ID through context to all AI operations
  - [ ] Add `gen_ai.conversation.id` attribute to all AI spans

- [ ] Update test script to validate GenAI conventions
- [ ] Update documentation with new attribute names

- [ ] Implement JSON-structured log-trace correlation (DD-005):
  - [ ] Create `src/utils/trace-logger.js` with JSON output format
  - [ ] Evaluate and decide on ID format strategy (OTel hex vs Datadog decimal)
  - [ ] Replace console.log calls in key instrumented files:
    - [ ] src/index.js - Main application logging
    - [ ] src/generators/journal-generator.js - Generation phase logging  
    - [ ] src/generators/summary-generator.js - AI operation logging
    - [ ] src/integrators/context-integrator.js - Context gathering logging
  - [ ] Add environment variable control for log level/format
  - [ ] Test correlation in Datadog UI with trace_id filtering
  - [ ] Evaluate collection path: current OTLP→Agent vs direct OTLP

### Phase 3: Advanced Observability
**Timeline**: 2-3 hours  
**Priority**: Low  
**Dependencies**: Phase 2 complete

#### Advanced Features
- [ ] Add sampling for high-volume scenarios
- [ ] Implement baggage for cross-service context
- [ ] Add metrics alongside traces for AI operations
- [ ] Create custom span processors for AI-specific data

### Phase 4: AI Intelligence Integration
**Timeline**: Future consideration  
**Priority**: Low  
**Dependencies**: MCP server availability

#### AI Self-Analysis Features
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

### January 16, 2025 (Later): GenAI Research and Design Decisions
**Duration**: ~1 hour  
**Focus**: Research latest OpenTelemetry GenAI developments and strategic decisions

**Research Findings**:
- OpenTelemetry GenAI semantic conventions released in 2024-2025 (Development status)
- Standardized `gen_ai.*` attribute naming conventions
- Event recording patterns for prompt/completion content
- Conversation ID tracking for multi-turn interactions
- Available third-party libraries (Elastic's `@opentelemetry/instrumentation-openai`)

**Strategic Decisions Made**:
- **DD-001**: ⏳ Adopt GenAI semantic conventions for attribute standardization
- **DD-002**: ⏳ Add event recording for better AI operation debugging
- **DD-003**: ⏳ Implement conversation ID tracking for session correlation
- **DD-004**: ✅ Continue manual instrumentation for full control

**Implementation Plan**:
- Defined Phase 2: GenAI Semantic Convention Alignment (1-2 hours)
- Specific checklist items for each design decision
- Environment variable controls for privacy/volume management
- Clear migration path from current `ai.*` to `gen_ai.*` attributes

**Next Session Priority**:
- Begin Phase 2 implementation with attribute naming updates
- Test GenAI convention compliance
- Validate event recording with privacy controls

### January 16, 2025 (Later): Log-Trace Correlation Strategy
**Duration**: ~30 minutes  
**Focus**: Design decision for structured logging with trace correlation

**Problem Identified**:
- Current console.log string format makes correlation difficult in Datadog UI
- Datadog recommendation: "To correlate logs with traces, inject trace_id and span_id"
- Need structured approach for log-trace correlation

**Critical Analysis Performed**:
- Evaluated JSON vs string logging approaches
- Analyzed ID format options: OpenTelemetry hex vs Datadog decimal vs hybrid
- Considered collection path implications: OTLP→Agent vs direct OTLP
- Assessed performance trade-offs and log volume impact

**Strategic Decision Made**:
- **DD-005**: ⏳ Implement JSON-structured log-trace correlation
- Recommended pure OpenTelemetry format (hex IDs) for vendor neutrality
- Chose structured JSON with minimal fields for performance
- Decided to evaluate collection path as part of implementation

**Architecture Decision Rationale**:
- Don't overcomplicate: Use standard OpenTelemetry hex format
- JSON enables structured queries and better parsing
- Keep log volume low by being selective about what to log
- Let traces handle detailed flow, logs handle key events/errors

**Implementation Plan**:
- Create trace-aware JSON logger utility
- Replace strategic console.log calls (not all)
- Test correlation in Datadog UI
- Evaluate direct OTLP vs Agent-based collection

**Next Session Priority**:
- Implement trace-logger utility with JSON output
- Test trace_id correlation in Datadog
- Decide on final ID format strategy

---

**PRD Created**: January 16, 2025  
**Last Updated**: January 16, 2025  
**Document Version**: 1.2