# PRD-001: Automated Git Journal System with AI Assistant Context Integration

**Issue**: [#1](https://github.com/wiggitywhitney/commit_story/issues/1)  
**Status**: Planning  
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
- **FR-014**: Store journal entries in daily markdown files in `journal/` directory
- **FR-015**: Aggregate multiple commits per day into single file
- **FR-016**: Maintain chronological order of entries within daily files
- **FR-017**: Handle file creation, updates, and concurrent access safely

### Technical Requirements

#### 1. Implementation Stack
- **TR-001**: Node.js runtime environment
- **TR-002**: OpenAI API integration for content generation
- **TR-003**: Git integration for commit data collection
- **TR-004**: JSONL parsing for Claude Code chat file processing
- **TR-005**: File system operations for journal management

#### 2. Performance & Reliability
- **TR-006**: Journal generation completes within 30 seconds
- **TR-007**: System handles concurrent commits gracefully
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

## Implementation Milestones

### Phase 1: Foundation (Week 1)
- [x] **M1.1**: Set up Node.js project with OpenAI dependency
- [ ] **M1.2**: Implement git commit data collection
- [ ] **M1.3**: Build Claude Code JSONL file parser
- [ ] **M1.4**: Create basic journal file management system

### Phase 2: Core Integration (Week 2)
- [ ] **M2.1**: Implement time-based chat context matching
- [ ] **M2.2**: Build AI content generation with OpenAI integration
- [ ] **M2.3**: Create git post-commit hook installation system
- [ ] **M2.4**: End-to-end testing of commit → journal entry workflow

### Phase 3: Enhancement & Polish (Week 3)
- [ ] **M3.1**: Add error handling and graceful degradation
- [ ] **M3.2**: Implement concurrent commit handling
- [ ] **M3.3**: Add configuration options and customization
- [ ] **M3.4**: Documentation and installation guide

### Phase 4: Production Readiness (Week 4)
- [ ] **M4.1**: Security review and sensitive data filtering
- [ ] **M4.2**: Performance optimization and testing
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
- **R-004**: Concurrent git operations causing file conflicts
  - *Mitigation*: Proper file locking and atomic operations

### Low Risk
- **R-005**: Git hook installation across different systems
  - *Mitigation*: Cross-platform testing and clear documentation

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
- Basic connectivity test confirms API functionality
- `.env.example` template for user configuration

**Next Session Priority**: M1.2 - Implement git commit data collection

- **2025-08-14**: PRD created, GitHub issue opened, initial planning complete