# PRD-12: Fix Journal Entry Confusion

**Status**: Draft
**Created**: 2025-09-19
**Issue**: [#12](https://github.com/wiggitywhitney/commit-story/issues/12)

## Executive Summary
Journal entries show confusion starting around Sept 16 when OpenTelemetry instrumentation was added. The test script `scripts/test-otel.js` is causing duplicate journal generations. We need to determine if there's ALSO a context bleeding problem or if all confusion is purely from test script duplication.

## Problem Statement

### Confirmed Issue: Duplicate Entries from Test Script
- Same commits appear multiple times (e.g., 25de471b appears 3x, e0c1632b appears 4x)
- Caused by `scripts/test-otel.js` calling `await main('HEAD')`
- Each test run generates a full journal entry

### Suspected Issue: Context Bleeding (NEEDS VALIDATION)
- Content appears to mix different commits
- BUT this might just be multiple test runs capturing different conversation states
- Need to validate if this is a real issue or just a side effect of duplication

### Timeline
- **Pre-Sept 16**: Journal entries clean and focused
- **Sept 16, 12:20 PM - Commit 6239b6b**: Created test-otel.js
- **Sept 16-19**: Confusion and duplication appears

## Investigation Plan

### Phase 1: Validate If Context Bleeding Actually Exists
1. **Stop Test Script First**
   - Disable journal generation in test-otel.js
   - Prevent any new duplicate entries

2. **Regenerate a Clean Entry**
   - Pick a known "confused" commit
   - Generate a SINGLE clean journal entry for it
   - Compare with the existing confused entries

3. **Analyze the Differences**
   - If the clean entry is correct → problem was ONLY test duplication
   - If the clean entry still shows mixed context → there IS a filtering problem

### Phase 2: Use Traces to Understand What Happened

#### Queries to Validate the Problem
```
# Count how many times each commit was processed
service:commit-story operation:journal.generate
  | stats count by @git.commit.sha

# For a specific problem commit, see all generation attempts
service:commit-story @git.commit.sha:25de471b
  | group by @trace.trace_id
  | fields @timestamp @context.messages.count

# Check if different runs had different context windows
service:commit-story @git.commit.sha:25de471b operation:context.gather
  | fields @context.window.start @context.window.end @trace.trace_id
```

### Phase 3: Determine Root Cause(s)

#### If ONLY Test Duplication:
- Fix is simple: modify test-otel.js
- Add guards to prevent test journal generation
- Problem solved

#### If ALSO Context Bleeding:
- Find first commit with bleeding (after removing duplicates)
- Identify what broke the filtering
- Fix the timestamp filtering logic

## Success Criteria
1. **Validation Complete**: Know definitively if context bleeding is real
2. **Test Script Fixed**: No more duplicate generations
3. **If Bleeding Exists**: It's also fixed
4. **Clean Entries**: Can generate accurate single entries for all commits

## Milestones

### M1: Stop Test Duplication & Validate (Immediate)
- [ ] Modify test-otel.js to skip journal generation
- [ ] Pick a problem commit (e.g., 25de471b)
- [ ] Generate ONE clean entry for it
- [ ] Compare with confused entries
- [ ] Determine if context bleeding is real or not

### M2: Fix Actual Problems (Day 1)
- [ ] If only duplication: ensure test fix is complete
- [ ] If also bleeding: investigate when/how filtering broke
- [ ] Implement necessary fixes
- [ ] Add safeguards against future issues

### M3: Cleanup & Verification (Day 2)
- [ ] Regenerate all affected entries (Sept 16-19)
- [ ] Verify all entries are now clean
- [ ] Document what happened and how to prevent it
- [ ] Update test scripts appropriately

## Technical Approach

### Immediate Actions
1. **Modify test-otel.js**
   ```javascript
   // Add at top of test
   process.env.SKIP_JOURNAL_GENERATION = 'true';
   ```

2. **Test Regeneration**
   ```bash
   # Generate single clean entry for problem commit
   npm run commit-story 25de471b
   ```

3. **Compare Results**
   - If clean → was just duplication
   - If still confused → investigate filtering

### Diagnostic Tools
- Datadog trace queries to see generation patterns
- Git log to identify exact commit timestamps
- Diff tool to compare clean vs confused entries

## Documentation for Conference Talk

This investigation provides a test case for exploring whether traces help debug AI-assisted tools.

### What to Document
- What queries we ran and their results (both helpful and unhelpful)
- Whether trace data provided actionable insights or not
- Cases where traces confused or misled the investigation
- Alternative approaches that worked better (if any)
- Time spent using traces vs value gained
- Which specific trace attributes were useful (if any)
- What was noise vs signal in the trace data

### Questions to Answer Objectively
- Did traces reveal the root cause faster than other methods?
- Could we have found the issue without traces? How?
- Were there simpler debugging approaches we overlooked?
- Did trace data lead us down any wrong paths?
- What would we do differently next time?

### Connection to PRD-10
This investigation serves as a real-world test of PRD-10's hypothesis about trace data value. Document findings honestly - negative results are valuable data.

### Documentation Standards
- Record actual queries run, not idealized versions
- Include failed attempts and dead ends
- Note time spent on each approach
- Avoid assuming causation from correlation
- Let evidence drive conclusions, not predetermined narratives

## Progress Log

### 2025-09-19
- Identified test-otel.js causing duplicates
- Recognized need to VALIDATE if context bleeding is real
- Created plan to test hypothesis before assuming multiple problems
- Will fix test script first, then validate if other issues exist
- Set up objective documentation framework for conference talk

---
*This PRD focuses on first validating whether context bleeding is a real issue or just a symptom of test script duplication, then fixing the actual problems found. Documentation will be objective and evidence-based, recording both successes and failures in using trace data for debugging.*