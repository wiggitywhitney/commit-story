# "Taming Telemetry Standards: Adopting OpenTelemetry Weaver in Production"

## Abstract

Building comprehensive telemetry is the easy part. Managing it at scale is the hard part.

commit-story has traces flowing to Datadog, logs correlated with trace IDs, and dashboards covering every operation. The instrumentation works. But maintaining it reveals a painful truth: standards documentation is not enforcement.

The project maintains a 380-line TELEMETRY.md file documenting 5 instrumentation patterns, semantic conventions, and builder APIs. Developers must remember the right patterns, know which conventions to use, and copy-paste code samples hoping they follow the standards. There's no enforcement—if someone adds a span without `code.function`, nothing stops them. The wrong attribute name slips into production, breaks queries, or gets lost in noise.

This talk follows a real refactoring experiment: adopting **OpenTelemetry Weaver** to turn telemetry management from a best-effort practice into a testable contract.

Instead of maintaining a 380-line style guide, Weaver enables:
- Defining telemetry standards in a single schema file
- Auto-generating documentation and builder patterns from that schema
- Validating that instrumentation complies with standards before it ships
- Evolving conventions without manual updates scattered across the codebase

The talk covers the full journey:
- **The problems**: Manual standards enforcement, documentation decay, no validation
- **The approach**: Schema-driven telemetry with Weaver
- **The trials**: Schema design decisions, integration challenges, real refactoring costs
- **The results**: Were standards actually more maintainable? Did developer experience improve? Was the effort worth it?

Presented with real traces, git diffs, and lessons from integrating Weaver into an existing production codebase.

---

**Format**: Personal journey + practical demo (25-30 min)
**Level**: Intermediate (assumes OpenTelemetry familiarity)
**Audience**: Platform engineers, SREs, DevOps teams managing telemetry standards
