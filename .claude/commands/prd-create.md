---
name: prd-create
description: Create documentation-first PRDs that guide development through user-facing content
category: project-management
---

# PRD Creation Slash Command

## Instructions

You are helping create a documentation-first Product Requirements Document (PRD) for a new feature. This process involves three components:

1. **GitHub Issue**: Short, immutable concept description that links to the detailed PRD
2. **PRD File**: Project management document with milestone tracking, progress logs, and references to documentation
3. **Documentation Updates**: Actual user-facing content written directly into documentation files with PRD traceability comments

## Process

### Step 1: Understand the Feature Concept
Ask the user to describe the feature idea to understand the core concept and scope.

### Step 2: Create GitHub Issue FIRST
Create the GitHub issue immediately to get the issue ID. This ID is required for proper PRD file naming.

**IMPORTANT: Add the "PRD" label to the issue for discoverability.**

### Step 3: Create PRD File with Correct Naming
Create the PRD file using the actual GitHub issue ID: `prds/[issue-id]-[feature-name].md`

### Step 4: Update GitHub Issue with PRD Link
Add the PRD file link to the GitHub issue description now that the filename is known.

### Step 5: Analyze Existing Documentation Architecture
BEFORE making any documentation changes, perform systematic analysis of ALL documentation files:

**A. Discover All Documentation Files**
```bash
# Find all documentation files (adapt for your project's documentation format)
find . -name "*.md" -not -path "*/node_modules/*" | sort

# Or for other formats:
find . -name "*.rst" -o -name "*.txt" -o -name "*.adoc" | sort
```

**B. Identify Feature/Capability References**
```bash  
# Search for existing feature lists and capability references
grep -r -i "capability\|feature\|guide.*\|provides.*\|main.*\|Key.*Features" docs/ README*

# Look for documentation indexes and cross-reference patterns
grep -r "- \*