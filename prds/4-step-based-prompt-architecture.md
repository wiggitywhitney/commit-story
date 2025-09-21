# PRD-4: Step-Based Prompt Architecture for Section Generators

**GitHub Issue**: [#4](https://github.com/wiggitywhitney/commit-story/issues/4)  
**Status**: Planning  
**Created**: 2025-09-05  
**Last Updated**: 2025-09-05  

## Summary

Restructure the Technical Decisions and Summary generator prompts to follow the successful step-based pattern used in `/prd-create`, `/prd-next`, and `/prd-update-decisions` commands. The current prompts suffer from format-first antipatterns that cause AI to skip critical analysis steps, resulting in lower quality outputs.

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
- **Result**: AI pattern-matches to format rather than deeply analyzing content

## Success Criteria

1. **Output Quality**: Restructured prompts produce equivalent or better results than current prompts
2. **Consistency**: Both prompts follow the same successful step-based pattern
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

## Implementation Plan

### Milestone 1: Content Preservation Analysis

#### M1.1 Current Prompt Audit
- [ ] Map all requirements/rules in Technical Decisions prompt
- [ ] Map all requirements/rules in Summary prompt  
- [ ] Document critical elements that must be preserved
- [ ] Identify elements that can be consolidated or improved

#### M1.2 Restructure Design
- [ ] Design new step-based structure for Technical Decisions
- [ ] Design new step-based structure for Summary
- [ ] Map where each original element moves in new structure
- [ ] Ensure no critical functionality is lost

### Milestone 2: Technical Decisions Prompt Restructuring

#### Current Problems
- Format specification at lines 13-20 (too early)
- Buried critical logic (Implemented vs Discussed determination)
- Weak analysis steps (lines 27-32 are brief afterthoughts)
- No verification step

#### New Structure
- [ ] **Step 1**: Analyze chat for technical discussions
- [ ] **Step 2**: Analyze git diff for file changes  
- [ ] **Step 3**: Classify files (documentation vs functional)
- [ ] **Step 4**: Match discussions to file changes
- [ ] **Step 5**: Verify classification accuracy
- [ ] **Step 6**: Format output (ONLY NOW reveal bullet format)
- [ ] Preserve all anti-hallucination rules and critical instructions

### Milestone 3: Summary Prompt Restructuring  

#### Current Problems
- Has process steps but immediately dilutes with 7+ competing principles
- No clear "complete step 1, then step 2" enforcement
- Output guidance scattered throughout

#### New Structure
- [ ] **Step 1**: Analyze code changes in diff
- [ ] **Step 2**: Find related discussions in chat
- [ ] **Step 3**: Identify significance level
- [ ] **Step 4**: Match tone to actual work
- [ ] **Step 5**: Verify authenticity  
- [ ] **Step 6**: Generate prose output (ONLY NOW reveal format)
- [ ] Maintain all authenticity principles and significance matching rules

### Milestone 4: Testing and Validation

#### M4.1 Test Commit Selection
- [ ] Select recent implementation commit with code changes
- [ ] Select documentation-only commit
- [ ] Select mixed discussion/implementation commit
- [ ] Select bug fix or refactoring commit
- [ ] Select complex multi-file change

#### M4.1.1 Case Study: 2025-09-20 Journal Signal vs Noise
- [ ] Review @journal/entries/2025-09/2025-09-20.md - 21 commits in one day
- [ ] Key question: The narrative logger implementation and 3-hour debugging session (commit 5b69636a) were major accomplishments but are they lost in the volume of content?
- [ ] How can prompts better surface the day's most significant work?
- [ ] Should summaries prioritize by time spent, code impact, or technical complexity?
- [ ] Test improved prompts against this day to ensure major accomplishments are immediately obvious
- [ ] Note: Debugging session journal shows recency bias - emphasizes final timestamp fix over earlier agent config discovery

#### M4.2 Before/After Testing
- [ ] Run current Technical Decisions prompt on test commits → save outputs
- [ ] Run restructured Technical Decisions prompt on same commits → compare
- [ ] Present side-by-side comparison for human approval
- [ ] Only proceed after Technical Decisions approval
- [ ] Run current Summary prompt on test commits → save outputs
- [ ] Run restructured Summary prompt on same commits → compare
- [ ] Present side-by-side comparison for human approval
- [ ] Only proceed after Summary approval

#### M4.3 Implementation
- [ ] Update `/src/generators/prompts/sections/technical-decisions-prompt.js`
- [ ] Update `/src/generators/prompts/sections/summary-prompt.js`
- [ ] Run integration tests to ensure no regressions

## Technical Decisions

### DD-001: Sequential Step Architecture
**Decision**: Restructure both prompts to use numbered steps that must be completed sequentially  
**Rationale**: Prevents AI from jumping ahead to format generation before completing analysis
**Impact**: Major structural change requiring complete prompt rewrite

### DD-002: Progressive Disclosure Pattern  
**Decision**: Move all format specifications to the final step after analysis is complete
**Rationale**: Format-first patterns cause premature pattern matching instead of deep analysis
**Impact**: Requires reorganizing all output formatting instructions

### DD-003: Mandatory Human Approval Testing
**Decision**: Require side-by-side before/after comparison with human approval before implementation
**Rationale**: Changes to core generation logic are high-risk; quality must be verified
**Impact**: Extends timeline but ensures quality preservation

### DD-004: Content Preservation Mapping
**Decision**: Create comprehensive audit of all current prompt elements before restructuring  
**Rationale**: Prevents accidental loss of critical functionality during rewrite
**Impact**: Additional upfront analysis work but ensures complete migration

## Dependencies

- No external dependencies
- Dialogue prompt already follows correct pattern, no changes needed
- Testing requires access to diverse historical commits

## Risks and Mitigation

### Risk: Quality Regression
**Mitigation**: Mandatory before/after testing with human approval on diverse commit types

### Risk: Lost Functionality  
**Mitigation**: Comprehensive content mapping before restructuring

### Risk: Over-Engineering
**Mitigation**: Follow existing successful patterns exactly; don't invent new approaches

## Future Considerations

This architecture pattern should be documented and applied to any future AI generator prompts to maintain consistency and quality across the system.