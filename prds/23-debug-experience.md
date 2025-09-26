# PRD-23: Improve Debug Experience

## Metadata
- **Issue**: [#23](https://github.com/wiggitywhitney/commit-story/issues/23)
- **Status**: Active
- **Created**: 2025-09-26
- **Author**: Whitney Lee

## Overview

### Problem Statement
The current debug experience in Commit Story is cluttered with internal implementation details (OpenTelemetry messages, dotenv tips) and lacks clear, actionable feedback when journal generation fails. Users struggle to understand what went wrong and how to fix issues.

### Solution
Implement a clean, user-focused debug experience that:
1. Shows only relevant progress and error information
2. Suppresses internal telemetry noise
3. Provides actionable error messages with clear next steps
4. Uses appropriate exit codes for proper error handling

### Key Benefits
- **Improved User Experience**: Clear feedback without implementation noise
- **Easier Troubleshooting**: Actionable error messages with specific remediation steps
- **Reliable Error Detection**: Proper exit codes ensure hooks report accurate status
- **Maintainable Codebase**: Consistent debug logging patterns throughout

## User Stories

### Story 1: Developer Troubleshooting Failed Generation
**As a** developer using Commit Story
**I want** clear error messages when journal generation fails
**So that** I can quickly understand and fix the issue

**Acceptance Criteria:**
- Error messages explain what failed in user terms (not implementation details)
- Each error includes specific steps to resolve it
- Exit codes accurately reflect success/failure

### Story 2: Developer Monitoring Normal Operation
**As a** developer using Commit Story
**I want** minimal output during successful operations
**So that** my git workflow isn't cluttered with unnecessary messages

**Acceptance Criteria:**
- Background mode (debug: false) produces no output on success
- Debug mode (debug: true) shows clean progress messages
- No OpenTelemetry or dotenv messages in either mode

### Story 3: Developer Debugging Path Issues
**As a** developer with multiple repositories
**I want** robust path matching for Claude chat data
**So that** journal generation works regardless of path format variations

**Acceptance Criteria:**
- Path matching handles symlinks correctly
- Trailing slashes don't affect matching
- Debug output shows normalized paths being compared

## Requirements

### Functional Requirements

#### 1. Debug Output Control
- **R1.1**: Suppress OpenTelemetry initialization/shutdown messages
- **R1.2**: Suppress dotenv messages using `{ quiet: true }` option
- **R1.3**: Show progress messages only in debug mode
- **R1.4**: Keep narrative logger unchanged for telemetry purposes

#### 2. Error Handling
- **R2.1**: Exit with code 1 for any failure (not 0)
- **R2.2**: Show error messages with console.error in debug mode
- **R2.3**: Include actionable next steps in error messages
- **R2.4**: Specific error for "no chat data found" scenario

#### 3. Path Normalization
- **R3.1**: Use path.resolve() on both repo path and chat message paths
- **R3.2**: Remove trailing slashes before comparison
- **R3.3**: Handle symlinks through resolve()

#### 4. Success Messages
- **R4.1**: No output in background mode (debug: false)
- **R4.2**: Clear progress indicators in debug mode
- **R4.3**: Show file path where journal was saved (debug mode only)

### Non-Functional Requirements

#### 1. Maintainability
- **N1.1**: Keep implementation simple (KISS principle)
- **N1.2**: Consistent debug logging patterns
- **N1.3**: No complex multi-level verbosity settings

#### 2. Compatibility
- **N2.1**: Preserve all existing narrative logger calls
- **N2.2**: Maintain backward compatibility with existing configs
- **N2.3**: Don't break existing telemetry integration

## Design Decisions

### Decision 1: Simple Debug Flag
**Choice**: Keep debug as boolean (true/false) rather than multiple verbosity levels
**Rationale**: KISS principle for single-developer maintenance
**Tradeoffs**: Less granular control but simpler implementation and user experience

### Decision 2: Exit Code Strategy
**Choice**: Use only 0 (success) and 1 (failure)
**Rationale**: Simplicity over granularity for a side project
**Tradeoffs**: Less specific error detection but simpler hook script logic

### Decision 3: Path Normalization Approach
**Choice**: Minimal normalization with path.resolve() and trailing slash removal
**Rationale**: Handles 90% of cases without complex logic
**Tradeoffs**: May miss edge cases but maintains simplicity

## Implementation Plan

### Milestone 1: Suppress Telemetry Noise (Priority: High)
**Goal**: Remove OpenTelemetry and dotenv messages from user-visible output

**Tasks**:
- [ ] Add `{ quiet: true }` to dotenv config initialization
- [ ] Redirect OpenTelemetry output to null or suppress initialization messages
- [ ] Test that telemetry still functions while output is suppressed

**Documentation Updates**:
- None required (internal change)

### Milestone 2: Fix Exit Codes and Error Messages (Priority: High)
**Goal**: Ensure failures exit with code 1 and show clear errors

**Tasks**:
- [ ] Change "no chat data found" exit from 0 to 1
- [ ] Add console.error alongside debugLog for this scenario
- [ ] Update error message format with actionable steps
- [ ] Verify hook script detects failure correctly

**Documentation Updates**:
- Update README troubleshooting section with new error messages

### Milestone 3: Implement Path Normalization (Priority: Medium)
**Goal**: Make path matching more robust

**Tasks**:
- [ ] Add path.resolve() to both sides of path comparison
- [ ] Remove trailing slashes before comparison
- [ ] Add debug output showing normalized paths
- [ ] Test with symlinked directories

**Documentation Updates**:
- Add note about symlink support in README

### Milestone 4: Clean Up Debug Output (Priority: Medium)
**Goal**: Provide clear progress messages in debug mode

**Tasks**:
- [ ] Audit all debugLog calls for consistency
- [ ] Ensure all error paths use console.error in debug mode
- [ ] Remove or conditionalize any remaining noise
- [ ] Add clear progress indicators for each phase

**Documentation Updates**:
- Update README with example of debug output

## Success Metrics

### Quantitative
- Zero OpenTelemetry messages in user output
- 100% of failures exit with code 1
- Path matching success rate > 95% across different path formats

### Qualitative
- Users report easier troubleshooting experience
- Reduced confusion about journal generation failures
- Cleaner git commit output

## Risk Assessment

### Risk 1: Breaking Telemetry
**Likelihood**: Low
**Impact**: Medium
**Mitigation**: Test that narrative logger still sends data while output is suppressed

### Risk 2: Path Normalization Edge Cases
**Likelihood**: Medium
**Impact**: Low
**Mitigation**: Document known limitations, provide debug output for diagnosis

### Risk 3: Backward Compatibility
**Likelihood**: Low
**Impact**: High
**Mitigation**: Keep existing config format, test with old configs

## Progress Log

### 2025-09-26
- PRD created based on debugging session findings
- Identified key issues: telemetry noise, exit codes, path matching
- Defined implementation approach prioritizing simplicity

## Design Document References

### Existing Documentation
- `README.md` - Troubleshooting section needs updates
- `src/index.js` - Main entry point with debug logic
- `src/collectors/claude-collector.js` - Path matching logic
- `scripts/install-commit-journal-hook.sh` - Hook script with debug detection

### Code Locations for Changes
1. **Telemetry Suppression**
   - `src/index.js` - dotenv initialization
   - `src/tracing.js` - OpenTelemetry setup
   - `src/logging.js` - Logger shutdown messages

2. **Exit Code Fixes**
   - `src/index.js:87` - Change exit(0) to exit(1)
   - `src/index.js:84` - Add console.error for no chat data

3. **Path Normalization**
   - `src/collectors/claude-collector.js:80` - Path comparison
   - `src/integrators/context-integrator.js:156` - Pass normalized path

4. **Debug Output Cleanup**
   - Throughout codebase - Audit debugLog usage
   - Add console.error in debug mode for all error cases

## Notes

- This PRD focuses on improving the debug experience without changing the fundamental requirement for Claude Code chat data
- The implementation maintains backward compatibility and doesn't remove any telemetry functionality
- Priority is on simple, maintainable solutions appropriate for a single-developer side project