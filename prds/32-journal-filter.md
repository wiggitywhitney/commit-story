# PRD-32: Journal File Filtering

**Status**: 🔵 Planning
**GitHub Issue**: [#32](https://github.com/wiggitywhitney/commit-story/issues/32)
**Created**: 2025-10-15
**Last Updated**: 2025-10-15

## Problem Statement

Journal entries are creating noise and recursive generation issues that degrade the quality of generated content:

### Problem 1: Recursive Journal Generation
When a commit only adds journal entries (e.g., commit `1104c468`), the post-commit hook triggers and generates another journal entry about adding a journal entry. This creates recursive noise and wastes tokens.

### Problem 2: Context Pollution from Git Diffs
When commits include changes to journal files alongside functional code changes, the git diff contains old journal content. This causes generators to reference outdated solutions and previous work that isn't relevant to the current commit.

**Key Insight**: Generator functions should know nothing about journal files. They exist as output artifacts, not as input context.

## Test Case

**Commit 1104c468**: A journal-only commit that demonstrates the recursive generation problem. This commit should NOT have triggered journal generation.

## Success Criteria

1. ✅ Commits that only touch journal files do NOT trigger the post-commit hook
2. ✅ Journal files are completely filtered from git diffs before being passed to any generator
3. ✅ Old solutions and outdated context from previous journal entries no longer appear in new entries
4. ✅ Manual reflections and context captures (when relevant) are preserved in chat context
5. ✅ Commit 1104c468 can be used to verify the fix (re-running it should produce no output or minimal output)

## Non-Goals

- This PRD does NOT apply to PRD files (they are documentation, not journal output)
- This does NOT filter manual user reflections from chat history
- This does NOT change how context captures work

## Implementation Phases

### Phase 0: Research & Investigation
**Goal**: Understand the current state and identify what broke

**Tasks**:
- [ ] Investigate when journal files started appearing in commits (git history analysis)
- [ ] Check if there was previous logic to prevent this that got removed
- [ ] Identify all current filtering mechanisms (context-filter.js, commit-content-analyzer.js, etc.)
- [ ] Document how journal files currently flow through the system:
  - Where are they collected (git diff collection)?
  - Where are they filtered (or not filtered)?
  - Which generators see them?
- [ ] Determine why "old solutions get mentioned" - is it from diffs or somewhere else?

**Deliverable**: Research findings document added to this PRD

### Phase 1: Scope Definition
**Goal**: Define exactly which files should be filtered

**Discussion Questions**:
- Which journal directories should be filtered?
  - `journal/entries/**` - YES (auto-generated, should always be filtered)
  - `journal/reflections/**` - TBD (manual, but still journal output)
  - `journal/context/**` - TBD (manual captures, but might be in chat already?)
- Should we distinguish between:
  - Auto-generated journal entries vs manual reflections?
  - Journal files in git diffs vs journal files in chat history?
- What about PRDs?
  - NO - PRDs are documentation, not journal output
  - PRD changes SHOULD be visible to generators

**Deliverable**: Clear filtering rules documented in this PRD

### Phase 2: Hook-Level Prevention
**Goal**: Prevent post-commit hook from running on journal-only commits

**Tasks**:
- [ ] Add commit analysis to post-commit hook
- [ ] If commit only touches filtered journal paths, skip execution entirely
- [ ] Add telemetry for skipped journal-only commits
- [ ] Test with commit 1104c468 (should skip)
- [ ] Test with mixed commits (journal + code changes - should still run)

**Implementation Location**: `hooks/post-commit` or early in `src/index.js`

### Phase 3: Diff-Level Filtering
**Goal**: Strip journal files from git diffs before passing to generators

**Tasks**:
- [ ] Add journal file filtering to git diff collection
- [ ] Update `commit-content-analyzer.js` to exclude journal files from `changedFiles`
- [ ] Update `filterGitDiff` in `context-filter.js` to strip journal file changes
- [ ] Ensure no generator receives journal file diffs
- [ ] Add telemetry for filtered journal content

**Implementation Location**:
- `src/generators/utils/commit-content-analyzer.js`
- `src/generators/filters/context-filter.js`
- Git diff collection (wherever that happens)

### Phase 4: Validation
**Goal**: Verify the fix works end-to-end

**Tasks**:
- [ ] Test journal-only commit (should skip hook execution)
- [ ] Test mixed commit with journal files (should run but exclude journal diffs)
- [ ] Review recent journal entries to confirm no more "old solutions" pollution
- [ ] Check telemetry to verify filtering is working
- [ ] Update PRD with validation results

## Open Questions

1. **When did this break?** Was there previous logic that got removed?
2. **Manual reflections**: Should `journal/reflections/**` be treated the same as `journal/entries/**`?
3. **Context captures**: Should `journal/context/**` files be filtered from diffs?
4. **Chat vs Diff**: Should journal filtering rules differ for chat history vs git diffs?

## Design Decisions

_(To be filled in during implementation)_

## Work Log

### 2025-10-15: PRD Created
- Identified two distinct problems: recursive generation and context pollution
- Created GitHub issue #32
- Defined research phase to investigate root cause
- Added commit 1104c468 as test case
- Structured phases: Research → Scope Definition → Hook Prevention → Diff Filtering → Validation

## References

- **Test Commit**: 1104c468 (journal-only commit)
- **Existing Utilities**:
  - `src/generators/utils/commit-content-analyzer.js` - Detects doc-only commits
  - `src/generators/filters/context-filter.js` - Filters context for token limits
  - `hooks/post-commit` - Git hook entry point
