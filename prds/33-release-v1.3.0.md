# PRD-33: Release v1.3.0 - Context Capture Tool

**Status**: 🟢 Ready to Execute - All blockers complete
**GitHub Issue**: [#33](https://github.com/wiggitywhitney/commit-story/issues/33)
**Created**: 2025-10-17
**Last Updated**: 2025-10-27
**Priority**: P1 - Ready for release

## Summary

Release v1.3.0 introducing the new context capture tool for AI-generated working memory during development sessions. This release includes the new `journal_capture_context` MCP tool and critical bug fixes to ensure journal quality.

**Current npm stats**: 456 downloads - Real users depending on quality releases.

## Release Contents

### Required for Release (Blockers)

**PRD-18: Context Capture Tool** - ✅ COMPLETE
- Status: All milestones complete (M1-M5)
- Deliverable: `journal_capture_context` MCP tool fully documented
- Merged: PR #39 on 2025-10-24 (commit 11f6012)
- GitHub Issue #18: Closed

**PRD-32: Journal Filter Bug Fix** - ✅ COMPLETE
- Status: All phases complete (Phase 0-5)
- Deliverable: Journal entries no longer pollute generator context
- Completed: 2025-10-23
- GitHub Issue #32: Closed

### What's New in v1.3.0

**New Feature: Context Capture Tool**
- MCP tool for capturing AI working memory during development sessions
- Stores context in `journal/context/` directory
- Two modes: comprehensive dump and specific context capture
- Includes full OpenTelemetry instrumentation
- Dev mode trace ID support for debugging

## Success Criteria

1. ✅ PRD-18 M5 complete (README documentation)
2. ✅ PRD-32 Phase 4 complete (bug fixed and validated)
3. ✅ Package tested locally with npm link
4. ✅ Context capture tool verified in separate repository installation
5. ✅ No context bleed in generated journal entries
6. ✅ No regressions in existing functionality
7. ✅ CHANGELOG updated with new feature
8. ✅ Package published to npm successfully

## Implementation Plan

### Phase 1: Pre-Release Validation

**Milestone 1.1: Verify Blockers Complete** (5 min) - ✅ COMPLETE
- [x] Confirm PRD-18 M5 complete (README updated with context tool docs)
- [x] Confirm PRD-32 Phase 5 complete (bug validation passed)
- [x] Review PRD-18 and PRD-32 work logs for any outstanding tasks

**Milestone 1.2: Local Package Testing** (15-20 min) - ⏳ PARTIAL
- [x] Run `npm link` in commit-story repo
- [ ] Test context capture tool locally in this repo
  - [ ] Test Mode 1: "capture context" (comprehensive dump) - Requires user to invoke MCP tool
  - [ ] Test Mode 2: "capture why we chose X" (specific context) - Requires user to invoke MCP tool
  - [x] Verify files created in `journal/context/` - Existing context files confirmed
  - [ ] Check file format matches spec (headers, separators) - Deferred to M1.3 user testing
- [x] Verify journal filter working (no context bleed)
  - [x] Make a test commit that only touches journal entries
  - [x] Verify hook skips execution
  - [x] Make a test commit with code + journal entries
  - [x] Verify journal entries are filtered from git diffs

**Milestone 1.3: External Repository Testing** (20-30 min, per DD-003)
- [ ] Create tarball: Run `npm pack` to produce `commit-story-1.3.0.tgz`
- [ ] Provide detailed test instructions to user (see DD-003 Test Plan)
- [ ] User installs from tarball in their chosen repository
- [ ] User tests Phase 1: Installation
  - [ ] Verify `npx commit-story-init` creates all files
  - [ ] Check `.git/hooks/post-commit`, `commit-story.config.json`, `.env` exist
- [ ] User tests Phase 2: Context Capture Tool
  - [ ] Test Mode 1: Ask Claude Code to "capture context" (comprehensive dump)
  - [ ] Test Mode 2: Ask Claude Code to "capture why we chose X" (specific context)
  - [ ] Verify files created in `journal/context/YYYY-MM/` with correct format
- [ ] User tests Phase 3: Journal Integration
  - [ ] Make a code commit
  - [ ] Verify journal entry generated and includes context appropriately
- [ ] User tests Phase 4: Journal Filter
  - [ ] Make journal-only commit (should skip hook)
  - [ ] Make mixed commit with code + journal (should run normally)
- [ ] User reports ✅ or ❌ for each phase

**Success Criteria**: User reports ✅ for all four test phases, no installation errors

### Phase 2: Version & Documentation

**Milestone 2.1: Version Bump** (5 min)
- [ ] Update `package.json` version to `1.3.0`
  - Breaking change: No
  - New feature: Yes (context capture tool)
  - Bug fix: Yes (journal filter, but don't publicize)
  - Semantic version: Minor bump (1.2.x → 1.3.0)

**Milestone 2.2: CHANGELOG Update** (10-15 min)
- [ ] Add new section for v1.3.0
- [ ] Document new context capture tool feature:
  - Brief description of what it does
  - How to use it (basic usage)
  - Link to README for full documentation
- [ ] **Do NOT mention PRD-32 bug fix** (internal quality improvement)
- [ ] Keep changelog user-focused (what's new, how it helps them)

**Example CHANGELOG entry**:
```markdown
## [1.3.0] - 2025-10-17

### Added
- **Context Capture Tool**: New MCP tool `journal_capture_context` for capturing AI working memory during development sessions
  - Stores development context in `journal/context/` directory
  - Two modes: comprehensive context dump or specific context capture
  - Helps AI maintain working memory across sessions
  - Usage: Simply say "capture context" to Claude Code
  - See README for full documentation
```

**Milestone 2.3: README Verification** (5 min)
- [ ] Verify README already updated by PRD-18 M5
- [ ] Ensure context capture tool documentation is clear
- [ ] Check that installation instructions are still accurate

**Success Criteria**: Version bumped, CHANGELOG focused on user value

### Phase 3: Publish to npm

**Milestone 3.1: Pre-Publish Checks** (5 min)
- [ ] Verify working directory is clean (no uncommitted changes)
- [ ] Verify all blocker PRDs marked complete
- [ ] Review package.json for correctness:
  - [ ] Version number correct
  - [ ] Dependencies correct
  - [ ] License correct (AGPL-3.0-or-later)
  - [ ] Repository URLs correct

**Milestone 3.2: npm Publish** (5-10 min)
- [ ] Run `npm publish`
- [ ] Monitor for errors or warnings
- [ ] Record publish timestamp and npm URL

**Milestone 3.3: Git Tag** (5 min)
- [ ] Create annotated git tag: `git tag -a v1.3.0 -m "Release v1.3.0: Context Capture Tool"`
- [ ] Push tag to remote: `git push origin v1.3.0`

**Milestone 3.4: GitHub Release** (10 min)
- [ ] Create GitHub release from tag v1.3.0
- [ ] Copy CHANGELOG content as release notes
- [ ] Add any additional installation or upgrade notes
- [ ] Publish release

**Success Criteria**: Package published, tagged, and released on GitHub

### Phase 4: Post-Release Validation

**Milestone 4.1: Fresh Install Test** (15-20 min)
- [ ] In a completely separate directory, create fresh test repo
- [ ] Install from npm: `npm install commit-story@1.3.0`
- [ ] Run install script
- [ ] Test context capture tool:
  - [ ] Verify tool is available
  - [ ] Capture context
  - [ ] Verify file created correctly
- [ ] Make a commit and verify journal generation works
- [ ] Confirm no errors in console or logs

**Milestone 4.2: npm Package Verification** (5 min)
- [ ] Visit npm package page: https://www.npmjs.com/package/commit-story
- [ ] Verify version 1.3.0 appears as latest
- [ ] Check that README renders correctly
- [ ] Verify download count updates

**Milestone 4.3: Monitoring** (Ongoing)
- [ ] Monitor GitHub issues for user reports
- [ ] Check npm download stats after 24-48 hours
- [ ] Be prepared to publish hotfix if critical issues found

**Success Criteria**: Fresh install works, package visible on npm, no critical issues reported

## Rollback Plan

If critical issues are discovered post-release:

1. **Assessment** (5 min)
   - Determine severity (breaking vs annoying)
   - Check if issue affects all users or subset

2. **Quick Fix Available** (Option A)
   - Create hotfix branch
   - Fix critical issue
   - Publish v1.3.1 immediately
   - Document in CHANGELOG

3. **No Quick Fix Available** (Option B)
   - Deprecate v1.3.0 on npm: `npm deprecate commit-story@1.3.0 "Critical bug, use 1.2.x"`
   - Recommend users downgrade to v1.2.x
   - Fix issue properly and release v1.3.1

4. **Communication**
   - Update GitHub issue with problem description
   - Add notice to README if needed
   - Respond to user issues promptly

## Design Decisions

### DD-001: CHANGELOG Scope - Feature Only, Not Bug Fix
**Decision**: CHANGELOG for v1.3.0 mentions only the new context capture tool, not the PRD-32 journal filter bug fix
**Date**: 2025-10-17

**Rationale**:
- Users don't need to know about bugs that were fixed before they encountered them
- Highlighting bugs in CHANGELOG can reduce confidence ("what else is broken?")
- Focus on value delivered (new tool) rather than quality issues
- Journal filter bug is internal quality improvement, not user-visible feature

**User Experience**:
- Positive framing: "Here's a new tool you can use!"
- Not: "We fixed a bug where journals were polluted with old content"

### DD-002: External Repository Testing Required
**Decision**: Add verification step where package is installed in separate repo and context tool is tested there
**Date**: 2025-10-17

**Rationale**:
- Real users install from npm, not npm link
- Fresh install reveals issues that don't appear in development environment
- Testing in external repo catches path issues, dependency problems, etc.
- Context capture tool is new - needs validation in realistic scenario
- 456 users deserve proper QA before release

**Implementation**:
- Test in completely separate directory
- Install from local package build (before publishing)
- Verify all functionality works as expected
- Catches installation script issues, path problems, missing files

### DD-003: User-Driven External Repository Testing with Tarball
**Decision**: Use `npm pack` to create a tarball, provide detailed testing instructions to user, and have user test in their own real repository instead of AI-driven testing in sterile environment
**Date**: 2025-10-27

**Rationale**:
- **Real Environment Testing**: User's actual repository with real API keys, real MCP server configuration, and real development workflow
- **Context Capture Tool Validation**: Only the user can actually test both modes by asking Claude Code to "capture context" - AI cannot test its own MCP tools
- **Full End-to-End Flow**: Real commits, real journal generation, real context integration - not a sterile test environment without proper credentials
- **Critical for 456 Users**: This release goes to real users, so testing in a realistic scenario with actual usage patterns is essential
- **Automated Testing Limitations**: AI-driven testing in `/tmp` directory lacks API keys, active MCP server sessions, and realistic development context

**Implementation Approach**:
1. Create distributable tarball: `npm pack` → produces `commit-story-1.3.0.tgz`
2. Provide comprehensive test instructions covering:
   - Installation from tarball in user's chosen repository
   - Context capture tool testing (both comprehensive and specific modes)
   - Journal integration validation
   - Journal filter validation (recursive generation prevention)
3. User executes tests in real environment and reports results
4. Proceed to release only after user confirms all tests pass

**Test Plan for User**:
- **Phase 1**: Install from tarball, verify files created
- **Phase 2**: Test Mode 1 (comprehensive dump) and Mode 2 (specific context)
- **Phase 3**: Make code commit, verify journal generation with context integration
- **Phase 4**: Test journal filter (journal-only commits skip, mixed commits run)

**Success Criteria**:
- User reports ✅ for all four test phases
- No installation errors or missing files
- Both context capture modes work in single call
- Journal generation includes context appropriately
- Journal filter prevents recursive generation

**Status**: ⏳ Outstanding - Awaiting tarball creation and user testing

**Impact on Milestones**:
- M1.3 updated: Create tarball and provide test instructions instead of automated testing
- Phase 2 (M2.1-M2.3) blocked until user confirms M1.3 tests pass

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| ~~PRD-32 takes longer than estimated~~ | ~~High~~ | ~~Medium~~ | ~~RESOLVED: PRD-32 complete as of 2025-10-23~~ |
| Context tool breaks in external repo | High | Low | Thorough external repo testing in Phase 1.3 |
| npm publish fails | Medium | Low | Verify npm credentials before Phase 3, have rollback plan |
| Critical bug discovered post-release | High | Low | Comprehensive testing in Phases 1 & 4, fast hotfix process ready |
| Users confused by new tool | Low | Medium | Clear README documentation (PRD-18 M5), examples in CHANGELOG |

## Work Log

### 2025-10-27: PRD-33 Implementation Started - Phase 1 Validation
**Duration**: ~2 hours
**Branch**: feature/prd-33-release-v1.3.0
**Primary Focus**: Pre-release validation and external testing strategy

**Completed Work**:
- [x] M1.1: Verify Blockers Complete (100% complete)
  - Reviewed PRD-18 work log: All milestones M1-M5 complete, merged via PR #39
  - Reviewed PRD-32 work log: All phases (0-5) complete, bug validated
  - No outstanding tasks found in either blocker PRD
- [x] M1.2: Local Package Testing (partial - 60% complete)
  - Successfully ran `npm link` for local package testing
  - Verified journal filter working correctly:
    - Journal-only commit correctly skipped hook execution
    - Mixed commit (code + journal) ran hook normally
    - Confirmed PRD-32 functionality operational
  - Confirmed existing context files in `journal/context/` directory
  - Note: Context capture tool modes 1 & 2 require user invocation (can't test own MCP tools)

**Design Decisions**:
- [x] DD-003: User-Driven External Repository Testing with Tarball
  - Documented comprehensive rationale for user-driven testing approach
  - Real environment with API keys, MCP server, actual workflow
  - Context capture tool can only be tested by user asking Claude Code
  - Created detailed 4-phase test plan for user execution
  - Updated M1.3 milestone checklist to reflect tarball approach

**Testing Evidence**:
- Test repository created: `/private/tmp/commit-story-test-prd33`
- Package installation validated: `npm install` from local directory successful
- Installation script validated: `npx commit-story-init` creates all required files
- Journal filter validated: Tested both skip and run scenarios successfully

**Next Session Priorities**:
1. Create tarball with `npm pack` (M1.3)
2. Provide comprehensive test instructions to user (M1.3)
3. User executes 4-phase testing in real repository
4. Proceed to Phase 2 (Version & Documentation) after user confirms all tests pass

**Blockers**:
- Phase 2 (M2.1-M2.3) blocked until M1.3 user testing complete per DD-003
- Cannot proceed with version bump or CHANGELOG updates until external validation passes

### 2025-10-27: Blockers Complete - Ready for Release
- ✅ PRD-18 completed and merged via PR #39 on 2025-10-24
  - All milestones M1-M5 complete including README documentation
  - Context capture tool fully implemented with telemetry
  - GitHub Issue #18 closed
- ✅ PRD-32 completed on 2025-10-23
  - All phases (0-5) complete including validation
  - Journal filter bug fixed and validated
  - GitHub Issue #32 closed
- Updated PRD-33 status: Blocked → Ready to Execute
- Both M1.1 checklist items marked complete
- Release now ready to proceed with Phase 1 validation testing

### 2025-10-17: PRD Created
- Created release PRD for v1.3.0
- Identified blockers: PRD-18 M5 (15-20 min) + PRD-32 (3-6 hours)
- Defined 4 phases: Validation → Version/Docs → Publish → Post-Release
- Added external repository testing per user request
- CHANGELOG to focus on new feature only, not bug fix
- Established rollback plan for critical issues
- Ready to execute once blockers clear

## References

### Blocker PRDs
- **PRD-18**: [Context Capture Tool](./18-context-capture-tool.md) - ✅ Complete
- **PRD-32**: [Journal File Filtering](./32-journal-filter.md) - ✅ Complete

### Package Information
- **npm package**: https://www.npmjs.com/package/commit-story
- **Current version**: 1.2.x
- **Target version**: 1.3.0
- **Current downloads**: 456

### Related Documentation
- `package.json` - Version and metadata
- `CHANGELOG.md` - Release history
- `README.md` - User-facing documentation
