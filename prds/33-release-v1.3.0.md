# PRD-33: Release v1.3.0 - Context Capture Tool

**Status**: 🔵 Blocked (waiting on PRD-18 + PRD-32)
**GitHub Issue**: [#33](https://github.com/wiggitywhitney/commit-story/issues/33)
**Created**: 2025-10-17
**Last Updated**: 2025-10-17
**Priority**: P1 - Release when blockers complete

## Summary

Release v1.3.0 introducing the new context capture tool for AI-generated working memory during development sessions. This release includes the new `journal_capture_context` MCP tool and critical bug fixes to ensure journal quality.

**Current npm stats**: 456 downloads - Real users depending on quality releases.

## Release Contents

### Required for Release (Blockers)

**PRD-18: Context Capture Tool** - ⏳ M5 pending
- Status: M1-M4 complete, M5 (README docs) pending
- Deliverable: `journal_capture_context` MCP tool fully documented
- Estimated time to complete: 15-20 minutes

**PRD-32: Journal Filter Bug Fix** - ⏳ Not started (P0 critical)
- Status: Phase 0 (research) not started
- Deliverable: Journal entries no longer pollute generator context
- Estimated time to complete: 3-6 hours
- **Critical**: Cannot ship context bleed bug to 456+ users

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

**Milestone 1.1: Verify Blockers Complete** (5 min)
- [ ] Confirm PRD-18 M5 complete (README updated with context tool docs)
- [ ] Confirm PRD-32 Phase 4 complete (bug validation passed)
- [ ] Review PRD-18 and PRD-32 work logs for any outstanding tasks

**Milestone 1.2: Local Package Testing** (15-20 min)
- [ ] Run `npm link` in commit-story repo
- [ ] Test context capture tool locally in this repo
  - [ ] Test Mode 1: "capture context" (comprehensive dump)
  - [ ] Test Mode 2: "capture why we chose X" (specific context)
  - [ ] Verify files created in `journal/context/`
  - [ ] Check file format matches spec (headers, separators)
- [ ] Verify journal filter working (no context bleed)
  - [ ] Make a test commit that only touches journal entries
  - [ ] Verify hook skips execution
  - [ ] Make a test commit with code + journal entries
  - [ ] Verify journal entries are filtered from git diffs

**Milestone 1.3: External Repository Testing** (20-30 min)
- [ ] Create or use a separate test repository
- [ ] Install package from local build: `npm install /path/to/commit-story`
- [ ] Run installation script in test repo
- [ ] Test context capture tool in external repo:
  - [ ] Verify MCP server starts correctly
  - [ ] Test "capture context" command
  - [ ] Verify context file created in correct location
  - [ ] Confirm tool is accessible from Claude Code
  - [ ] Make a commit and verify journal generation works
- [ ] Verify no regressions in existing features:
  - [ ] Journal entries generate correctly
  - [ ] Reflections work as expected
  - [ ] Telemetry is working (if dev mode enabled)

**Success Criteria**: All tests pass, no critical bugs found

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

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| PRD-32 takes longer than estimated | High | Medium | Start PRD-32 investigation immediately, adjust timeline if needed |
| Context tool breaks in external repo | High | Low | Thorough external repo testing in Phase 1.3 |
| npm publish fails | Medium | Low | Verify npm credentials before Phase 3, have rollback plan |
| Critical bug discovered post-release | High | Low | Comprehensive testing in Phases 1 & 4, fast hotfix process ready |
| Users confused by new tool | Low | Medium | Clear README documentation (PRD-18 M5), examples in CHANGELOG |

## Work Log

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
- **PRD-18**: [Context Capture Tool](./18-context-capture-tool.md) - M5 pending
- **PRD-32**: [Journal File Filtering](./32-journal-filter.md) - Phase 0 not started

### Package Information
- **npm package**: https://www.npmjs.com/package/commit-story
- **Current version**: 1.2.x
- **Target version**: 1.3.0
- **Current downloads**: 456

### Related Documentation
- `package.json` - Version and metadata
- `CHANGELOG.md` - Release history
- `README.md` - User-facing documentation
