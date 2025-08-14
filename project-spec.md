# Commit Story - Automated Git Journal System

## Project Overview

An automated journaling system that generates meaningful development narratives by combining git commit data with AI assistant conversation context.

## Core Concept

Whenever a git commit is made, automatically create a journal entry that captures:
- What code changed (git diff → English summary of the change's meaning)
- Why it changed (AI assistant conversations)
- Key insights and reasoning (extracted quotes)

## System Requirements

### Trigger Mechanism
- **Git post-commit hooks** - automatic execution after each commit
- No workflow interruption - runs in background

### Context Collection
- **Git commit data**: diff (for AI analysis), message, timestamp, metadata
- **Claude Code chat history**: Parse JSONL files from `~/.claude/projects/`
- **Time-based matching**: Use commit timestamps to find relevant chat windows
- **Previous journal entries**: Build continuity with past context

### AI Processing
- **OpenAI API integration**: Fresh instances for each journal generation
- **Context synthesis**: Combine git data + chat history + previous entries
- **Code change interpretation**: Convert git diffs into meaningful English descriptions
- **Summary generation**: Concise narrative of development session
- **Quote extraction**: Identify and preserve key insights from conversations

### Output Format
- **Simple structure**: Summary + key quotes
- **Markdown format**: Easy to read and version control
- **Daily aggregation**: All commits for a day go into single journal file
- **Storage location**: `journal/` directory within the repository

### Technical Implementation
- **Language**: Node.js
- **Dependencies**: 
  - OpenAI API client
  - Git integration
  - JSONL parsing for Claude Code chat files
  - File system operations for journal management

## System Architecture

```
Git Commit → Post-commit Hook → Context Collection → AI Processing → Journal Entry
     ↓              ↓                    ↓              ↓              ↓
  Metadata    Trigger Script    Git Diff + Chat    OpenAI API    Daily Markdown
                                   History                         File
```

## File Structure
```
repo/
├── .git/
│   └── hooks/
│       └── post-commit
├── journal/
│   ├── 2025-08-14.md
│   ├── 2025-08-15.md
│   └── ...
├── src/
│   ├── collect-context.js
│   ├── generate-journal.js
│   └── install-hooks.js
└── package.json
```

## Implementation Plan

1. **Setup Node.js project** with OpenAI dependency
2. **Build context collection** - parse git data and Claude chat files
3. **Create AI integration** - send context to OpenAI for journal generation
4. **Implement git hooks** - automatic triggering system
5. **Add journal file management** - daily file creation and updates
6. **Test end-to-end workflow** - commit → context → journal entry

## Success Criteria

- Commits automatically generate journal entries
- Journal entries capture both technical changes and reasoning
- Chat context is accurately matched to commit timeframes
- Output is readable and provides development narrative value
- System operates without workflow disruption