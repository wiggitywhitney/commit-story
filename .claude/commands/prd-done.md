---
name: prd-done
description: Complete PRD implementation workflow - create branch, push changes, create PR, merge, and close issue
category: project-management
---

# Complete PRD Implementation

Complete the PRD implementation workflow including branch management, pull request creation, and issue closure.

## Workflow Steps

### 0. Implementation Type Detection
**FIRST: Determine the type of PRD completion to choose the appropriate workflow**

**Documentation-Only Completion** (Skip PR workflow):
- ✅ Changes are only to PRD files or project management documents
- ✅ No source code changes
- ✅ No configuration changes
- ✅ Feature was already implemented in previous work
- → **Use Simplified Workflow** (Steps 1, 2-simplified, 5 only)

**Code Implementation Completion** (Full PR workflow):
- ✅ Contains source code changes
- ✅ Contains configuration changes
- ✅ Contains new functionality or modifications
- ✅ Requires testing and integration
- → **Use Full Workflow** (Steps 1-6)

### 1. Pre-Completion Validation
- [ ] **All PRD checkboxes completed**: Verify every requirement is implemented and tested
- [ ] **All tests passing**: Run project test suite to ensure quality standards (skip if documentation-only)
- [ ] **Documentation updated**: All user-facing docs reflect implemented functionality
- [ ] **No outstanding blockers**: All dependencies resolved and technical debt addressed
- [ ] **Update PRD status**: Mark PRD as "Complete" with completion date

### 2. Branch and Commit Management

**For Documentation-Only Completions:**
- [ ] **Commit directly to main**: `git add [prd-files]` and commit with skip CI flag
- [ ] **Use skip CI commit message**: Include CI skip pattern in commit message to avoid unnecessary CI runs
  - Common patterns: `[skip ci]`, `[ci skip]`, `***NO_CI***`, `[skip actions]`
  - Check project's CI configuration for the correct pattern
- [ ] **Push to remote**: `git push origin main` to sync changes

**For Code Implementation Completions:**
- [ ] **Create feature branch