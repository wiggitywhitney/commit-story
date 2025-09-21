# PRD-18: Context Capture Tool for AI Working Memory

**GitHub Issue**: [#18](https://github.com/wiggitywhitney/commit-story/issues/18)
**Status**: Planning
**Created**: 2025-09-21
**Last Updated**: 2025-09-21

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
3. **Configurable Cleanup**: User-configurable auto-deletion after N days (default 7)
4. **Journal Integration**: Journal generator can read context files for enhanced narratives
5. **Clean Separation**: Context files clearly distinguished from permanent content
6. **Session Management**: Support for multiple concurrent work sessions

## Technical Requirements

### Core Functionality
- **Input**: Accept AI-generated context text via MCP tool
- **Storage**: Save to dedicated context directory (`journal/context/`)
- **Naming**: Timestamp-based with optional session identifier
- **Format**: Consistent visual formatting matching journal style
- **Auto-cleanup**: Configurable retention period (1-365 days, default 7)

### Integration Points
- **Journal Generator Enhancement**: Read available context files during journal creation
- **Configuration System**: Respect existing config patterns, add cleanup settings
- **Directory Management**: Create and maintain context directory structure
- **Cleanup Scheduler**: Background process or trigger-based cleanup of expired files

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

### DD-002: Auto-Cleanup Strategy
**Decision**: Configurable retention with default 7 days, cleanup on tool usage

**Implementation**:
```json
{
  "contextRetentionDays": 7,
  "contextCleanupOnUse": true
}
```

**Rationale**:
- Prevents accumulation of stale context files
- User control over retention based on workflow needs
- Cleanup on usage ensures active maintenance
- Conservative default prevents accidental data loss

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

## Implementation Plan

### Phase 1: Core MCP Tool
- [ ] Create `journal_capture_context` MCP tool implementation
- [ ] Implement context directory management (`journal/context/`)
- [ ] Add basic file creation and content formatting
- [ ] Implement session naming and timestamp handling

### Phase 2: Auto-Cleanup System
- [ ] Add configuration options for retention period
- [ ] Implement cleanup logic (delete files older than retention period)
- [ ] Add cleanup trigger on tool usage
- [ ] Create manual cleanup utility if needed

### Phase 3: Journal Integration
- [ ] Enhance journal generator to discover context files
- [ ] Implement context file parsing and integration
- [ ] Add context references to generated journal entries when used
- [ ] Test integration with various context scenarios

### Phase 4: Advanced Features
- [ ] Add `journal_append_context` for session continuity
- [ ] Implement context file listing/browsing utilities
- [ ] Add telemetry for usage patterns and optimization
- [ ] Create context file preview/summary functionality

## Technical Architecture

### File Structure
```
src/
  mcp/
    context-tool.js             # MCP tool implementation
  managers/
    context-manager.js          # Context directory and file management
    journal-manager.js          # Enhanced to read context files
  utils/
    context-formatter.js        # Format context entries consistently
    context-cleanup.js          # Handle auto-cleanup logic

journal/
  context/                      # Context files directory
    2025-09-21-debugging.md     # Session-based context files
    2025-09-21-feature-work.md
```

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
```json
{
  "contextRetentionDays": 7,
  "contextCleanupOnUse": true,
  "contextDirectory": "journal/context",
  "contextMaxFileSize": "1MB"
}
```

## Success Metrics

### Functional Metrics
- **Clean Directory Management**: Context files properly organized and cleaned up
- **Integration Success**: Journal generator successfully utilizes context when available
- **Session Management**: Multiple sessions per day handled without conflicts
- **Configuration Compliance**: Cleanup behavior follows user settings

### Usage Metrics
- **Capture Frequency**: How often context capture is used during development
- **Session Patterns**: Average sessions per day, session duration patterns
- **Journal Enhancement**: Correlation between context availability and journal quality
- **Cleanup Effectiveness**: Files properly cleaned up according to retention settings

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Context files accumulate without cleanup | Medium | Medium | Robust auto-cleanup with multiple triggers |
| Large context files impact performance | Low | Low | File size limits and efficient parsing |
| Context integration breaks journal generation | High | Low | Fallback to standard generation, comprehensive testing |
| User confusion about context vs reflections | Medium | Medium | Clear documentation and different directory structures |

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