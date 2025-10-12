# File/Directory Exclusion System for Journal Noise Reduction

**Issue**: [#2](https://github.com/wiggitywhitney/commit_story/issues/2)  
**Status**: Not Planning to Implement (2025-10-12 - Not a problem worth solving for current workflow)  
**Created**: 2025-09-02  
**Last Updated**: 2025-09-02  

## Problem Statement

The automated journal system currently captures all changes, including task management files (PRDs, TODO lists, project tracking documents) that generate entries focused on administrative processes rather than engineering work. Recent journal entries demonstrate this issue:

> "During this development session, the developer focused on completing the Technical Decisions section (M2.2c) for the Automated Git Journal System. The work was primarily documented in a markdown file..."

Administrative noise drowns out actual engineering insights and technical decisions, reducing the value of generated journals for developers seeking to understand their engineering progress.

## Solution Overview

Implement a user-controlled file/directory exclusion system that filters administrative content from journal generation while preserving the core development narrative and technical context.

### Core Capabilities

1. **`.commitstoryignore` Configuration File**
   - Git-ignore style pattern matching
   - Support for file paths, directory paths, and glob patterns
   - User-defined exclusion rules

2. **Git Diff Filtering**
   - Remove changes to excluded files from diff context
   - Preserve commit messages for narrative continuity
   - Filter applied at collection time

3. **Chat Message Filtering**
   - Filter messages that heavily reference excluded file paths
   - Simple heuristic-based approach (not complex content analysis)
   - Preserve general discussion context

4. **Built-in Exclusions**
   - Auto-exclude journal directory to prevent recursion
   - No other built-in patterns (user choice only)

## Technical Requirements

### TR-023: Configuration File Support
**Requirement**: System must read and parse `.commitstoryignore` file from repository root  
**Acceptance Criteria**: 
- Support glob patterns (`*.md`, `prds/**`, etc.)
- Support directory exclusions (`docs/`, `task-tracking/`)
- Handle missing file gracefully
- Cache patterns for performance

### TR-024: Git Diff Filtering Implementation  
**Requirement**: Filter excluded files from git diff context during collection  
**Acceptance Criteria**:
- Integration with existing `git-collector.js` 
- Preserve commit hash, message, and timestamp
- Remove diff chunks for excluded files only
- Maintain diff parsing compatibility

### TR-025: Chat Message Path-Based Filtering
**Requirement**: Filter chat messages that primarily discuss excluded files  
**Acceptance Criteria**:
- Simple path mention detection (not NLP)
- Filter messages with high excluded file path density
- Preserve general development discussions
- Integration with existing chat filtering

## Milestones

### M3.1: Core Exclusion Infrastructure
- [ ] **M3.1a**: Exclusion utility module implementation
  - [ ] Create `src/utils/exclusion-matcher.js`
  - [ ] Implement `.commitstoryignore` parser
  - [ ] Add glob pattern matching
  - [ ] Add built-in journal directory exclusion
  - [ ] Unit tests for pattern matching

### M3.2: Git Diff Filtering Integration  
- [ ] **M3.2a**: Git collector enhancement
  - [ ] Modify `src/collectors/git-collector.js` to use exclusions
  - [ ] Filter diff output for excluded files
  - [ ] Preserve commit metadata
  - [ ] Validation testing with excluded files

### M3.3: Chat Filtering Integration
- [ ] **M3.3a**: Context integrator enhancement  
  - [ ] Modify `src/integrators/context-integrator.js`
  - [ ] Implement path-based chat filtering
  - [ ] Preserve non-excluded discussions
  - [ ] Testing across various chat scenarios

### M3.4: Testing and Documentation
- [ ] **M3.4a**: End-to-end validation
  - [ ] Test with various exclusion patterns
  - [ ] Validate journal quality improvement
  - [ ] Performance testing with large repositories
- [ ] **M3.4b**: Documentation updates
  - [ ] Update README.md with configuration section
  - [ ] Add usage examples
  - [ ] Document filtering behavior

## Design Decisions

### DD-068: Preserve Commit Messages for Narrative Flow
**Decision**: Do not filter commit messages even when they reference excluded files  
**Rationale**: Commit messages provide essential narrative continuity and context about the development session flow  
**Impact**: Users maintain story coherence while removing file-level noise

### DD-069: Simple Path-Based Chat Filtering  
**Decision**: Use simple file path mention detection rather than complex content analysis for chat filtering  
**Rationale**: Complex NLP filtering would be unreliable and add unnecessary complexity; path-based filtering addresses the core use case of removing file-focused discussions  
**Impact**: Simple, predictable filtering behavior that developers can understand and control

### DD-070: User-Controlled Exclusions Only
**Decision**: No built-in exclusion patterns except journal directory auto-exclusion  
**Rationale**: Each project has different administrative file patterns; developers should have full control over what constitutes "noise" in their context  
**Impact**: Maximum flexibility while preventing unintended exclusions

## Success Criteria

1. **Journal Quality**: Generated entries focus on engineering work rather than administrative tasks
2. **User Control**: Developers can easily configure exclusions for their project patterns
3. **Context Preservation**: Important development context and narrative flow remain intact
4. **Performance**: Exclusion filtering doesn't significantly impact generation time
5. **Compatibility**: Existing journal generation pipeline works unchanged when no exclusions are configured

## Progress Log

**2025-09-02**: PRD creation and documentation session
- **Duration**: 1 hour
- **GitHub Issue**: Created issue #2 with "PRD" label and comprehensive problem statement linking administrative noise to engineering journal quality degradation
- **PRD Documentation**: Complete PRD-002 created with technical requirements (TR-023, TR-024, TR-025), 4-phase milestone structure, and 3 design decisions with architectural rationale
- **README Integration**: Enhanced configuration documentation with `.commitstoryignore` examples and filtering behavior explanation
- **Traceability**: Established PRD-002 reference comments throughout documentation for implementation tracking
- **Next Priority**: Begin M3.1a implementation with exclusion utility module development

---

**Project**: Automated Git Journal System  
**Component**: Context Collection Enhancement  
**Priority**: Medium  
**Estimated Effort**: 2-3 development sessions