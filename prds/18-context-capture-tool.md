# PRD-18: Context Capture Tool for AI Working Memory

**GitHub Issue**: [#18](https://github.com/wiggitywhitney/commit-story/issues/18)
**Status**: In Progress (Started 2025-10-13)
**Created**: 2025-09-21
**Last Updated**: 2025-10-13
**Priority**: Active Development - Core functionality implementation

## Summary

Create an MCP tool that allows AI assistants to capture working context and intermediate findings during development sessions. This provides temporary working memory that enhances journal generation while maintaining clear separation from permanent journal entries and human reflections.

## Problem Statement

### Current Gap in Documentation System

The current Commit Story system has:
- **Journal Entries**: Automated commit narratives (permanent)
- **Reflections**: Human insights and thoughts (permanent)
- **Missing**: AI working memory and session context

### Real-World Scenario

During a 3-hour debugging session, valuable context accumulates:
- Attempts made and their results
- Intermediate discoveries
- Current understanding of the problem space
- Next steps being considered

This context is valuable for:
1. **Current session**: Keeping track of "plates spinning"
2. **Journal generation**: Providing richer context for automated narratives
3. **Session continuity**: Resuming work after interruptions

But it's not appropriate for permanent storage like reflections or journal entries.

## Success Criteria

1. **Seamless Capture**: MCP tool accessible directly from AI assistant interface
2. **Automatic Organization**: Context organized by date and optional session naming
3. **Manual Management**: Context files kept indefinitely, users delete when needed
4. **Journal Integration**: Journal generator can read context files for enhanced narratives
5. **Clean Separation**: Context files clearly distinguished from permanent content
6. **Session Management**: Support for multiple concurrent work sessions

## Technical Requirements

### Core Functionality
- **Input**: Accept AI-generated context text via MCP tool
- **Storage**: Save to dedicated context directory (`journal/context/`)
- **Naming**: Timestamp-based with optional session identifier
- **Format**: Consistent visual formatting matching journal style
- **Retention**: Files kept indefinitely, manual deletion by user

### Integration Points
- **Journal Generator Enhancement**: Read available context files during journal creation
- **Configuration System**: Respect existing config patterns (minimal config needed)
- **Directory Management**: Create and maintain context directory structure

### MCP Tool Interface

```javascript
// Primary context capture
journal_capture_context({
  text: "Current debugging context: tried X, found Y, next attempting Z",
  session: "datadog-integration",  // Optional session identifier
  timestamp: "optional-override"   // Defaults to current time
})

// Context append (add to existing session)
journal_append_context({
  text: "Update: Z approach failed, trying W instead",
  session: "datadog-integration"
})
```

## Design Decisions

### DD-001: Directory Structure
**Decision**: Use `journal/context/` with date-based organization

```
journal/
  context/
    2025-09-21-debugging-session.md
    2025-09-21-feature-implementation.md
    2025-09-20-performance-analysis.md
```

**Rationale**:
- Flat structure for easy cleanup and discovery
- Date prefix enables chronological sorting
- Session suffix allows multiple contexts per day
- Consistent with existing journal directory patterns

### DD-002: Context File Retention - Keep Forever (Updated 2025-10-13)
**Decision**: Context files are kept indefinitely. Users manually delete files when no longer needed.

**Rationale**:
- **Simplicity**: No auto-deletion logic, configuration, or edge cases to handle
- **User control**: Users decide what to keep, when to delete
- **Low friction**: Manual file deletion is trivial (`rm journal/context/old-file.md`)
- **No surprises**: Files never disappear unexpectedly
- **Appropriate scope**: Auto-deletion adds complexity for uncertain value

**User Experience**:
- Context files accumulate in `journal/context/`
- Users can manually delete old files anytime
- No configuration needed for retention
- Clear, predictable behavior

**Future Consideration**: If auto-deletion becomes needed, see "Deferred Features" section for a designed approach.

### DD-003: Session Management
**Decision**: Optional session naming with automatic fallback

**Format**: `YYYY-MM-DD-{session-name || 'context'}.md`

**Rationale**:
- Supports multiple concurrent work sessions
- Automatic naming prevents decision fatigue
- Session names improve context organization
- Date prefix maintains chronological order

### DD-004: Journal Integration Points
**Decision**: Journal generator reads available context files for current commit date

**Integration**:
- Journal generator scans `journal/context/` for files matching commit date
- Context content used to enhance narrative depth and accuracy
- No automatic inclusion - journal generator decides relevance
- Context files referenced in journal entries when utilized

**Rationale**:
- Provides richer source material for journal generation
- Maintains journal generator autonomy in content selection
- Creates valuable feedback loop between working memory and final narrative

### DD-005: Milestone-Based Implementation Strategy
**Decision**: Break Phase 1 into four incremental milestones instead of single monolithic implementation
**Date**: 2025-10-13

**Milestones**:
1. **M1: Basic Context Tool** (30-45 min) - Minimal working tool with file creation
2. **M2: Session Management** (20-30 min) - Handle multiple sessions and appending
3. **M3: MCP Server Integration** (15-20 min) - Register tool and make callable
4. **M4: Format & Polish** (20-30 min) - Match PRD format specifications

**Rationale**:
- Incremental progress with testable checkpoints at each milestone
- Reduces risk by validating each piece before moving forward
- Easier to pause/resume work between milestones
- Clear definition of "done" for each step
- Enables early testing of core functionality before polish

**Impact**: Phase 1 tasks reorganized into milestone structure (see Implementation Plan below)

### DD-006: Telemetry-Last Approach
**Decision**: Implement core functionality first, add telemetry separately afterward
**Date**: 2025-10-13

**Approach**:
- Build context tool without OpenTelemetry instrumentation initially
- Use `/add-telemetry` slash command after core functionality works
- Follow same telemetry patterns as reflection-tool.js once added

**Rationale**:
- Separates concerns: get feature working first, then add observability
- Leverages existing `/add-telemetry` automation for consistent patterns
- Reduces initial implementation complexity
- Allows focus on business logic without telemetry boilerplate
- Proven reflection-tool.js pattern available as reference when adding telemetry

**Impact**:
- Removes telemetry implementation from Phase 1 milestones
- Phase 4 will include telemetry addition via `/add-telemetry` command
- Estimated time savings: ~30-45 minutes in initial implementation

### DD-007: Code Reuse for Journal Integration (DRY Principle)
**Decision**: Generalize existing reflection discovery/parsing code to work for both reflections AND context files
**Date**: 2025-10-13

**Current State**:
- `journal-manager.js` has `discoverReflections()` and `parseReflectionFile()`
- These functions find and parse reflection files within commit time windows
- Context files need identical discovery/parsing logic (same file format, same time windows)

**Refactoring Approach**:
```javascript
// BEFORE (reflection-specific)
discoverReflections(commitTime, previousCommitTime)
parseReflectionFile(content, fileDate, startTime, endTime)

// AFTER (generalized)
discoverJournalFiles(type, commitTime, previousCommitTime)  // type = 'reflections' | 'context'
parseJournalFile(type, content, fileDate, startTime, endTime)
```

**Implementation Tasks** (Phase 2, M2.1):
1. Extract common logic from `discoverReflections()` into `discoverJournalFiles(type, ...)`
2. Extract common logic from `parseReflectionFile()` into `parseJournalFile(type, ...)`
3. Update existing reflection code to use new generic functions (ensure no regression)
4. Add context file support using same functions
5. Test both reflections and context discovery/parsing

**Rationale**:
- **DRY**: Single implementation for file discovery and parsing logic
- **Consistency**: Reflections and context handled identically
- **Maintainability**: Bug fixes/improvements apply to both file types
- **Reduced complexity**: Less code to maintain and test
- **Safe refactoring**: Existing reflection code tested first, then generalized

**Risk Mitigation**:
- Test existing reflection functionality after refactoring (no regression)
- Keep file format identical between reflections and context for easy reuse
- If generalization proves complex, fall back to separate `discoverContext()` function

**Impact**: Phase 2 milestones must include refactoring tasks, not just new code

## Implementation Plan

### Phase 1: Core MCP Tool (Milestone-Based per DD-005)

#### Milestone 1: Basic Context Tool (30-45 min)
- [ ] Create `src/mcp/tools/context-tool.js` with basic structure
- [ ] Implement input validation (text required, optional session/timestamp)
- [ ] Create basic context file writer
- [ ] Use existing `journal-paths.js` utilities for path generation
- [ ] Return success/error messages
- **Success Criteria**: Tool creates a context file in `journal/context/`

#### Milestone 2: Session Management (20-30 min)
- [ ] Implement session naming logic: `YYYY-MM-DD-{session || 'context'}.md`
- [ ] Handle file existence check (append vs create new)
- [ ] Add timestamp headers for each capture
- [ ] Add separator bars between entries
- **Success Criteria**: Multiple sessions per day work, appending to same session works

#### Milestone 3: MCP Server Integration (15-20 min)
- [ ] Import context tool in `src/mcp/server.js`
- [ ] Add to tool handlers registry
- [ ] Add tool description and schema to tools list
- **Success Criteria**: Tool appears in AI assistant and can be invoked

#### Milestone 4: Format & Polish (20-30 min)
- [ ] Format headers: `## HH:MM:SS [TIMEZONE] - Context Capture: {session-name}`
- [ ] Ensure separator bars match reflection format
- [ ] Add clear error messages for validation failures
- [ ] Test edge cases (empty text, invalid timestamps, etc.)
- **Success Criteria**: Files match PRD format specification exactly

#### Milestone 5: README Documentation (15-20 min)
- [ ] Add `journal_capture_context` tool to README
- [ ] Mirror documentation style from reflection tool section
- [ ] Include basic usage example
- **Success Criteria**: Tool documented in README, simple and straightforward

### Phase 2: Journal Integration (Milestone-Based per DD-007)

#### Milestone 2.1: Refactor for DRY (45-60 min)
- [ ] Extract `discoverReflections()` → `discoverJournalFiles(type, commitTime, previousCommitTime)`
- [ ] Extract `parseReflectionFile()` → `parseJournalFile(type, content, fileDate, startTime, endTime)`
- [ ] Update existing reflection code to use new generic functions
- [ ] Test reflection discovery/parsing (ensure no regression)
- **Success Criteria**: Reflections still work using generalized functions

#### Milestone 2.2: Context Discovery (20-30 min)
- [ ] Add 'context' type support to `discoverJournalFiles()`
- [ ] Use existing path utilities with type='context'
- [ ] Test context file discovery for commit time windows
- **Success Criteria**: Context files discovered correctly for given commit dates

#### Milestone 2.3: Narrative Integration Planning (Discussion & Design - 30-45 min)
**Purpose**: Design how context integrates into journal generation before implementing

**Current Understanding**:
- Journal generation has 3 separate generators: summary, dialogue, technical decisions
- Context likely NOT needed for dialogue generator
- Context format can be consistent (no special formatting per generator)

**Design Questions to Discuss:**
- [ ] Which generators get context? (Summary + Technical Decisions? Just one?)
- [ ] How is context formatted and presented in prompts?
- [ ] What instructions do we add to generator prompts about using context?
- [ ] How do we handle multiple context sessions for same commit?

**Context Attribution Approach**:
- Add a "Context Files" section at the end of journal entries
- Include clickable links to context files generated during that commit window
- Format: `### Context Files - {hash}\n\n- [session-name](../context/YYYY-MM-DD-session-name.md)`

**Deliverable**: Design decisions documented, ready for M2.4 implementation
**Success Criteria**: Clear plan for which generators get context and how

#### Milestone 2.4: Implementation (30-45 min, after M2.3 planning)
- [ ] Implement context integration per M2.3 design decisions
- [ ] Modify relevant generator prompts with context instructions
- [ ] Add context discovery calls before journal generation
- [ ] Add "Context Files" section at end of journal entry with links to relevant context files
- [ ] Test with various scenarios (no context, single session, multiple sessions)
- **Success Criteria**: Journals include context appropriately, links to context files visible

### Phase 3: Telemetry & Advanced Features (per DD-006)
- [ ] Run `/add-telemetry` on `src/mcp/tools/context-tool.js`
- [ ] Verify telemetry follows reflection-tool.js patterns
- [ ] Add `journal_append_context` for session continuity
- [ ] Implement context file listing/browsing utilities
- [ ] Create context file preview/summary functionality

## Technical Architecture

### File Structure
```
src/
  mcp/
    tools/
      context-tool.js           # MCP tool implementation
  managers/
    journal-manager.js          # Enhanced to read context files (Phase 2)

journal/
  context/                      # Context files directory
    2025-09-21-debugging.md     # Session-based context files
    2025-09-21-feature-work.md
```

Note: Uses existing utilities from `src/utils/journal-paths.js` for path generation and directory management.

### Context File Format
```markdown
## HH:MM:SS [TIMEZONE] - Context Capture: {session-name}

{context-content}

═══════════════════════════════════════

## HH:MM:SS [TIMEZONE] - Context Update

{additional-context}

═══════════════════════════════════════
```

### Configuration Integration
No configuration required. Context files are saved to `journal/context/` using the same path management utilities as reflections.

## Success Metrics

### Functional Metrics
- **Clean Directory Management**: Context files properly organized by date and session
- **Integration Success**: Journal generator successfully utilizes context when available
- **Session Management**: Multiple sessions per day handled without conflicts

### Usage Metrics
- **Capture Frequency**: How often context capture is used during development
- **Session Patterns**: Average sessions per day, session duration patterns
- **Journal Enhancement**: Correlation between context availability and journal quality

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Context files accumulate over time | Low | High | Users manually delete old files when needed; minimal storage impact |
| Large context files impact performance | Low | Low | Efficient file I/O; files naturally bounded by session scope |
| Context integration breaks journal generation | High | Low | Fallback to standard generation, comprehensive testing |
| User confusion about context vs reflections | Medium | Medium | Clear documentation and different directory structures |

## Deferred Features

### Auto-Deletion (Deferred per DD-002)
If automatic context file deletion becomes needed in the future, here's a safe approach:

**Configuration:**
```json
{
  "contextRetentionDays": 7,  // User sets: days to retain (0 = keep forever)
  "_contextAutoDeleteStartDate": "2025-10-13"  // System-managed: DO NOT EDIT
}
```

**Forward-Only Deletion Logic:**
- Only files created on/after `_contextAutoDeleteStartDate` are subject to auto-deletion
- Files created before the start date are grandfathered (exempt forever)
- System automatically sets/updates `_contextAutoDeleteStartDate` when user changes `contextRetentionDays`
- `_` prefix indicates system-managed field (user never sets this manually)
- Cleanup runs when context tool is invoked

**Why This Works:**
- No retroactive deletion: changing retention from 0 to 7 days won't nuke months of existing files
- Simple mental model: "only files created under current retention rules get deleted"
- Config as single source of truth: all settings in one file
- Non-destructive: changing retention settings is safe

**Deferred Rationale:** Auto-deletion adds complexity without clear current need. Manual deletion is simple and sufficient for now.

---

## Future Enhancements

### Context Analysis
Add AI analysis of context patterns:
- Identify frequently captured context types
- Suggest workflow optimizations
- Automatic context categorization

### Cross-Session Context
Enable context sharing across sessions:
- Link related debugging sessions
- Merge context from related work
- Context dependency tracking

### Enhanced Integration
Deeper integration with development workflow:
- IDE integration for automatic context capture
- Git hook integration for context preservation
- Automated context suggestions based on code changes

## References

- **Original Context Tool**: [MCP Commit Story server.py](https://github.com/wiggitywhitney/mcp-commit-story/blob/main/src/mcp_commit_story/server.py)
- **Related PRD**: [PRD-17: Manual Reflection Tool](./17-manual-reflection-tool.md)
- **Journal Architecture**: `journal/entries/` structure and patterns
- **Configuration System**: `commit-story.config.json` integration examples