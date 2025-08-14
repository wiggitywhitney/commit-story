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