# Historical Journal Backfill System

**Issue**: [#3](https://github.com/wiggitywhitney/commit_story/issues/3)  
**Status**: Planning  
**Created**: 2025-09-02  
**Last Updated**: 2025-09-02  

## Problem Statement

When adopting the automated journal system on existing repositories, users encounter commits in their git history that lack corresponding journal entries. This creates an incomplete project narrative and loses valuable development context from earlier work periods when the journal system wasn't active.

Users want to retroactively populate their development journal to create a complete picture of their project's evolution, but doing so manually would be time-consuming and prone to inconsistency.

## Solution Overview

Implement a historical journal backfill system that can retrospectively generate journal entries for past commits that have available Claude Code chat data. The solution emphasizes simplicity and user control while providing safeguards against unexpected costs and processing time.

### Core Capabilities

1. **Smart History Detection**
   - Scan repository commit history for gaps in journal entries
   - Correlate commits with available Claude Code chat data timestamps
   - Estimate processing scope, time, and API costs before execution

2. **Setup Flow Integration**
   - Optional prompt during initial setup to populate historical entries
   - Clear cost/time estimates presented to user
   - "Do it later" option for users who want manual control

3. **Standalone NPM Script**
   - Simple `npm run journal:backfill` (name TBD) for manual execution
   - No CLI framework or complex argument parsing
   - Natural idempotency - subsequent runs only process missing entries

4. **Safety and Progress Features**
   - Cost estimation before processing begins
   - Progress indicators during execution
   - Atomic writes (complete journal entries only - no partial entries on interrupt)
   - Graceful handling of missing or incomplete chat data

## Technical Requirements

### TR-026: Historical Commit Analysis
**Requirement**: System must identify commits without corresponding journal entries that have available chat data  
**Acceptance Criteria**: 
- Scan git history and cross-reference with existing journal files
- Detect commits within available Claude Code chat data timeframe
- Calculate accurate processing estimates (time, API calls, costs)

### TR-027: NPM Script Implementation
**Requirement**: Create standalone script for manual backfill execution  
**Acceptance Criteria**:
- Script file at `src/scripts/backfill-history.js`
- NPM script entry in package.json
- No CLI framework dependencies
- Progress tracking and status output

### TR-028: Setup Flow Integration  
**Requirement**: Integrate backfill option into setup process  
**Acceptance Criteria**:
- Optional prompt with clear cost/time estimates
- User choice: immediate execution, skip, or defer to manual script
- Shared logic between setup and standalone script
- No impact on users who decline backfill

### TR-029: Atomic Journal Entry Writing
**Requirement**: Prevent partial journal entries when process is interrupted  
**Acceptance Criteria**:
- Complete entry generation before writing to file

### TR-030: Error Marker Detection and Regeneration
**Requirement**: Identify and regenerate entries containing error markers from failed generations  
**Acceptance Criteria**:
- Error markers use format: `[Section generation failed: reason]`
- Backfill should consider regenerating entries containing error markers, not just missing entries
- During backfill implementation, consider updating error messages to suggest using backfill
- Graceful handling of SIGINT/SIGTERM
- No incomplete or corrupted journal entries
- Safe to restart after interruption

## Milestones

### M4.1: Core History Analysis Infrastructure
- [ ] **M4.1a**: History scanner implementation
  - [ ] Create `src/utils/history-scanner.js`
  - [ ] Implement git commit history parsing
  - [ ] Cross-reference with existing journal entries
  - [ ] Correlate with available Claude Code chat timestamps

### M4.2: Backfill Script Development
- [ ] **M4.2a**: Standalone backfill script
  - [ ] Create `src/scripts/backfill-history.js`
  - [ ] Implement batch processing logic
  - [ ] Add progress tracking and status output
  - [ ] Ensure atomic entry writing

### M4.3: Cost and Safety Features
- [ ] **M4.3a**: Cost estimation system
  - [ ] Calculate API call estimates based on commit count
  - [ ] Provide time estimates based on processing benchmarks
  - [ ] Present clear cost breakdown to users

### M4.4: Setup Integration
- [ ] **M4.4a**: Setup flow enhancement
  - [ ] Add backfill detection and prompting
  - [ ] Integrate cost/time estimation display
  - [ ] Provide clear user choices
  - [ ] Share logic with standalone script

### M4.5: NPM Script Configuration
- [ ] **M4.5a**: Package.json and naming
  - [ ] Finalize npm script naming (discuss options)
  - [ ] Add script entry to package.json
  - [ ] Test script execution and error handling

### M4.6: Testing and Documentation
- [ ] **M4.6a**: End-to-end validation
  - [ ] Test with repositories of various sizes
  - [ ] Validate cost estimation accuracy
  - [ ] Test interrupt/restart scenarios
- [ ] **M4.6b**: Documentation updates
  - [ ] Add "Historical Journal Population" section to README.md
  - [ ] Document both setup and npm script approaches
  - [ ] Include troubleshooting guidance

## Design Decisions

### DD-061: NPM Script vs CLI Tool
**Decision**: Implement as simple NPM script rather than full CLI tool  
**Rationale**: 
- Feature is primarily one-time operation
- No need for complex argument parsing or CLI framework
- Keeps project dependencies minimal
- Natural re-run behavior handles edge cases

### DD-062: Setup Integration Approach
**Decision**: Optional prompt during setup with manual script fallback  
**Rationale**:
- Maximizes discoverability for new users
- Provides control for users who want to defer
- Maintains setup simplicity for users who decline

### DD-063: NPM Script Naming Strategy
**Decision**: Defer naming decision to implementation review
**Candidates**:
- `journal:populate-history`
- `journal:generate-past`
- `journal:catch-up`
- `journal:backfill`

**Evaluation Criteria**: Self-descriptive, clear purpose, consistent with existing patterns

### DD-064: Squash Merge Handling
**Decision**: Defer to implementation time (requires user research and testing)

**Problem**:
Squash merges destroy granular commit history by combining multiple commits (each with their own journal entries) into a single commit. This fundamentally conflicts with commit-story's goal of preserving detailed development narrative.

**Example**:
- Individual commits: `6d80b64` (Milestone 3 impl), `135f57f` (PRD update), `7018b09` (CodeRabbit fixes) - each with detailed journal entries
- After squash merge: Single commit `4430d2d` "Milestone 3 complete" - loses all granular context
- Result: Condensed changelog referencing multiple features, original commits no longer exist in history

**Question for Implementation**: Should backfill detect squashed commits and warn/skip them?

**Considerations**:
- Squashed commits have condensed messages that may reference multiple unrelated features
- Original individual commits no longer exist in main branch history
- Attempting to generate a journal entry may produce confusing/misleading narratives
- May lack sufficient chat context (spans multiple development sessions)

**Options**:
1. **Skip with warning**: Detect squash commits, skip generation, log warning
2. **Generate with marker**: Create entry but mark it as "squashed commit - incomplete context"
3. **Attempt reconstruction**: Try to generate from condensed commit message (likely poor quality)
4. **User prompt**: Ask user whether to process squashed commits during backfill

**Detection Method**:
- Check commit message for squash merge patterns (e.g., "Squash merge", "PR #123", multiple bullet points)
- Compare commit diff size to typical commit patterns (squashed commits tend to be very large)
- Check for multiple unrelated file changes that suggest combined work

**Recommendation**: Start with Option 1 (skip with warning) - preserves journal quality, user can manually document if needed

## Risk Assessment

### High-Impact Risks
- **Cost overrun**: Multiple API calls for large repositories
  - *Mitigation*: Upfront cost estimation and user confirmation
- **Processing time**: Large histories may take significant time
  - *Mitigation*: Progress indicators and clear time estimates
- **Incomplete data**: Some commits may lack sufficient chat context
  - *Mitigation*: Skip commits gracefully, report statistics

### Low-Impact Risks  
- **Partial entries**: Process interruption leaves incomplete entries
  - *Mitigation*: Atomic writes ensure complete entries only
- **Duplicate processing**: Re-running script processes same commits
  - *Mitigation*: Natural idempotency through journal file checking

## Success Metrics

1. **Functionality**: Successfully generates journal entries for all processable historical commits
2. **User Experience**: Clear cost estimates and progress feedback
3. **Safety**: No partial entries, accurate cost predictions
4. **Performance**: Reasonable processing time for typical repository sizes
5. **Discoverability**: Setup integration drives feature adoption

---

**PRD Created**: 2025-09-02  
**GitHub Issue**: [#3](https://github.com/wiggitywhitney/commit_story/issues/3)  
**Next Phase**: Implementation - Start with M4.1a (History Scanner)