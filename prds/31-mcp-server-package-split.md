# PRD-31: MCP Server Package Split for Lean Core Installation

## Metadata
- **Issue**: [#31](https://github.com/wiggitywhitney/commit-story/issues/31)
- **Status**: Planning
- **Created**: 2025-10-06
- **Author**: Whitney Lee
- **Priority**: P1 (High - Impacts All New Users)
- **Target Version**: 2.0.0

## Problem Statement

Current v1.2.1 bundles MCP server functionality with core journal generation, requiring all users to install 93 packages even if they never use the MCP server. The MCP SDK alone brings 89 transitive dependencies.

**Impact**: Users who only want automated journal generation (likely the majority) pay unnecessary installation cost and package bloat.

**Evidence**:
- MCP code is completely isolated (src/mcp/, ~700 lines)
- Zero imports from core code to MCP code
- Clean architectural boundary already exists
- PRD-30 reduced package from 288 to 93, but 89 of those 93 are for optional MCP feature

## Solution

Extract MCP server into separate optional package. Users who want journals install core package (~4 dependencies). Users who want MCP server install both packages.

**Package Structure**:
- `commit-story`: Core journal generation (4 packages: openai, dotenv, @opentelemetry/api, ~~@modelcontextprotocol/sdk~~)
- `@commit-story/mcp-server` or `commit-story-mcp`: MCP server + tools (includes MCP SDK)

## Benefits

1. **Lean Core**: 4 packages instead of 93 for journal-only users
2. **Clear Separation**: Core vs optional features well-defined
3. **Independent Evolution**: MCP features (PRD-18, PRD-19-21) evolve without forcing core updates
4. **Professional Pattern**: Industry standard for optional features (e.g., @babel/core vs @babel/cli)
5. **Future-Proofing**: Sets pattern for other optional features

## Success Criteria

- [ ] Core package installs with 4 dependencies only
- [ ] MCP server works as separate package with clear installation instructions
- [ ] No breaking changes for existing functionality (just packaging)
- [ ] Documentation clearly explains core vs MCP packages
- [ ] Both packages published to npm successfully

## User Stories

### Story 1: Developer Wants Just Journals
**As a** developer who wants automated commit journals
**I want** to install only the core package
**So that** I get fast installation without unused MCP dependencies

**Acceptance Criteria**:
- `npm install --save-dev commit-story` installs 4 packages
- Journal generation works without MCP package
- Installation completes in < 1 second

### Story 2: Developer Wants MCP Features
**As a** developer who wants to use reflection tools via AI assistant
**I want** clear instructions to install MCP package
**So that** I can access MCP tools like `journal_add_reflection`

**Acceptance Criteria**:
- Documentation clearly shows MCP package is optional
- Installation instructions for both packages provided
- MCP tools work when both packages installed
- Clear error message if MCP package missing but tools attempted

## Implementation Phases

### Phase 1: Package Extraction
Extract MCP server code into separate package with proper dependencies.

### Phase 2: Documentation Updates
Update README, installation docs, and PRD cross-references.

### Phase 3: Testing & Validation
Verify both packages work independently and together.

### Phase 4: Publishing & Migration
Publish both packages, provide migration guide for v1.x users.

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking change disrupts users | Medium | Clear migration guide, v2.0.0 signals breaking change |
| Installation friction (2 packages) | Low | Common pattern, well-documented |
| Package naming/organization | Low | Follow npm best practices (@scope/package) |

## Dependencies

**Prerequisites**: None - can start immediately
**Blocks**: PRD-18 (Context Capture Tool) - should do this first to avoid adding more MCP bloat
**Related**: PRD-30 (just completed), PRD-17 (MCP reflection tool), PRD-19-21 (future MCP agents)

## Notes

### Why Separate PRD (Not Add to Existing)
- PRD-17: About reflection **tool** implementation (Complete)
- PRD-18: About context capture **tool** implementation (Planning)
- PRD-31: About package **architecture** (different concern)

### Why Not Add to PRD-30
PRD-30 focused on "move dev dependencies to devDependencies". This PRD is "make optional features truly optional via separate package" - different architectural approach.

## Questions for Implementation

- Package naming: `@commit-story/mcp-server` vs `commit-story-mcp`?
- Should MCP SDK be dependency or peerDependency in MCP package?
- Migration strategy for existing v1.2.1 users?
- Should core package recommend MCP package in README?
