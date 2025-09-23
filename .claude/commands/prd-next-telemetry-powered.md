---
name: prd-next-telemetry-powered
description: Analyze existing PRD with telemetry data to identify and recommend the single highest-priority task to work on next
category: project-management
---

# PRD Next - Work On the Next Task (Telemetry-Powered)

## Instructions

You are helping analyze an existing Product Requirements Document (PRD) to suggest the single highest-priority task to work on next, using runtime telemetry to understand actual codebase behavior and architecture. Then discuss its design if the user confirms they want to work on it.

## Process Overview

0. **Verify Datadog Connection** - Ensure telemetry is available before proceeding
1. **Check Context Clarity** - Determine if PRD is obvious from recent conversation
2. **Auto-Detect Target PRD** - If context unclear, intelligently determine which PRD to analyze
3. **Analyze Current Implementation** - Understand what's implemented vs what's missing, enhanced with telemetry insights
4. **Identify the Single Best Next Task** - Find the one task that should be worked on next
5. **Present Recommendation** - Give clear rationale and wait for confirmation
6. **Design Discussion** - If confirmed, dive into implementation design details

## Step 0: Verify Datadog Connection

**MANDATORY: Test Datadog MCP connection before proceeding**

Test connection with a simple query:
```
mcp__datadog__search_datadog_services query:* start_at:0 max_tokens:100
```

**If connection fails:**
❌ **Datadog MCP not connected.** Please connect it first to use this telemetry-powered command.

**Connection Required:** This command requires active Datadog telemetry to provide runtime insights. Use regular `/prd-next` for static analysis only.

**If connection succeeds:**
✅ **Datadog connected** - Proceeding with telemetry-enhanced analysis.

## Step 1: Context Awareness Check

**FIRST: Check if PRD context is already clear from recent conversation:**

**Skip detection/analysis if recent conversation shows:**
- **Recent PRD work discussed** - "We just worked on PRD 29", "Just completed PRD update", etc.
- **Specific PRD mentioned** - "PRD #X", "MCP Prompts PRD", etc.
- **PRD-specific commands used** - Recent use of `prd-update-progress`, `prd-start` with specific PRD
- **Clear work context** - Discussion of specific features, tasks, or requirements for a known PRD

**If context is clear:**
- Skip to Step 6 (Single Task Recommendation) using the known PRD
- Use conversation history to understand current state and recent progress
- Proceed directly with task recommendation based on known PRD status

**If context is unclear:**
- Continue to Step 2 (PRD Detection) for full analysis

## Step 2: Smart PRD Detection (Only if Context Unclear)

**Auto-detect the target PRD using these context clues (in priority order):**

1. **Git Branch Analysis** - Check current branch name for PRD patterns:
   - `feature/prd-12-*` → PRD 12
   - `prd-13-*` → PRD 13
   - `feature/prd-*` → Extract PRD number

2. **Recent Git Commits** - Look at recent commit messages for PRD references:
   - "fix: PRD 12 documentation" → PRD 12
   - "feat: implement prd-13 features" → PRD 13

3. **Git Status Analysis** - Check modified/staged files for PRD clues:
   - Modified `prds/12-*.md` → PRD 12
   - Changes in feature-specific directories

4. **Available PRDs Discovery** - List all PRDs in `prds/` directory:
   - `prds/12-documentation-testing.md`
   - `prds/13-cicd-documentation-testing.md`

5. **Fallback to User Choice** - Only if context detection fails, ask user to specify

**PRD Detection Implementation:**
```bash
# Use these tools to gather context:
# 1. Check git branch: gitStatus shows current branch
# 2. Check git status: Look for modified PRD files
# 3. List PRDs: Use LS or Glob to find prds/*.md files
# 4. Recent commits: Use Bash 'git log --oneline -n 5' for recent context
```

**Detection Logic:**
- **High Confidence**: Branch name matches PRD pattern (e.g., `feature/prd-12-documentation-testing`)
- **Medium Confidence**: Modified PRD files in git status or recent commits mention PRD
- **Low Confidence**: Multiple PRDs available, use heuristics (most recent, largest)
- **No Context**: Present available options to user

**Example Detection Outputs:**
```markdown
🎯 **Auto-detected PRD 12** (Documentation Testing)
- Branch: `feature/prd-12-documentation-testing` ✅
- Modified files: `prds/12-documentation-testing.md` ✅
- Recent commits mention PRD 12 features ✅
```

**Once PRD is identified:**
- Read the PRD file from `prds/[issue-id]-[feature-name].md`
- Analyze completion status across all sections
- Identify patterns in completed vs remaining work

## Step 3: Documentation & Implementation Analysis with Telemetry (Only if Context Unclear)

Before assessing task priorities, analyze both the documented specifications and current implementation state, enhanced with runtime telemetry insights:

### Documentation Analysis (Documentation-First PRDs)
For PRDs using the documentation-first approach:
- **Read referenced documentation**: Check the "Content Location Map" in PRD to find where feature specs live
- **Understand target state**: What functionality is documented but not yet implemented
- **Check documentation completeness**: Are all user workflows and examples fully documented
- **Validate cross-references**: Do all documentation links and references work correctly

### Code Discovery & Runtime Analysis
- **Search for related files**: Use Grep/Glob to find files related to the feature
- **Identify key modules**: Locate main implementation files mentioned in PRD
- **Find test files**: Discover existing test coverage for the feature
- **Check dependencies**: Review imports and module relationships

**Telemetry-Enhanced Discovery:**
For each discovered module or service, query telemetry data to understand runtime behavior:

```
# Note: Traces, logs, and metrics are correlated - use trace IDs to connect them
# Example queries to run for discovered modules:
mcp__datadog__search_datadog_spans query:"service:* @operation:*[module-name]*"
mcp__datadog__search_datadog_logs query:"service:* @file:*[filename]*"
mcp__datadog__search_datadog_services query:"name:*[service-name]*"
```

**Share telemetry insights discovered:**
After completing telemetry queries, describe what you learned about runtime behavior and patterns. Be specific about:
- Which modules are actively running vs dormant
- Actual service dependencies and communication patterns
- Error patterns or reliability issues
- Performance characteristics or bottlenecks
- Any gaps between documented architecture and runtime reality

If telemetry provided no useful insights, explain why (no traces found, service not instrumented, etc.).

### Implementation vs Documentation Gap Analysis
- **Compare docs vs code**: What's documented vs actually implemented
- **Partial implementations**: Identify half-finished features or TODO comments
- **Documentation validation**: Can documented examples and commands actually work
- **Architecture alignment**: Does current code match documented behavior and PRD architecture decisions
- **Quality assessment**: Code style, error handling, test coverage gaps

### Technical Feasibility Analysis
- **Dependency conflicts**: Are PRD requirements compatible with existing code
- **Breaking changes**: Will remaining tasks require refactoring existing code
- **Integration points**: How new work connects with current implementation
- **Technical debt**: Issues that might block or slow future work

## Step 4: Completion Assessment (Only if Context Unclear)

### Analyze Checkbox States
Count and categorize all checkboxes:
- **Completed**: `[x]` items
- **Pending**: `[ ]` items
- **Deferred**: `[~]` items
- **Blocked**: `[!]` items

### Phase Analysis
For each implementation phase:
- Calculate completion percentage
- Identify bottlenecks or stalled work
- Assess readiness to move to next phase

### Requirement Coverage
Review requirement categories:
- **Functional Requirements**: Core feature completion
- **Non-Functional Requirements**: Quality and performance aspects
- **Success Criteria**: Measurable outcomes
- **Dependencies**: External requirements
- **Risk Mitigation**: Risk management progress

## Step 5: Dependency Analysis (Only if Context Unclear)

### Identify Critical Path Items
Look for items that:
- **Block other work** - Must be completed before others can start
- **Enable major capabilities** - Unlock significant value when completed
- **Resolve current blockers** - Remove impediments to progress

### Dependency Patterns

#### PRD-Level Dependencies
- **Sequential dependencies** - A must be done before B
- **Parallel opportunities** - Multiple items that can be worked simultaneously
- **Foundation requirements** - Core capabilities needed by multiple features
- **Integration points** - Items that connect different parts of the system

#### Code-Level Dependencies
- **Import dependencies** - Modules that depend on others being implemented first
- **Interface contracts** - APIs/types that must be defined before consumers
- **Database schema** - Data model changes needed before business logic
- **Test dependencies** - Tests that require certain infrastructure or mocks
- **Build/deployment** - Configuration changes that affect multiple components

## Step 6: Strategic Value Assessment (Only if Context Unclear)

### High-Value Next Steps
Prioritize items that:
- **Unblock multiple other items** - High leverage impact
- **Deliver user-visible value** - Direct user benefit
- **Reduce technical risk** - Address major uncertainties
- **Enable validation** - Allow testing of key assumptions
- **Provide learning** - Generate insights for future work

### Low-Priority Items
Identify items that:
- **Have many dependencies** - Can't be started yet
- **Are nice-to-have** - Don't impact core value proposition
- **Are optimization-focused** - Improve existing working features
- **Require external dependencies** - Waiting on others

## Step 7: Single Task Recommendation

**Note**: If you arrived here from Step 1 (clear context), use the conversation history and known PRD state to make your recommendation. If you came through the full analysis, use your detailed findings including telemetry insights.

Present findings in this focused format:

```markdown
# Next Task Recommendation: [Feature Name]

## Recommended Task: [Specific Task Name]

**Why this task**: [2-3 sentences explaining why this is the highest priority right now]

**What it unlocks**: [What becomes possible after completing this]

**Dependencies**: [What's already complete that makes this ready to work on]

**Effort estimate**: [Realistic time estimate]

**Success criteria**: [How you'll know it's done]

---

**Do you want to work on this task?**

If yes, I'll help you design the implementation approach. If no, let me know what you'd prefer to work on instead.
```

## Step 8: Design Discussion (If Confirmed)

If the user confirms they want to work on the recommended task, then dive into:

### Implementation Planning
- **Architecture approach**: How this fits into existing codebase
- **Key components**: What needs to be built/modified
- **Integration points**: How it connects with existing code
- **Testing strategy**: How to validate the implementation

### Design Decisions
- **Technical choices**: Framework/library decisions to make
- **Interface design**: APIs, data structures, user interfaces
- **Error handling**: How to handle failure cases
- **Performance considerations**: Scalability and optimization needs

### Implementation Steps
- **Step-by-step breakdown**: Logical sequence of implementation
- **Quick wins**: Parts that can be completed first for validation
- **Risk mitigation**: Addressing the biggest uncertainties first
- **Testing checkpoints**: When and how to validate progress

### Questions to Resolve
- **Open decisions**: Design choices that need to be made
- **Clarifications needed**: Requirements that need more detail
- **Assumptions to validate**: Things we're assuming that should be confirmed

## Success Criteria

This command should:
- ✅ Identify the single highest-value task to work on next based on current PRD state and runtime telemetry
- ✅ Provide clear, compelling rationale for why this specific task should be prioritized
- ✅ Include insights from telemetry about runtime behavior and patterns
- ✅ Wait for user confirmation before proceeding
- ✅ If confirmed, provide detailed implementation design guidance
- ✅ Keep teams focused on the most important work rather than overwhelming them with options
- ✅ Enable immediate action by transitioning from recommendation to design discussion