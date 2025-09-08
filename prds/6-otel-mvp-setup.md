# PRD-6: MVP OpenTelemetry Development Environment Setup

**GitHub Issue**: [#6](https://github.com/wiggitywhitney/commit-story/issues/6)  
**Status**: Planning  
**Priority**: High  
**Timeline**: 2 days  

## Executive Summary

This PRD establishes the minimal development environment setup to support OpenTelemetry-based tracing for the Commit Story project. The setup focuses on pure OpenTelemetry instrumentation (not vendor-specific SDKs) with dual exporters: console for immediate development feedback and Datadog OTLP for demo visualizations.

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
5. **Standards Compliance**: Pure OpenTelemetry SDK, no vendor lock-in

## Implementation Milestones

### M1: Teller Secrets Management
**Timeline**: Day 1  
**Owner**: Whitney Lee

#### Deliverables
- [ ] `.teller.yml` configuration for Google Secret Manager
- [ ] `.gitignore` updated to exclude sensitive config
- [ ] `package.json` script: `npm run secrets:pull`
- [ ] Documentation: Secrets management workflow in `docs/dev/`

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
- [ ] OpenTelemetry SDK with console exporter (immediate feedback)
- [ ] OpenTelemetry SDK with OTLP exporter → Datadog (demo visuals)
- [ ] Datadog Agent OTLP receiver configuration
- [ ] Test trace generation and dual verification
- [ ] Documentation: OpenTelemetry dual-exporter setup in `docs/dev/`

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

### Next Phase: Code Instrumentation
This PRD establishes the foundation for:
- Custom span generation for AI operations
- GenAI semantic conventions implementation
- Behavioral contract validation via traces
- AI system discovery through trace analysis

## References

- [OpenTelemetry AI Verification Concept](../docs/dev/otel-ai-verification-concept.md)
- [Teller Documentation](https://tlr.dev/)
- [OpenTelemetry Node.js SDK](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/)
- [OpenTelemetry Multi-Exporter Pattern](https://opentelemetry.io/docs/languages/js/exporters/)
- [Datadog OTLP Documentation](https://docs.datadoghq.com/opentelemetry/)

---

**PRD Created**: September 8, 2025  
**Last Updated**: September 8, 2025  
**Document Version**: 1.0