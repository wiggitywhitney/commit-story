# PRD-9: OpenTelemetry Automation & Developer Experience Tooling

**GitHub Issue**: [#10](https://github.com/wiggitywhitney/commit-story/issues/10)
**Status**: Planning
**Priority**: Medium
**Timeline**: 3-4 hours (across multiple phases)
**Dependencies**: **PRD-7 Phase 2** (Standards Module and Validation Script) must be complete

## Executive Summary

This PRD defines automated tooling to simplify OpenTelemetry instrumentation in the Commit Story project. The primary deliverable is an **AI-powered `/add-telemetry` slash command** that analyzes uninstrumented code, queries OpenTelemetry semantic conventions, and generates proper instrumentation using the established standards module patterns. When new conventions are needed, the tool adds them statically to the standards module to maintain the project's "no hardcoded strings" principle.

**Note**: This tooling supports the conference demo described in [Cloud Native Denmark 2025 Talk Outline](../docs/talks/cloud-native-denmark-2025-outline.md), specifically the auto-instrumentation agent demonstration.

## Context & Motivation

### Building on PRD-7 Foundation
PRD-7 established the core infrastructure:
- **Standards Module** (`src/telemetry/standards.js`) - Static OTEL conventions and builders
- **Validation Script** (`scripts/validate-telemetry.js`) - Compliance checking

PRD-9 adds **intelligent automation** that leverages and extends this foundation when needed.

### Current Pain Points
- **Manual Convention Lookup**: Developers must manually search OTEL docs for applicable conventions
- **Error-Prone**: Easy to use wrong attribute names despite standards module
- **Limited Coverage**: Standards module may be missing some needed OTEL semantic conventions
- **Repetitive Work**: Same instrumentation patterns repeated across files

### Opportunity
Create an AI-powered slash command that:
- Discovers applicable OTEL conventions from official documentation
- Adds missing conventions to the standards module statically when needed
- Generates correct instrumentation code using PRD-7's established patterns
- Validates compliance using enhanced validation script

## Success Criteria

1. **Zero Manual Strings**: Developers never type telemetry attribute strings directly
2. **Convention Discovery**: Automatically finds and applies relevant OTEL conventions from official docs
3. **Standards Completeness**: PRD-7's standards module gains any missing conventions through static additions
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

#### 2. Static Standards Module Additions (builds on PRD-7)
**Extends**: `src/telemetry/standards.js` from PRD-7 Phase 2.1

**New Capabilities**:
- Missing convention identification through code analysis
- OTEL semantic convention querying from official documentation
- Static builder code generation following established patterns
- Seamless integration with existing builder architecture

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

### Phase 1: Convention Analysis and Gap Identification
**Timeline**: 30 minutes
**Priority**: High
**Dependencies**: PRD-7 Phase 2.1 (Standards Module) complete

#### Deliverables
- [ ] Analyze existing standards.js coverage against PRD-17 uninstrumented code
- [ ] Identify missing OTEL semantic conventions needed
- [ ] Create list of builders to add to standards.js
- [ ] Validate that existing patterns can handle most cases
- [ ] Document convention addition process

#### Gap Analysis Focus
**Target Code**: PRD-17 reflection system functions
- `discoverReflections()` - File I/O operations
- `parseReflectionFile()` - File parsing and processing
- `parseReflectionTimestamp()` - Date/time parsing

#### Expected Findings
**Likely Missing Conventions** (to be verified):
- `file.operation` - Type of file operation (read, write, parse)
- `file.size` - File size metrics
- Additional time-based attributes for reflection processing

**Existing Adequate Coverage**:
- File paths: `'code.filepath'` already documented in TELEMETRY.md
- Journal operations: `OTEL.span.utils.journal_paths.*` already exists
- Basic span patterns: Well-established in existing codebase

### Phase 2: Static Convention Addition System
**Timeline**: 1 hour
**Priority**: High
**Dependencies**: Phase 1 complete, internet access for OTEL docs

#### Deliverables
- [ ] Create OTEL semantic convention query capability
- [ ] Build operation type detection for code analysis
- [ ] Implement static builder code generation
- [ ] Add missing conventions to standards.js based on Phase 1 analysis
- [ ] Test new builders follow existing patterns

#### Static Addition Process
1. **Detect Operation Types**: Parse function code for file I/O, network, etc.
2. **Query OTEL Docs**: Find applicable semantic conventions online
3. **Generate Builder Code**: Create properly formatted builder functions
4. **Add to Standards Module**: Insert new builders into standards.js statically
5. **Validate Integration**: Ensure new builders work with existing patterns

#### Builder Code Generation
**Example Output for File Operations**:
```javascript
// Generate this code to add to OTEL.attrs in standards.js:
file: {
  operation: (op) => ({ 'file.operation': op }),
  size: (bytes) => ({ 'file.size': bytes }),
  path: (path) => ({ 'file.path': path }) // If not covered by code.filepath
}
```

#### Integration Points
- **Preserve existing patterns**: Follow OTEL.attrs.* structure exactly
- **Maintain builder consistency**: Same parameter patterns as existing builders
- **Update JSDoc documentation**: Add proper documentation for new builders
- **Version control**: All additions are explicit commits to standards.js

### Phase 3: `/add-telemetry` Command Implementation
**Timeline**: 1 hour
**Priority**: High
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

**Step 3: Static Standards Addition**
```markdown
## Step 3: Add Missing Builders to Standards Module
1. Generate builder code for discovered conventions
2. Add builders to standards.js following existing patterns
3. Document source and stability level in comments
4. Commit changes to standards.js with clear commit message
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

#### Real-World Test Case (PRD-17 Code)
```
User: /add-telemetry --file src/managers/journal-manager.js

AI: Found 3 uninstrumented functions in journal-manager.js:
    1. discoverReflections() - File I/O, async processing, time filtering
    2. parseReflectionFile() - String processing, file parsing
    3. parseReflectionTimestamp() - Date parsing, timezone handling

Analyzing operations...
✓ File I/O operations detected → file.* conventions needed
✓ Time-sensitive logic detected → performance metrics needed
✓ Async processing detected → proper span lifecycle required

Checking OTEL conventions for file operations...
✓ Found: file.path (stable)
✓ Found: file.operation (stable)
✓ Found: file.size (experimental)

Adding to standards module:
+ OTEL.span.journal.discover_reflections()
+ OTEL.span.reflection.parse_file()
+ OTEL.span.reflection.parse_timestamp()
+ OTEL.attrs.reflection.timeWindow()
+ OTEL.metrics for reflection discovery duration and counts

Instrumenting functions:
+ discoverReflections(): Added file I/O span with time window attributes
+ parseReflectionFile(): Added parsing span with file attributes
+ parseReflectionTimestamp(): Added timestamp parsing span
+ Added proper metrics for discovery performance tracking

Running validation... ✅ All checks passed
Testing against PRD-17 requirements... ✅ Matches TELEMETRY.md patterns

Summary:
- 3 functions instrumented (real production code from PRD-17)
- 4 new conventions added
- 5 metrics added for reflection system observability
- Validates agent can handle authentic uninstrumented code
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
- [ ] **Validate PRD-17 test case**: Ensure agent successfully instruments all reflection system functions per DD-001

#### Enhanced Validation Features
**Extends**: `scripts/validate-telemetry.js` from PRD-7 Phase 2.4

**New Checks**:
- Validate newly added conventions are used correctly
- Suggest OTEL conventions for any remaining custom attributes
- Check for experimental convention usage (warn but don't fail)
- Verify new conventions have proper JSDoc and follow naming patterns
- Ensure all builders use semantic convention patterns

**New Reports**:
- Convention coverage analysis (what % of operations have proper OTEL conventions)
- Standards module completeness (gaps in coverage)
- Validation compliance trends over time

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
**Decision**: Manual slash command approach
**Rationale**:
- Consistent with project's existing tooling patterns
- Explicit control over when instrumentation occurs
- Easier to validate and debug output
- Reduces complexity compared to automatic triggers

**Status**: ✅ Decided - September 26, 2025

### AD-006: Dynamic vs Static Convention Management
**Decision**: Static convention addition through `/add-telemetry` command modifications
**Rationale**:
- **Maintains "no hardcoded strings" principle**: All telemetry uses builders from standards.js
- **Preserves AI-friendly architecture**: Future AI instances see all conventions in one static module
- **Version controlled**: New conventions are explicit, reviewable commits
- **Simpler maintenance**: No runtime complexity or persistent storage requirements
- **Query OTEL docs when needed**: But only to generate static code additions, not runtime lookups
- **Existing coverage**: Analysis shows standards.js already covers most needed operations

**Implementation Approach**:
1. `/add-telemetry` detects missing conventions
2. Queries OTEL docs for semantic conventions
3. Generates builder code for standards.js
4. Adds builders statically to standards.js
5. Uses new builders to instrument code

**Status**: ✅ Decided - September 26, 2025

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
   - **Risk**: Semantic conventions evolve, statically added conventions become outdated
   - **Mitigation**: Static additions are version-controlled and easy to update, stability level tracking in comments

2. **Standards Module Integration**
   - **Risk**: New static additions break existing instrumentation patterns
   - **Mitigation**: Code generation follows exact existing patterns, comprehensive testing of new builders

3. **Convention Query Failures**
   - **Risk**: OTEL docs unavailable when discovering new conventions
   - **Mitigation**: Graceful fallback to manual convention specification, offline operation capability

### Process Risks

1. **Developer Adoption**
   - **Risk**: Team doesn't use automated tooling
   - **Mitigation**: Clear documentation, obvious value proposition

2. **Maintenance Burden**
   - **Risk**: Added complexity makes the system harder to maintain
   - **Mitigation**: Simplified static approach, comprehensive documentation, clear separation of concerns

## Design Decisions

### DD-001: Real-World Training Dataset from PRD-17 Implementation
**Decision**: Use the uninstrumented reflection system code from PRD-17 as authentic training/testing material for the telemetry agent

**Context**: During PRD-17 (Manual Reflection Tool) implementation, significant functionality was added without telemetry instrumentation, creating a perfect real-world scenario for testing the auto-instrumentation agent.

**Uninstrumented Code Created (Perfect Test Cases)**:
- **`src/managers/journal-manager.js`**:
  - `discoverReflections()` function - File I/O operations, async processing, time window logic
  - `parseReflectionFile()` function - File parsing, string processing, time filtering
  - `parseReflectionTimestamp()` function - Date parsing, timezone handling
  - Modified `saveJournalEntry()` - Added reflection discovery without tracing the call
  - Modified `formatJournalEntry()` - Added reflection formatting without spans

- **`src/integrators/context-integrator.js`**:
  - Added `previousCommit` context integration without instrumentation
  - Context object enhancement lacks telemetry tracking

**Required Instrumentation (Agent Test Output)**:

**File I/O Operations**:
```javascript
// src/managers/journal-manager.js - discoverReflections()
return await tracer.startActiveSpan(OTEL.span.journal.discover_reflections(), {
  attributes: {
    [`${OTEL.NAMESPACE}.reflection.time_window_start`]: startTime.toISOString(),
    [`${OTEL.NAMESPACE}.reflection.time_window_end`]: commitTime.toISOString(),
    [`${OTEL.NAMESPACE}.reflection.days_to_check`]: daysToCheck,
    'file.operation': 'read'
  }
}, async (span) => {
  // Add metrics for reflection discovery
  OTEL.metrics.histogram('commit_story.reflection.discovery_duration_ms', Date.now() - startTime);
  OTEL.metrics.gauge('commit_story.reflection.files_checked', daysToCheck);
  OTEL.metrics.gauge('commit_story.reflection.reflections_found', reflections.length);
});
```

**String Processing Operations**:
```javascript
// parseReflectionFile() needs span for file parsing
OTEL.span.reflection.parse_file(), {
  attributes: {
    'file.path': filePath,
    'file.size': content.length,
    [`${OTEL.NAMESPACE}.reflection.time_window_duration_ms`]: endTime - startTime
  }
}

// parseReflectionTimestamp() needs span for date parsing
OTEL.span.reflection.parse_timestamp(), {
  attributes: {
    [`${OTEL.NAMESPACE}.reflection.time_string`]: timeString,
    [`${OTEL.NAMESPACE}.reflection.timezone`]: timezone
  }
}
```

**Context Operations**:
```javascript
// src/integrators/context-integrator.js - previousCommit addition
span.setAttributes({
  [`${OTEL.NAMESPACE}.context.has_previous_commit`]: !!previousCommit,
  [`${OTEL.NAMESPACE}.context.time_window_duration_ms`]: previousCommit ?
    currentCommit.timestamp - previousCommit.timestamp : null
});
```

**Why This Is Valuable**:
- **Authentic Test Case**: Real production code that should be instrumented but isn't
- **System Context Available**: Existing telemetry patterns in codebase for agent to learn from
- **Complexity Variety**: Simple parsing functions to complex file I/O with time logic
- **Quality Benchmark**: Agent output can be validated against established TELEMETRY.md standards
- **Before/After Evidence**: Current uninstrumented state vs expected instrumented output

**Implementation Requirements**:
- Agent must detect file I/O operations and add appropriate `file.*` semantic attributes
- Time-sensitive operations need duration metrics and timing spans
- Context modifications require attribute tracking
- All instrumentation must follow existing TELEMETRY.md patterns
- Generated code must pass PRD-7's validation script

**Status**: Outstanding - requires Phase 3 agent implementation

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