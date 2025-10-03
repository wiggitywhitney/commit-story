# PRD-4: Step-Based Prompt Architecture for Section Generators

**GitHub Issue**: [#4](https://github.com/wiggitywhitney/commit-story/issues/4)
**Status**: In Progress - Milestone 1 Complete
**Created**: 2025-09-05
**Last Updated**: 2025-10-03  

## Summary

Restructure all three section generator prompts (Technical Decisions, Summary, and Dialogue) to follow the successful step-based pattern used in `/prd-create`, `/prd-next`, and `/prd-update-decisions` commands. The current prompts suffer from format-first antipatterns that cause AI to skip critical analysis steps, resulting in lower quality outputs.

## Problem Statement

Analysis of existing prompts reveals a clear effectiveness gap:

### Successful Pattern (Command Prompts)
- `/prd-create`, `/prd-next`, `/prd-update-decisions` all work reliably
- Clear numbered steps executed sequentially  
- Progressive information disclosure (format revealed last)
- Built-in verification steps

### Problem Pattern (Section Generator Prompts)
- **Technical Decisions Prompt**: Shows output format at line 13-20 BEFORE analysis steps
- **Summary Prompt**: Has competing principles that dilute clear process flow
- **Dialogue Prompt**: Format examples appear mid-prompt (line 77-82); anti-hallucination rules buried as appendix
- **Result**: AI pattern-matches to format rather than deeply analyzing content

## Success Criteria

1. **Output Quality**: Restructured prompts produce equivalent or better results than current prompts
2. **Consistency**: All three prompts follow the same successful step-based pattern
3. **Safety**: No critical functionality lost during restructuring
4. **Validation**: Before/after testing confirms improvement across diverse commit types

## What Makes Successful Prompts Work

Based on analysis of `/prd-create`, `/prd-next`, and `/prd-update-decisions`:

### 1. Sequential Steps with Clear Numbers
- Each step has a clear number and title
- Steps build on previous ones  
- No jumping ahead possible

### 2. Progressive Information Disclosure
- Context gathering first (Steps 1-2)
- Analysis middle (Steps 3-5)
- Output format ONLY at the end (Step 6+)

### 3. Decision Branches Within Steps
- "If context is clear: Skip to Step 6"
- "If YES: Note in the DD text"  
- Clear conditional logic

### 4. Verification Before Output
- `/prd-update-decisions` has Step 7: "Implementation Status Assessment"
- `/prd-next` has Step 5: "Quality check before final output"
- Always verify before generating

### 5. Format Examples at the Very End
- Output format specifications come AFTER all thinking
- Examples shown only after process is complete
- Prevents premature pattern matching

### 6. Essential Introductory Context
- Successful prompts include problem framing before steps
- "Overall Goal" and strategy context help AI understand purpose
- This is NOT competing principles - it's necessary context setting
- Steps come after context, not instead of it

## Implementation Plan

### Milestone 1: Technical Decisions Prompt Restructuring (3-4 hours) ✅ COMPLETE

#### Tasks
- [x] Analyze current prompt (identify what's worth keeping)
- [x] Restructure with proper step-based architecture
- [x] Move format specifications to final step (currently at lines 13-20)
- [x] Integrate anti-hallucination rules into relevant steps (not appendix)
- [x] Add verification step before output generation
- [x] Test before/after on 3-5 diverse commits
- [x] Present side-by-side comparison for human approval
- [x] Update `src/generators/prompts/sections/technical-decisions-prompt.js`

#### Proposed Structure (to be refined during implementation)
- **Step 1**: Analyze chat for technical discussions
- **Step 2**: Analyze git diff for file changes
- **Step 3**: Classify files (documentation vs functional)
- **Step 4**: Match discussions to file changes
- **Step 5**: Verify classification accuracy
- **Step 6**: Format output (ONLY NOW reveal bullet format)

### Milestone 2: Summary Prompt Restructuring (3-4 hours)

#### Tasks
- [ ] Analyze current prompt (identify what's worth keeping)
- [ ] Restructure with proper step-based architecture
- [ ] Move format specifications to final step
- [ ] Integrate authenticity principles into relevant steps (not scattered)
- [ ] Add verification step before output generation
- [ ] Test before/after on same 3-5 commits from Milestone 1
- [ ] Present side-by-side comparison for human approval
- [ ] Update `src/generators/prompts/sections/summary-prompt.js`

#### Proposed Structure (to be refined during implementation)
- **Step 1**: Analyze code changes in diff
- **Step 2**: Find related discussions in chat
- **Step 3**: Identify significance level
- **Step 4**: Match tone to actual work
- **Step 5**: Verify authenticity
- **Step 6**: Generate prose output (ONLY NOW reveal format)

### Milestone 3: Dialogue Prompt Refinement (2-3 hours)

#### Tasks
- [ ] Analyze current prompt (identify specific issues)
- [ ] Move format examples to very end (currently at line 77-82)
- [ ] Integrate anti-hallucination rules into Steps 2-3 (not appendix)
- [ ] Preserve essential introductory context ("Overall Goal", "Summary-Guided Approach")
- [ ] Ensure true progressive disclosure throughout
- [ ] Test before/after on same 3-5 commits from previous milestones
- [ ] Present side-by-side comparison for human approval
- [ ] Update `src/generators/prompts/sections/dialogue-prompt.js`

#### Key Principle
The dialogue prompt's introductory context is ESSENTIAL and should be preserved. Each AI instance needs to understand:
- The problem it's solving (extracting authentic dialogue)
- The strategy to use (summary-guided approach)
- Why quality matters (foundation of entire journal)

This framing is not "competing principles" - it's necessary context before steps begin.

## Technical Decisions

### DD-001: Sequential Step Architecture
**Decision**: Restructure all three prompts to use numbered steps that must be completed sequentially
**Rationale**: Prevents AI from jumping ahead to format generation before completing analysis
**Impact**: Major structural change requiring complete prompt rewrite
**Status**: ⏳ Outstanding - See Milestones 1-3 tasks

### DD-002: Progressive Disclosure Pattern
**Decision**: Move all format specifications to the final step after analysis is complete
**Rationale**: Format-first patterns cause premature pattern matching instead of deep analysis
**Impact**: Requires reorganizing all output formatting instructions
**Status**: ⏳ Outstanding - See Milestones 1-3 tasks

### DD-003: Mandatory Human Approval Testing
**Decision**: Require side-by-side before/after comparison with human approval before each prompt implementation
**Rationale**: Changes to core generation logic are high-risk; quality must be verified
**Impact**: Extends timeline but ensures quality preservation
**Status**: ⏳ Outstanding - Each milestone has testing task

### DD-004: Eliminate Waterfall Analysis Phase (2025-10-02)
**Decision**: Remove separate analysis milestones - integrate analysis into each prompt's restructuring work
**Rationale**: Upfront design documentation is makework; analysis happens naturally during restructuring
**Impact**: Reduces total effort from 11-16 hours to 8-11 hours; three focused milestones instead of four bloated ones
**Status**: ✅ Implemented - PRD structure updated per this decision

### DD-005: Include Dialogue Prompt Refinement (2025-10-02)
**Decision**: Add Milestone 3 to refine dialogue prompt despite it being "close enough" to the pattern
**Rationale**: All three prompts should follow identical architectural standards for consistency
**Impact**: Adds 2-3 hours to project scope but ensures uniform quality
**Status**: ⏳ Outstanding - See Milestone 3 tasks

### DD-006: Preserve Essential Introductory Context (2025-10-02)
**Decision**: Keep "Overall Goal" and strategy framing in prompts; this is necessary context, not competing principles
**Rationale**: Each AI instance needs problem framing before executing steps; successful command prompts use this pattern
**Impact**: Prevents over-correction that would remove valuable context
**Status**: ✅ Implemented - Documented in Milestone 3 "Key Principle"

## Dependencies

- No external dependencies
- Testing requires access to diverse historical commits
- Each milestone builds on lessons from previous milestone (test on same commits for consistency)

## Risks and Mitigation

### Risk: Quality Regression
**Likelihood**: Medium
**Impact**: High
**Mitigation**: Mandatory before/after testing with human approval on diverse commit types (each milestone)

### Risk: Lost Functionality
**Likelihood**: Low
**Impact**: High
**Mitigation**: Analysis integrated into restructuring work; preserve anti-hallucination rules and critical instructions

### Risk: Over-Engineering
**Likelihood**: Low
**Impact**: Medium
**Mitigation**: Follow existing successful patterns exactly; don't invent new approaches

### Risk: Analysis Paralysis
**Likelihood**: Medium (eliminated by DD-004)
**Impact**: Medium
**Mitigation**: No upfront design phase; learn by doing during each milestone

## Progress Log

### 2025-10-03: Milestone 1 Complete - Technical Decisions Prompt Restructured
**Duration**: ~4 hours
**Commits**: Multiple commits during iterative development

**Completed Work**:
- [x] Analyzed current prompt and identified format-first antipattern as root cause
- [x] Restructured prompt with 5-step progressive disclosure architecture
- [x] Moved format specifications to Step 5 (final step only)
- [x] Integrated anti-hallucination rules into Step 4 ("Ensure every reason is traceable")
- [x] Added explicit output-only instruction to Step 5
- [x] Tested on 4 diverse commits (cf36c06, bbadf8d, 53dbcdb, 28f7a8f)
- [x] Presented side-by-side comparison and received approval
- [x] Updated technical-decisions-prompt.js (old backed up to technical-decisions-prompt-old.js)

**Additional Improvements**:
- Updated context-integrator.js with full data schemas for `git` and `chat_sessions` objects
- Renamed section to "Technical Decisions and Problem Solving"
- Added "Code Archivist" role-based framing to Step 1
- Refined filtering to explicitly exclude bug fixes
- Removed quotation marks from reasoning output
- Added explicit fallback to skip to Step 5 when no decisions found

**Key Design Decisions**:
- Accepted some noise in output for conference deadline - perfect filtering can be refined later
- IMPLEMENTED vs DISCUSSED classification working correctly based on file changes
- Progressive disclosure successfully prevents AI from showing intermediate steps

**Next Session**: Begin Milestone 2 (Summary Prompt Restructuring)

### 2025-10-02: Strategic Restructure of Implementation Plan
**Context**: During PRD-26 conference roadmap analysis, user questioned PRD-4's original structure

**Key Decisions**:
- Eliminated separate analysis milestone (DD-004) - integrate into each prompt's work
- Added dialogue prompt to scope (DD-005) - all three prompts should meet same standard
- Clarified essential introductory context (DD-006) - not competing principles, necessary framing
- Refined to three self-contained milestones: Technical Decisions (3-4h), Summary (3-4h), Dialogue (2-3h)

**Total Effort**: 8-11 hours (down from original 11-16 hours)

**Status**: PRD restructured, ready for implementation after PRD-24 (Package & Deploy) completes

## Future Considerations

This architecture pattern should be documented and applied to any future AI generator prompts to maintain consistency and quality across the system.