# PRD-30: Installation Experience & Package Optimization

## Metadata
- **Issue**: [#30](https://github.com/wiggitywhitney/commit-story/issues/30)
- **Status**: Active
- **Created**: 2025-10-05
- **Author**: Whitney Lee
- **Priority**: P0 (Blocks Adoption)
- **Target Version**: 1.2.0

## Overview

### Problem Statement
User testing revealed critical installation issues that block adoption:
- **Massive package bloat**: 288 packages (133 MB, 20,915 files) from unnecessary dependencies
- **Git disaster risk**: Missing node_modules/ protection causes users to commit all packages
- **Windows users blocked**: No installation instructions for Windows
- **Confusing documentation**: Missing "start in repo root" guidance
- **Outdated install script**: References removed `enabled` config option

**Real Impact**: Friend's installation resulted in computer overheating, git struggling with 20k+ files, and confusion about setup process. This is completely unacceptable for a dev tool.

### Solution
Comprehensive installation experience overhaul:
1. **Research phase**: Audit ALL dependencies to identify minimum packages needed
2. **Package optimization**: Remove bloat (OTel, MCP SDK to devDependencies only)
3. **Install script hardening**: Ensure node_modules/ in .gitignore, remove outdated messages
4. **Documentation improvements**: Add Windows support, repo root guidance, clearer prerequisites

### Key Benefits
- **90%+ package reduction**: 288 packages → ~10-20 packages (estimated)
- **10x faster installation**: From 133 MB → ~10-15 MB
- **Zero git disasters**: Automatic node_modules/ protection
- **Windows support**: Unblocks entire platform
- **Professional first impression**: Smooth, error-free installation

## User Stories

### Story 1: New User Installing Commit Story
**As a** developer wanting to try Commit Story
**I want** a fast, lightweight installation with clear instructions
**So that** I can start using the tool within 30 seconds without confusion

**Acceptance Criteria:**
- Installation completes in under 10 seconds
- Package size under 20 MB
- Clear "start in repo root" instruction
- Works on Windows, Mac, and Linux

### Story 2: User with Existing Repository
**As a** developer adding Commit Story to an existing project
**I want** the install script to protect my git repository
**So that** I don't accidentally commit thousands of node_modules files

**Acceptance Criteria:**
- Install script ensures node_modules/ is in .gitignore
- Works whether .gitignore exists or not
- Works whether node_modules/ entry exists or not
- Prevents git disaster before first commit

### Story 3: Windows Developer
**As a** Windows developer
**I want** installation instructions that work on my platform
**So that** I can use Commit Story without translating bash commands

**Acceptance Criteria:**
- Windows-specific installation steps in README
- PowerShell and CMD command equivalents
- Works on Windows 10 and 11

## Requirements

### Functional Requirements

#### Phase 0: Dependency Research & Audit
- **R0.1**: Audit ALL current dependencies (direct and transitive)
- **R0.2**: Identify which packages are actually imported/used in code
- **R0.3**: Determine minimum viable dependency set
- **R0.4**: Document why each remaining dependency is needed

#### Phase 1: Package Optimization
- **R1.1**: Move ALL OpenTelemetry packages to devDependencies
- **R1.2**: Remove @modelcontextprotocol/sdk from dependencies
- **R1.3**: Audit openai SDK necessity (or find lighter alternatives)
- **R1.4**: Verify dotenv is minimal/necessary
- **R1.5**: Remove any unused dependencies
- **R1.6**: Update package.json with minimal dependency set

#### Phase 2: Install Script Hardening
- **R2.1**: Ensure node_modules/ is added to .gitignore during init
- **R2.2**: Handle cases where .gitignore doesn't exist
- **R2.3**: Handle cases where .gitignore exists but no node_modules/ entry
- **R2.4**: Remove all references to `enabled: false` from output
- **R2.5**: Update success message with accurate configuration options

#### Phase 3: Documentation Updates
- **R3.1**: Add "Prerequisites: Start in your git repository root" to README
- **R3.2**: Add Windows installation section with PowerShell/CMD commands
- **R3.3**: Make OPENAI_API_KEY more prominent and clear
- **R3.4**: Update Quick Start section with platform-specific notes
- **R3.5**: Add troubleshooting section for common installation issues

### Non-Functional Requirements

#### Performance
- **N1.1**: Package size under 20 MB
- **N1.2**: Installation completes in under 10 seconds on standard connection
- **N1.3**: No performance degradation from conditional package loading

#### Reliability
- **N2.1**: Install script works on macOS, Linux, and Windows
- **N2.2**: Handles all .gitignore scenarios gracefully
- **N2.3**: Clear error messages if prerequisites not met

#### Maintainability
- **N3.1**: Dependencies only include what's actually needed
- **N3.2**: Easy to add back OTel for development
- **N3.3**: Documentation stays in sync with install script

## Research Phase: Dependency Audit

### Current State Analysis
```
Total packages: 288
Total size: 133 MB
Total files: 20,915
Total folders: 2,340
```

### Dependencies to Audit

#### Direct Dependencies (Current)
1. **@modelcontextprotocol/sdk** (^1.18.1)
   - Brings: express, cors, eventsource, eventsource-parser, zod, etc. (12+ packages)
   - Usage: MCP reflection tool (development only)
   - Decision: **Move to devDependencies**

2. **@opentelemetry/api** (^1.9.0)
   - Part of: OpenTelemetry instrumentation
   - Usage: Development telemetry only (confirmed via Datadog)
   - Decision: **Move to devDependencies**

3. **@opentelemetry/auto-instrumentations-node** (^0.63.0)
   - Brings: ~200+ packages for auto-instrumentation
   - Usage: Development telemetry only (confirmed via Datadog)
   - Decision: **Move to devDependencies**

4. **@opentelemetry/exporter-logs-otlp-http** (^0.205.0)
   - Usage: Development telemetry only (confirmed via Datadog)
   - Decision: **Move to devDependencies**

5. **@opentelemetry/exporter-metrics-otlp-http** (^0.205.0)
   - Usage: Development telemetry only (confirmed via Datadog)
   - Decision: **Move to devDependencies**

6. **@opentelemetry/exporter-trace-otlp-http** (^0.204.0)
   - Usage: Development telemetry only (confirmed via Datadog)
   - Decision: **Move to devDependencies**

7. **@opentelemetry/sdk-logs** (^0.205.0)
   - Usage: Development telemetry only (confirmed via Datadog)
   - Decision: **Move to devDependencies**

8. **@opentelemetry/sdk-metrics** (^2.1.0)
   - Usage: Development telemetry only (confirmed via Datadog)
   - Decision: **Move to devDependencies**

9. **@opentelemetry/sdk-node** (^0.204.0)
   - Usage: Development telemetry only (confirmed via Datadog)
   - Decision: **Move to devDependencies**

10. **@opentelemetry/sdk-trace-base** (^2.1.0)
    - Usage: Development telemetry only (confirmed via Datadog)
    - Decision: **Move to devDependencies**

11. **dotenv** (^17.2.2)
    - Usage: Load .env file for OPENAI_API_KEY (core functionality)
    - Transitive dependencies: Minimal (~0-1 packages)
    - Decision: **KEEP in dependencies**

12. **openai** (^5.19.1)
    - Usage: AI journal generation (REQUIRED for core functionality)
    - Transitive dependencies: **ZERO** (verified via npm view)
    - Decision: **KEEP in dependencies**

### Research Tasks
- [x] Check what openai SDK brings as transitive dependencies
- [x] Verify if dotenv is necessary or can be replaced
- [x] Confirm MCP SDK is only for development
- [x] Confirm OTel packages are only for development (via Datadog telemetry analysis)
- [x] Document final minimal dependency list

### Final Research Summary

**Core Dependencies (KEEP):**
- `openai` - Zero transitive dependencies, required for AI journal generation
- `dotenv` - Minimal footprint, required for .env file loading

**Development Dependencies (MOVE to devDependencies):**
- All 10 `@opentelemetry/*` packages - Only used when telemetry enabled (confirmed via Datadog)
- `@modelcontextprotocol/sdk` - Only used for MCP server (development tool)

**Result:** Users installing `commit-story` will only get packages necessary for core functionality. Developers who want telemetry or MCP tools can install with `--include=dev`.

## Implementation Plan

### Milestone 0: Research & Audit (Priority: Critical) ✅ COMPLETE
**Goal**: Understand current dependency tree and identify minimum viable set

**Tasks**:
- [x] Run `npm list --all` to see full dependency tree
- [x] Check `npm view openai dependencies` for transitive deps
- [x] Grep codebase for all `require()` and `import` statements
- [x] Analyze Datadog telemetry to confirm OTel usage is dev-only
- [x] Document findings and final dependency decision

**Success Criteria**:
- [x] Complete understanding of what each package does
- [x] Clear decision on every dependency (keep/remove/devDep)
- [x] Documented rationale for all kept dependencies

### Milestone 1: Package Optimization (Priority: Critical) ✅ COMPLETE
**Goal**: Reduce package bloat by moving dev-only packages to devDependencies

**Tasks**:
- [x] Move all OpenTelemetry packages to devDependencies
- [x] Move @modelcontextprotocol/sdk to devDependencies
- [x] Keep dotenv (necessary for .env loading)
- [x] Update package.json with final minimal set
- [x] Run `npm pack` and verify package size reduction
- [x] Test installation in isolation

**Success Criteria**:
- [x] Only necessary packages in dependencies (openai + dotenv)
- [x] Massive size reduction: 191M → 13M (93% reduction)
- [x] Package count: ~150 packages → 3 packages
- [x] Production installation verified working

### Milestone 1.5: Production Compatibility Fix (Priority: Critical) ✅ COMPLETE
**Goal**: Make SDK imports dynamic so production installs work without devDependencies

**Tasks**:
- [x] Move @opentelemetry/api to dependencies
- [x] Refactor tracing.js to use dynamic SDK imports
- [x] Update index.js to conditionally initialize telemetry
- [x] Update mcp/server.js for conditional initialization
- [x] Test telemetry works in dev mode (with devDependencies)
- [x] Test journal generation works in production mode (without devDependencies)

**Success Criteria**:
- [x] Production installs work with only openai + dotenv + @opentelemetry/api
- [x] Telemetry initializes correctly when SDK packages available
- [x] Journal generation works without errors when SDK packages absent
- [x] No breaking changes to existing functionality

### Milestone 2: Install Script Hardening (Priority: High) ✅ COMPLETE
**Goal**: Prevent node_modules/ git disasters and fix outdated messages

**Tasks**:
- [x] Add node_modules/ to .gitignore in install script
- [x] Handle .gitignore doesn't exist case
- [x] Handle .gitignore exists but missing node_modules/ case
- [x] Handle .gitignore exists with node_modules/ already there
- [x] Remove all `enabled: false` references from output
- [x] Update success message with current config options only
- [x] Test on repo with no .gitignore
- [x] Test on repo with .gitignore but no node_modules/ entry
- [x] Test on repo with .gitignore that has node_modules/

**Success Criteria**:
- [x] node_modules/ always in .gitignore after init
- [x] No references to removed `enabled` config
- [x] Clear, accurate success messages

### Milestone 3: Documentation Updates (Priority: High) ✅ COMPLETE
**Goal**: Add missing instructions and improve clarity

**Tasks**:
- [x] Add "Start in repository root" to Prerequisites section
- [x] Add Windows installation section
- [x] Add PowerShell command examples
- [x] Add CMD command examples
- [x] Make OPENAI_API_KEY more prominent
- [x] Update Quick Start with platform-specific notes
- [x] Add troubleshooting: "Not in git repository" error
- [x] Add troubleshooting: "node_modules committed" recovery
- [x] Review entire README for clarity

**Success Criteria**:
- [x] Windows users can install successfully
- [x] "Start in repo root" is clear and prominent
- [x] OPENAI_API_KEY is impossible to miss
- [x] Troubleshooting covers common issues

### Milestone 4: Testing & Validation (Priority: High)
**Goal**: Verify all fixes work on all platforms

**Tasks**:
- [ ] Test fresh install on macOS
- [ ] Test fresh install on Linux
- [ ] Test fresh install on Windows 10
- [ ] Test fresh install on Windows 11
- [ ] Test with existing .gitignore
- [ ] Test without .gitignore
- [ ] Test in repo with node_modules/ already committed
- [ ] Verify package size is acceptable
- [ ] Verify installation speed is acceptable
- [ ] Get user feedback on experience

**Success Criteria**:
- Works on all platforms
- No git disasters possible
- Fast, smooth installation
- Clear, helpful documentation

### Milestone 5: Release (Priority: Medium)
**Goal**: Publish v1.2.0 with all fixes

**Tasks**:
- [ ] Update version to 1.2.0 in package.json
- [ ] Update CHANGELOG with breaking changes note
- [ ] Create fresh package with npm pack
- [ ] Test package installation from tarball
- [ ] Publish to npm registry
- [ ] Update GitHub issue #30 with release notes
- [ ] Announce fix to affected users

**Success Criteria**:
- v1.2.0 published to npm
- All installation issues resolved
- Users can install successfully
- No reported installation problems

## Success Metrics

### Quantitative
- Package count: 288 → under 30 (90%+ reduction)
- Package size: 133 MB → under 20 MB (85%+ reduction)
- File count: 20,915 → under 1,000 (95%+ reduction)
- Installation time: ~1 minute → under 10 seconds
- Platform support: 1 → 3 (macOS, Linux, Windows)

### Qualitative
- Zero "node_modules committed" disasters
- Zero Windows user complaints
- Zero "where do I run this?" confusion
- Professional, smooth installation experience
- Users report "just worked" experience

## Risk Assessment

### Risk 1: Breaking Changes for Existing Users
**Likelihood**: Medium
**Impact**: Medium
**Mitigation**:
- Version bump to 1.2.0 signals breaking change
- Document migration path in CHANGELOG
- Existing users already have packages installed (won't break)
- New installs get clean experience

### Risk 2: Removing Necessary Dependencies
**Likelihood**: Low
**Impact**: High
**Mitigation**:
- Thorough research phase before changes
- Test all functionality after dependency removal
- Keep test coverage for core features
- Easy to add back if needed

### Risk 3: Platform-Specific Issues
**Likelihood**: Medium
**Impact**: Medium
**Mitigation**:
- Test on all three platforms before release
- Clear error messages for platform-specific issues
- Document platform-specific troubleshooting
- Community can report platform issues quickly

## Testing Strategy

### Research Phase Testing
1. **Dependency Analysis**: Use npm tools to understand tree
2. **Import Verification**: Grep all source files for requires/imports
3. **Minimal Test**: Install with only core deps and verify functionality

### Implementation Testing
1. **Unit Tests**: Verify all functionality still works
2. **Package Tests**: Create fresh packages and test size/contents
3. **Platform Tests**: Test on macOS, Linux, Windows
4. **Scenario Tests**: Test all .gitignore scenarios
5. **User Acceptance**: Get feedback from test users

### Regression Testing
1. **Core Functionality**: Journal generation still works
2. **Hook Installation**: Git hooks install correctly
3. **Configuration**: Config creation and loading works
4. **Error Handling**: Errors are clear and helpful

## Progress Log

### 2025-10-05: PRD Created
- Created PRD-30 based on user installation issues
- Documented all 7 problems discovered during testing
- Defined research phase for dependency audit
- Established 5 milestones for complete fix
- Target: v1.2.0 release

### 2025-10-05: Milestone 0 Complete - Research & Audit
- ✅ Analyzed all 12 direct dependencies using code grep and npm analysis
- ✅ Verified OpenAI SDK has zero transitive dependencies
- ✅ Confirmed via Datadog telemetry that all OTel packages are dev-only
- ✅ Confirmed MCP SDK only used for development MCP server
- ✅ Documented clear keep/remove/devDep decisions for all packages
- **Decision**: Keep only `openai` + `dotenv` in dependencies, move all OTel + MCP to devDependencies

**Key Findings from Telemetry Analysis**:
- Service `commit-story-dev` has 896k+ logs and 18k+ spans over 7 days
- All OTel traces show dev environment only - no production user traces
- Core journal generation works independently of telemetry packages
- Package bloat entirely from dev tooling, not core functionality

### 2025-10-05: Milestone 1 Complete - Package Optimization
- ✅ Updated package.json: moved 11 packages to devDependencies
- ✅ Created test package with `npm pack`
- ✅ Tested production install in isolation (/tmp/test-commit-story-prod)
- ✅ Verified package size reduction: 191M → 13M (93% reduction!)
- ✅ Verified package count reduction: ~150 packages → 3 packages
- **Result**: Users now only get openai + dotenv, massive installation improvement

### 2025-10-05: Milestone 2 Complete - Install Script Hardening
**Duration**: ~2 hours
**Primary Focus**: Git disaster prevention and config cleanup

**Completed PRD Items**:
- [x] node_modules/ protection - Enhanced script with `add_to_gitignore()` function handling all scenarios
- [x] All 3 .gitignore scenarios - Tested: no .gitignore, existing without entries, existing with entries
- [x] Removed `enabled` field - Simplified config to just `{"debug": false}` with inline instructions
- [x] Updated success messages - Removed outdated `enabled: false` reference, streamlined output
- [x] Fixed bash bug - Removed `local` keyword from non-function scope (line 153)

**Testing Evidence**:
- Scenario 1 (no .gitignore): Creates new file with both node_modules/ and journal/
- Scenario 2 (.gitignore exists, missing entries): Successfully adds both missing entries
- Scenario 3 (both entries exist): Correctly detects and skips with appropriate message

**Key Implementation Details**:
- Created reusable `add_to_gitignore()` function for DRY pattern matching
- Handles all edge cases: missing file, partial entries, complete entries
- Provides clear user feedback for each scenario

**Next Session Priorities**:
- Begin Milestone 3: Documentation Updates
- Add Windows installation instructions
- Make prerequisites more prominent

### 2025-10-05: Milestone 3 Complete - Documentation Updates
**Duration**: ~1 hour
**Primary Focus**: README improvements for cross-platform installation clarity

**Completed PRD Items**:
- [x] Added "Run from repository root" prerequisite
- [x] Unified installation instructions for macOS, Windows, and Linux
- [x] Made OpenAI API key requirements more prominent with cost transparency
- [x] Added Node.js download link (https://nodejs.org/en/download)
- [x] Simplified .env file setup instructions
- [x] Removed unnecessary troubleshooting sections per user feedback

**Key Improvements**:
- Cross-platform support clearly stated (macOS, Windows, and Linux)
- Cost transparency: GPT-4o-mini ~$3/month for typical usage
- Clearer .env file instructions for users with/without existing .env files
- Simplified platform-specific commands to universal approach
- User-driven iteration based on real installation confusion from friend's experience

**Implementation Approach**:
- Removed redundant platform-specific code blocks
- Added cost estimate under API key prerequisite
- Changed "Create .env" to "Add to .env (create if doesn't exist)" for clarity
- Hyperlinked Node.js prerequisite to official download page

**Next Session Priorities**:
- Begin Milestone 4: Testing & Validation
- Test installation on multiple platforms
- Gather user feedback on improved documentation

### 2025-10-05: Milestone 1.5 Complete - Production Compatibility Fix
**Duration**: ~3 hours
**Primary Focus**: Fix production installation by making SDK imports dynamic

**Problem Discovered**:
- Moving OTel packages to devDependencies (Milestone 1) broke production installs
- Code still had top-level imports of SDK packages → MODULE_NOT_FOUND errors
- Users without devDependencies couldn't run the tool

**Solution Implemented**:
- Kept `@opentelemetry/api` (~1.2MB) in dependencies for no-op safety
- Created dynamic `loadOTelSDK()` function in tracing.js
- Made SDK initialization async and conditional
- Updated 3 files: tracing.js, index.js, mcp/server.js

**Testing Evidence**:
- Dev mode ON: Telemetry SDK loads, traces captured successfully
- Dev mode OFF: Journal generation works, no telemetry overhead, zero errors
- Package remains lightweight: 4 packages total (~1.5MB)

**Key Technical Decisions**:
- Chose to keep @opentelemetry/api in dependencies vs removing entirely
- Rationale: Tool calls external OpenAI API; 1.2MB acceptable for AI tool
- Avoided touching 22 business logic files by keeping API package
- Used plan mode to carefully design 3-file refactor

**Files Modified**:
- src/tracing.js: Dynamic SDK imports with async initialization
- src/index.js: Conditional telemetry initialization
- src/mcp/server.js: Conditional telemetry initialization
- package.json: Moved @opentelemetry/api to dependencies

**Next Session Priorities**:
- Create fresh v1.2.0 package with dynamic imports
- Test production install in isolated environment
- Test with friend on Linux machine
- Complete Milestone 4: Testing & Validation

## Design Document References

### Package Configuration
- `package.json` - Dependencies to be updated
- `package-lock.json` - Will regenerate after dependency changes

### Install Script
- `scripts/install-commit-journal-hook.sh` - Needs gitignore + message fixes

### Documentation
- `README.md` - Needs Windows section, repo root guidance, clearer prerequisites

### Testing Locations
- Test on Windows 10, Windows 11, macOS, Linux
- Test with/without .gitignore
- Test with/without node_modules/ already committed

## Notes

### Why This is P0 (Critical)
- Friend's installation resulted in unusable experience
- 288 packages is embarrassing for a "lightweight" dev tool
- Windows users completely blocked
- Risk of git disasters destroys user trust
- First impression is terrible, blocks adoption

### Breaking Changes
- v1.2.0 because dependency changes are breaking
- Users who have `dev: true` will need to `npm install --save-dev` OTel packages
- MCP reflection tool will require manual MCP SDK installation for dev
- Documented in CHANGELOG with migration instructions

### Future Considerations
- Consider separate `commit-story-dev` package with all dev tools
- Consider making OpenAI SDK pluggable (bring your own LLM)
- Consider zero-dependency mode for maximum lightness
