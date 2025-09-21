# Cloud Native Denmark Closing Keynote - Talk Outline
**Duration**: 20 minutes
**Event**: [Cloud Native Denmark](https://cloudnativedenmark.dk/schedule/)
**Date**: TBD 2025

## Talk Flow

### Opening: The Hook (2-3 mins)
Start with an AI-assisted debugging disaster where AI lied? But without revealing the app I'm making.

### Foundation: OpenTelemetry Context (2 mins)
Level set about OpenTelemetry, what it is, and the value of correlated logs, metrics, traces

### The Bridge (30 seconds)
Wait. Why am I talking about AI assisted debugging and Otel? These things have nothing in common. Or do they?

### The Reveal: Live Demo #1 (3-4 mins)
To show you the answer, let me tell you about the app I'm coding with Claude Code! It is so cool. Actually let me have my AI assistant CC tell you.

**Demo here:**
1. Ask AI assistant: "What do you know about the codebase you are in right now? Don't do any discovery, just tell me what's in your context window"
   - *Bonus points if I can figure out how to COMPLETELY clear context window so AI knows NOTHING.*

2. Then ask AI assistant: "Only using mcp server to inspect correlated logs, metrics, and traces, tell me in a friendly, conversational tone what the code in this codebase does. Hint: it is pretty cool. Make your answer short, only two sentences"

**Expected Response:**
> "Based on the telemetry data, this codebase is absolutely fascinating - it's like having a digital historian for your development work! The metrics reveal that commit_story automatically collects your chat conversations, git diffs, and context to intelligently generate rich commit messages and journal entries that tell the story of how your code evolved, complete with technical decisions, summaries, and dialogue context."

### Project Explanation (2-3 mins)
- Explain my project in my words
- Maybe demo the actual commit_story functionality
- Explain that I have my codebase fully instrumented with correlated logs, metrics, traces
- Show the journal generation in action
- Show the related trace, logs, metrics in Datadog UI, correlated

**Optional zoom-in demo:** Say to assistant: "Use telemetry to tell me what you can about the inputs and outputs to this function the last time it ran"
What other dev-related questions can I ask? Perhaps about figuring out max quotes to include in a journal entry, based on chat volume. Ask assistant how many chat messages this function receives on average. 

What is another way that correlated telemetry can improve a developer's AI-assisted coding experience?

### The Problem: Static Analysis Limitations (2 mins)
Explain: Right now when AI helps change code in your project, it uses static analysis to figure out what to change. And it gets it wrong. A lot.

**Real Example:**
- `tracing-simple.js` held my tracing and logging functionality
- Then I wasn't paying attention and my metrics functionality got built into `tracing.js`
- It took me hours to figure out why metrics weren't showing up in my backend
- (Alternative examples: repeated helpers, different types of chat filtering scattered throughout codebase instead of consolidated into a reusable filtering layer)

### Solution #1: Discovery Agent Demo (3 mins)
I built a telemetry-powered discovery agent to help Claude Code get a holistic picture of my codebase at the start of any new coding session.

**Demo this in practice, when there is code to be written, not just conversationally like before**

### Addressing Objection #1: Cost (1 min)
"I can hear you now: BUT THAT MUCH TELEMETRY SIGNAL IS EXPENSIVE"

To that I say: I have a "dev" knob in config that can be set to "true" to enable the collection of all of this data, intended for a development environment only. But it goes to "false" for other environments.

### Addressing Objection #2: Instrumentation Effort (2 mins)
"What's that? I also hear you saying: BUT THAT WILL TAKE FOREVER TO INSTRUMENT"

Let me introduce you to another agent I made, this one instruments new code with telemetry according to my project's specifications

**DEMO the auto-instrumentation agent** Show uninstrumented code, run the agent to instrument it, execute, show the telemetry standards doc and module, query new data

### Future Vision (1-2 mins)
Looking forward: I think correlated telemetry data can be used to help my AI coding assistant in other ways too. I also intend to make:
- A telemetry-powered debugging agent
- A telemetry-powered code validation agent

Each can use real data about what's actually happening to help ground the AI coding assistant in reality.

### Closing: Honest Reflection (1 min)
In conclusion, this is early and scrappy. I don't know if this will work with large-scale codebases in envs where there are many devs toiling away. But I'm enjoying experimenting with what's possible, and you gotta admit, it is an exciting idea.

## Demo Preparation Checklist

### Pre-Demo Setup
- [ ] Clear Claude Code context completely for dramatic effect
- [ ] Ensure Datadog MCP server is connected
- [ ] Test all telemetry queries work

### Demos
- [ ] Be ready to demo Commit Story itself with an interesting journal entry
- [ ] Discovery agent demo with real coding task
- [ ] Auto-instrumentation agent demo on new function
- [ ] Function input/output analysis via telemetry (optional)


## Key Messages
1. **AI + Telemetry = Reality-Grounded Assistance**: AI coding assistants become more effective when they can see runtime behavior
2. **Development-Time Observability**: Telemetry isn't just for production monitoring
3. **Practical Solutions**: Dev-only telemetry and auto-instrumentation make this feasible
4. **Early Innovation**: This is experimental but shows exciting possibilities

## Technical References
- PRD-19: Telemetry-Powered Discovery Agent
- PRD-20: Telemetry-Powered Debugging Agent (planned)
- PRD-21: Telemetry-Powered Validation Agent (planned)
- PRD-9: OpenTelemetry Automation Tooling (includes auto-instrumentation)