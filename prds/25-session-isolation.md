# PRD-25: Fix Chat Collection Cross-Contamination with Session Isolation

## Metadata
- **Issue**: [#25](https://github.com/wiggitywhitney/commit-story/issues/25)
- **Status**: Active
- **Created**: 2025-09-26
- **Author**: Whitney Lee

## Overview

### Problem Statement
When multiple Claude Code tabs are open in the same repository working on different tasks, the chat collector mixes messages from ALL sessions into journal entries. This contaminates the narrative coherence of journal entries with unrelated conversations, breaking the intended story of each commit's development process.

### Evidence of the Problem
Recent journal entry for the PRD-24 commit contained this question from a parallel session:
```
**Human:** "Question. Does prd-9 have a plan for evaluating updated code, not just net-new code? We have some of each from yesterday's prd-17 updates"
```

This PRD-9 question came from a different Claude Code tab working on unrelated functionality but was mixed into the PRD-24 journal entry about packaging and deployment.

### Solution
Implement session isolation using the `sessionId` field available in Claude Code message data to ensure journal entries only contain messages from the relevant conversation thread.

### Key Benefits
- **Narrative Coherence**: Journal entries tell a focused story of each commit's development
- **Accurate Documentation**: No contamination from parallel work streams
- **Improved Traceability**: Clear connection between conversation and resulting code changes
- **Better User Experience**: Journal entries make sense and provide value

## Research Foundation

Based on existing research in [`docs/dev/claude-chat-research.md`](https://github.com/wiggitywhitney/commit-story/blob/b753456ce6fca3239ce2505447c3f860d7aed29b/docs/dev/claude-chat-research.md):

### Claude Code Message Structure
- **Storage**: `~/.claude/projects/[project-path-encoded]/*.jsonl`
- **Format**: JSONL with one JSON object per line
- **Key Fields**:
  - `sessionId`: Unique identifier for each Claude Code instance/conversation
  - `cwd`: Current working directory (repository path)
  - `timestamp`: UTC ISO format
  - `uuid`: Unique message identifier
  - `parentUuid`: Links to previous message

### Current Filtering Mechanism
The chat collector currently filters by:
1. **Repository path**: `message.cwd === repoPath`
2. **Time window**: Messages between previous commit and current commit

**Missing**: No filtering by `sessionId`, allowing messages from all sessions to mix

## User Stories

### Story 1: Developer Working on Multiple Features
**As a** developer working on multiple features in parallel using different Claude Code tabs
**I want** journal entries to only include conversations related to each specific commit
**So that** each journal tells a coherent story without unrelated discussions

**Acceptance Criteria:**
- Journal entries contain messages only from the session that created the commit
- No contamination from parallel Claude Code sessions in the same repository
- Automatic session detection without manual configuration

### Story 2: Developer Reviewing Journal History
**As a** developer reviewing past journal entries to understand development decisions
**I want** clean, focused narratives for each commit
**So that** I can quickly understand the context and reasoning behind each change

**Acceptance Criteria:**
- Historical context is preserved and accurate
- Each journal entry has narrative coherence
- Technical decisions are clearly connected to their discussions

## Requirements

### Functional Requirements

#### 1. Session Detection
- **R1.1**: Automatically detect which Claude Code session was active when commit was made
- **R1.2**: Use heuristics based on message timestamps and commit timing
- **R1.3**: Select the session with the most recent activity before commit time
- **R1.4**: Handle edge cases where multiple sessions are equally active

#### 2. Message Filtering
- **R2.1**: Filter messages to include only the detected session's messages
- **R2.2**: Preserve all existing filtering (repository path, time window)
- **R2.3**: Maintain message chronological order within session
- **R2.4**: Graceful fallback if session detection fails

#### 3. Debug Visibility
- **R3.1**: Show which session was selected in debug mode
- **R3.2**: Display session detection reasoning and confidence
- **R3.3**: Log session statistics (count, message ranges, selection criteria)
- **R3.4**: Enable troubleshooting of session selection issues

#### 4. Backward Compatibility
- **R4.1**: No breaking changes for users with single Claude Code sessions
- **R4.2**: Existing journal entries remain unchanged
- **R4.3**: Configuration file format unchanged
- **R4.4**: Performance impact minimal for single-session usage

### Non-Functional Requirements

#### 1. Accuracy
- **N1.1**: Correct session selection in 95%+ of cases
- **N1.2**: False positive rate (wrong session) under 5%
- **N1.3**: False negative rate (no session selected) under 2%

#### 2. Performance
- **N2.1**: Session detection adds less than 500ms to journal generation
- **N2.2**: Memory usage increase less than 20% for multiple sessions
- **N2.3**: No impact on repositories with single sessions

#### 3. Maintainability
- **N3.1**: Session detection logic is well-documented and testable
- **N3.2**: Clear separation of concerns in collector code
- **N3.3**: Debuggable with clear logging and metrics

## Design Decisions

### Decision 1: Session Detection Strategy
**Choice**: Automatic detection based on recent message activity
**Rationale**: Preserves workflow automation, requires no user configuration
**Alternatives Considered**:
- Manual session configuration (rejected: breaks automation)
- Branch-based session mapping (rejected: doesn't handle same-branch work)
**Tradeoffs**: May occasionally select wrong session vs. guaranteed accuracy with manual config

### Decision 2: Selection Algorithm
**Choice**: Most recent message timestamp before commit time
**Rationale**: Simple heuristic that captures "active" session at commit time
**Implementation**:
```javascript
// For each sessionId, find the most recent message before commit
const sessionActivity = sessions.map(session => ({
  sessionId: session.id,
  lastActivity: session.messages
    .filter(msg => msg.timestamp < commitTime)
    .reduce((latest, msg) => msg.timestamp > latest ? msg.timestamp : latest, 0)
}));

// Select session with most recent activity
const activeSession = sessionActivity
  .sort((a, b) => b.lastActivity - a.lastActivity)[0];
```

### Decision 3: Fallback Behavior
**Choice**: If session detection fails, use all messages (current behavior)
**Rationale**: Preserves existing functionality, ensures journal generation never fails
**Tradeoffs**: Contaminated journal vs. no journal at all

### Decision 4: Debug Output Format
**Choice**: Structured debug output showing session selection reasoning
**Example**:
```
[DEBUG] Session Detection:
  - Found 2 active sessions in time window
  - Session abc123: 15 messages, last activity 2min ago
  - Session def456: 3 messages, last activity 30min ago
  - Selected: abc123 (most recent activity)
```

## Implementation Plan

### Milestone 1: Session Grouping and Detection (Priority: High)
**Goal**: Group messages by sessionId and implement detection algorithm

**Tasks**:
- [ ] Modify `extractChatForCommit()` to group messages by sessionId
- [ ] Implement session activity detection algorithm
- [ ] Add session selection logic with confidence scoring
- [ ] Create fallback mechanism for detection failures
- [ ] Add comprehensive error handling

**Files Modified**:
- `src/collectors/claude-collector.js` - Core implementation
- Tests for session detection logic

### Milestone 2: Debug Output and Logging (Priority: High)
**Goal**: Provide visibility into session selection process

**Tasks**:
- [ ] Add debug output showing session detection results
- [ ] Include session statistics in narrative logs
- [ ] Add telemetry for session detection accuracy
- [ ] Create troubleshooting documentation

**Files Modified**:
- `src/collectors/claude-collector.js` - Debug output
- Documentation updates for troubleshooting

### Milestone 3: Edge Case Handling (Priority: Medium)
**Goal**: Handle complex scenarios and edge cases

**Tasks**:
- [ ] Handle sessions with identical activity times
- [ ] Manage very short time windows with minimal activity
- [ ] Address sessions that span multiple commits
- [ ] Test with various session overlap patterns

**Files Modified**:
- `src/collectors/claude-collector.js` - Edge case logic
- Test cases for complex scenarios

### Milestone 4: Performance Optimization (Priority: Low)
**Goal**: Ensure minimal performance impact

**Tasks**:
- [ ] Optimize session grouping algorithm
- [ ] Add early exit for single-session cases
- [ ] Minimize memory usage for large message sets
- [ ] Benchmark before/after performance

**Files Modified**:
- `src/collectors/claude-collector.js` - Performance optimizations

## Technical Specification

### Session Detection Algorithm

```javascript
/**
 * Detects the most active Claude Code session before commit time
 * @param {Array} messages - All messages in time window
 * @param {Date} commitTime - When the commit was made
 * @returns {Object} { sessionId, confidence, reasoning }
 */
function detectActiveSession(messages, commitTime) {
  // Group messages by sessionId
  const sessions = groupMessagesBySession(messages);

  if (sessions.length === 1) {
    return {
      sessionId: sessions[0].id,
      confidence: 1.0,
      reasoning: 'Only session in time window'
    };
  }

  // Calculate activity score for each session
  const sessionScores = sessions.map(session => ({
    sessionId: session.id,
    messageCount: session.messages.length,
    lastActivity: getLastActivityBefore(session.messages, commitTime),
    activityScore: calculateActivityScore(session.messages, commitTime)
  }));

  // Sort by activity score (descending)
  sessionScores.sort((a, b) => b.activityScore - a.activityScore);

  const winner = sessionScores[0];
  const confidence = calculateConfidence(sessionScores);

  return {
    sessionId: winner.sessionId,
    confidence: confidence,
    reasoning: `Most active session: ${winner.messageCount} messages, last activity ${winner.lastActivity}`
  };
}
```

### Activity Scoring Formula

```javascript
function calculateActivityScore(messages, commitTime) {
  return messages
    .filter(msg => new Date(msg.timestamp) < commitTime)
    .reduce((score, msg) => {
      const timeDiff = commitTime - new Date(msg.timestamp);
      const timeWeight = Math.exp(-timeDiff / (1000 * 60 * 30)); // 30min decay
      return score + timeWeight;
    }, 0);
}
```

## Success Metrics

### Quantitative
- **Session Selection Accuracy**: >95% correct selection in test scenarios
- **Performance Impact**: <500ms additional processing time
- **Memory Usage**: <20% increase for multi-session scenarios
- **False Positive Rate**: <5% incorrect session selection

### Qualitative
- **Journal Coherence**: Entries tell focused, coherent stories
- **User Satisfaction**: No complaints about mixed conversations
- **Debug Experience**: Clear visibility into session selection
- **Development Workflow**: No interruption to existing practices

## Risk Assessment

### Risk 1: Incorrect Session Detection
**Likelihood**: Medium
**Impact**: Medium (contaminated journal entries)
**Mitigation**:
- Comprehensive testing with various scenarios
- Conservative confidence thresholds
- Fallback to current behavior when uncertain
- Debug output for troubleshooting

### Risk 2: Performance Degradation
**Likelihood**: Low
**Impact**: Medium
**Mitigation**:
- Benchmarking before/after implementation
- Early exit optimizations for single sessions
- Efficient grouping algorithms

### Risk 3: Breaking Changes
**Likelihood**: Low
**Impact**: High
**Mitigation**:
- Extensive testing with existing repositories
- Fallback mechanisms preserve current behavior
- Gradual rollout approach

### Risk 4: Complex Edge Cases
**Likelihood**: Medium
**Impact**: Low
**Mitigation**:
- Document known limitations
- Provide debug tools for investigation
- Community feedback for edge case discovery

## Testing Strategy

### Unit Testing
- Session grouping logic
- Activity scoring algorithm
- Edge case handling (equal scores, no activity, etc.)
- Confidence calculation accuracy

### Integration Testing
- End-to-end journal generation with multiple sessions
- Fallback behavior when detection fails
- Debug output format and content
- Performance benchmarks

### Manual Testing Scenarios
1. **Two tabs, different features**: Parallel work on unrelated functionality
2. **Two tabs, same feature**: Collaborative work on single feature
3. **Sequential sessions**: One tab closed, another opened
4. **Inactive sessions**: One tab active, one idle
5. **Overlapping activity**: Both tabs active near commit time

## Progress Log

### 2025-09-26
- PRD created based on identified cross-contamination issue
- Research foundation established from existing Claude Code analysis
- Session detection algorithm designed with fallback mechanisms
- Implementation plan created with 4 milestones

## Design Document References

### Existing Documentation
- [`docs/dev/claude-chat-research.md`](https://github.com/wiggitywhitney/commit-story/blob/b753456ce6fca3239ce2505447c3f860d7aed29b/docs/dev/claude-chat-research.md) - Claude Code message structure and filtering
- `src/collectors/claude-collector.js` - Current chat collection implementation
- `src/integrators/context-integrator.js` - Context gathering orchestration

### Code Locations for Changes
1. **Primary Implementation**: `src/collectors/claude-collector.js`
   - Add session grouping logic
   - Implement activity detection algorithm
   - Add debug output and logging

2. **Supporting Changes**: `src/integrators/context-integrator.js`
   - May need commit timing context for better detection
   - Could add git author information for enhanced heuristics

3. **Testing**: New test files for session isolation
   - Unit tests for detection algorithm
   - Integration tests with mock multiple sessions
   - Performance benchmarks

## Notes

- This PRD addresses a critical issue affecting journal quality and narrative coherence
- Solution leverages existing `sessionId` field in Claude Code messages
- Implementation preserves backward compatibility and existing workflow
- Focus on automatic detection to maintain seamless user experience
- Fallback mechanisms ensure journal generation never fails due to session detection issues