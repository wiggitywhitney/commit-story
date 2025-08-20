# Claude Code Chat Storage Research (M1.3a)

## Research Summary
Research findings for understanding Claude Code chat storage structure and time-window correlation for the automated git journal system.

## File Structure

### Storage Location
- **Path**: `~/.claude/projects/[project-path-encoded]/`
- **File Format**: JSONL (one JSON object per line)
- **File Naming**: UUID-based (e.g., `3a60dff4-1d78-4338-abae-b933110b3e31.jsonl`)
- **Project Encoding**: Path separators replaced with hyphens

### Message Structure
```json
{
  "parentUuid": "previous-message-uuid", 
  "isSidechain": false,
  "userType": "external", 
  "cwd": "/working/directory/path",
  "sessionId": "session-uuid",
  "version": "1.0.85",
  "gitBranch": "master",
  "type": "user|assistant",
  "message": {
    "role": "user|assistant", 
    "content": "string or array"
  },
  "isMeta": true|false,
  "uuid": "message-uuid",
  "timestamp": "2025-08-20T20:54:46.152Z"
}
```

## Extraction Logic Testing

### Project Filtering Test
- **Total messages**: 468
- **Messages with matching CWD**: 467
- **Messages with other CWDs**: 1 (missing cwd field)
- **Accuracy**: 99.8%

**Result**: Simple `cwd` field matching works for project filtering.

### Time-Window Extraction Test
**Test Case**: Latest commit (2025-08-20T15:53:49-05:00)
- **Previous commit**: 2025-08-14T16:45:01-05:00  
- **Time window**: 5 days
- **Messages extracted**: 233

### Partial Session Extraction Test
**Long session** (42829480..., 94 messages over 5 days):
- **Commit 1** (c74e71e): 8 messages extracted
- **Commit 2** (09c9850): 86 messages extracted  
- **Commit 3** (b535d74): 0 messages extracted

**Result**: Sessions can be split across commit time windows.

## Timestamp Handling

### Format Standards
- **Chat timestamps**: UTC ISO format `2025-08-20T20:54:46.152Z`
- **Git timestamps**: Local timezone with offset `2025-08-20T15:53:49-05:00`

### Parsing Strategy
1. **Chat**: `datetime.fromisoformat(timestamp.replace('Z', '+00:00'))`
2. **Git**: `datetime.fromisoformat(git_timestamp)`
3. **Convert both to UTC for comparison**

### Validation
- **Git commit**: `2025-08-20T15:53:49-05:00` → `2025-08-20T20:53:49+00:00` UTC
- **Chat message**: `2025-08-20T20:54:46.152Z` → `2025-08-20T20:54:46.152+00:00` UTC
- **Time difference**: 11 seconds

## Simple Extraction Algorithm

```javascript
function extractChatForCommit(commitTime, previousCommitTime, repoPath) {
  const messages = [];
  
  // 1. Find all JSONL files in Claude projects directory
  const files = findClaudeProjectFiles(repoPath);
  
  // 2. Process each file
  for (const file of files) {
    const lines = readJSONLFile(file);
    
    for (const line of lines) {
      const message = JSON.parse(line);
      
      // 3. Filter by project
      if (message.cwd !== repoPath) continue;
      
      // 4. Filter by time window
      const messageTime = parseTimestamp(message.timestamp);
      if (previousCommitTime <= messageTime && messageTime <= commitTime) {
        messages.push(message);
      }
    }
  }
  
  return messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
```

## Implementation Notes
- **No content filtering** during extraction - get everything
- **Simple project matching** - use cwd field only
- **Handle partial sessions** - extract relevant portions of long sessions

---
*Research completed: 2025-08-20*  
*Next milestone: M1.3b - Build Claude Code JSONL parser*