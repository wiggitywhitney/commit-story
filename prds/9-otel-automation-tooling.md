# PRD-9: OpenTelemetry Automation & Developer Experience Tooling

**GitHub Issue**: [#10](https://github.com/wiggitywhitney/commit-story/issues/10)
**Status**: Planning
**Priority**: Medium
**Timeline**: 3-4 hours (across multiple phases)
**Dependencies**: **PRD-7 Phase 2** (Standards Module and Validation Script) must be complete

## Executive Summary

This PRD defines automated tooling to simplify OpenTelemetry instrumentation in the Commit Story project. The primary deliverable is an **AI-powered telemetry automation tool** that can be invoked as either a manual slash command (`/add-telemetry`) or an automatic agent that proactively instruments new code. The system extends PRD-7's standards module with dynamic convention discovery and enhances the validation script to support newly discovered conventions.

**Note**: This tooling supports the conference demo described in [Cloud Native Denmark 2025 Talk Outline](../docs/talks/cloud-native-denmark-2025-outline.md), specifically the auto-instrumentation agent demonstration.

## Context & Motivation

### Building on PRD-7 Foundation
PRD-7 established the core infrastructure:
- **Standards Module** (`src/telemetry/standards.js`) - Static OTEL conventions and builders
- **Validation Script** (`scripts/validate-telemetry.js`) - Compliance checking

PRD-9 adds **intelligent automation** on top of this foundation.

### Current Pain Points
- **Manual Convention Lookup**: Developers must manually search OTEL docs for applicable conventions
- **Error-Prone**: Easy to use wrong attribute names despite standards module
- **Static Standards**: Standards module only knows conventions we've manually added
- **Repetitive Work**: Same instrumentation patterns repeated across files

### Opportunity
Create an AI-powered slash command that:
- Discovers applicable OTEL conventions automatically
- Extends the standards module dynamically
- Generates correct instrumentation code using PRD-7's patterns
- Validates compliance using enhanced validation script

## Success Criteria

1. **Zero Manual Strings**: Developers never type telemetry attribute strings directly
2. **Convention Discovery**: Automatically finds and applies relevant OTEL conventions
3. **Standards Growth**: PRD-7's standards module expands as new conventions are discovered
4. **Validation Success**: All generated telemetry passes PRD-7's validation script
5. **Developer Velocity**: < 1 minute to add full instrumentation to a function
6. **Documentation Trail**: Clear record of which OTEL conventions are used where

## Implementation Approach: Agent vs Slash Command

### Context
In Claude Code, both "agents" and "slash commands" are AI-powered tools - the distinction is primarily in their invocation pattern and scope:

**Slash Command Pattern** (`/add-telemetry`)
- **Manual trigger**: Developer explicitly invokes the command
- **Targeted scope**: Instruments specific files or functions
- **Interactive**: Can ask questions and show options
- **Point-in-time**: Runs once when called

**Agent Pattern** (automatic instrumentation)
- **Automatic trigger**: Runs on file save, commit, or schedule
- **Comprehensive scope**: Finds and instruments all uninstrumented code
- **Proactive**: Makes decisions based on project patterns
- **Continuous**: Can monitor for changes and act on them

### Implementation Options
Both patterns can use the same underlying implementation with different invocation modes:
1. **Manual mode**: `/add-telemetry --file src/example.js`
2. **Auto mode**: `/add-telemetry --auto` (instruments all new code since last commit)
3. **Watch mode**: Could run automatically on triggers (file save, pre-commit, etc.)

### Decision Point
**To be decided during implementation**: Which invocation pattern(s) best fit the developer workflow?
- Option A: Start with manual slash command, add automatic mode later
- Option B: Build both modes simultaneously
- Option C: Focus entirely on automatic agent behavior

See Architecture Decision AD-005 (below) for tracking this decision.

## Technical Requirements

### Functional Requirements

#### 1. Telemetry Automation Tool (Slash Command and/or Agent)
**Main Deliverable**: AI-powered tool that automates telemetry addition via multiple invocation patterns

**Process Steps**:
1. **Discovery Phase**: Auto-detect target functions (like `/prd-update-progress` does)
2. **Convention Research**: Query OTEL semantic conventions for operation type
3. **Standards Extension**: Add new conventions to PRD-7's standards module
4. **Code Generation**: Use PRD-7's OTEL.span.* and OTEL.attrs.* builders
5. **Validation**: Run PRD-7's validation script on results

#### 2. Standards Module Extensions (builds on PRD-7)
**Extends**: `src/telemetry/standards.js` from PRD-7 Phase 2.1

**New Features**:
- Dynamic convention registration
- Metadata tracking (source, version, stability)
- Builder function generation for new conventions
- Convention lookup by operation type

#### 3. Convention Discovery System
**Purpose**: Find applicable OTEL conventions for any operation type

**Capabilities**:
- Query OTEL semantic conventions v1.37.0+
- Cache conventions locally for offline use
- Track stability levels (stable/experimental)
- Identify gaps requiring custom `commit_story.*` attributes

#### 4. Enhanced Validation (extends PRD-7)
**Extends**: `scripts/validate-telemetry.js` from PRD-7 Phase 2.4

**New Features**:
- Check against dynamically discovered conventions
- Report unknown attributes that might have OTEL equivalents
- Suggest applicable conventions for custom attributes
- Validate newly added conventions

### Non-Functional Requirements
- **Performance**: Convention lookup < 500ms
- **Reliability**: Graceful fallback if OTEL docs unavailable
- **Compatibility**: Works with all existing PRD-7 instrumentation
- **Maintainability**: Clear extension points, comprehensive tests

## Implementation Phases

### Phase 1: Standards Module Extensibility
**Timeline**: 1 hour
**Priority**: High
**Dependencies**: PRD-7 Phase 2.1 (Standards Module) complete

#### Deliverables
- [ ] Extend PRD-7's standards module with dynamic convention support
- [ ] Add convention metadata tracking (source, version, stability)
- [ ] Create builder function generator for new conventions
- [ ] Maintain compatibility with existing PRD-7 instrumentation
- [ ] Test dynamic convention addition

#### Technical Design
```javascript
// Enhanced src/telemetry/standards.js (extends PRD-7)
export const OTEL = {
  // Existing static conventions from PRD-7
  NAMESPACE: 'commit_story',
  span: { /* existing from PRD-7 */ },
  attrs: { /* existing from PRD-7 */ },

  // NEW: Dynamic extension system
  dynamicConventions: new Map(),

  // NEW: Add convention at runtime
  addConvention(path, builder, metadata) {
    this.dynamicConventions.set(path, {
      builder,
      source: metadata.source || 'otel-docs',
      version: metadata.version || 'v1.37.0',
      stability: metadata.stability || 'unknown',
      addedDate: new Date(),
      addedBy: 'add-telemetry-command'
    });

    // Update JSDoc documentation
    this._generateJSDoc(path, metadata);
  },

  // NEW: Get conventions for operation type
  getConventionsFor(operationType) {
    // Returns both static (PRD-7) and dynamic conventions
    const static = this._getStaticConventions(operationType);
    const dynamic = this._getDynamicConventions(operationType);
    return { static, dynamic, combined: [...static, ...dynamic] };
  }
};
```

#### Integration with PRD-7
- **Preserves existing**: All PRD-7 Phase 2 functionality unchanged
- **Extends cleanly**: New methods don't interfere with existing ones
- **Maintains patterns**: Uses same OTEL.attrs.* builder approach

### Phase 2: Convention Discovery System
**Timeline**: 1.5 hours
**Priority**: High
**Dependencies**: Phase 1 complete, internet access for OTEL docs

#### Deliverables
- [ ] Create OTEL convention query system
- [ ] Build operation type detection (file I/O, network, AI, etc.)
- [ ] Implement convention recommendation engine
- [ ] Add stability level tracking and warnings
- [ ] Create local cache for offline usage

#### Convention Categories
```javascript
const OPERATION_TYPES = {
  'file': {
    patterns: ['fs.', 'readFile', 'writeFile', 'path.'],
    conventions: ['file.*', 'system.filesystem.*']
  },
  'network': {
    patterns: ['http', 'fetch', 'axios', 'request'],
    conventions: ['http.*', 'net.*', 'network.*']
  },
  'ai': {
    patterns: ['openai', 'chat.completions', 'anthropic'],
    conventions: ['gen_ai.*']
  },
  'process': {
    patterns: ['spawn', 'exec', 'git ', 'npm ', 'command'],
    conventions: ['process.*', 'subprocess.*']
  },
  'database': {
    patterns: ['query', 'SELECT', 'INSERT', 'UPDATE'],
    conventions: ['db.*', 'sql.*']
  }
};
```

#### Discovery Process
1. **Analyze Code**: Parse function/file to identify operation types
2. **Query Cache**: Check local convention cache first
3. **Fetch Updates**: Get latest from OTEL docs if online
4. **Filter Applicable**: Return relevant conventions for detected operations
5. **Generate Builders**: Create new OTEL.attrs.* functions

### Phase 3: `/add-telemetry` Command Implementation
**Timeline**: 1.5 hours
**Priority**: Medium
**Dependencies**: Phase 2 complete, PRD-7 Phase 2.4 (validation script)

#### Command Specification

**File**: `prompts/add-telemetry.md` (or similar)

**Command Usage**:
```bash
/add-telemetry [options]

Options:
  --file <path>      Target specific file (manual mode)
  --function <name>  Target specific function (manual mode)
  --auto             Auto-detect from recent git changes (agent mode)
  --watch            Monitor for changes and auto-instrument (agent mode)
  --since <commit>   Instrument all changes since specified commit
  --dry-run          Show changes without applying
```

**Agent Mode Triggers** (when implemented):
- On file save (if --watch enabled)
- Pre-commit hook
- Post-merge instrumentation
- Manual trigger via --auto flag

#### Multi-Step Process (AI Prompt Logic)

**Step 1: Discovery**
```markdown
## Step 1: Target Discovery
1. If --auto: analyze recent git commits for new/modified functions
2. If --file specified: scan file for uninstrumented functions
3. If --function specified: locate specific function
4. Cross-reference with PRD tasks (like /prd-update-progress does)
5. Present options to user for confirmation
```

**Step 2: Convention Research**
```markdown
## Step 2: OTEL Convention Analysis
1. Parse target function code to identify operation types
2. Query convention discovery system for applicable standards
3. Check PRD-7 standards module for existing coverage
4. Identify new conventions to add vs existing builders to use
5. Report stability levels and recommend approach
```

**Step 3: Standards Extension**
```markdown
## Step 3: Extend Standards Module (if needed)
1. Add newly discovered conventions to PRD-7 standards module
2. Generate builder functions following PRD-7 patterns
3. Document source and stability level
4. Test new builders generate correct attributes
```

**Step 4: Code Generation**
```markdown
## Step 4: Generate Instrumentation Code
1. Import OTEL from PRD-7 standards module
2. Add span using OTEL.span.* pattern
3. Add attributes using OTEL.attrs.* builders (existing + new)
4. Follow PRD-7 error handling patterns
5. Maintain existing code functionality
```

**Step 5: Validation**
```markdown
## Step 5: Validate Results
1. Run PRD-7's validation script on modified files
2. Check convention compliance (both static and dynamic)
3. Report any issues found
4. Suggest fixes if validation fails
```

#### Example Session
```
User: /add-telemetry --file src/collectors/git-collector.js

AI: Found 2 uninstrumented functions in git-collector.js:
    1. collectGitData() - Process operations (git commands)
    2. parseGitOutput() - Data processing

Checking OTEL conventions for process operations...
✓ Found: process.command (stable)
✓ Found: process.exit_code (stable)
✓ Found: process.command.args (experimental)

Adding to standards module:
+ OTEL.attrs.process.command()
+ OTEL.attrs.process.exitCode()
+ OTEL.attrs.process.commandArgs() [experimental]

Instrumenting collectGitData():
+ Added OTEL.span.collectors.git()
+ Added process.* attributes via new builders
+ Added commit_story.* custom attributes

Running validation... ✅ All checks passed

Summary:
- 1 function instrumented
- 3 new OTEL conventions added
- 0 validation errors
- Ready for testing with npm run trace:test
```

### Phase 4: Enhanced Validation & Testing
**Timeline**: 30 minutes
**Priority**: Low
**Dependencies**: Phase 3 complete, PRD-7 validation script exists

#### Deliverables
- [ ] Enhance PRD-7's validation script for dynamic conventions
- [ ] Add convention compliance reporting
- [ ] Create coverage analysis for standards module usage
- [ ] Update npm scripts for enhanced validation
- [ ] Document validation process

#### Enhanced Validation Features
**Extends**: `scripts/validate-telemetry.js` from PRD-7 Phase 2.4

**New Checks**:
- Validate dynamically added conventions are used correctly
- Report coverage: static vs dynamic convention usage
- Suggest OTEL conventions for custom attributes
- Check for experimental convention usage (warn but don't fail)
- Verify new conventions have proper JSDoc

**New Reports**:
- Convention discovery success rate
- Standards module growth over time
- Validation compliance trends
- Dynamic vs static attribute usage

## Architecture Decisions

### AD-001: Extend PRD-7 Standards Module vs Create New
**Decision**: Extend the existing standards module from PRD-7
**Rationale**:
- Preserves all existing functionality
- Maintains consistency in usage patterns
- Single source of truth for all conventions
- Natural evolution rather than replacement

### AD-002: AI Prompt vs Traditional CLI Tool
**Decision**: Implement as AI prompt (slash command)
**Rationale**:
- Consistent with project's existing automation (like `/prd-update-progress`)
- AI can make intelligent decisions about applicability
- Natural language feedback and suggestions
- Easier to extend and modify than compiled tools

### AD-003: Local Convention Cache vs Live Queries
**Decision**: Hybrid approach with local cache and online updates
**Rationale**:
- Works offline during development
- Faster response times
- Can update to latest conventions when online
- Graceful degradation if docs unavailable

### AD-004: Convention Discovery Scope
**Decision**: Focus on commonly used operations (file, network, AI, process)
**Rationale**:
- Covers 90% of use cases in this project
- Manageable initial scope
- Easy to expand categories later
- Clear success criteria

### AD-005: Invocation Pattern - Manual Command vs Automatic Agent
**Decision**: [TO BE DETERMINED DURING IMPLEMENTATION]
**Options Under Consideration**:
1. **Manual-first approach**: Start with slash command, add automation later based on usage patterns
2. **Dual-mode approach**: Support both manual and automatic from the start
3. **Agent-first approach**: Focus on automatic instrumentation for conference demo impact

**Factors to Consider**:
- Developer workflow preferences
- Conference demo requirements (see [Cloud Native Denmark talk outline](../docs/talks/cloud-native-denmark-2025-outline.md))
- Ease of implementation and testing
- Risk of over-automation vs under-automation

**Decision Date**: To be decided during Phase 3 implementation

## Dependencies

### Hard Dependencies (Required)
- **PRD-7 Phase 2.1**: Standards module must exist
- **PRD-7 Phase 2.4**: Validation script must exist
- **OpenTelemetry research**: DD-011 documentation from PRD-7

### Soft Dependencies (Preferred)
- **PRD-7 Phase 2.3**: All existing instrumentation migrated to standards module
- **Internet access**: For convention updates (has offline fallback)
- **Git history**: For auto-detection feature

## Risk Mitigation

### Technical Risks

1. **OTEL Convention Changes**
   - **Risk**: Semantic conventions evolve, cached data becomes stale
   - **Mitigation**: Version tracking, update notifications, stability warnings

2. **Standards Module Conflicts**
   - **Risk**: Dynamic additions conflict with static conventions
   - **Mitigation**: Namespace separation, conflict detection, validation

3. **Performance Impact**
   - **Risk**: Convention discovery slows down instrumentation
   - **Mitigation**: Caching, async operations, lazy loading

### Process Risks

1. **Developer Adoption**
   - **Risk**: Team doesn't use automated tooling
   - **Mitigation**: Clear documentation, obvious value proposition

2. **Maintenance Burden**
   - **Risk**: Complex system becomes hard to maintain
   - **Mitigation**: Clean architecture, comprehensive tests, good docs

## Success Metrics

### Quantitative Metrics
1. **Automation Rate**: % of new telemetry added via `/add-telemetry`
2. **Convention Coverage**: # of OTEL conventions in standards module
3. **Validation Pass Rate**: % of telemetry passing enhanced validation
4. **Time Savings**: Minutes saved per instrumentation task

### Qualitative Metrics
1. **Developer Experience**: Ease of adding correct telemetry
2. **Code Quality**: Reduction in manual string literals
3. **Standard Compliance**: Adherence to OTEL conventions
4. **Knowledge Transfer**: Team understanding of OTEL patterns

## Open Questions for Implementation

1. **Invocation Pattern**: Should this be a manual slash command, automatic agent, or both?
2. **Automatic Triggers**: What events should trigger automatic instrumentation?
3. **Developer Control**: How to balance automation with explicit developer control?
4. **Performance Impact**: Will automatic instrumentation slow down the development flow?
5. **Scope Management**: How to prevent over-instrumentation in automatic mode?

## Future Enhancements

### Potential Extensions
- **Auto-instrumentation suggestions**: Proactive recommendations
- **Coverage analysis**: Visual reports of instrumentation gaps
- **CI/CD integration**: Automatic validation in pull requests
- **Dashboard generation**: Auto-create monitoring views from telemetry
- **Multi-language support**: Extend patterns to other languages
- **IDE integration**: Real-time instrumentation hints in the editor

## Work Log

### Pre-Implementation Planning
**Focus**: Requirements analysis and architecture design based on PRD-7 foundation

**Analysis Completed**:
- [x] Reviewed PRD-7 standards module design
- [x] Identified extension points for dynamic conventions
- [x] Designed slash command specification
- [x] Planned integration with existing validation script

**Next Steps**:
- Begin Phase 1 once PRD-7 Phase 2 is complete
- Test extension patterns don't break existing functionality
- Validate convention discovery approach with sample operations

---

**PRD Created**: September 18, 2025
**Last Updated**: September 21, 2025
**Document Version**: 1.1

### Version History
- v1.1 (Sept 21): Added agent vs slash command discussion, referenced conference talk outline
- v1.0 (Sept 18): Initial PRD creation