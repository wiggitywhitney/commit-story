# Commit Story

> Automated Git Journal System with AI Assistant Context Integration

<!-- PRD-001: This project implements the automated git journal system as specified in PRD-001 -->

## Overview

Commit Story automatically generates meaningful development narratives by combining git commit data with AI assistant conversation context. Never lose the "why" behind your code changes again.

## Key Features

<!-- PRD-001: Core functionality as defined in Feature Requirements FR-001 through FR-017 -->

- **🔄 Automatic Triggering**: Seamlessly integrates with git via post-commit hooks
- **🧠 AI-Powered Summaries**: Converts technical changes into readable English narratives  
- **💬 Conversation Context**: Captures insights from Claude Code chat interactions
- **📝 Daily Journaling**: Aggregates commits into daily markdown files
- **🎯 Quote Extraction**: Preserves key insights from AI assistant conversations
- **⚡ Background Processing**: Zero workflow interruption

## How It Works

<!-- PRD-001: Implementation follows architecture defined in Architecture Overview section -->

1. **Git Commit** - You commit code as usual
2. **Context Collection** - System gathers git diff, commit message, and recent Claude Code conversations
3. **AI Processing** - OpenAI analyzes context and generates meaningful summary with quotes
4. **Journal Entry** - Daily markdown file updated with new entry in `journal/` directory

## Quick Start

<!-- PRD-001: Installation process will be developed in Phase 3 milestone M3.4 -->

*Coming soon - this project is currently in active development*

## Configuration

<!-- PRD-002: File exclusion configuration system per requirements TR-023, TR-024, TR-025 -->

### File Exclusions

You can exclude files and directories from journal generation by creating a `.commitstoryignore` file in your repository root. This is useful for filtering out administrative files, task management documents, or other content that creates noise in your development journal.

**Example `.commitstoryignore`:**
```
# Exclude PRD and project management files
prds/
*.prd.md
project-management/

# Exclude documentation drafts
docs/drafts/
*.draft.md

# Exclude specific files
TODO.md
ROADMAP.md
```

**Supported Patterns:**
- File paths: `specific-file.md`
- Directory paths: `directory/` (trailing slash recommended)
- Glob patterns: `*.extension`, `path/**/*.md`
- Comments: Lines starting with `#`

**What Gets Filtered:**
- **Git diffs** - Changes to excluded files are removed from context
- **Chat messages** - Messages heavily referencing excluded files are filtered
- **Preserved** - Commit messages remain intact for narrative continuity

**Built-in Exclusions:**
- `journal/` directory is automatically excluded to prevent recursion

## Architecture

<!-- PRD-001: Technical implementation follows requirements TR-001 through TR-013 -->

```
Git Commit → Post-commit Hook → Context Collection → AI Processing → Journal Entry
     ↓              ↓                    ↓              ↓              ↓
  Metadata    Trigger Script    Git Diff + Chat    OpenAI API    Daily Markdown
                                   History                         File
```

**Tech Stack:**
- Node.js runtime
- OpenAI API for content generation
- Claude Code JSONL parsing
- Git integration

## Project Status

<!-- PRD-001: Current status and progress tracking per Implementation Milestones -->

🚧 **Status**: Active Development - Phase 1 (Foundation)

**Current Phase**: Foundation development (Week 1)
- [ ] Node.js project setup with OpenAI dependency
- [ ] Git commit data collection implementation
- [ ] Claude Code JSONL file parser
- [ ] Basic journal file management system

**Next Phase**: Core Integration (Week 2)

## Documentation

<!-- PRD-001: Documentation structure supports project requirements and development process -->

- **[Project Specification](./project-spec.md)** - Technical requirements and implementation details
- **[Product Requirements Document](./prds/1-automated-git-journal-system.md)** - Complete feature specification and milestones
- **[File Exclusion System PRD](./prds/2-file-exclusion-system.md)** - Configuration and filtering requirements
- **[Historical Journal Backfill PRD](./prds/3-journal-history-backfill.md)** - Retrospective journal generation for existing commits
- **[GitHub Issue #1](https://github.com/wiggitywhitney/commit_story/issues/1)** - Feature concept and discussion
- **[GitHub Issue #2](https://github.com/wiggitywhitney/commit_story/issues/2)** - File exclusion system requirements
- **[GitHub Issue #3](https://github.com/wiggitywhitney/commit_story/issues/3)** - Historical journal backfill requirements

## Development

### Prerequisites

- Node.js (v18+)
- OpenAI API key
- Git repository
- Claude Code (for chat context)

### Installation

*Installation guide coming in Phase 3*

## Contributing

This project is currently in early development. Contributions and feedback welcome!

## License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Commit Story**: Because your development journey deserves a narrative, not just a log.