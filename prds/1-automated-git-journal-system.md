# PRD-001: Automated Git Journal System with AI Assistant Context Integration

**Issue**: [#1](https://github.com/wiggitywhitney/commit_story/issues/1)  
**Status**: In Development  
**Priority**: P0 - Foundation Feature  
**Created**: 2025-08-14  
**Owner**: @wiggitywhitney  

## Executive Summary

Build an automated journaling system that generates meaningful development narratives by combining git commit data with AI assistant conversation context. This system will capture not just what code changed, but why it changed and the reasoning process behind development decisions.

## Problem Statement

Developers lose valuable context about their development decisions and reasoning process over time. Traditional git logs capture technical changes but miss the crucial "why" and "how" of AI-assisted development sessions. This leads to:

- Lost context about decision rationale
- Difficulty understanding past code changes
- Inability to learn from previous development patterns
- Missing narrative for technical storytelling and documentation

## Goals & Success Metrics

### Primary Goals
1. **Seamless Context Capture**: Automatically collect development context without workflow disruption
2. **Meaningful Narratives**: Generate readable summaries that explain both what changed and why
3. **AI Conversation Integration**: Preserve key insights from AI assistant interactions
4. **Daily Development Story**: Create continuous development narrative through daily journal aggregation

### Success Metrics
- ✅ 100% of commits automatically generate journal entries
- ✅ Journal entries capture both technical changes and reasoning process
- ✅ AI assistant context accurately matched to commit timeframes (95%+ accuracy)
- ✅ Readable output that provides development narrative value
- ✅ Zero workflow interruption - system operates in background

## Feature Requirements

### Core Functionality

#### 1. Automated Triggering System
- **FR-001**: System triggers automatically on git commit via post-commit hooks
- **FR-002**: Background processing ensures zero workflow interruption
- **FR-003**: Error handling prevents commit failures if journal generation fails

#### 2. Context Collection Engine
- **FR-004**: Collect git commit data (diff, message, timestamp, metadata)
- **FR-005**: Parse Claude Code chat history from `~/.claude/projects/*.jsonl` files
- **FR-006**: Time-based matching of chat conversations to commit windows
- **FR-007**: Include previous journal entries for narrative continuity
- **FR-008**: Support multiple conversation sources (extensible architecture)

#### 3. AI-Powered Content Generation
- **FR-009**: Convert git diffs into meaningful English descriptions of changes
- **FR-010**: Synthesize chat context with code changes for comprehensive narrative
- **FR-011**: Extract and preserve key quotes from AI assistant conversations
- **FR-012**: Generate concise summaries that capture development session essence
- **FR-013**: Use fresh OpenAI instances for each generation (no context bleeding)

#### 4. Journal File Management
- **FR-014**: Store journal entries in daily markdown files in `journal/entries/YYYY-MM/` monthly directories
- **FR-015**: Aggregate multiple commits per day into single file
- **FR-016**: Maintain chronological order of entries within daily files
- **FR-017**: Handle file creation, updates, and directory structure atomically

### Technical Requirements

#### 1. Implementation Stack
- **TR-001**: Node.js runtime environment
- **TR-002**: OpenAI API integration for content generation
- **TR-003**: Git integration for commit data collection
- **TR-004**: JSONL parsing for Claude Code chat file processing
- **TR-005**: File system operations for journal management

#### 2. Performance & Reliability
- **TR-006**: Journal generation completes within 30 seconds
- **TR-008**: Graceful degradation when AI services unavailable
- **TR-009**: Local operation with minimal external dependencies

#### 3. Data Privacy & Security
- **TR-010**: All processing happens locally (no data sent except to OpenAI)
- **TR-011**: OpenAI API key stored securely via environment variables
- **TR-012**: No sensitive code content logged or exposed
- **TR-013**: Chat content filtered for sensitive information before AI processing

## Architecture Overview

```
Git Commit → Post-commit Hook → Context Collection → AI Processing → Journal Entry
     ↓              ↓                    ↓              ↓              ↓
  Metadata    Trigger Script    Git Diff + Chat    OpenAI API    Daily Markdown
                                   History                         File
```

### Component Breakdown

1. **Git Hook System**: Automatic triggering via post-commit hooks
2. **Context Collector**: Gathers git data and Claude Code chat history
3. **Time Window Matcher**: Associates chat conversations with commit timeframes
4. **AI Content Generator**: Uses OpenAI to create meaningful summaries and extract quotes
5. **Journal File Manager**: Handles daily file creation and updates

## Design Decisions & Constraints

### DD-001: NO TESTING
**Decision**: This system will have NO automated tests, unit tests, integration tests, or test frameworks.  
**Rationale**: Minimal viable approach - ship working code, iterate based on real usage.  
**Impact**: Faster development, simpler codebase, learn from actual usage patterns.

### DD-002: No CLI Interface
**Decision**: System operates only through git hooks, no manual command-line interface.  
**Rationale**: Aligns with "zero workflow interruption" requirement.  
**Impact**: Pure event-driven automation, simpler architecture.

### DD-003: Simple Debug Strategy
**Decision**: Debug by running the process in foreground instead of background.  
**Rationale**: No need for complex logging infrastructure or environment variables.  
**Implementation**:
- Normal: Background process, silent operation
- Debug: Run manually in foreground, see terminal output
**Impact**: Minimal complexity, easy troubleshooting when needed.

### DD-004: Minimal Implementation Only
**Decision**: Each milestone delivers exactly what's needed, no extras.  
**Rationale**: Ship fast, learn fast, avoid over-engineering.  
**Impact**: Clear scope boundaries, faster iterations.

### DD-005: Research-First Implementation Approach
**Decision**: Add discovery/research phases before complex implementations.  
**Rationale**: Understanding data structures and requirements before building prevents wrong implementations and reduces rework.  
**Impact**: Adds research phase to complex components, slightly extends timeline but reduces technical risk.

### DD-006: Monthly Directory Organization
**Decision**: Journal entries stored in monthly subdirectories: `journal/entries/YYYY-MM/YYYY-MM-DD.md`  
**Rationale**: Prevents journal directory from becoming unwieldy (365+ files per year in flat structure). Minimal complexity cost for significant usability improvement.  
**Impact**: Slightly more complex path handling but prevents directory scalability issues.

### DD-007: No Frontmatter/Tags for MVP
**Decision**: Skip YAML frontmatter and tags in initial implementation  
**Rationale**: Adds parsing complexity and AI prompt engineering complexity without immediate benefit. Tags would be inconsistent without taxonomy. Can be added when summary generation or search features are implemented.  
**Impact**: Cleaner, simpler implementation. Tags can be retrofitted later when actually needed.

### DD-008: No File Locking for Concurrent Commits
**Decision**: Use simple `fs.appendFile()` without file locking mechanisms  
**Rationale**: Single-developer tool with extremely low probability of simultaneous commits. OS-level atomic appends are sufficient.  
**Impact**: Massively simplified implementation, eliminates complex locking libraries.

### DD-009: Simple Markdown Entry Format
**Decision**: Basic markdown format with timestamp and commit hash headers, no structured metadata  
**Rationale**: Readable by humans, parseable by future tools, minimal complexity. Structured data can be added later if needed.  
**Impact**: Clean, readable journal entries that work immediately.

## Implementation Milestones

### Phase 1: Foundation (Week 1)
- [x] **M1.1**: Set up Node.js project with OpenAI dependency
- [x] **M1.2**: Implement git commit data collection (core functions only)
- [x] **M1.3a**: Research Claude Code chat storage structure and time-window correlation
- [x] **M1.3b**: Build Claude Code JSONL file parser (based on M1.3a findings)
- [x] **M1.5**: Create basic journal file management system

### Phase 2: Core Integration (Week 2)
- [x] **M2.1**: Implement time-based chat context matching
- [ ] **M2.2**: Build AI content generation with OpenAI integration
- [ ] **M2.3**: Create git post-commit hook installation system
- [ ] **M2.4**: Validate commit → journal entry workflow

### Phase 3: Enhancement & Polish (Week 3)
- [ ] **M3.1**: Add error handling and graceful degradation
- [ ] **M3.2**: Implement concurrent commit handling
- [ ] **M3.3**: Add configuration options and customization
- [ ] **M3.4**: Documentation and installation guide

### Phase 4: Production Readiness (Week 4)
- [ ] **M4.1**: Security review and sensitive data filtering
- [ ] **M4.2**: Performance optimization
- [ ] **M4.3**: Edge case handling and robustness improvements
- [ ] **M4.4**: Release preparation and packaging

## Risk Assessment

### High Risk
- **R-001**: OpenAI API rate limits or service availability
  - *Mitigation*: Implement retry logic and graceful degradation
- **R-002**: Large git diffs overwhelming AI context limits
  - *Mitigation*: Implement diff summarization and chunking

### Medium Risk
- **R-003**: Claude Code chat file format changes
  - *Mitigation*: Flexible parsing with version detection

### Low Risk
- **R-005**: Git hook installation across different systems
  - *Mitigation*: Clear documentation and simple installation
- **R-006**: Claude Code conversation correlation complexity
  - *Mitigation*: Thorough research phase (M1.3a) before implementation

## Open Questions

1. How should the system handle very large git diffs that exceed AI context limits?
2. What level of chat content filtering is needed for privacy/security?
3. Should the system support custom journal entry templates?
4. How to handle repositories with multiple active developers?

## References

- **Project Specification**: [project-spec.md](../project-spec.md)
- **GitHub Issue**: [#1](https://github.com/wiggitywhitney/commit_story/issues/1)
- **Claude Code Documentation**: Local chat storage format in `~/.claude/projects/`

## Progress Log

### 2025-08-14: Node.js Foundation Setup Complete
**Duration**: ~45 minutes 
**Focus**: Project infrastructure and OpenAI integration

**Completed PRD Items**:
- [x] M1.1: Set up Node.js project with OpenAI dependency - Evidence: Full project structure, working OpenAI client, connectivity validated

**Implementation Details**:
- Node.js project with ESM modules and modern configuration
- OpenAI SDK integration with environment-based API key management
- Modular directory structure ready for core components
- Basic connectivity validation confirms API functionality
- `.env.example` template for user configuration

**Next Session Priority**: M1.2 - Implement git commit data collection

### 2025-08-20: Minimal Design Decisions  
**Duration**: Design session
**Focus**: Strategic decisions for truly minimal implementation

**Key Design Decisions**:
- [x] DD-001: NO TESTING - Zero automated tests, ship and iterate based on real usage
- [x] DD-002: No CLI Interface - Pure git hook automation only  
- [x] DD-003: Simple Debug Strategy - Foreground process for debugging, no complex logging
- [x] DD-004: Minimal Implementation Only - Deliver exactly what's needed, nothing more

**PRD Updates**:
- Removed all testing references from milestones (M2.4, M4.2)
- Added explicit Design Decisions & Constraints section
- Clarified M1.2 as "core functions only"
- Established minimal viable approach as guiding principle

### 2025-08-20: Git Commit Data Collection Complete
**Duration**: ~2 hours  
**Focus**: M1.2 implementation with git hook workflow optimization

**Completed PRD Items**:
- [x] M1.2: Implement git commit data collection (core functions only) - Evidence: Working `src/collectors/git-collector.js` with `getLatestCommitData()` function

**Implementation Details**:
- Created git collector focused on latest commit (HEAD) for git hook integration
- Successfully extracts all commit metadata: hash, message, author, timestamp, full diff
- Handles large diffs with 10MB buffer (tested with 6.5MB Node.js setup diff)
- Simple error handling returns null on any git command failure
- Optimized for git post-commit hook workflow - no parameters needed

**Next Session Priority**: M1.3a - Research Claude Code chat storage structure

### 2025-08-20: Strategic Pivot to Research-First Approach
**Duration**: Design session  
**Focus**: Critical decision to add research phase before parser implementation

**Key Strategic Decision**:
- [x] DD-005: Research-First Implementation Approach - Add discovery phases before complex implementations

**Implementation Changes**:
- Split M1.3 into M1.3a (research) and M1.3b (implementation based on research)
- Renumbered M1.4 to M1.5 to accommodate research phase
- Added R-006 risk about Claude Code data complexity
- Recognized that time-window correlation requires understanding data structure first

**Rationale**:
Initial approach of jumping directly to parser implementation risked building wrong solution. Need to understand:
- JSONL file structure and session patterns
- Timestamp formats and correlation challenges
- How to match conversations to commit time windows
- Message types and their relevance

**Next Session Priority**: M1.3b - Build Claude Code JSONL parser

### 2025-08-20: Claude Code Chat Storage Research Complete (M1.3a)
**Duration**: ~2 hours  
**Focus**: Understanding Claude Code data structure and time-window correlation strategy

**Completed PRD Items**:
- [x] M1.3a: Research Claude Code chat storage structure and time-window correlation - Evidence: Comprehensive research document at `/docs/claude-chat-research.md`

**Key Research Findings**:
- **Project filtering**: 99.8% accuracy using simple `cwd` field matching
- **Time-window extraction**: Successfully tested with 233 messages from 5-day commit window
- **Partial session extraction**: Confirmed sessions can be split across commit time boundaries
- **Simple extraction algorithm**: Documented clear implementation approach for M1.3b
- **Timestamp correlation**: Validated precise time matching (within seconds) between git commits and chat messages

**Research Documentation**: 
- **Location**: `/docs/claude-chat-research.md`
- **Contains**: File structure analysis, extraction logic testing, timestamp handling, simple algorithm specification
- **Key Algorithm**: Project filtering via `cwd` field + time-window filtering between commits
- **Next Implementation**: M1.3b parser should use this research as specification

**Technical Specifications Ready**:
- JSONL file structure and message format documented
- Project filtering strategy validated (use `cwd` field)
- Time-window correlation strategy proven (previous_commit_time <= chat_time <= current_commit_time)
- Simple extraction algorithm ready for implementation

**Next Session Priority**: M1.5 - Create basic journal file management system

### 2025-08-26: Claude Code JSONL Parser Implementation Complete (M1.3b)
**Duration**: ~3 hours  
**Focus**: Building and validating the chat message extraction parser

**Completed PRD Items**:
- [x] M1.3b: Build Claude Code JSONL file parser (based on M1.3a findings) - Evidence: Working parser at `/src/collectors/claude-collector.js` with successful test validation

**Implementation Details**:
- Created `extractChatForCommit()` function that scans all Claude project directories
- Implements project filtering via `cwd` field matching (99.8% accuracy from research)
- Time-window filtering between commit timestamps with proper UTC conversion
- Error-resilient processing (skips malformed JSON, missing files, bad timestamps)
- Returns complete message objects for downstream AI processing
- No hardcoded values - works across different users/systems

**Validation Results**:
- **Research data test**: Successfully extracted 233 messages from 5-day research window
- **Recent commit test**: Successfully extracted 183 messages from 47-minute window
- **Time correlation**: All extracted messages fall within correct time boundaries
- **Message distribution**: Proper mix of user/assistant messages (109 user, 124 assistant in research test)
- **Project filtering**: Correctly filters messages by repository path using `cwd` field

**Parser Functionality**:
- Simple approach: scan all JSONL files, let `cwd` field filtering handle project matching
- Abandoned complex path encoding optimization in favor of research-validated simple approach
- Graceful error handling for missing directories, unreadable files, malformed JSON
- Chronological message sorting for downstream processing

**Phase 1 Foundation Complete**: All 5 milestones (M1.1, M1.2, M1.3a, M1.3b, M1.5) successfully implemented

**Next Session Priority**: M2.1 - Implement time-based chat context matching

### 2025-08-26: Journal File Management System Complete (M1.5)
**Duration**: ~2 hours  
**Focus**: MVP journal file management with critical design decisions

**Completed PRD Items**:
- [x] M1.5: Create basic journal file management system - Evidence: Working `src/managers/journal-manager.js` with `saveJournalEntry()` function and monthly directory structure

**Critical Design Decisions Made**:
- [x] DD-006: Monthly Directory Organization - `journal/entries/YYYY-MM/YYYY-MM-DD.md` structure
- [x] DD-007: No Frontmatter/Tags for MVP - Skip YAML and tags to avoid complexity without immediate benefit  
- [x] DD-008: No File Locking - Use simple `fs.appendFile()` for single-developer use case
- [x] DD-009: Simple Markdown Format - Clean headers with timestamp and commit hash

**Implementation Details**:
- Monthly directory structure prevents scalability issues (365+ files per year)
- Simple append-based file operations with OS-level atomicity
- Clean markdown format: timestamp headers, commit references, separator lines
- Tested with multiple entries per day - proper aggregation and chronological ordering
- Zero complexity features (tags, frontmatter, locking) deferred until actually needed

**Phase 1 Foundation COMPLETE**: All foundation components ready for Phase 2 integration

**Next Session Priority**: M2.2 - Build AI content generation with OpenAI integration

### 2025-08-26: Time-based Chat Context Matching Complete (M2.1)
**Duration**: ~3 hours  
**Focus**: Integration layer connecting git commits with Claude conversations

**Completed PRD Items**:
- [x] M2.1: Implement time-based chat context matching - Evidence: Working `/src/integrators/context-integrator.js` with `gatherContextForCommit()` function, successful integration test with 115 messages from 4.6-hour development window

**Implementation Details**:
- Created integration module that orchestrates git-collector, claude-collector, and journal-manager
- Correct function signature alignment between all collectors (Date objects, proper parameter order)
- Real-world validation: Successfully extracted and correlated chat context from actual M1.5 development session
- Updated main entry point (`src/index.js`) to demonstrate complete context gathering pipeline
- All foundation components (Phase 1) + integration layer (M2.1) now working together

**Content Quality Discovery**:
- **Finding**: ~41% of extracted messages contain meaningful conversational content (47 of 115 messages)
- **Hypothesis**: ~60% may be empty due to tool calls, system messages, command executions, and structured data
- **Status**: Hypothesis requires further validation - not yet confirmed through systematic analysis
- **Impact**: Current content rate appears sufficient for journal generation based on quality of meaningful messages
- **Decision**: Proceed with M2.2 using current data quality, validate through actual journal generation

**Phase 2 Core Integration**: 25% complete (1 of 4 milestones)

**Next Session Priority**: M2.2 - Build AI content generation with OpenAI integration

- **2025-08-14**: PRD created, GitHub issue opened, initial planning complete