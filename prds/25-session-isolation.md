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

## Dependencies

**Prerequisites**: None - This is a standalone bug fix
**Blocks**: Clean demo experience without chat contamination
**Related PRDs**: Part of conference roadmap (PRD-26)

## Research Foundation

Based on research in [`docs/dev/claude-chat-research.md`](../docs/dev/claude-chat-research.md) which provides comprehensive analysis of Claude Code message structure and filtering patterns:

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

#### 1. Session Detection (Revised per DD-010)
- **R1.1**: Group collected messages by sessionId field
- **R1.2**: If single sessionId present, use all messages (Plan A - fast path)
- **R1.3**: If multiple sessionIds present, apply AI session relevance filter (Plan B)
- **R1.4**: AI filter determines which sessions relate to commit changes based on semantic analysis

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

### Decision 1: Validation-Based Selection Over Time Heuristics
**Choice**: Use definitive signals (git commit presence) and AI content analysis instead of time-based guessing
**Rationale**: Telemetry analysis revealed that "most recent activity" heuristics would fail for terminal commits and parallel workflows
**Date**: 2025-09-27
**Status**: ✅ Decided

### Decision 2: Plan A → Plan C Approach (Skip Unreliable Heuristics)
**Choice**:
- **Plan A**: Check if session's last messages contain git commit command/output
- **Plan C**: Use AI to analyze session content against git diff for relevance
- **Skip Plan B**: Avoid unreliable signals like "git add" or "git stage" commands
**Rationale**: Keep it simple - use definitive signals first, then intelligent analysis. No guessing.
**Date**: 2025-09-27
**Status**: ✅ Decided

### Decision 3: Filter Each Session Independently
**Choice**: Apply noise filtering (tool calls, system messages) to each session separately before selection
**Rationale**: Telemetry logs revealed filtering happens in collector ("40 noisy messages" removed) - this should happen per-session for clean AI comparison
**Date**: 2025-09-27
**Status**: ✅ Decided

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

### Decision 5: Implementation Location Before Noise Filtering
**Choice**: Session detection logic must be implemented in `claude-collector.js` BEFORE noise filtering occurs
**Rationale**: Git commit evidence exists in tool_use messages (Bash commands) and tool_result messages (git output), which are filtered out as "noise" in context-filter.js. To detect which session contains git commit commands, we must examine raw messages before filtering.
**Date**: 2025-09-28
**Status**: ✅ Decided

### Decision 6: Git Commit Detection via Bash Tool Use
**Choice**: For multi-tab scenarios, detect git commit by looking for assistant messages with Bash tool_use containing "git commit" in the input.command field
**Rationale**: User workflow involves `/prd-update-progress` which executes git commands via Claude's Bash tool. This creates definitive evidence in the form of tool_use messages with "git commit" commands.
**Date**: 2025-09-28
**Status**: ✅ Decided

### Decision 7: Single Session Fast Path
**Choice**: If only one sessionId exists in all collected messages, use it immediately without detection logic
**Rationale**: Single session is the common case and should be optimized. No need for detection overhead when there's no ambiguity.
**Date**: 2025-09-28
**Status**: ✅ Decided

### Decision 8: Scope Limitation - Focus on Realistic Problems
**Choice**: Address multi-tab contamination first, defer complex edge cases (sequential sessions, compaction behavior) for future research
**Rationale**: The primary issue is simultaneous multi-tab work creating contamination. Sequential session scenarios are less common and add significant complexity.
**Date**: 2025-09-28
**Status**: ✅ Decided

### Decision 9: Fallback Documentation Strategy
**Choice**: If session detection proves too complex, document that the system works best with single Claude Code sessions
**Rationale**: Provides user expectation management and clear boundaries for supported workflows
**Date**: 2025-09-28
**Status**: ✅ Decided (as backup plan)

### Decision 10: Architectural Pivot - Simplify to Plan A/B Approach
**Choice**: Replace complex git commit detection with simple two-path logic:
- **Plan A**: Single sessionId detected → use all messages (fast path)
- **Plan B**: Multiple sessionIds detected → AI-powered session relevance filter
**Rationale**: Previous approach (DD-001 through DD-006) was overengineered. Clean separation between simple case (no overhead) and complex case (AI intelligence) is more maintainable and handles all scenarios.
**Date**: 2025-09-28
**Status**: ✅ Decided

### Decision 11: AI Session Filter for Multi-Session Cases
**Choice**: When multiple sessions detected, use dedicated AI call to determine which sessions relate to the commit changes
**Rationale**: AI excels at semantic understanding of "does this conversation relate to these code changes?" Handles all edge cases (sequential work, terminal commits, mixed content) naturally without reverse-engineering Claude Code internals.
**Date**: 2025-09-28
**Status**: ✅ Decided

### Decision 12: Research Phase Remains Critical for AI Context
**Choice**: Keep Phase 1 research requirements despite architectural simplification
**Rationale**: AI filter needs to understand WHY multiple sessions exist (parallel tabs vs sequential work vs compaction) to provide appropriate prompting context. Without sessionId lifecycle understanding, AI can't make informed decisions.
**Date**: 2025-09-28
**Status**: ✅ Decided

### Decision 13: AI Reasoning Emission During Session Filtering
**Choice**: Modify AI session filter to emit explicit reasoning process during evaluation
**Rationale**: Current AI filter makes decisions without exposing its reasoning, making it difficult to debug session selection issues or validate correctness. Emitted reasoning should be captured in telemetry for troubleshooting and system improvement.
**Date**: 2025-09-29
**Status**: ❌ Outstanding
**Implementation**: Add reasoning field to AI response format, log reasoning to narrative telemetry

### Decision 14: /clear Command Session Boundary Detection Strategy
**Choice**: Detect session boundaries across /clear commands by identifying:
- **Pre-clear session**: Session containing `/clear` as final user message
- **Post-clear session**: New sessionId starting immediately after with `parentUuid: null`
**Rationale**: `/clear` creates definitive session breaks that should be handled intelligently - either as related continuation (same feature work) or separate contexts (topic change). Detection can be programmatic (message pattern matching) rather than relying solely on AI to understand the pattern.
**Date**: 2025-09-29
**Status**: ❌ Outstanding
**Implementation**: Add /clear boundary detection in session grouping logic

### Decision 15: Validation Testing with Known /clear Commit
**Choice**: Use the specific commit containing documented /clear command usage as primary validation test case
**Rationale**: Real-world /clear usage provides authentic test scenario for session boundary detection. This commit occurred after code writing but before /add-telemetry command execution, creating perfect multi-session contamination test case.
**Date**: 2025-09-29
**Status**: ❌ Outstanding
**Implementation**: Identify and test against the /clear commit for validation

### Decision 16: Enhanced Telemetry for /clear-Aware Testing
**Choice**: Conditionally rerun /add-telemetry command with enhanced instructions if testing reveals gaps in /clear scenario handling
**Rationale**: Current telemetry instrumentation may need updates to properly capture /clear boundary detection and reasoning emission. Only rerun if validation testing identifies missing telemetry coverage.
**Date**: 2025-09-29
**Status**: ❌ Outstanding
**Implementation**: Assess telemetry gaps after /clear testing, enhance instrumentation if needed

## Implementation Plan

### Milestone 1: Plan A/B Session Logic (Priority: High)
**Goal**: Implement simplified two-path approach for session handling

**Tasks** (based on DD-010, DD-011, DD-012, DD-013, DD-014):
- [x] Group messages by sessionId after time/project filtering in claude-collector.js (line 90-91)
- [x] Implement Plan A: Single session fast path (DD-010) - if only one sessionId, return all messages
- [x] Implement Plan B: AI session relevance filter (DD-011) for multiple sessions
- [x] Create AI prompt for session filtering: 4-step structured prompt with JSON response format
- [ ] Add AI reasoning emission to response format (DD-013) - include reasoning field in JSON response
- [ ] Add /clear command boundary detection (DD-014) in session grouping logic:
  - [ ] Detect sessions ending with `/clear` user message
  - [ ] Identify new sessions starting with `parentUuid: null` after /clear timestamp
  - [ ] Link pre-clear and post-clear sessions for AI analysis context
- [ ] Add structured debug output showing which plan was used and results
- [ ] Handle AI filter edge cases (no response, ambiguous response, API failures)

**Files Modified**:
- [x] `src/collectors/claude-collector.js` - Plan A/B session logic implemented
- [x] `src/utils/session-filter.js` - Complete AI session filter module (777 lines)
- [x] `src/telemetry/standards.js` - Comprehensive session filtering telemetry standards
- [ ] Tests for both single and multi-session scenarios

### Milestone 2: /clear Command Testing and Validation (Priority: High)
**Goal**: Validate session isolation with real /clear command usage scenarios

**Tasks** (based on DD-015, DD-016):
- [ ] Identify the specific commit that contains /clear command usage (DD-015)
- [ ] Test current session filtering logic against /clear commit scenario
- [ ] Validate that pre-clear and post-clear sessions are properly detected
- [ ] Assess whether AI reasoning emission is sufficient for debugging /clear scenarios
- [ ] Determine if enhanced telemetry instrumentation is needed (DD-016):
  - [ ] Check if /clear boundary detection events are properly captured
  - [ ] Verify AI reasoning logging covers /clear continuation decisions
  - [ ] Conditionally rerun /add-telemetry command if gaps identified

**Files Modified**:
- Test validation against real commit data
- Potentially enhanced telemetry if gaps found

### Milestone 3: Debug Output and Logging (Priority: High)
**Goal**: Provide visibility into session selection process

**Tasks**:
- [ ] Add debug output showing session detection results
- [ ] Include session statistics in narrative logs
- [ ] Add telemetry for session detection accuracy (capturing AI reasoning from DD-013)
- [ ] Create troubleshooting documentation

**Files Modified**:
- `src/collectors/claude-collector.js` - Debug output
- Documentation updates for troubleshooting

### Milestone 4: Edge Case Handling (Priority: Medium)
**Goal**: Handle complex scenarios and edge cases

**Tasks**:
- [ ] Handle sessions with identical activity times
- [ ] Manage very short time windows with minimal activity
- [ ] Address sessions that span multiple commits
- [ ] Test with various session overlap patterns
- [ ] Handle /clear command edge cases (multiple /clear commands, immediate commits after /clear)

**Files Modified**:
- `src/collectors/claude-collector.js` - Edge case logic
- Test cases for complex scenarios

### Milestone 5: Performance Optimization (Priority: Low)
**Goal**: Ensure minimal performance impact

**Tasks**:
- [ ] Optimize session grouping algorithm
- [ ] Add early exit for single-session cases
- [ ] Minimize memory usage for large message sets
- [ ] Benchmark before/after performance

**Files Modified**:
- `src/collectors/claude-collector.js` - Performance optimizations

## Technical Specification

### Session Selection Algorithm (Plan A → Plan C)

```javascript
/**
 * Select relevant session using validation-based approach
 * @param {Array} messages - All messages in time window
 * @param {Object} gitDiff - Git diff data for commit
 * @param {string} commitMessage - Commit message
 * @returns {Array|null} Selected session messages or null
 */
async function selectRelevantSession(messages, gitDiff, commitMessage) {
  // Group messages by sessionId
  const sessions = groupBySessionId(messages);

  if (sessions.length === 1) {
    return filterNoiseFromMessages(sessions[0].messages);
  }

  // Filter each session independently
  const filteredSessions = sessions.map(session => ({
    sessionId: session.id,
    messages: filterNoiseFromMessages(session.messages),
    hasGitCommit: checkLastMessagesForCommit(session.messages),
    stats: { messageCount: session.messages.length }
  }));

  // Plan A: Check for definitive git commit signal
  const commitSession = filteredSessions.find(s => s.hasGitCommit);
  if (commitSession) {
    logger.info(`Selected session ${commitSession.sessionId} (Plan A: git commit found)`);
    return commitSession.messages;
  }

  // Plan C: AI content analysis for terminal commits
  logger.info('No git commit found in sessions, using AI analysis (Plan C)');
  const selected = await analyzeSessionsWithAI(filteredSessions, gitDiff, commitMessage);

  if (selected) {
    logger.info(`Selected session ${selected.sessionId} (Plan C: AI analysis)`);
    return selected.messages;
  }

  // No valid session found
  logger.info('No relevant session detected - skipping journal generation');
  return null;
}
```

### Plan A: Git Commit Detection

```javascript
function checkLastMessagesForCommit(messages) {
  const lastThreeMessages = messages.slice(-3);
  return lastThreeMessages.some(msg =>
    msg.content && msg.content.match(/git commit|Successfully committed|Created commit [a-f0-9]{7}/i)
  );
}
```

### Plan C: AI Content Analysis

```javascript
async function analyzeSessionsWithAI(sessions, gitDiff, commitMessage) {
  const prompt = `
    Given these chat sessions and a git diff, identify which session(s)
    led to these code changes:

    Git Commit: ${commitMessage}
    Files Changed: ${gitDiff.files?.join(', ') || 'Unknown'}

    ${sessions.map((s, i) => `
    Session ${i + 1} (${s.sessionId.slice(0, 8)}) - ${s.stats.messageCount} messages:
    Recent messages: ${s.messages.slice(-10).map(m => m.content).join('\n---\n')}
    `).join('\n')}

    Which session discussed or implemented these changes?
    Respond with: SESSION_1, SESSION_2, BOTH, or NONE
    Include brief reasoning.
  `;

  const decision = await callOpenAI(prompt);
  return parseAIDecision(decision, sessions);
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

### Contaminated Commit Test Cases
**Purpose**: Use real contamination examples to validate session isolation effectiveness

**Primary Test Case - PRD-24/PRD-9 Contamination**:
- **Location**: `journal/entries/2025-09/2025-09-26.md`
- **Issue**: PRD-24 commit journal contains unrelated PRD-9 question from parallel session
- **Evidence**: "Question. Does prd-9 have a plan for evaluating updated code, not just net-new code?"
- **Expected Result**: After session isolation, PRD-24 journal should contain only PRD-24 related conversation

**Secondary Test Cases - Multi-Commit Scenarios**:
- **Location**: `journal/entries/2025-09/2025-09-25.md`
- **Issue**: Multiple commits with potentially overlapping session activity
- **Purpose**: Test both Plan A (git commit detection) and Plan C (AI analysis) scenarios
- **Expected Result**: Each commit journal contains only its relevant session conversations

**Validation Method**:
1. Regenerate journals for contaminated commits using new session isolation logic
2. Compare before/after results to measure contamination reduction
3. Verify narrative coherence improved in each journal entry
4. Confirm no legitimate conversation context was lost

## Outstanding Research Questions

### Phase 1: Human/AI Collaborative Research (Required before implementation)
**Status**: Not Started
**Priority**: High

**Questions requiring empirical research**:
1. **Sequential Session Behavior**: What happens when user closes Claude and reopens to continue same feature work?
   - Does new tab get new sessionId?
   - How common is this workflow?
   - Should sequential sessions be linked?

2. **Compaction Impact**: When Claude compacts long conversations, does sessionId change?
   - Can we observe this in real JSONL data?
   - How would this affect detection?

3. **Claude Code Restart Behavior**: When Claude Code application is quit and restarted, are sessionIds preserved?
   - Test with actual quit/restart cycle
   - Check JSONL files for evidence

4. **Real Usage Patterns**: User's actual multi-tab workflow frequency
   - How many tabs typically open?
   - Do tabs stay open for days?
   - Terminal commit frequency?

**Research Methodology**:
- Review existing JSONL files for session patterns
- Conduct controlled testing of Claude Code behavior
- Document findings before proceeding with complex implementation

### The Context Problem: Why Research Remains Critical

Despite the architectural simplification to Plan A/B, understanding sessionId lifecycle is essential for the AI filter to work correctly.

**The AI filter needs different instructions based on why multiple sessions exist:**

**Scenario 1 - Parallel Tabs (Different Features)**:
- User has 2+ tabs working on unrelated features simultaneously
- AI instruction: \"Pick the session most relevant to this commit's changes\"
- Expected: Select one session, ignore others

**Scenario 2 - Sequential Work (Same Feature)**:
- User closed Claude, reopened, continued same feature work
- AI instruction: \"These may be continuation of same work, include all relevant sessions\"
- Expected: Select multiple sessions that form logical sequence

**Scenario 3 - Compaction/System Behavior**:
- Long conversation triggered sessionId change due to Claude's internal behavior
- AI instruction: \"These sessions may be the same logical conversation\"
- Expected: Treat as single session despite different sessionIds

**Without research understanding, the AI filter gets ambiguous instructions and may:**
- Exclude important sequential context (Scenario 2)
- Include irrelevant parallel work (Scenario 1)
- Miss system-generated session splits (Scenario 3)

This is why Phase 1 research cannot be skipped even with the simplified approach."

## Progress Log

### 2025-09-26
- PRD created based on identified cross-contamination issue
- Research foundation established from existing Claude Code analysis
- Initial time-based session detection algorithm designed
- Implementation plan created with 4 milestones

### 2025-09-27
- **Telemetry analysis completed**: Used Datadog traces/logs to understand actual execution flow
- **Design pivot**: Replaced time-based heuristics with validation-based selection (DD-001)
- **Plan A → Plan C approach**: Definitive signals first, then AI analysis (DD-002)
- **Architecture insight**: Filter each session independently for clean AI comparison (DD-003)
- **Implementation strategy refined**: Leverage existing filtering pipeline in claude-collector.js

### 2025-09-28 - Morning: Initial Architecture
- **Architecture decision finalized**: Session detection in claude-collector.js before noise filtering (DD-005)
- **Git detection method refined**: Focus on Bash tool_use with "git commit" commands (DD-006)
- **Single session optimization**: Fast path for single sessionId scenarios (DD-007)
- **Scope limitation**: Focus on realistic multi-tab problems, defer edge cases (DD-008)
- **Research phase identified**: Need collaborative human/AI investigation of session behavior
- **Updated docs/dev/claude-chat-research.md**: Added comprehensive reference documentation

### 2025-09-28 - Evening: Architectural Pivot
- **Major simplification**: Replaced complex git detection with Plan A/B approach (DD-010)
- **AI-powered filtering**: Multi-session cases handled by dedicated AI semantic analysis (DD-011)
- **Context problem identified**: Research phase still critical for AI filter context (DD-012)
- **Implementation simplified**: Two clear paths eliminate need for git command parsing
- **Edge case handling**: AI naturally handles sequential sessions, terminal commits, compaction scenarios

### 2025-09-29: Research Phase Complete - AI Filter Prompt Designed ✅
**Duration**: Full research and design session
**Primary Focus**: Complete sessionId lifecycle research and AI filter prompt design

**Research Achievements**:
- **Multi-tab contamination confirmed**: Real test data with zebra/limerick/PRD-25/Jupiter sessions
- **SessionId lifecycle documented**: Restart, compaction, --continue behavior fully understood
- **Plan A/B approach validated**: Controlled testing confirms approach viability
- **Evidence**: `docs/dev/session-isolation-research.md` with comprehensive behavioral findings

**Prompt Design Completed**:
- **4-step AI filter prompt**: data structure → session topics → commit analysis → selection
- **Structured JSON response**: sessionIds array format for programmatic parsing
- **Git commit detection**: Specific Bash tool_use signal integration
- **No bias prevention**: Avoided session creation pattern assumptions in prompt
- **Evidence**: `docs/dev/session-filter-prompt-context.md` ready for implementation

**Implementation Readiness**:
- Plan A: Single sessionId fast path (no AI overhead needed)
- Plan B: AI semantic filtering with designed prompt ready
- Test data available: 4 distinctive contamination scenarios documented
- Architecture decisions finalized: claude-collector.js integration points identified

**Next Session Priorities**:
- Implement session grouping logic in claude-collector.js line 90-91
- Add Plan A/B decision tree before noise filtering
- Integrate AI filter module with structured prompt

### 2025-09-29 - Evening: Implementation and Enhancement Decisions ✅
**Duration**: Post-instrumentation reflection and planning session
**Primary Focus**: Identify remaining implementation requirements and edge case handling

**New Design Decisions Captured**:
- **DD-013**: AI reasoning emission for debugging session selection (Outstanding)
- **DD-014**: /clear command boundary detection strategy (Outstanding)
- **DD-015**: Validation testing with known /clear commit (Outstanding)
- **DD-016**: Conditional telemetry enhancement based on testing gaps (Outstanding)

**Implementation Plan Enhanced**:
- **Milestone 2 added**: /clear command testing and validation as high priority
- **Milestone renumbering**: Debug output moved to Milestone 3
- **Task specifications**: Detailed /clear boundary detection requirements
- **Validation strategy**: Real-world /clear commit identified as primary test case

**Key Insight**: /clear command creates definitive session boundaries that need programmatic detection rather than relying solely on AI pattern recognition. This addresses a critical edge case in multi-session contamination scenarios.

**Implementation Status**: Research complete, 4 core design decisions made, ready for /clear-aware implementation phase

### 2025-09-29 - Evening: Core Session Isolation Implementation Complete ✅
**Duration**: ~6 hours (estimated from file changes and conversation)
**Commits**: Implementation work (ready to commit)
**Primary Focus**: Complete Plan A/B session filtering architecture with full telemetry

**Completed PRD Items**:
- [x] **Plan A/B Architecture** - Complete single/multi-session detection logic in claude-collector.js (lines 140-161)
- [x] **AI Session Filter Module** - Full 777-line implementation with OpenAI integration (`src/utils/session-filter.js`)
- [x] **Session grouping by sessionId** - Implemented in message collection pipeline
- [x] **Plan A: Single session fast path** - Zero overhead for single sessions (lines 143-148)
- [x] **Plan B: AI session relevance filter** - Dynamic import and semantic analysis (lines 150-161)
- [x] **Telemetry infrastructure** - Comprehensive OTEL spans, metrics, and attributes for all session operations
- [x] **Updated standards.js** - 134 lines of session filtering telemetry conventions

**Technical Achievements**:
- **Architecture**: Plan A/B approach provides optimal performance (fast path) with intelligent fallback (AI analysis)
- **Integration**: Seamless integration into existing claude-collector.js pipeline before noise filtering
- **Telemetry**: Full observability with spans for debugging and metrics for monitoring session filter decisions
- **AI Integration**: Complete OpenAI-powered session relevance analysis with git context and structured JSON responses
- **Code Quality**: Over-instrumentation corrected (removed parseTimestamp spans to avoid 60+ span pollution)

**Implementation Evidence**:
- `src/collectors/claude-collector.js`: +146 lines, -37 lines - Core Plan A/B logic
- `src/utils/session-filter.js`: 777 lines - Complete AI filter with 8 instrumented functions
- `src/telemetry/standards.js`: +134 lines - Session filtering telemetry standards
- Full OTEL instrumentation validated through console traces and Datadog integration

**Next Session Priorities**:
- Test implementation against /clear command scenarios (DD-015)
- Add AI reasoning emission for debugging (DD-013)
- Validate session boundary detection across /clear commands
- Conduct end-to-end testing with real multi-session scenarios

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

## How Telemetry Informed This Design

The `/prd-next-telemetry-powered` analysis revealed critical insights that shaped our approach:

### 1. **Revealed Real Execution Flow**
Trace data showed: `context.gather_for_commit` (404ms) → `claude.collect_messages` (365ms) → `context.filter_messages` (0ms)
- The 0ms duration on `filter_messages` revealed filtering actually happens in the collector
- This informed where to insert session grouping logic

### 2. **Showed Current Filtering Patterns**
Logs revealed the two-stage filtering:
- "Filtered out 1183 messages (wrong project) + 29406 messages (outside time window)"
- "Filtered out 40 noisy messages (tool calls, system messages, empty content)"
- This informed our per-session filtering approach

### 3. **Validated Problem Impact**
- 16 successful journal generations this week
- But no sessionId filtering means potential contamination in every one
- Telemetry quantified the problem's real-world impact

### 4. **Guided Design Evolution Through Dialogue**
Our iterative discussion used telemetry insights to evolve from:
- Initial: Time-based "most recent activity" heuristics
- Problem: "We shouldn't be guessing about session relevance"
- Solution: Plan A (definitive signals) → Plan C (intelligent analysis)
- Architecture: Filter each session independently for clean AI comparison

The telemetry didn't just show us WHAT the system does, but HOW it does it - enabling a solution that fits naturally into the existing pipeline.

## Notes

- This PRD addresses a critical issue affecting journal quality and narrative coherence
- Solution leverages existing `sessionId` field in Claude Code messages
- Implementation preserves backward compatibility and existing workflow
- **Design informed by runtime telemetry analysis**: Used actual system behavior to guide architecture decisions
- Fallback mechanisms ensure journal generation never fails due to session detection issues