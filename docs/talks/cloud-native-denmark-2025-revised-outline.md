# Cloud Native Denmark 2025 - Revised Talk Outline
**Title:** Telemetry-Powered AI Coding: When Your Development Assistant Can See What Actually Runs
**Speaker:** Whitney Lee
**Duration:** 20-35 minutes (flexible format)
**Date:** October 5, 2025
**Source Reflections:** [journal/reflections/2025-10/2025-10-05.md](../../journal/reflections/2025-10/2025-10-05.md)

## Opening Hook (1-2 minutes)

### Setup
- **Visual**: Claude Code open with cleared context, VS Code hidden
- **Line**: "You know how now with the proliferation of tools like Claude Code everyone thinks they're an app developer now?"
- **Pause for effect**
- **Reveal**: "Well look at this app I made with the help of Claude Code! I'm so very proud of it"

### Purpose
Misdirection - audience expects a joke about shallow AI usage, but you're about to show something genuinely innovative

## Demo Part 1: The App in Action (3-4 minutes)

### Step 1: Show Journal Generation
- Tell Claude Code to commit staged changes
- **Config**: `debug: true` and `dev: true` (but explain it normally runs silently in background)
- Flip to VS Code to show the generated engineering journal entry
- **Journal content**: About a previous conversation with Claude about creating a list of activities for time in Aarhus (relatable, real use case)

### Step 2: Trace ID → System Understanding
- Use the trace ID that printed to console
- Ask Claude Code: "Use this trace plus correlated telemetry to understand my system and draw me a diagram of how it works"
- Walk through the diagram, explaining how the journal system works

### Step 3: Expand to Full System View
- Ask Claude Code: "Use wider Commit Story data from the last X days to update the diagram"
- Show features that didn't get called in that single journal creation
- Add interesting stats to the diagram
- **Expected reveal**: MCP server functionality appears here

### Optional Step 4: Zoom In on Component
- (Time permitting or instead of Step 3)
- Ask Claude Code to zoom in on one section (chat collection)
- Explain how just that piece works using telemetry data

## The Big Reveal (1-2 minutes)

### Audience Engagement
- **Question**: "How many of you have played around with coding assistants, show of hands?"
- **Wait for response**
- **Statement**: "Okay then, you all can have my back. You know that what I'm doing here - using telemetry to understand my system's runtime behavior at development time - this is NOT normal."
- **Key point**: "The Datadog telemetry-fetching tool I'm using for this demo is in preview. This is an entirely new use case for telemetry and code instrumentation."

## Education: What Makes This Possible (3-4 minutes)

### Level Set on OpenTelemetry
- Brief explanation of what OpenTelemetry is
- Standard use case: production observability

### Show the Secret Sauce
- Display an instrumented function (perhaps one from chat gathering that appeared in the diagram)
- **Honest admission**: "When I've instrumented for development insights, I've added WAY more instrumentation than I would for production"
- **Philosophy**: "Instrument EVERYTHING! Narrative logs!"
- Show specific examples of over-instrumentation

## The "Why" - Benefits & Story (4-5 minutes)

### Pose the Question
"How might this improve your AI-assisted coding experience?"

### Answer with Story
- Dramatized version of debugging & architectural blindness experience from Friday, Oct 3
- Use slides with back-and-forth quotes
- Include lots of relatable AI behaviors:
  - AI confidently suggesting wrong approaches
  - Missing architectural context
  - Unable to see runtime behavior
  - Making assumptions about how code actually works

### Benefits of Telemetry for Development

#### A. Codebase Discovery (Removing Architectural Blindness)
- AI can see what actually runs, not just what's in static code
- Understanding system architecture from runtime behavior

#### B. Debugging
- Trace through actual execution paths
- See real data flowing through the system
- Identify issues AI couldn't spot from code alone

#### C. Code Validation
- Glaring performance problems caught immediately
- Real metrics vs assumptions
- Immediate feedback on changes

#### D. Asking Arbitrary Design Questions
- **Example**: "When deciding how many quotes my journal tool should feature per entry, I can ask the average number of possible quotes that the invoked AI is choosing from, as well as min and max"
- Data-driven design decisions instead of guesswork

## The "Why Not" - Honest Challenges (2-3 minutes)

### A. Cost
- Expensive to store all this data
- Extra burden on AI assistant and models to instrument and query
- **War story**: "The coding assistant will do the HUGEST calls through MCP server if I don't watch it"

### B. AI Can Make Wrong Assumptions Too
- Correlation helps, but not foolproof
- (Include a good story here about AI misinterpreting telemetry data)

### C. Developer Experience Pain
- It IS a PITA for developers to have to instrument everything
- **Solution preview**: This is where automation comes in...

### D. Dev vs Production Instrumentation
- How to simultaneously instrument for development AND production?
- Different needs, different verbosity levels
- My solution: `dev` mode vs production mode

## Solution: The Instrumentation Agent (2-3 minutes)

### My Handmade Telemetry-Instrumenting Agent
- Show the `/add-telemetry` command
- How it addresses the "PITA" problem
- (Demo if time permits)
- Agent handles the tedious work of adding instrumentation
- Maintains consistency and best practices

## Closing Demo/Question (1-2 minutes)

### Go Out With a Bang
Options to consider:
1. Ask Claude to use ALL the telemetry data to write the conference talk abstract you SHOULD have submitted (meta, funny, shows full power)
2. Ask Claude a complex question about the system that would be impossible to answer without telemetry
3. Show a quick before/after comparison of AI assistance with and without telemetry

## Wrap-Up (1 minute)

### Key Takeaways
- Telemetry isn't just for production anymore
- AI coding assistants are powerful but architecturally blind
- Runtime data gives them the context they need
- This is a new paradigm for development

### Call to Action
- The tools are available (Datadog MCP in preview)
- OpenTelemetry makes instrumentation standard
- Try it in your own projects
- Let's make AI assistants actually understand what we're building

### Contact/Resources
- GitHub: https://github.com/wiggitywhitney/commit-story
- npm: npm install commit-story
- Demo available at: https://github.com/wiggitywhitney/commit-story

---

## Timing Breakdown

### 20-Minute Version (Minimal)
- Opening Hook: 1-2 min
- Demo Part 1 (Steps 1-2 only): 4-5 min
- Big Reveal: 1-2 min
- Education (Brief OTel intro + 1 function): 2-3 min
- Benefits & Story (Story + top 2 benefits): 4-5 min
- Challenges (Briefly mention): 1-2 min
- Solution (Show tool, don't demo): 1-2 min
- Closing: 1-2 min
- **Total: ~20 minutes**

### 30-Minute Version (Standard)
- Opening Hook: 2 min
- Demo Part 1 (All steps): 6-8 min
- Big Reveal: 2 min
- Education (Full OTel + multiple functions): 4-5 min
- Benefits & Story (Full story + all 4 benefits): 6-7 min
- Challenges (All 4 with brief stories): 3-4 min
- Solution (Show + quick demo): 3-4 min
- Closing (with bang demo): 2-3 min
- **Total: ~30 minutes**

### 35-Minute Version (Deep Dive)
- Opening Hook: 2 min
- Demo Part 1 (All steps + zoom in): 8-10 min
- Big Reveal: 2 min
- Education (Detailed OTel + multiple examples): 5-6 min
- Benefits & Story (Rich story + detailed examples): 7-8 min
- Challenges (All 4 with full stories): 4-5 min
- Solution (Full demo of /add-telemetry): 4-5 min
- Closing (multiple demos): 3-4 min
- **Total: ~35 minutes**

## Notes
- Keep energy high throughout
- Use humor strategically (opening misdirection, cost "HUGEST calls" story)
- Balance technical depth with accessibility
- Show, don't just tell (live demos are key)
- Acknowledge challenges honestly (builds credibility)
- End on inspiring note about the future of AI-assisted development
