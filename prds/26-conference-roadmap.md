# PRD-26: Conference Ready Implementation Roadmap

**GitHub Issue**: [#26](https://github.com/wiggitywhitney/commit-story/issues/26)
**Status**: Active - Implementation Starting
**Created**: 2025-09-27
**Last Updated**: 2025-09-27
**Type**: Meta-PRD (Coordination Document)

## Summary

Meta-PRD to coordinate the implementation of conference-critical PRDs in the correct sequence with proper dependency management for the Cloud Native Denmark conference presentation.

## Conference Context

**Event**: Cloud Native Denmark Closing Keynote
**Duration**: 20 minutes
**Demo Requirements**: Live demonstration of telemetry-powered AI coding assistance

## Problem Statement

Preparing Commit Story for a conference presentation requires coordinating multiple PRDs with interdependencies, managing limited time effectively, and maintaining context across multiple development sessions. Without coordination:

- Critical features might be incomplete at conference time
- Dependencies could be discovered too late
- Demo-breaking bugs might not get priority
- Context gets lost between AI coding sessions

## Success Criteria

1. **Demo Readiness**: All critical bugs fixed, no contamination or confusion during live demo
2. **Feature Complete**: Telemetry automation tool working and demonstrable
3. **Package Ready**: v1.1.0 installable by conference attendees
4. **Dogfooding Evidence**: PRDs 17,25,23 instrumented using PRD-9's tool

## Implementation Sequence

### Planned Order: 9 → 17 → 25 → 23 → 24

This sequence was chosen based on:
- **Dogfooding Opportunity**: PRD-9 first enables using the telemetry tool on subsequent PRDs
- **Risk Mitigation**: Timezone fix (17) can wait since conference is not immediate
- **Dependency Chain**: Each PRD naturally builds on the previous
- **Demo Story**: "I used this tool to instrument these fixes" is compelling

### Critical Path PRDs

#### 1. PRD-9: OpenTelemetry Automation Tooling
**Priority**: P0 - Demo Centerpiece
**Estimated Time**: 2-3 days
**Dependencies**: PRD-7 Phase 2 (✅ Complete)
**Enables**: Dogfooding on all subsequent PRDs
**Risk**: High - Core demo feature must work perfectly

**Success Metrics**:
- [ ] /add-telemetry command functional
- [ ] Successfully instruments new functions
- [ ] Handles both new code and updates
- [ ] Standards module updated dynamically

#### 2. PRD-17: Manual Reflection Tool Timezone Fix
**Priority**: P1 - Edge Case Fix
**Estimated Time**: 2 hours
**Dependencies**: None (tool already working)
**Enables**: Reliable reflections in any timezone
**Risk**: Low - Simple UTC conversion

**Success Metrics**:
- [ ] UTC conversion implemented
- [ ] Time windows calculate correctly
- [ ] Tested with timezone changes
- [ ] Instrumented with PRD-9 tool

#### 3. PRD-25: Session Isolation
**Priority**: P0 - Critical Bug
**Estimated Time**: 1-2 days
**Dependencies**: None
**Enables**: Clean demo without contamination
**Risk**: High - Could corrupt live demo

**Success Metrics**:
- [ ] SessionId filtering implemented
- [ ] No cross-tab contamination
- [ ] Tested with multiple sessions
- [ ] Instrumented with PRD-9 tool

#### 4. PRD-23: Debug Experience
**Priority**: P1 - Professional Polish
**Estimated Time**: 1 day
**Dependencies**: None
**Enables**: Clean demo output
**Risk**: Medium - Affects perception

**Success Metrics**:
- [ ] Telemetry noise removed
- [ ] Meaningful user messages
- [ ] Clear error states
- [ ] Instrumented with PRD-9 tool

#### 5. PRD-24: Package & Deploy v1.1.0
**Priority**: P1 - Distribution
**Estimated Time**: 2 days with testing
**Dependencies**: PRD-23 (clean output)
**Enables**: Attendee adoption
**Risk**: Medium - External repo testing needed

**Success Metrics**:
- [ ] Clean npm install
- [ ] Works in fresh repo
- [ ] Documentation updated
- [ ] Published to npm

## Session Handoff Protocol

### At Session Start
1. Read this PRD for current status
2. Check recent commits: `git log --oneline -10 --grep="prd-"`
3. Review current PRD's work log
4. Check for blocking issues

### During Session
1. Update PRD work logs with decisions
2. Commit with pattern: `feat(prd-N): complete [specific achievement]`
3. Use reflection tool for important insights
4. Update task checkboxes in real-time

### At Session End
1. Update this roadmap's progress tracking
2. Document any blockers discovered
3. Add reflection: "Next session should start with..."
4. Commit all work with clear message

## Progress Tracking

### Overall Status: 0/5 PRDs Complete

| PRD | Status | Progress | Notes |
|-----|--------|----------|--------|
| 9   | Not Started | 0% | Begin immediately |
| 17  | Partial | 95% | Only timezone fix needed |
| 25  | Not Started | 0% | After PRD-9 |
| 23  | Not Started | 0% | After PRD-25 |
| 24  | Not Started | 0% | After PRD-23 |

### Meta Progress Log

*Note: This log tracks coordination and cross-PRD progress only. Feature-specific progress should be documented in individual PRD work logs.*

#### 2025-09-27: Roadmap Created
- Created PRD-26 to coordinate conference preparation
- Established implementation sequence: 9→17→25→23→24
- Identified dependencies and risks
- Set up progress tracking structure

#### 2025-09-27: PRD-9 Progress - Real-World Validation Success
- Designed `/add-telemetry` slash command specification (6-step workflow)
- Established auto-discovery, instrumentation, and validation approach
- Integrated Datadog MCP validation requirements
- Created standards module extension patterns
- **BREAKTHROUGH**: Successfully validated on PRD-17 reflection functions
- **Evidence**: 5/5 functions in journal-manager.js fully instrumented with comprehensive telemetry
- **Validation**: Static validation passed, runtime spans generated, Datadog ingestion confirmed
- **Standards Extended**: Added 6 span builders + 6 attribute builders to standards.js
- **Status**: Core automation proven, validation improvements identified
- **Remaining Work**: Complete context-integrator.js instrumentation, implement validation enhancements
- **Risk Status**: ✅ Major de-risked - tool works on real production code

## Risk Management

### High Risk Items
1. **PRD-9 Complexity**: Telemetry automation might have unforeseen edge cases
   - Mitigation: Time-box to 3 days max, simplify if needed

2. **PRD-25 Testing**: Hard to test multiple session scenarios
   - Mitigation: Create test script with multiple terminal tabs

3. **Conference Timeline**: Limited time to complete everything
   - Mitigation: Focus on MVC, defer nice-to-haves

### Contingency Plans
- If PRD-9 fails: Demo existing telemetry, explain automation vision
- If PRD-25 incomplete: Use single Claude tab during demo
- If PRD-24 issues: Provide GitHub clone instructions instead

## Demo Day Requirements

### Must Work
- [ ] Telemetry tool demonstrates instrumentation
- [ ] No session contamination during demo
- [ ] Clean debug output (no noise)
- [ ] Basic package installation

### Nice to Have
- [ ] Live coding with telemetry tool
- [ ] Multiple Claude tabs demonstration
- [ ] NPM install live demo
- [ ] Audience participation element

## Integration Points

### PRD-9 Integration
- Will instrument code changes in PRDs 17, 25, 23
- Provides real examples for conference demo
- Updates standards module with new patterns

### Cross-PRD Dependencies
```
PRD-7 (Complete) ──→ PRD-9 ──→ Dogfood on others
                         ↓
                    Instrument
                    ↓    ↓    ↓
                 PRD-17 PRD-25 PRD-23 ──→ PRD-24
```

## Decision Log

### 2025-09-27: Sequence Decision
**Decision**: Start with PRD-9 instead of PRD-25
**Rationale**: Dogfooding opportunity outweighs session isolation risk
**Trade-off**: Accepting contamination risk for 3-4 more days

## Next Actions

1. **Immediate**: Start PRD-9 implementation
2. **Today**: Set up development environment for telemetry tool
3. **This Session**: Review PRD-9 requirements and create implementation plan

## Conference Story Arc

The narrative we're building for the demo:
1. "AI assistants today use static analysis and guess"
2. "But runtime telemetry reveals what actually happens"
3. "Here's a tool that automatically adds telemetry"
4. "I used it to instrument my own bug fixes"
5. "Now AI can see runtime reality, not static assumptions"

## Notes and Observations

- Telemetry analysis shows 102-138 JSONL files processed per commit (multiple sessions active)
- Current system takes 17-20 seconds per journal generation
- Token filtering reduces 68-58K tokens to 2-32K (aggressive but necessary)
- 5 reflections captured today alone - tool is being actively used

## References

- **Talk Outline**: [docs/talks/cloud-native-denmark-2025-outline.md](../docs/talks/cloud-native-denmark-2025-outline.md)
- **PRD-9**: [prds/9-otel-automation-tooling.md](../prds/9-otel-automation-tooling.md)
- **PRD-17**: [prds/17-manual-reflection-tool.md](../prds/17-manual-reflection-tool.md)
- **PRD-25**: [prds/25-session-isolation.md](../prds/25-session-isolation.md)
- **PRD-23**: [prds/23-debug-experience.md](../prds/23-debug-experience.md)
- **PRD-24**: [prds/24-package-deploy.md](../prds/24-package-deploy.md)