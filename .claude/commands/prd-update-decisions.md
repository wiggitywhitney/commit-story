---
name: prd-update-decisions
description: Update PRD based on design decisions and strategic changes made during conversations
category: project-management
---

# PRD Update Decisions Slash Command

## Instructions

You are updating a PRD based on design decisions, strategic changes, and architectural choices made during conversations. This command captures conceptual changes that may not yet be reflected in code but affect requirements, approach, or scope.

## Process Overview

1. **Identify Target PRD** - Determine which PRD to update
2. **Analyze Conversation Context** - Review discussions for design decisions and strategic changes
3. **Identify Decision Points** - Find architecture, workflow, requirement, or scope changes
4. **Map to PRD Sections** - Determine which parts of the PRD need updates
5. **Propose Updates** - Suggest changes to requirements, approaches, and constraints
6. **Update Decision Log** - Record new decisions with rationale and impact
7. **Assess Implementation Status** - Evaluate if each DD is completed or outstanding
8. **Create Actionable Tasks** - Ensure outstanding DDs have explicit checklist items

## Step 1: PRD Analysis

Ask the user which PRD to update, then:
- Read the PRD file from `prds/[issue-id]-[feature-name].md`
- Understand current requirements, approach, and constraints
- Identify areas most likely to be affected by design decisions

## Step 2: Conversation Analysis

Review the conversation context for decision-making patterns:

### Design Decision Indicators
Look for conversation elements that suggest strategic changes:
- **Workflow changes**: "Let's simplify this to..." "What if we instead..."
- **Architecture decisions**: "I think we should use..." "The better approach would be..."
- **Requirement modifications**: "Actually, we don't need..." "We should also include..."
- **Scope adjustments**: "Let's defer this..." "This is more complex than we thought..."
- **User experience pivots**: "Users would prefer..." "This workflow makes more sense..."

### Specific Decision Types
- **Technical Architecture**: Framework choices, design patterns, data structures
- **User Experience**: Workflow changes, interface decisions, interaction models
- **Requirements**: New requirements, modified requirements, removed requirements
- **Scope Management**: Features added, deferred, or eliminated
- **Implementation Strategy**: Phasing

## Step 7: Implementation Status Assessment

After creating each new Design Decision (DD) in Step 6, evaluate its implementation status:

1. **Check if already implemented**:
   - Review code/documentation to see if this decision is already executed
   - If YES: Note in the DD text (e.g., "**Status**: ✅ Implemented")
   - If NO: Continue to Step 8

2. **Be strict about "completed"**:
   - Knowing what to do ≠ having done it
   - If scripts need renaming but aren't renamed yet, it's NOT complete

## Step 8: Create or Update Actionable Tasks

For each outstanding DD, ensure it has explicit checklist items:

1. **Check if related tasks already exist** in milestones:
   - If YES: Add DD reference and specific implementation details to existing task
   - If NO: Create new checklist items with explicit, executable steps

2. **Make tasks specific enough** that future-you can execute without rethinking:
   - Include exact file names, paths, and commands
   - Specify before/after transformations
   - Reference the DD number for context

### Example:
```markdown
DD-079 requires script renaming. Check M3.4:
- Existing task "Update package.json scripts" → Add specifics:
  - [ ] Rename all scripts per DD-079:
    - "install-commit-journal-hook" → "commit-story:init-hook"
    - "uninstall-commit-journal-hook" → "commit-story:remove-hook"
    - Update references in: hooks/post-commit
```

## Why This Matters

- **No orphaned decisions**: Every DD either shows completion or points to specific todos
- **No re-discussion**: Decisions are final, work is clear
- **Future-proof**: Six months later, you know exactly what needs doing and why