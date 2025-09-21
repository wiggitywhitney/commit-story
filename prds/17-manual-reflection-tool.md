# PRD-17: Manual Reflection Tool for Real-Time Journal Entries

**GitHub Issue**: [#17](https://github.com/wiggitywhitney/commit-story/issues/17)
**Status**: Planning
**Created**: 2025-09-21
**Last Updated**: 2025-09-21

## Summary

Add a manual reflection tool that allows developers to capture timestamped reflections directly into their journal entries through the AI assistant interface, complementing the existing commit-based automated journaling system.

## Problem Statement

### Current State
Commit Story only captures journal entries automatically when git commits are made. This creates gaps in documentation:

- **Temporal Limitation**: Insights occur throughout development, not just at commit boundaries
- **Context Loss**: Valuable thoughts and observations are forgotten by commit time
- **Process Gaps**: Problem-solving journeys, learning moments, and "aha!" realizations are lost
- **Missing Real-Time Capture**: No way to preserve mid-development insights when they occur

### Evidence from Original Implementation
The first Commit Story iteration included an `add_reflection` MCP tool that was frequently used and highly valued. Key usage patterns:

- **Mid-Development Insights**: Capturing realizations while debugging or implementing
- **Learning Documentation**: Recording new concepts or techniques discovered during development
- **Context Preservation**: Adding background that might be forgotten by commit time
- **Process Documentation**: Recording decision-making rationale in real-time

## Success Criteria

1. **Seamless Integration**: Tool integrates with journal system using dedicated reflections directory
2. **Simple Interface**: MCP tool accessible directly from AI assistant interface
3. **Automatic Formatting**: Consistent timestamp headers and formatting
4. **No Workflow Disruption**: Available on-demand without interrupting development flow
5. **Permanent Storage**: Reflections preserved forever in dedicated directory structure
6. **Cross-Reference Integration**: Journal generator can reference and link to reflections

## Technical Requirements

### Core Functionality
- **Input**: Accept free-form text reflection via MCP tool
- **Timestamp**: Automatic timestamp generation with consistent formatting
- **Storage Location**: Save to dedicated reflections directory (`journal/reflections/YYYY-MM/YYYY-MM-DD.md`)
- **Format Consistency**: Maintain visual consistency with journal entries but in separate files
- **Cross-Referencing**: Enable journal generator to discover and reference reflections

### Integration Points
- **Directory Structure**: Create and manage `journal/reflections/` alongside existing `journal/entries/`
- **Date Handling**: Consistent date parsing and file path generation
- **Journal Generator Integration**: Allow journal generator to read reflections for enhanced narrative context
- **Retention Policy**: Permanent storage (no auto-cleanup) for reflections

### Implementation Approach: MCP Server Tool

Implement as MCP tool for seamless AI assistant integration:

```javascript
// MCP tool interface
journal_add_reflection({
  text: "Just realized the issue was in the async handling - the Promise wasn't being awaited properly",
  timestamp: "optional-override"  // Defaults to current time
})
```

**Benefits**:
- **Zero Friction**: Available directly in AI assistant chat
- **Natural Workflow**: Capture thoughts as they occur during development
- **Consistent Interface**: Matches other Commit Story MCP tools
- **Rich Integration**: Can be enhanced with metadata in future versions

**Pros**: Simple, no new commands to remember
**Cons**: Less discoverable, potential file conflicts

## Design Decisions

### DD-001: Output Format
**Decision**: Use consistent formatting with automated entries

```markdown
## HH:MM:SS [TIMEZONE] - Manual Reflection

[Reflection content]

═══════════════════════════════════════
```

**Rationale**: Maintains visual consistency and searchability. Format remains consistent across all reflection files.

### DD-002: File Placement Strategy
**Decision**: Store in dedicated reflections directory (`journal/reflections/YYYY-MM/YYYY-MM-DD.md`)

**Rationale**:
- **Separation of Concerns**: Human reflections separate from auto-generated journal entries
- **Permanent Value**: Reflections preserved forever without mixing with temporary content
- **Easy Discovery**: Can browse reflections independently or reference from journal entries
- **Cross-Referencing**: Journal generator can link to relevant reflections during commit processing

### DD-003: Timestamp Precision
**Decision**: Include time precision to seconds with timezone

**Rationale**:
- Enables correlation with commit timestamps
- Provides precise sequencing for multiple reflections per day
- Matches existing automated entry format

## Implementation Plan

### Phase 1: MCP Tool Core Implementation
- [ ] Create MCP server tool `journal_add_reflection`
- [ ] Implement reflections directory management (`journal/reflections/YYYY-MM/`)
- [ ] Add reflection file creation and appending logic
- [ ] Implement basic error handling and validation

### Phase 2: Enhanced Integration
- [ ] Add reflection discovery to journal generator (for cross-referencing)
- [ ] Implement configuration integration (respect enabled/debug flags)
- [ ] Add telemetry instrumentation for reflection usage tracking
- [ ] Create reflection browsing utilities if needed

### Phase 3: Documentation and Polish
- [ ] Update README.md with reflection tool documentation
- [ ] Document MCP tool interface and setup requirements
- [ ] Add examples and usage patterns
- [ ] Create troubleshooting section for reflection tool

## Technical Architecture

### File Structure
```
src/
  mcp/
    reflection-tool.js          # MCP tool implementation
  managers/
    reflections-manager.js      # Handle reflections directory and files
    journal-manager.js          # Enhanced to read reflections for cross-referencing
journal/
  reflections/                  # New directory structure
    YYYY-MM/                    # Monthly organization
      YYYY-MM-DD.md            # Daily reflection files
  utils/
    reflection-formatter.js     # Format reflection entries consistently
```

### Error Handling
- **Missing Reflections Directory**: Create `journal/reflections/` structure if doesn't exist
- **File Permissions**: Handle read/write permission issues gracefully
- **Invalid Input**: Validate reflection text (non-empty, reasonable length)
- **Configuration Issues**: Respect existing config system for enabled/debug flags
- **MCP Integration**: Proper error responses following MCP protocol

### Testing Strategy
- **Unit Tests**: Test reflection formatting and file operations
- **Integration Tests**: Test reflections directory creation and cross-referencing
- **MCP Protocol Testing**: Verify proper MCP tool interface compliance
- **Manual Testing**: Verify AI assistant integration experience

## Success Metrics

### Functional Metrics
- **Directory Separation**: Reflections cleanly separated from automated journal entries
- **Consistent Formatting**: All reflections follow established formatting patterns
- **Cross-Reference Integration**: Journal generator successfully discovers and links reflections
- **Error-Free Operation**: Graceful handling of edge cases and error conditions

### Usage Metrics
- **Developer Adoption**: Track usage through telemetry (if enabled)
- **Reflection Frequency**: Monitor reflection patterns to validate value
- **Integration Success**: No conflicts with existing commit-based journaling

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Directory structure conflicts | Medium | Low | Use established `journal/` parent directory pattern |
| MCP server setup complexity | Medium | Medium | Provide clear setup documentation and examples |
| Cross-reference integration breaks | High | Low | Comprehensive testing of journal generator integration |
| Tool adds development friction | Low | Low | MCP integration provides seamless AI assistant access |

## Future Enhancements

### Structured Reflections
Add support for categorized reflections:
```bash
npx commit-story-reflect --type=learning "TIL: async/await vs Promises"
npx commit-story-reflect --type=decision "Chose React over Vue for better TypeScript support"
```

### Reflection Templates
Pre-defined templates for common reflection types:
```bash
npx commit-story-reflect --template=bug-fix "Issue was caused by..."
npx commit-story-reflect --template=performance "Optimization achieved..."
```

### Integration with Existing Telemetry
If applicable, add reflection events to existing OpenTelemetry instrumentation for observability into reflection patterns and usage.

## References

- **Original Implementation**: [MCP Commit Story server.py](https://github.com/wiggitywhitney/mcp-commit-story/blob/main/src/mcp_commit_story/server.py)
- **Existing Journal Manager**: `src/managers/journal-manager.js`
- **Current Journal Format**: See `journal/entries/` for formatting examples
- **Configuration System**: `commit-story.config.json` integration patterns