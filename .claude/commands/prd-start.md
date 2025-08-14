---
name: prd-start
description: Start working on a PRD implementation
category: project-management
---

# PRD Start - Begin Implementation Work

## Instructions

You are helping initiate active implementation work on a specific Product Requirements Document (PRD). This command bridges the gap between PRD planning and actual development work by setting up the implementation context and providing clear next steps.

## Process Overview

1. **Select Target PRD** - Ask user which PRD they want to implement
2. **Validate PRD Readiness** - Ensure the selected PRD is ready for implementation
3. **Set Up Implementation Context** - Prepare the development environment
4. **Identify Starting Point** - Determine the best first implementation task
5. **Begin Implementation** - Launch into actual development work

## Step 0: Context Awareness Check

**FIRST: Check if PRD context is already clear from recent conversation:**

**Skip detection/analysis if recent conversation shows:**
- **Recent PRD work discussed** - "We just worked on PRD 29", "Just completed PRD update", etc.
- **Specific PRD mentioned** - "PRD #X", "MCP Prompts PRD", etc.
- **PRD-specific commands used** - Recent use of `prd-update-progress`, `prd-start` with specific PRD
- **Clear work context** - Discussion of specific features, tasks, or requirements for a known PRD

**If context is clear:**
- Skip to Step 2 (PRD Readiness Validation) using the known PRD 
- Use conversation history to understand current state and recent progress
- Proceed directly with readiness validation based on known PRD status

**If context is unclear:**
- Continue to Step 1 (PRD Detection) for full analysis

## Step 1: Smart PRD Detection (Only if Context Unclear)

**Auto-detect the target PRD using these context clues (in priority order):**

1. **Git Branch Analysis** - Check current branch name for PRD patterns:
   - `feature/prd-12-*` → PRD 12
   - `prd-13-*` → PRD 13
   - `feature/