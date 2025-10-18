# PRD-32: Journal File Filtering

**Status**: 🔴 Critical - Top Priority
**GitHub Issue**: [#32](https://github.com/wiggitywhitney/commit-story/issues/32)
**Created**: 2025-10-15
**Last Updated**: 2025-10-18
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
**Goal**: ✅ COMPLETE - Root cause identified (2025-10-17)

#### Investigation Summary

Comprehensive investigation using telemetry analysis, git history, code search, and Oct 3 reflection notes revealed the root cause and clarified confusion with unrelated PRD-2.

#### Key Findings

**Finding 1: Message Filtering Bypass (Oct 1-3, 2025) - UNRELATED to journal path filtering**
- ✅ **Oct 1** (commit `8db5ceb4`): Session grouping implementation bypassed message filtering
  - Generators switched from `chatMessages` (filtered) to `chatSessions` (unfiltered)
  - Result: 448 unfiltered messages instead of 174 filtered → dialogue timeouts
  - This broke filtering of tool calls, system messages, etc.
- ✅ **Oct 3** (commit `600ed65`): Message filtering was RESTORED
  - Applied filtering to session groups to match filtered flat messages
  - Verified with telemetry: 61% token reduction (448→174 messages)
- ✅ **Conclusion**: Message filtering working correctly now, NOT the root cause of journal entry problem

**Finding 2: Journal Path Filtering (NEVER IMPLEMENTED) - ROOT CAUSE**

**Evidence from comprehensive code search**:
- ✅ `git log -p -S "journal/entries"` → NO commits ever implemented path filtering
- ✅ `grep -r "journal/entries" src/` → Only references in `journal-paths.js` utility (path generation, not filtering)
- ✅ `src/collectors/git-collector.js:55` → Uses `git diff-tree -p ${commitRef}` with NO path exclusions
- ✅ `src/generators/filters/context-filter.js:136` → Only filters by:
  - Sensitive data redaction (`redactSensitiveData`)
  - Diff size (summarizes if >15000 tokens)
  - **NO path-based filtering**
- ✅ `src/generators/utils/commit-content-analyzer.js` → Categorizes docs vs functional files, but NO journal-specific logic
- ✅ `hooks/post-commit` → No journal commit detection
- ✅ `src/index.js` → No journal filtering at entry point

**Historical context that confused investigation**:
- ❌ **PRD-1 DD-029** (Sept 2025): "Journal Path Filtering Strategy (Deferred)"
  - This was about filtering **PRD files and task management docs** from journal generation
  - NOT about filtering journal entries themselves from git diffs
  - Correctly deferred pending configuration architecture
- ❌ **PRD-2** (Sept 2-Oct 12, 2025): File Exclusion System for Journal Noise Reduction
  - Also about filtering **PRDs/task management files**, not journal entries
  - Status changed to "Not Planning to Implement" on Oct 12
  - Completely separate concern from PRD-32

**Actual problem**: Journal entry path filtering for `journal/entries/**` was NEVER implemented.

**Finding 3: Timeline of Journal Entry Problem**

| Date | Event | Impact |
|------|-------|--------|
| Aug 28, 2025 | `context-filter.js` created (commit `13ceb04`) | Token-based filtering only |
| Oct 1, 2025 | Session grouping (commit `8db5ceb4`) | Message filtering bypassed (unrelated) |
| Oct 3, 2025 | Filtering restored (commit `600ed65`) | Message filtering working again (unrelated) |
| Oct 7-8, 2025 | Journal directory created (commit `b676b55`) | `journal/entries/` structure established |
| Oct 15, 2025 | Recursive generation discovered (commit `1104c468`) | Journal-only commit triggered recursive generation |
| Oct 17, 2025 | Context bleed discovered (commit `441db893`) | Old journal content in diffs causing AI to reference previous work |

#### Answers to Key Questions

1. **Did journal entry path filtering exist before?**
   - NO - it was NEVER implemented
   - DD-029 and PRD-2 were about filtering PRDs/task files (different problem)

2. **What broke?**
   - Nothing broke - filtering never existed
   - Two issues discovered:
     - ✅ Message filtering bypass (Oct 1) → FIXED Oct 3 (unrelated)
     - ❌ Journal path filtering → NEVER EXISTED (this PRD)

3. **When did journal files start appearing in diffs?**
   - Always included since journal directory created (~Oct 7-8)
   - Problem became visible when:
     - Journal entries accumulated over time
     - Entries committed alongside code changes
     - Old journal content caused context bleed

#### Root Cause: Two Separate Problems

1. ✅ **Message filtering bypass** - ALREADY FIXED (commit `600ed65`)
   - Tool calls, system messages properly filtered now
   - Session grouping maintains filtering correctly

2. ❌ **Journal path filtering** - NEVER IMPLEMENTED (this PRD solves it)
   - Journal entry files always included in git diffs
   - `filterGitDiff()` only handles size/sensitivity, NOT paths
   - Need to implement path-based exclusion for `journal/entries/**`

#### Implementation Locations

**Phase 2** (Hook-Level Prevention):
- `hooks/post-commit` or `src/index.js:204-210`
- Detect journal-entry-only commits before context gathering
- Skip execution entirely if only `journal/entries/**` changed

**Phase 3** (Diff-Level Filtering):
- **Option A** (Preferred): `src/collectors/git-collector.js:55`
  - Add `-- . ':!journal/entries/**'` to `git diff-tree` command
  - Filters at collection time (most efficient)
- **Option B**: `src/generators/filters/context-filter.js:136`
  - Add path filtering logic to `filterGitDiff()` function
  - Parse diff and remove sections for `journal/entries/**` files
- `src/generators/utils/commit-content-analyzer.js:33-36`
  - Exclude `journal/entries/**` from `changedFiles` analysis

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
**Goal**: ✅ COMPLETE - Prevent post-commit hook from running on journal-entry-only commits (2025-10-18)

**Tasks**:
- [x] Add commit analysis utility - Created `src/utils/commit-analyzer.js`
- [x] If commit only touches `journal/entries/**` paths, skip execution entirely
- [x] Test with commit 1104c468 (should skip - no hook execution) - ✅ PASSED
- [x] Test with mixed commits (journal entries + code changes - should still run) - ✅ PASSED
- [x] Test with reflections/context-only commits (should still run - these are manual content) - ✅ PASSED

**Implementation Location**: `src/index.js` (lines 205-213) and new `src/utils/commit-analyzer.js`

**Implementation Details**:
- Created `getChangedFilesInCommit()` - Uses `git diff-tree` to detect changed files
- Created `isJournalEntriesOnlyCommit()` - Pattern matches `journal/entries/**`
- Early exit check placed after CLI parsing, before expensive context collection
- Proper span closure and debug logging for observability

**Test Results**:
- Commit 1104c468 (historical journal-only): Successfully skipped
- Commit e5edb4d (3 journal entries): Successfully skipped
- Mixed commits (code + journal/reflection): Ran normally
- Code-only commits: Ran normally
- Reflection-only commits: Ran normally (manual content preserved)
- Context-only commits: Ran normally (manual content preserved)

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

### 2025-10-18: Phase 2 Implementation Complete
**Duration**: ~1 hour
**Commits**: b86937d, e5edb4d, 1cb9027, 260b86a, bcc8d90, 207bdaa
**Implementation**: Hook-level prevention to eliminate recursive journal generation

**Completed PRD Items**:
- [x] Commit analysis utility - Created `src/utils/commit-analyzer.js` with `getChangedFilesInCommit()` and `isJournalEntriesOnlyCommit()` functions
- [x] Early exit check - Modified `src/index.js` (lines 205-213) to skip journal-entries-only commits before context collection
- [x] Comprehensive testing - All 6 test scenarios passed:
  - ✅ Historical journal-only commit (1104c468): Skipped
  - ✅ New journal-only commit (e5edb4d): Skipped
  - ✅ Mixed commits (code + journal): Ran normally
  - ✅ Code-only commits: Ran normally
  - ✅ Reflection-only commits: Ran normally (manual content)
  - ✅ Context-only commits: Ran normally (manual content)

**Implementation Approach**:
- **Detection logic**: Uses `git diff-tree --no-commit-id --name-only -r` to get changed files
- **Pattern matching**: Simple `file.startsWith('journal/entries/')` check for clarity
- **Placement**: Early exit after CLI parsing, before expensive `gatherContextForCommit()`
- **Error handling**: Defaults to allowing execution on git command failures (safer)
- **Observability**: Debug logs show "⏭️  Skipping commit (only journal entries changed: N files)"

**Key Design Decision**:
Implemented at application entry point (`src/index.js`) rather than in bash hook (`hooks/post-commit`) because:
- Access to proper error handling and span management
- Consistent with existing codebase patterns
- Can leverage debug logging infrastructure
- Cleaner separation of concerns (hook stays simple, logic in JS)

**Problem Solved**: Recursive journal generation (Problem 1 from PRD)
- Journal-only commits no longer trigger hook execution
- Eliminates "journal entry about adding a journal entry" noise
- Preserves execution for manual content (reflections, context captures)

**Next Phase**: Phase 3 - Diff-Level Filtering to solve context pollution (Problem 2)

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
