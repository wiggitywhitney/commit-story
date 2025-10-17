# PRD-32: Journal File Filtering

**Status**: 🔴 Critical - Top Priority
**GitHub Issue**: [#32](https://github.com/wiggitywhitney/commit-story/issues/32)
**Created**: 2025-10-15
**Last Updated**: 2025-10-17
**Priority**: P0 - Must fix before next release

## Problem Statement

Journal entries are creating noise and recursive generation issues that degrade the quality of generated content:

### Problem 1: Recursive Journal Generation
When a commit only adds journal entries (e.g., commit `1104c468`), the post-commit hook triggers and generates another journal entry about adding a journal entry. This creates recursive noise and wastes tokens.

### Problem 2: Context Pollution from Git Diffs
When commits include changes to journal files alongside functional code changes, the git diff contains old journal content. This causes generators to reference outdated solutions and previous work that isn't relevant to the current commit.

**Example**: [journal/entries/2025-10/2025-10-17.md](../journal/entries/2025-10/2025-10-17.md) lines 48-83

Commit `441db893` (gitignore config file) contains this problematic text in its Summary section:

> "The session also covered the AGPL license change that had been committed previously, reinforcing the importance of including the license in the npm package due to legal requirements. This context helped shape the conversation around the config file and its relevance to different users of the project."

This is context bleed from the **previous commit** `b0b0c9b2` (license change). The AGPL license information has nothing to do with the gitignore commit, yet it appears in the generated summary.

**Key Insight**: Generator functions should know nothing about journal files. They exist as output artifacts, not as input context.

## Test Case

**Commit 1104c468**: A journal-only commit that demonstrates the recursive generation problem. This commit should NOT have triggered journal generation.

## Filtering Scope

**Filter these paths** (journal entries only):
- `journal/entries/**/*.md` - Auto-generated journal entries

**DO NOT filter these paths**:
- `journal/reflections/**/*.md` - Manual user reflections (should remain visible)
- `journal/context/**/*.md` - Manual context captures (should remain visible)
- `prds/**/*.md` - PRD documentation (not journal output)

**Rationale**: Only auto-generated journal entries create recursive/pollution problems. Manual reflections and context captures are intentional user input and should be treated like any other documentation.

## Success Criteria

1. ✅ Commits that only touch `journal/entries/**` do NOT trigger the post-commit hook
2. ✅ Files matching `journal/entries/**` are completely filtered from git diffs before being passed to any generator
3. ✅ Old solutions and outdated context from previous journal entries no longer appear in new entries
4. ✅ Manual reflections and context captures remain visible in git diffs and chat context (NOT filtered)
5. ✅ Commit 1104c468 can be used to verify the fix (re-running it should produce no output)
6. ✅ Commit 441db893 context bleed no longer occurs when regenerated

## Non-Goals

- This PRD does NOT apply to PRD files (they are documentation, not journal output)
- This does NOT filter manual user reflections from chat history or git diffs
- This does NOT filter context captures from chat history or git diffs
- This does NOT change how reflections or context captures work

## Implementation Phases

### Phase 0: Research & Investigation
**Goal**: Understand the current state and identify what broke

**Research Strategy** (Start with telemetry):

This problem only appeared recently (within ~3 weeks). The most efficient investigation approach is to use telemetry to understand what changed.

**Step 1: Telemetry Analysis** (Primary investigation method)
- [ ] Query Datadog for traces from **3 weeks ago** (when journal quality was good)
  - Find a successful journal generation from ~September 26, 2025
  - Look for any file filtering operations in the trace spans
  - Check if `journal/entries/**` files were being filtered out
  - Document what filtering was happening then
- [ ] Query Datadog for traces from **recent commits** (with context bleed)
  - Compare trace structure to 3-week-old traces
  - Identify what changed in the data flow
  - Check if filtering spans are missing now
  - Look for bypass conditions or changes in filtering logic

**Step 2: Code Investigation** (After telemetry reveals clues)
- [ ] Check if filtering logic already exists in the codebase:
  - Search for `journal/entries` filtering patterns
  - Look in `context-filter.js`, `commit-content-analyzer.js`, etc.
  - Check git history for removed/commented filtering code
- [ ] Identify all current filtering mechanisms:
  - Where are git diffs collected?
  - Where are they filtered (or supposed to be filtered)?
  - Which generators receive the filtered/unfiltered diffs?
- [ ] Determine the root cause:
  - Was filtering logic removed?
  - Was a bypass condition added?
  - Did a refactor break the filtering?

**Step 3: Impact Analysis**
- [ ] Document how journal files currently flow through the system
- [ ] Identify exactly where the context bleed is introduced
- [ ] Confirm whether it's from git diffs, chat context, or both

**Key Questions to Answer**:
1. Did journal entry filtering exist 3 weeks ago?
2. If yes, where was it implemented and what broke it?
3. If no, when did journal files start being included in diffs?

**Deliverable**: Research findings document added to this PRD with:
- Comparison of old vs new trace structures
- Identification of what changed
- Root cause analysis
- Clear diagnosis of where to implement the fix

### Phase 1: Scope Definition
**Goal**: ✅ COMPLETE - Scope defined (see "Filtering Scope" section above)

**Filtering Rules** (Decided 2025-10-17):
- ✅ `journal/entries/**` - Filter these (auto-generated, creates recursive/pollution issues)
- ✅ `journal/reflections/**` - DO NOT filter (manual user input, intentional content)
- ✅ `journal/context/**` - DO NOT filter (manual context captures, intentional content)
- ✅ `prds/**` - DO NOT filter (documentation, not journal output)

**Rationale**: Only auto-generated journal entries need filtering. Manual reflections and context captures are intentional user documentation and should remain visible like any other code documentation.

**Next Phase**: Proceed directly to Phase 2 (Hook-Level Prevention)

### Phase 2: Hook-Level Prevention
**Goal**: Prevent post-commit hook from running on journal-entry-only commits

**Tasks**:
- [ ] Add commit analysis to post-commit hook
- [ ] If commit only touches `journal/entries/**` paths, skip execution entirely
- [ ] Add telemetry for skipped journal-entry-only commits
- [ ] Test with commit 1104c468 (should skip - no hook execution)
- [ ] Test with mixed commits (journal entries + code changes - should still run)
- [ ] Test with reflections/context-only commits (should still run - these are manual content)

**Implementation Location**: `hooks/post-commit` or early in `src/index.js`

**Note**: Commits that ONLY touch reflections or context files should still trigger the hook, as these are manual user content that may be relevant to journal generation.

### Phase 3: Diff-Level Filtering
**Goal**: Strip journal entry files from git diffs before passing to generators

**Tasks**:
- [ ] Add `journal/entries/**` filtering to git diff collection
- [ ] Update `commit-content-analyzer.js` to exclude `journal/entries/**` files from `changedFiles`
- [ ] Update `filterGitDiff` in `context-filter.js` to strip `journal/entries/**` changes from diffs
- [ ] Ensure no generator receives journal entry file diffs
- [ ] Add telemetry for filtered journal entry content
- [ ] Verify reflections and context files are NOT filtered (should remain in diffs)

**Implementation Location**:
- `src/generators/utils/commit-content-analyzer.js`
- `src/generators/filters/context-filter.js`
- Git diff collection (wherever that happens)

**Important**: Only filter `journal/entries/**` paths. DO NOT filter `journal/reflections/**` or `journal/context/**` - these are manual user content and should remain visible to generators.

### Phase 4: Validation
**Goal**: Verify the fix works end-to-end

**Tasks**:
- [ ] Test journal-entry-only commit (e.g., 1104c468) - should skip hook execution entirely
- [ ] Test reflection-only or context-only commit - should still run hook (manual content)
- [ ] Test mixed commit with journal entries + code - should run but exclude journal entry diffs
- [ ] Regenerate commit 441db893 and verify no AGPL license bleed in output
- [ ] Review recent journal entries to confirm no more "old solutions" pollution
- [ ] Check telemetry to verify filtering is working
- [ ] Verify reflections and context files remain visible in git diffs
- [ ] Update PRD with validation results

## Open Questions

1. **When did this break?** ⏳ TO BE ANSWERED in Phase 0 telemetry analysis
   - Was there previous logic that got removed?
   - What changed in the last 3 weeks?

2. ✅ **Manual reflections** - ANSWERED (2025-10-17)
   - Should `journal/reflections/**` be treated the same as `journal/entries/**`?
   - **Decision**: NO - Reflections are manual user input and should NOT be filtered

3. ✅ **Context captures** - ANSWERED (2025-10-17)
   - Should `journal/context/**` files be filtered from diffs?
   - **Decision**: NO - Context captures are manual user input and should NOT be filtered

4. ✅ **Chat vs Diff** - ANSWERED (2025-10-17)
   - Should journal filtering rules differ for chat history vs git diffs?
   - **Decision**: Only filter `journal/entries/**` from git diffs. Reflections and context in chat history should remain (they're manual user input)

## Design Decisions

_(To be filled in during implementation)_

## Work Log

### 2025-10-17: PRD Updated - Priority, Scope, and Research Strategy
- **Priority elevated to P0 (Critical)** - Must fix before next release
- **Added concrete example** of context bleed:
  - Commit 441db893 (gitignore) incorrectly mentions AGPL license from previous commit b0b0c9b2
  - Example location: journal/entries/2025-10/2025-10-17.md lines 48-83
- **Clarified filtering scope**:
  - ✅ Filter: `journal/entries/**` only (auto-generated)
  - ❌ DO NOT filter: `journal/reflections/**`, `journal/context/**` (manual user input)
- **Added telemetry-based research strategy**:
  - Start with Datadog trace analysis from 3 weeks ago vs now
  - Look for existing filtering logic that may have been bypassed
  - Investigate what changed in the data flow
- **Completed Phase 1** (Scope Definition) - filtering rules now clear
- **Updated all phases** to reflect journal-entries-only filtering scope
- **Answered open questions** about reflections, context, and chat vs diff filtering

### 2025-10-15: PRD Created
- Identified two distinct problems: recursive generation and context pollution
- Created GitHub issue #32
- Defined research phase to investigate root cause
- Added commit 1104c468 as test case
- Structured phases: Research → Scope Definition → Hook Prevention → Diff Filtering → Validation

## References

### Test Cases
- **Commit 1104c468**: Journal-only commit (tests recursive generation prevention)
- **Commit 441db893**: Gitignore commit with context bleed from previous commit b0b0c9b2
  - Journal entry: [journal/entries/2025-10/2025-10-17.md](../journal/entries/2025-10/2025-10-17.md) lines 48-83
  - Problem: AGPL license info from b0b0c9b2 bleeding into 441db893 summary

### Existing Utilities
- `src/generators/utils/commit-content-analyzer.js` - Detects doc-only commits
- `src/generators/filters/context-filter.js` - Filters context for token limits
- `hooks/post-commit` - Git hook entry point
