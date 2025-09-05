# PRD-5: Automated Journal Summary Generation

**Issue**: [#5](https://github.com/wiggitywhitney/commit-story/issues/5)  
**Status**: Planning  
**Created**: 2025-09-05  
**Last Updated**: 2025-09-05

## Summary

Create an automated daily journal summary system that intelligently detects gaps in summarization and generates comprehensive daily summaries from journal entries. The system will trigger on the first commit of a new day, automatically backfill any missing summaries, and provide manual commands for testing and catch-up scenarios.

## Problem Statement

Currently, the journal system generates rich individual commit entries but lacks higher-level aggregation. Developers need:

1. **Daily Overview**: A consolidated view of each day's development work
2. **Gap Handling**: Automatic detection of unsummarized periods (weekends, vacations)
3. **Retroactive Capability**: Manual summary generation for testing and historical data
4. **Foundation for Rollups**: Groundwork for future weekly/monthly summaries

## Solution Overview

### Core Functionality

**Daily Summary Generation**:
- Triggered automatically on first commit of new day
- Scans for ALL unsummarized days with journal entries
- Generates summaries for each missing day using AI
- Stores in structured directory: `journal/summaries/daily/`

**Smart Gap Detection**:
- Identifies which days need summaries by checking existing files
- Handles irregular development patterns (weekends off, vacation gaps)
- Prevents duplicate summary generation

**Manual Backfill**:
- CLI command: `npm run generate-summary [date]`  
- Useful for testing, development, and historical backfill
- Can regenerate existing summaries if needed

### MVP Scope (This PRD)

**Included**:
- Daily summary generation with AI
- Gap detection and automatic backfill
- Manual summary command
- Post-commit hook integration
- Summary section structure (TBD at implementation)

**Deferred to Future PRDs**:
- Weekly summaries (from daily summaries)
- Monthly/quarterly/yearly rollups  
- Source file linking system
- Configurable summary sections
- Summary search and indexing

## Technical Architecture

### New Components

**Summary Manager** (`src/managers/summary-manager.js`):
- Orchestrates summary generation workflow
- Detects which days need summaries
- Handles both automatic and manual triggers
- Manages summary file creation and organization

**Daily Summary Generator** (`src/generators/daily-summary-generator.js`):
- AI-powered summary generation from journal entries
- Uses OpenAI to create consolidated daily narratives
- Section structure to be determined during implementation
- Handles single and multi-entry days

**Summary Detector** (`src/utils/summary-detector.js`):
- Logic to determine which days need summaries
- Scans existing summary files to prevent duplicates
- Handles date range calculations for gap detection

### Modified Components

**Post-Commit Hook** (`hooks/post-commit`):
- Add summary generation trigger after journal creation
- Detect first commit of new day condition
- Call summary manager for gap detection and processing

**Main Entry Point** (`src/index.js`):
- Add summary generation flow after journal creation
- Handle summary-specific error conditions
- Integrate with existing validation logic

**Package Scripts** (`package.json`):
- Add `generate-summary` script for manual backfill
- Support date parameter for specific day generation

### File Structure

```
journal/
├── entries/
│   └── YYYY-MM/
│       └── YYYY-MM-DD.md (existing)
└── summaries/
    └── daily/
        └── YYYY-MM-DD.md (new)
```

## Milestones

### Milestone 1: Foundation and Detection Logic
**Goal**: Build core infrastructure for summary detection and file management

**Tasks**:
- [ ] Create `src/utils/summary-detector.js` with gap detection logic
- [ ] Create basic `src/managers/summary-manager.js` structure
- [ ] Add npm script for manual summary generation
- [ ] Create summary directory structure with test files
- [ ] Unit tests for date logic and gap detection

**Acceptance Criteria**:
- System can identify which days need summaries
- Manual command structure works end-to-end
- Proper error handling for invalid dates
- No duplicate summary detection works correctly

**Time Estimate**: 2-3 days

### Milestone 2: AI Summary Generation
**Goal**: Implement AI-powered daily summary creation from journal entries

**Tasks**:
- [ ] Create `src/generators/daily-summary-generator.js`
- [ ] Design daily summary section structure (decision point)
- [ ] Implement AI prompt for consolidating journal entries
- [ ] Handle single vs multi-entry days appropriately
- [ ] Add comprehensive error handling for AI failures

**Design Decision Required**: Summary section structure
- Option A: Same 4 sections as journal (Summary, Dialogue, Technical, Details)
- Option B: New summary-focused sections (Narrative, Achievements, Learning, Context)
- Decision to be made based on actual journal data analysis

**Acceptance Criteria**:
- Generate coherent daily summaries from journal entries
- Handle days with single and multiple commits
- Proper error handling and graceful degradation
- Summary quality comparable to individual journal entries

**Time Estimate**: 3-4 days

### Milestone 3: Post-Commit Integration
**Goal**: Integrate summary generation into existing post-commit workflow

**Tasks**:
- [ ] Modify `hooks/post-commit` to trigger summary check
- [ ] Update `src/index.js` to include summary workflow
- [ ] Add configuration option to enable/disable summaries
- [ ] Test integration with existing journal generation
- [ ] Ensure summary generation doesn't break existing workflows

**Acceptance Criteria**:
- Summaries generate automatically on first commit of day
- Existing journal generation continues to work
- Configuration allows disabling summary feature
- Performance impact is minimal

**Time Estimate**: 2 days

### Milestone 4: Gap Handling and Testing
**Goal**: Comprehensive testing of gap detection and edge cases

**Test Scenarios**:
- [ ] Single day summary (normal case)
- [ ] Weekend gap (Fri → Mon, 2-3 days)  
- [ ] Vacation gap (5-10 days)
- [ ] Manual backfill command testing
- [ ] Duplicate prevention testing
- [ ] Days with no journal entries (should be skipped)
- [ ] Multiple commits on same day handling

**Acceptance Criteria**:
- All gap scenarios handled correctly
- Manual backfill works for historical dates
- No duplicate summaries created
- Graceful handling of edge cases

**Time Estimate**: 2-3 days

## Success Metrics

**Functional Success**:
- Daily summaries generated automatically for all journal days
- Zero duplicate summaries created
- Manual backfill command works reliably
- No disruption to existing journal generation

**Quality Success**:
- Summary quality comparable to individual journal entries
- Consolidated information maintains key technical decisions
- Narrative flow makes sense for daily development work
- AI processing time under 30 seconds per day

**User Experience Success**:
- Zero configuration required for basic functionality
- Clear documentation for manual commands
- Helpful error messages for edge cases
- Configurable enable/disable option

## Open Questions

1. **Summary Section Structure**: Should daily summaries use the same 4-section structure as journal entries, or create new summary-specific sections?

2. **Summary Tracking Method**: Use file existence checks or maintain a metadata file to track which days have been summarized?

3. **Regeneration Policy**: Should the system allow regenerating existing summaries, or prevent overwrites by default?

4. **Configuration Granularity**: Should summary generation be configurable at the feature level, or provide more granular controls?

5. **AI Model Selection**: Use same model as journal entries (gpt-4o-mini) or experiment with different models for summarization tasks?

## Future Enhancements (Out of Scope)

**Weekly/Monthly Rollups**:
- Weekly summaries from daily summaries
- Monthly summaries from weekly summaries
- Quarterly and yearly rollups

**Advanced Features**:
- Source file linking system (from previous implementation)
- Summary search and indexing
- Configurable summary sections
- Custom AI prompts for different summary styles
- Integration with external tools (Slack, email, etc.)

**Performance Optimizations**:
- Batch processing for large gaps
- Caching of intermediate results
- Parallel summary generation

## Progress Log

### 2025-09-05
- **Created PRD**: Initial version with comprehensive scope definition
- **GitHub Issue**: Created [#5](https://github.com/wiggitywhitney/commit-story/issues/5) with PRD label
- **Next Steps**: Begin Milestone 1 implementation after PRD review

---

*This PRD follows the documentation-first approach established in PRD-1 and uses the step-based architecture principles from PRD-4.*