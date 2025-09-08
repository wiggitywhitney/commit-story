# PRD-6: OpenTelemetry AI System Intelligence Setup

**GitHub Issue**: [#6](https://github.com/wiggitywhitney/commit-story/issues/6)  
**Status**: In Development  
**Priority**: High  
**Timeline**: 3-4 days  

## Executive Summary

This PRD establishes OpenTelemetry-based tracing for AI system intelligence in the Commit Story project. The setup provides dual exporters (console + Datadog OTLP) as foundation, then enables AI assistants to query and analyze trace data for system discovery and code verification.

## Context & Motivation

### Conference Demo Requirements
- **Venue**: KubeCon and other OSS conferences
- **Demo Goal**: Show OpenTelemetry as system intelligence for AI, not vendor-specific APM
- **Technical Story**: "This is pure OpenTelemetry with multiple exporters" - emphasis on standards

### Development Experience Requirements  
- **Immediate Feedback**: Console traces for instant development validation
- **Visual Demos**: Datadog backend for professional conference presentations
- **Pure OpenTelemetry**: No vendor-specific instrumentation libraries

### Current Environment
- ✅ Teller v2.0.7 installed via Homebrew
- ✅ Datadog Agent v7.69.4 running locally  
- ✅ GCP authentication active (whitney.lee@datadoghq.com)
- ✅ API keys available in Google Secret Manager (secret: `datadog-commit-story-dev`)
- Current secrets: Only `OPENAI_API_KEY` in `.env.example`

## Success Criteria

1. **Secrets Management**: API keys pulled from Google Secret Manager via Teller
2. **Dual OpenTelemetry Exporters**: Console + Datadog OTLP working simultaneously
3. **Development Feedback**: Traces visible in terminal within milliseconds
4. **Demo Readiness**: Traces visible in Datadog UI within 10ms
5. **AI Integration**: AI assistants can query trace data via Datadog MCP server
6. **Standards Compliance**: Pure OpenTelemetry SDK, no vendor lock-in

## Implementation Milestones

### M1: Teller Secrets Management
**Timeline**: Day 1  
**Owner**: Whitney Lee

#### Deliverables
- [x] `.teller.yml` configuration for Google Secret Manager
- [x] `.gitignore` updated to exclude sensitive config
- [x] `package.json` script: `npm run secrets:pull`
- [x] Documentation: Secrets management workflow in `docs/dev/` (skipped - personal dev setup)

#### Technical Requirements
- Configure Teller to pull `datadog-commit-story-dev` from Google Secret Manager
- Map to standard `DD_API_KEY` environment variable
- Local fallback to `.env` for development flexibility
- Ensure no secrets committed to git

#### Acceptance Criteria
- `teller show` displays available secrets (redacted)
- `npm run secrets:pull` populates environment variables
- No sensitive data in git history

### M2: Dual OpenTelemetry Exporters
**Timeline**: Day 2  
**Owner**: Whitney Lee

#### Deliverables
- [x] OpenTelemetry SDK with console exporter (immediate feedback)
- [x] OpenTelemetry SDK with OTLP exporter → Datadog (demo visuals)
- [x] Datadog Agent OTLP receiver configuration
- [x] Test trace generation and dual verification
- [x] Documentation: OpenTelemetry dual-exporter setup in `src/tracing-simple.js`

#### Technical Requirements
- Setup OpenTelemetry Node.js SDK with MultiSpanProcessor
- Configure console exporter for development traces
- Configure OTLP exporter to Datadog Agent port 4318
- Generate test traces visible in both outputs
- Document the "pure OpenTelemetry, multiple backends" approach

#### Acceptance Criteria
- Test traces appear in terminal console immediately
- Same traces appear in Datadog UI within 10ms
- Both exporters show identical OpenTelemetry semantic conventions
- Configuration demonstrates backend flexibility
- Ready for future application instrumentation

## Architecture Decisions

### Why Teller for Secrets
- **Personal Workflow**: Already installed and configured
- **GCP Integration**: Direct Google Secret Manager integration
- **Security**: Avoids committing API keys to git
- **Conference Demos**: Professional secrets management

### Why Dual Exporters (Console + Datadog)
- **Development Speed**: Console provides instant feedback without network calls
- **Demo Quality**: Datadog provides professional visualizations for presentations
- **Standards Demonstration**: Shows OpenTelemetry flexibility across backends
- **Zero Dependencies**: Console works without any external services

### Why OpenTelemetry SDK (Not dd-trace)
- **Standards Compliance**: Pure OpenTelemetry semantic conventions
- **Vendor Neutrality**: Backend-agnostic instrumentation
- **Conference Story**: "This works with any OTLP-compatible backend"
- **Multi-Export Capability**: Single SDK, multiple destinations

## Technical Implementation

### OpenTelemetry Configuration Pattern
```javascript
// Multi-exporter setup for development + demos
const { NodeSDK } = require('@opentelemetry/node');
const { ConsoleSpanExporter } = require('@opentelemetry/exporter-console');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-otlp-http');
const { MultiSpanProcessor, BatchSpanProcessor } = require('@opentelemetry/trace-base');

const sdk = new NodeSDK({
  spanProcessors: [
    new BatchSpanProcessor(new ConsoleSpanExporter()), // Immediate feedback
    new BatchSpanProcessor(new OTLPTraceExporter({      // Demo backend
      url: 'http://localhost:4318/v1/traces'
    }))
  ]
});
```

## Risk Assessment

### Low Risk
- **Teller Setup**: Tool already installed and working
- **Console Exporter**: No external dependencies
- **GCP Integration**: Authentication already active

### Medium Risk
- **Datadog OTLP Configuration**: May require Agent configuration changes
- **Multi-exporter Setup**: OpenTelemetry SDK configuration complexity

### Mitigations
- Start with console exporter first (zero dependencies)
- Add Datadog OTLP exporter second (incremental validation)
- Use OpenTelemetry Node.js multi-exporter examples

## Success Metrics

1. **Setup Time**: < 2 hours total implementation
2. **Console Latency**: Traces in terminal immediately
3. **Datadog Latency**: Traces in Datadog UI within 10ms
4. **Development Experience**: Single command setup via `npm run secrets:pull`
5. **Demo Readiness**: Clear "OpenTelemetry multi-backend" story

## Future Considerations

### Next Phase: Production Integration
This PRD establishes the foundation for:
- AI-driven instrumentation of existing Commit Story codebase
- GenAI semantic conventions for AI operations
- Behavioral contract validation via traces
- Production-ready AI system intelligence workflows

## References

- [OpenTelemetry AI Verification Concept](../docs/dev/otel-ai-verification-concept.md) - **REQUIRED READING for future AI assistants working on this PRD**
- [Teller Documentation](https://tlr.dev/)
- [OpenTelemetry Node.js SDK](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/)
- [OpenTelemetry Multi-Exporter Pattern](https://opentelemetry.io/docs/languages/js/exporters/)
- [Datadog OTLP Documentation](https://docs.datadoghq.com/opentelemetry/)
- [Datadog MCP Server](https://docs.datadoghq.com/bits_ai/mcp_server/)

---

---

## Work Log

### September 8, 2025: M1 Teller Secrets Management - COMPLETE ✅
**Duration**: ~1 hour  
**Focus**: Personal development environment secrets setup

**Completed M1 Deliverables**:
- [x] `.teller.yml` configuration - Evidence: Configured for `projects/demoo-ooclock` with correct secret mappings
- [x] `.gitignore` updated - Evidence: Added `.teller.env` exclusion for security
- [x] `npm run secrets:pull` script - Evidence: Added development-only script (no `commit-story:` prefix)
- [x] Documentation - Skipped (personal dev setup with private Google Cloud project)

**Completed M1 Acceptance Criteria**:
- ✅ `teller show` displays secrets (redacted): `DD_API_KEY = 6f***`, `OPENAI_API_KEY = sk***`
- ✅ `npm run secrets:pull` populates environment variables successfully
- ✅ No sensitive data in git history (`.teller.env` excluded)

**Technical Decisions Made**:
- Used personal Google Cloud project (`demoo-ooclock`) for development
- Mapped `datadog-commit-story-dev` secret (corrected from wrong API key)
- Kept `OpenAI-API-Key` secret mapping for existing OpenAI integration
- Added development-only npm script without `commit-story:` prefix

### September 8, 2025: M2 Dual OpenTelemetry Exporters - COMPLETE ✅
**Duration**: ~2 hours  
**Focus**: Conference-ready dual exporter setup for development + demo

**Completed M2 Deliverables**:
- [x] OpenTelemetry SDK with console exporter (immediate feedback)
- [x] OpenTelemetry SDK with OTLP exporter → Datadog (demo visuals)  
- [x] Datadog Agent OTLP receiver configuration
- [x] Test trace generation and dual verification
- [x] Documentation: OpenTelemetry dual-exporter setup in `src/tracing-simple.js`

**Completed M2 Acceptance Criteria**:
- ✅ Test traces appear in terminal console immediately
- ✅ Same traces appear in Datadog UI within 10ms (service: `commit-story-dev`)
- ✅ Both exporters show identical OpenTelemetry semantic conventions
- ✅ Configuration demonstrates backend flexibility
- ✅ Ready for future application instrumentation

**Technical Implementation Evidence**:
- Console traces: 4 spans with detailed OpenTelemetry attributes
- Datadog traces: All 4 spans visible (`test-simple-span`, `test-parent-span`, `test-child-span`, `test-error-span`)
- Parent-child relationships preserved in both outputs
- Error span with exception details captured correctly
- Service identification working (`commit-story-dev`)

**Architecture Decisions Validated**:
- ✅ Multi-exporter pattern enables "pure OpenTelemetry, multiple backends" story
- ✅ Console provides instant development feedback (0ms network latency)
- ✅ OTLP → Datadog Agent provides professional demo visuals
- ✅ Standards-compliant OpenTelemetry semantic conventions throughout

### M3: AI System Intelligence Integration
**Timeline**: Day 3-4
**Owner**: Whitney Lee

#### Deliverables
- [ ] Datadog Bits AI MCP server setup and configuration
- [ ] Simple instrumented utility function for real trace validation
- [ ] AI workflow validation: real code → trace generation → MCP query → analysis
- [ ] Document trace data format and AI analysis capabilities
- [ ] Cleanup: Remove validation artifacts after successful integration

#### Technical Requirements
- Configure Datadog MCP server integration with Claude Code
- Create `src/utils/journal-stats.js` with OTel instrumentation
- Implement `getJournalEntriesByDateRange(startDate, endDate)` function
- Test with real journal data from existing project files
- Validate AI can analyze traces to verify function behavior
- Document MCP `get_trace()` data format and limitations

#### Acceptance Criteria
- AI can successfully call `get_trace(trace_id)` via Datadog MCP server
- Returned trace data includes custom attributes, timing, and span relationships
- AI can validate function behavior: "Did this function work as intended?"
- AI can extract system intelligence: input patterns, execution time, error cases
- End-to-end workflow demonstrated: code → trace → AI analysis → validation
- Validation artifacts cleaned up (test utility function removed or archived)

#### Cleanup Requirements
- Remove or move `src/utils/journal-stats.js` to `examples/` after validation
- Archive any temporary test data or configurations
- Update documentation to reflect final implementation patterns
- Ensure no development artifacts remain in main codebase

**Overall Progress**: 67% complete (M1 ✅, M2 ✅, M3 ⏳)

---

**PRD Created**: September 8, 2025  
**Last Updated**: September 8, 2025  
**Document Version**: 1.2