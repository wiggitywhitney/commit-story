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
   - Brings: express, cors, eventsource, eventsource-parser, etc.
   - Usage: MCP reflection tool
   - Question: Needed for users or just dev?

2. **@opentelemetry/api** (^1.9.0)
   - Part of: OpenTelemetry instrumentation
   - Usage: Development telemetry only
   - Decision: Move to devDependencies

3. **@opentelemetry/auto-instrumentations-node** (^0.63.0)
   - Brings: ~200+ packages for auto-instrumentation
   - Usage: Development telemetry only
   - Decision: Move to devDependencies

4. **@opentelemetry/exporter-logs-otlp-http** (^0.205.0)
   - Usage: Development telemetry only
   - Decision: Move to devDependencies

5. **@opentelemetry/exporter-metrics-otlp-http** (^0.205.0)
   - Usage: Development telemetry only
   - Decision: Move to devDependencies

6. **@opentelemetry/exporter-trace-otlp-http** (^0.204.0)
   - Usage: Development telemetry only
   - Decision: Move to devDependencies

7. **@opentelemetry/sdk-logs** (^0.205.0)
   - Usage: Development telemetry only
   - Decision: Move to devDependencies

8. **@opentelemetry/sdk-metrics** (^2.1.0)
   - Usage: Development telemetry only
   - Decision: Move to devDependencies

9. **@opentelemetry/sdk-node** (^0.204.0)
   - Usage: Development telemetry only
   - Decision: Move to devDependencies

10. **@opentelemetry/sdk-trace-base** (^2.1.0)
    - Usage: Development telemetry only
    - Decision: Move to devDependencies

11. **dotenv** (^17.2.2)
    - Usage: Load .env file for OPENAI_API_KEY
    - Question: Still needed or can use process.env directly?

12. **openai** (^5.19.1)
    - Usage: AI journal generation (REQUIRED)
    - Question: Any lighter alternatives? What does it bring in?

### Research Tasks
- [ ] Check what openai SDK brings as transitive dependencies
- [ ] Verify if dotenv is necessary or can be replaced
- [ ] Confirm MCP SDK is only for development
- [ ] Test if system works with only openai + dotenv
- [ ] Document final minimal dependency list

## Implementation Plan

### Milestone 0: Research & Audit (Priority: Critical)
**Goal**: Understand current dependency tree and identify minimum viable set

**Tasks**:
- [ ] Run `npm list --all` to see full dependency tree
- [ ] Check `npm view openai dependencies` for transitive deps
- [ ] Grep codebase for all `require()` and `import` statements
- [ ] Test installation with only openai + dotenv
- [ ] Document findings and final dependency decision

**Success Criteria**:
- Complete understanding of what each package does
- Clear decision on every dependency (keep/remove/devDep)
- Documented rationale for all kept dependencies

### Milestone 1: Package Optimization (Priority: Critical)
**Goal**: Reduce package count from 288 to ~10-20

**Tasks**:
- [ ] Move all OpenTelemetry packages to devDependencies
- [ ] Remove @modelcontextprotocol/sdk from dependencies
- [ ] Remove dotenv if not needed (or keep if necessary)
- [ ] Update package.json with final minimal set
- [ ] Run `npm pack` and verify package size reduction
- [ ] Test that journal generation still works

**Success Criteria**:
- Package count under 30
- Package size under 20 MB
- All core functionality works
- Installation takes under 10 seconds

### Milestone 2: Install Script Hardening (Priority: High)
**Goal**: Prevent node_modules/ git disasters and fix outdated messages

**Tasks**:
- [ ] Add node_modules/ to .gitignore in install script
- [ ] Handle .gitignore doesn't exist case
- [ ] Handle .gitignore exists but missing node_modules/ case
- [ ] Handle .gitignore exists with node_modules/ already there
- [ ] Remove all `enabled: false` references from output
- [ ] Update success message with current config options only
- [ ] Test on repo with no .gitignore
- [ ] Test on repo with .gitignore but no node_modules/ entry
- [ ] Test on repo with .gitignore that has node_modules/

**Success Criteria**:
- node_modules/ always in .gitignore after init
- No references to removed `enabled` config
- Clear, accurate success messages

### Milestone 3: Documentation Updates (Priority: High)
**Goal**: Add missing instructions and improve clarity

**Tasks**:
- [ ] Add "Start in repository root" to Prerequisites section
- [ ] Add Windows installation section
- [ ] Add PowerShell command examples
- [ ] Add CMD command examples
- [ ] Make OPENAI_API_KEY more prominent
- [ ] Update Quick Start with platform-specific notes
- [ ] Add troubleshooting: "Not in git repository" error
- [ ] Add troubleshooting: "node_modules committed" recovery
- [ ] Review entire README for clarity

**Success Criteria**:
- Windows users can install successfully
- "Start in repo root" is clear and prominent
- OPENAI_API_KEY is impossible to miss
- Troubleshooting covers common issues

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

**Next Session Priorities**:
- Begin Milestone 0: Research & Audit phase
- Understand full dependency tree
- Make final decisions on minimal package set

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
