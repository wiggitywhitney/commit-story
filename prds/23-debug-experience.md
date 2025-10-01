# PRD-23: Improve Debug Experience

## Metadata
- **Issue**: [#23](https://github.com/wiggitywhitney/commit-story/issues/23)
- **Status**: Active
- **Created**: 2025-09-26
- **Author**: Whitney Lee

## Overview

### Problem Statement

**THE BIG THING**: The debug/dev flag combination creates the wrong user experience:

**Current Broken Behavior**:
- When `dev: false, debug: true` → User gets telemetry noise (OTLP failures, shutdown messages) mixed with helpful debug info
- When `dev: true, debug: false` → User gets telemetry noise when they want silence for demos

**Root Cause**: Telemetry initializes regardless of `dev` flag, causing noise when `dev: false`

**Two Core Problems**:
1. **Remove Unhelpful Noise**: Telemetry errors, shutdown messages, and initialization spam appear when `dev: false`
2. **Add Useful Debug Logs**: Missing clear progress indicators and actionable error guidance

Users can't get clean debug output without telemetry pollution, breaking the conference demo experience and development troubleshooting.

### Solution
Implement proper flag-based output control:

**When `dev: false, debug: true`**:
- ✅ Clean progress messages: "Starting context collection", "Found X chat messages"
- ✅ Clear error messages with actionable next steps
- ❌ ZERO telemetry noise: no initialization, shutdown, or export failure messages

**When `dev: true, debug: false`**:
- ✅ Full telemetry collection (for conference demo analysis)
- ❌ ZERO console output (clean demo presentation)

**When `dev: false, debug: false`**:
- ❌ Complete silence (production mode)

**When `dev: true, debug: true`**:
- ✅ Both telemetry AND debug messages (development mode)

### Key Benefits
- **Improved User Experience**: Clear feedback without implementation noise
- **Easier Troubleshooting**: Actionable error messages with specific remediation steps
- **Reliable Error Detection**: Proper exit codes ensure hooks report accurate status
- **Maintainable Codebase**: Consistent debug logging patterns throughout

## Dependencies

**Prerequisites**: None - This is a standalone UX improvement
**Blocks**: PRD-24 (Package v1.1.0) - Can't ship with noisy debug output
**Related PRDs**: Part of conference roadmap (PRD-26)

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

### Decision 4: Conditional Telemetry Initialization
**Choice**: Make OpenTelemetry initialization completely conditional on `dev: true` flag
**Rationale**: The root cause of noise pollution is telemetry trying to run when `dev: false`, causing OTLP export failures, shutdown messages, and metric emission errors
**Tradeoffs**: Slightly more complex initialization logic but eliminates all telemetry noise when disabled
**Impact**: Solves the conference demo scenario and clean debug experience
**Status**: ✅ Implemented in Milestone 1

### Decision 5: Telemetry-Aware Console Output Design
**Choice**: Design console telemetry logs specifically for developers using telemetry to enhance AI coding assistance
**Rationale**: This repository is an experiment in telemetry-powered AI coding. Developers need actionable telemetry information (trace IDs, export status, service names) to effectively use AI assistant commands like `/trace`. Generic "initialized" messages don't support the core experiment.
**Tradeoffs**: More complex console output logic but enables the primary use case of correlating AI queries with runtime data
**Impact**: Enables developers to immediately use trace IDs with AI assistant commands, supporting the telemetry-powered coding experiment
**Status**: Outstanding - requires implementation

## Implementation Plan

### Milestone 1: Remove Unhelpful Telemetry Noise (Priority: High)
**Goal**: Make telemetry completely conditional on `dev: true` to eliminate noise when `dev: false`

**The Core Problem**: Currently telemetry initializes regardless of `dev` flag, causing noise pollution

**Tasks**:
- [x] Add `{ quiet: true }` to dotenv config initialization
- [x] Make OpenTelemetry initialization conditional on `dev: true` flag
- [x] Make logging.js shutdown handlers conditional on `dev: true`
- [x] Suppress telemetry metric emission failures when `dev: false`
- [x] Test that when `dev: false, debug: true` → zero telemetry messages appear

**Documentation Updates**:
- None required (internal change)

### Milestone 2: Add Useful Debug Logs (Priority: High) ✅ COMPLETE
**Goal**: Provide clear, helpful progress messages and error guidance when `debug: true`

**Tasks**:
- [x] Fix "no chat data found" exit code from 0 to 1
- [x] Add console.error alongside debugLog for error scenarios in debug mode
- [x] Enhance progress messages with clear phase indicators
- [x] Add actionable next steps to all error messages
- [x] Verify hook script detects failure correctly with new exit codes

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

### Milestone 4: Conference Demo Mode (Priority: High)
**Goal**: Perfect `dev: true, debug: false` behavior for clean conference presentation

**Requirements**:
- Full telemetry collection (for demo analysis)
- Zero console output (professional demo appearance)

**Tasks**:
- [ ] Audit all console.log/error/warn calls for debug flag conditioning
- [ ] Ensure telemetry runs silently when `debug: false`
- [ ] Test conference scenario: `dev: true, debug: false` → no console output
- [ ] Validate telemetry data still flows to Datadog in demo mode

**Documentation Updates**:
- Update README with conference demo configuration example

### Milestone 5: Clean Up Debug Output Consistency (Priority: Medium)
**Goal**: Audit and improve debug message quality

**Tasks**:
- [ ] Audit all debugLog calls for consistency
- [ ] Ensure all error paths use console.error in debug mode
- [ ] Remove or conditionalize any remaining noise
- [ ] Add clear progress indicators for each phase

**Documentation Updates**:
- Update README with example of debug output

### Milestone 6: Telemetry-Aware Console Output (Priority: Medium)
**Goal**: Design console logs around the needs of developers using telemetry to enhance their AI coding experience

**Context**: This repository is an experiment in whether feeding telemetry back into coding assistants can help the development experience. Developers in dev mode DO care about telemetry working, but they need actionable telemetry information that supports the core experiment.

**Current Problems**:
- No trace IDs shown (developers can't correlate AI queries with runtime data)
- No export success/failure confirmation
- No service name confirmation for Datadog queries
- No span/metric counts to understand telemetry volume
- Generic "initialized" messages don't help with telemetry debugging

**Tasks**:
- [ ] Replace generic "OpenTelemetry initialized" with service-aware message
- [ ] Add trace ID display for immediate use with `/trace` commands
- [ ] Show export success/failure with connection status
- [ ] Display span and metric counts after operations
- [ ] Add service name confirmation for Datadog correlation
- [ ] Design output format: `✅ Telemetry: service=commit-story-dev, exported 5 spans (trace: abc123...)`
- [ ] Ensure trace IDs are easily copyable for AI assistant queries
- [ ] Test that telemetry console output supports the AI-coding workflow

**Documentation Updates**:
- Update README with telemetry console output examples
- Document how to use displayed trace IDs with AI assistant commands

## Success Metrics

### Quantitative
- Zero OpenTelemetry noise when `dev: false` (clean debug output)
- 100% of failures exit with code 1
- Path matching success rate > 95% across different path formats
- Trace IDs displayed for 100% of telemetry operations when `dev: true`
- Export success/failure confirmation for all telemetry operations

### Qualitative
- Users report easier troubleshooting experience
- Reduced confusion about journal generation failures
- Cleaner git commit output
- Developers can easily correlate AI assistant queries with runtime telemetry data
- Telemetry console output supports the AI-coding workflow experiment

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

### 2025-10-01
- **Design Decision 4**: Identified root cause of noise pollution - telemetry initialization regardless of `dev` flag
- **Problem Clarification**: THE BIG THING is two separate issues:
  1. Remove unhelpful telemetry noise when `dev: false`
  2. Add useful debug logs when `debug: true`
- **New Milestone 4**: Added Conference Demo Mode requirements for `dev: true, debug: false`
- **Strategy Shift**: Make telemetry completely conditional on `dev: true` rather than just suppressing output
- **Milestone 1 Complete**: Successfully implemented conditional telemetry initialization
  - Fixed duplicate shutdown messages
  - Validated `dev: false, debug: true` produces zero telemetry noise
  - Confirmed `dev: true` still sends telemetry to Datadog correctly
- **Design Decision 5**: Added Telemetry-Aware Console Output milestone
  - Recognized need for actionable telemetry info (trace IDs, export status)
  - Focus on supporting AI-coding workflow with trace correlation
  - New Milestone 6 addresses telemetry experiment's core needs

### 2025-10-01: Milestone 1 Implementation Complete ✅
**Duration**: ~2 hours
**Primary Focus**: Conditional telemetry initialization and duplicate shutdown fix

**Completed PRD Items** (All 5 tasks in Milestone 1):
- [x] Make OpenTelemetry initialization conditional on `dev: true` flag - Evidence: tracing.js lines 26-102
- [x] Make logging.js shutdown handlers conditional on `dev: true` - Evidence: logging.js lines 75-113
- [x] Suppress telemetry metric emission failures when `dev: false` - Evidence: telemetry disabled completely when dev: false
- [x] Test that when `dev: false, debug: true` → zero telemetry messages appear - Evidence: Manual testing confirmed clean output
- [x] Fixed duplicate shutdown messages - Evidence: Removed manual gracefulShutdown call from index.js:185

**Technical Implementation**:
- **tracing.js**: Wrapped entire SDK initialization in `isDevMode` conditional
- **logging.js**: Made LoggerProvider creation and shutdown handlers conditional on `dev: true`
- **index.js**: Removed redundant shutdown call to fix duplicate messages
- **Validation**: Tested both `dev: false` (clean) and `dev: true` (telemetry working) scenarios

**Telemetry Verification**:
- Datadog logs confirm telemetry still flows correctly when `dev: true`
- Zero telemetry noise when `dev: false, debug: true`
- No errors or export failures detected in recent logs

**Next Session Priorities**:
- Consider implementing Milestone 6 (Telemetry-Aware Console Output)
- Milestone 2-5 remain available for future work if needed

### 2025-10-01: Additional Implementation - Dry-Run Flag & Config Refactoring ✅
**Duration**: ~1.5 hours
**Primary Focus**: Testing improvement and code cleanup

**Additional Work Completed**:
- **Dry-Run Flag Implementation** - Evidence: src/index.js argument parsing and conditional file saving
  - Added `--dry-run` and `--test` flags for testing without file creation
  - Full telemetry pipeline testing without cleanup hassles
  - JSDoc documentation with CLI usage examples
- **Config Parsing Refactoring** - Evidence: src/utils/config.js creation and imports updated
  - Created centralized `getConfig()` function in src/utils/config.js
  - Updated 4 files to use centralized config (index.js, tracing.js, logging.js, trace-logger.js)
  - Eliminated duplicate config parsing logic across codebase
  - Single source of truth for configuration management

**Testing Validation**:
- Verified --dry-run works with HEAD and specific commits
- Confirmed centralized config correctly handles dev: true/false scenarios
- Validated normal mode (file saving) still functions
- All telemetry behavior unchanged, cleaner code structure

**Developer Experience Improvements**:
- Future AI can test with `node src/index.js --dry-run` without cleanup
- Maintainable config parsing with consistent error handling
- Enhanced discoverability through JSDoc documentation

**Files Created/Modified**:
- NEW: src/utils/config.js (centralized config parsing)
- MODIFIED: src/index.js (CLI args, dry-run logic, config import)
- MODIFIED: src/tracing.js (config import)
- MODIFIED: src/logging.js (config import)
- MODIFIED: src/utils/trace-logger.js (config import)

**Next Session Priorities**:
- Consider implementing Milestone 6 (Telemetry-Aware Console Output)
- Potential telemetry instrumentation of new functionality with /add-telemetry
- Milestone 2-5 remain available for future work if needed

### 2025-10-01: Comprehensive Telemetry Instrumentation Session ✅
**Duration**: ~3 hours
**Primary Focus**: Advanced telemetry instrumentation using /add-telemetry command + safety improvements

**Telemetry Instrumentation Completed** (4 out of 5 original targets):
- [x] **CLI argument parsing instrumentation** - Evidence: CLI parsing span properly correlated in main trace (trace ID: dda80d64bf640cbafd082f3f1c2eccbc)
- [x] **Dry-run content display logic instrumentation** - Evidence: Dry-run attributes and telemetry correlation working
- [x] **Conditional telemetry initialization instrumentation** - Evidence: tracing.js spans with full narrative logging
- [x] **Conditional logging initialization instrumentation** - Evidence: logging.js spans with decision tracking
- [ ] **Configuration file reading logic** - INTENTIONALLY SKIPPED: Removed due to circular dependency issues (memory crashes resolved)

**Technical Architecture Improvements**:
- **Trace Correlation Success**: CLI parsing moved inside main() function for proper parent-child span relationships
- **Circular Dependency Resolution**: Configuration instrumentation cleanly removed to prevent bootstrap timing issues
- **Hack Elimination**: Removed 100ms setTimeout hack by restructuring code architecture
- **Duplicate Shutdown Fix**: Added isShuttingDown guard to prevent repeat console logs

**Telemetry Validation Results**:
- **Datadog Verification**: All spans reaching Datadog with proper correlation (21 spans in single trace)
- **Metrics and Logs**: Dual emission pattern working (span attributes + metrics + narrative logs)
- **Trace Hierarchy**: Perfect parent-child relationships across all instrumented components
- **Performance Impact**: Zero performance degradation, clean telemetry when dev: false

**Development Tool Enhancements**:
- **Anti-Pattern Prevention**: Added safety checks to /add-telemetry command:
  1. Circular dependency prevention (check imports before instrumentation)
  2. Trace correlation enforcement (nest spans within existing traces)
- **Future Safety**: These additions prevent the circular dependency and trace correlation issues encountered

**System State After Session**:
- ✅ All original functionality working correctly
- ✅ Telemetry instrumentation clean and logical (no hacks)
- ✅ Trace correlation properly implemented
- ✅ Development tooling improved for future instrumentation work
- ✅ Architecture resilient to bootstrap timing issues

**Lessons Learned**:
- **Configuration modules** should not be instrumented due to early bootstrap requirements
- **Trace correlation** requires careful placement within existing traced functions
- **setTimeout hacks** indicate architectural problems that need proper solutions
- **Simple rules** (2 safety checks) can prevent complex instrumentation problems

**Impact on PRD-23 Goals**:
- Significant progress on telemetry cleanliness and developer experience
- Foundation established for future Milestone 6 (Telemetry-Aware Console Output)
- Instrumentation methodology proven and documented for future sessions

**Next Session Priorities**:
- Consider implementing Milestone 4 (Conference Demo Mode) for clean presentation
- Consider implementing Milestone 6 (Telemetry-Aware Console Output) leveraging new telemetry infrastructure
- Milestone 2-3 remain available for error handling and path matching improvements

### 2025-10-01: Milestone 2 COMPLETE - Enhanced Debug Logging & Process Exit Fix ✅
**Duration**: ~4 hours (includes debugging and refactoring)
**Commits**: Implementation pending commit
**Primary Focus**: User-facing error messages and process lifecycle management

**Completed PRD Items** (All 5 tasks in Milestone 2):
- [x] **Exit code fix for no chat data** - Evidence: src/index.js:236 changed from exit(0) to return 1
  - Critical bug fix: git hooks can now detect this failure condition correctly
  - Error message includes helpful troubleshooting guidance

- [x] **Console.error for all error scenarios** - Evidence: src/index.js lines 224-234, 243-249, 282-289, 365-373
  - No chat data error: Explains 3 common causes with next steps
  - Missing API key error: Shows where to add key and how to get one
  - OpenAI connectivity error: Suggests connection troubleshooting
  - Generic errors: Provides debugging guidance with --dry-run recommendation

- [x] **4-phase progress indicators** - Evidence: src/index.js lines 185-196, 216-252, 294-299, 318-338
  - Phase 1 (Context Collection): Shows commit details, message count, sessions, previous commit
  - Phase 2 (Validation): Lists each validation step with checkmarks
  - Phase 3 (AI Generation): Indicates generation start and completion
  - Phase 4 (Saving): Shows save location or dry-run status
  - All phases use emoji icons for visual clarity (🔍 📊 💬 ✅)

- [x] **Actionable next steps in all errors** - Evidence: All error messages follow "Next steps:" pattern
  - Specific remediation guidance tailored to each error type
  - Examples include exact commands to run and resources to check

- [x] **Hook script exit code verification** - Evidence: Manual testing confirmed correct behavior
  - Success: exit code 0
  - All failures: exit code 1
  - Git hooks can now reliably detect failures

**Additional Work Completed (Beyond PRD Scope)**:
- [x] **Fixed pre-existing process hanging issue** - Evidence: Process now exits cleanly in 15ms vs hanging indefinitely
  - Root cause: Event loop kept alive by periodic metric exporter (5s interval)
  - Solution: Proper telemetry shutdown sequence before process.exit()
  - Following ChatGPT's recommended Node.js best practices for OpenTelemetry

- [x] **Created shutdown-helper utility** - Evidence: src/utils/shutdown-helper.js (new file)
  - DRY principle: Single implementation of timeout-bounded shutdown logic
  - Reusable across telemetry and logging systems
  - Follows same pattern as getConfig() utility

- [x] **Added shutdown functions** - Evidence: tracing.js and logging.js exports
  - `shutdownTelemetry({ timeoutMs: 2000 })` - Flushes traces/metrics with timeout
  - `shutdownLogging({ timeoutMs: 2000 })` - Flushes logs with timeout
  - Both use shared shutdown-helper for consistent behavior

- [x] **Refactored main() to return exit codes** - Evidence: src/index.js main() function
  - Removed all process.exit() calls from main()
  - Returns 0 for success, 1 for failures
  - Cleaner architecture, more testable

- [x] **Added CLI boundary** - Evidence: src/index.js lines 380-416
  - Proper separation: main() does work, CLI handles process lifecycle
  - Awaits telemetry shutdown before exit
  - Graceful error handling for unhandled exceptions

- [x] **Fixed author display bug** - Evidence: src/index.js:191
  - Was showing "[object Object]" in status logs
  - Now shows actual author name from commit data

**Technical Implementation Details**:
- **Status Logging Architecture**: 4-phase pipeline with emoji icons for visual clarity
- **Error Message Pattern**: All errors follow "❌ ERROR: [what]" + explanation + "Next steps:" format
- **Exit Code Strategy**: Consistent use of return codes instead of direct process.exit() calls
- **Shutdown Sequence**: Logging and telemetry shut down in parallel with 2s timeout each

**Files Modified**:
- src/index.js (138 lines changed: +108, -30)
- src/tracing.js (16 lines added: shutdown function)
- src/logging.js (16 lines added: shutdown function)
- NEW: src/utils/shutdown-helper.js (reusable shutdown utility)

**Testing Validation**:
- ✅ Dry-run mode: Clean status logging, proper error messages
- ✅ Normal mode: Journal saved successfully with status updates
- ✅ Exit codes: 0 for success, 1 for all failures
- ✅ Process exit: Clean exit in 15ms after ~18s AI processing (normal)
- ✅ Telemetry: Still flows to Datadog correctly when dev: true

**Conference Readiness Impact**:
- ✅ **Professional error UX**: Users can self-solve issues with clear guidance
- ✅ **Reliable git hooks**: Exit codes now correctly indicate success/failure
- ✅ **Clean status output**: Progress indicators show exactly what's happening
- ✅ **Process stability**: No more hanging (was breaking workflows)

**Design Decision: Process Exit Pattern**
- **Context**: Process was hanging indefinitely after completion (pre-existing issue)
- **Root Cause**: PeriodicExportingMetricReader keeps event loop alive with 5s timer
- **Solution Adopted**: ChatGPT-recommended pattern for Node.js + OpenTelemetry
  - Return exit codes from helper functions (not process.exit)
  - Single exit point at CLI boundary
  - Await telemetry shutdown with timeout before exit
  - Use process.exit() AFTER telemetry flushed
- **Alternative Considered**: process.exitCode without explicit exit
  - Rejected: Doesn't force exit when event loop has active timers
- **Trade-offs**: Added 15ms shutdown delay, but ensures telemetry delivery
- **Validation**: Tested old vs new behavior - old version also hung
- **Status**: ✅ Implemented and validated

**Next Session Priorities**:
- Milestone 4 (Conference Demo Mode) - Silent telemetry for professional presentation
- Milestone 6 (Telemetry-Aware Console Output) - Show trace IDs for AI assistant queries
- Milestone 3 (Path Normalization) - Lower priority, handle symlinks robustly
- Documentation: Update README troubleshooting section with new error messages

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