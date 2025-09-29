# Session Isolation Research Findings (PRD-25)

**Research Date**: 2025-09-29
**Purpose**: Understand Claude Code sessionId behavior for implementing session isolation in claude-collector.js

## Executive Summary

Confirmed that multiple Claude Code tabs create separate sessionIds, causing cross-contamination in journal entries. The Plan A/B approach in PRD-25 is the correct solution.

## Test Environment Created

Created controlled test with 4 distinct sessions:

| SessionId (first 8 chars) | Tab Status | Content | Contamination Risk |
|---------------------------|------------|---------|-------------------|
| `ecdd3ba0` | 2 tabs (--continue) | PRD-25 technical research | Low (same topic) |
| `50d1198c` | 1 tab (active) | Zebra biology discussion | HIGH |
| `0a91338a` | 1 tab (active) | Software limerick poetry | HIGH |
| `47641e77` | Closed | Jupiter astronomy facts | HIGH (persists) |

## Key Behavioral Findings

### 1. Multi-Tab Session Creation ✅
- **Normal new tabs** → Unique sessionIds (contamination source)
- **--continue flag** → Shared sessionId (no contamination within shared session)
- **Evidence**: 4 different sessionIds for 5 tabs (2 tabs shared via --continue)

### 2. Session Persistence After Tab Closure ✅
- **JSONL files persist** after tab closure
- **Content remains** in time window collection
- **Risk**: Closed sessions still contaminate journals
- **Evidence**: Jupiter tab closed but file exists with full conversation

### 3. Compaction Does NOT Change SessionId ✅
- **SessionId preserved** through /compact
- **File grows larger** (adds compaction summary)
- **Message count increases** (system messages added)
- **Evidence**: Zebra session `50d1198c` maintained same sessionId after compaction
  - Before: 9,825 bytes, 11 messages
  - After: 18,038 bytes, 18 messages

### 4. Real Contamination Scenario Confirmed ✅
If journal generated now, would mix:
- Technical session isolation discussions
- Zebra stripe biology facts
- Software engineering limericks
- Jupiter planetary science questions

### 5. Application Restart Preserves SessionIds (with --continue) ✅
- **SessionIds persist** through Claude Code quit/restart cycle
- **--continue flag required** to resume specific conversations
- **Session continuity** maintained across app restarts when using --continue
- **Evidence**: Session `ecdd3ba0` successfully resumed after full app restart using --continue
- **Important**: Without --continue, restart likely creates new sessionId

## Remaining Questions (Lower Priority)

### MEDIUM PRIORITY - Edge Cases
- **Q**: What's the maximum messages before compaction triggers?
- **Q**: How long do sessionId files persist?
- **Q**: What happens with multiple repositories?

## AI Filter Context Requirements

Based on findings, the AI filter (Plan B) needs different instructions for:

### Scenario 1: Parallel Tabs (Different Topics)
- **Pattern**: Multiple sessionIds, overlapping timestamps
- **Evidence**: Technical research + zebras + limericks simultaneously
- **AI Instruction**: "Select session most relevant to commit changes"

### Scenario 2: Sequential Sessions (Same Topic)
- **Pattern**: Multiple sessionIds, sequential timestamps, related content
- **AI Instruction**: "Include all related sessions as continuation"

### Scenario 3: --continue Sessions (Same Topic)
- **Pattern**: Single sessionId, multiple tabs, same content
- **AI Instruction**: "Use all messages (no filtering needed)"

### Scenario 4: Compacted Sessions
- **Pattern**: Single sessionId with compaction markers
- **AI Instruction**: "Treat as single logical session"

## Implementation Readiness

✅ **Plan A Logic**: Single sessionId → use all messages (fast path)
✅ **Plan B Logic**: Multiple sessionIds → AI semantic filtering
✅ **Test Data**: 4 distinctive sessions for validation
⚠️ **App Restart**: Still need to test persistence behavior

## Files for Implementation Testing

Real JSONL files with test content:
- `~/.claude/projects/-Users-whitney-lee-Documents-Repositories-commit-story/ecdd3ba0-*.jsonl` (PRD-25 research)
- `~/.claude/projects/-Users-whitney-lee-Documents-Repositories-commit-story/50d1198c-*.jsonl` (zebra biology)
- `~/.claude/projects/-Users-whitney-lee-Documents-Repositories-commit-story/0a91338a-*.jsonl` (limerick poetry)
- `~/.claude/projects/-Users-whitney-lee-Documents-Repositories-commit-story/47641e77-*.jsonl` (Jupiter facts)

## Next Steps

1. **Complete app restart testing**
2. **Write session detection algorithm** based on findings
3. **Implement Plan A/B logic** in claude-collector.js
4. **Test with real contamination scenarios**
5. **Validate session isolation works**

---
*Research conducted through controlled multi-tab testing on 2025-09-29*