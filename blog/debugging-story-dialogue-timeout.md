# Debugging Journey: Dialogue Generator Timeout (OpenTelemetry-Focused)

## The Problem
Dialogue generation timed out at 60s on commit a36d3800, while summary and technical decisions succeeded on the same commit.

## The Investigation

**Step 1: Examined recent code changes**
- Checked git diff for a36d3800
- Found expanded context descriptions in context-integrator.js
- **Initial hypothesis**: Schema descriptions added token overhead

**Step 2: Added debug instrumentation**
- Logged system prompt lengths, user message lengths, token estimates
- Found both generators got ~210-220KB messages, ~54-57k tokens
- **Disproved hypothesis**: Data sizes were similar, yet dialogue timed out while technical decisions succeeded

**Step 3: Examined actual message content**
- Wrote full prompts and data to `/tmp/` files
- Discovered massive embedded slash command prompts (e.g., `/prd-next-telemetry-powered` - thousands of lines)
- **New hypothesis**: Slash command content causing timeout
- **Disproved**: Both generators received identical slash command content

**Step 4: Nearly went down the wrong path** ⚠️
- I proposed writing new filtering logic for slash command content
- Suggested adding it to `context-filter.js` where other message cleanup happens
- **This would have worked, but...**
- You asked me to look at trace data to understand the full execution path first

**Step 5: Queried OpenTelemetry traces** ✅ **BREAKTHROUGH**
Found the answer in trace `8a9349bf68dbb9e59608b8e8963a2ed1`:

**Root span** (`commit_story.main`):
```
commit_story.chat.messages_count: 174      # Filtered messages
commit_story.chat.total_messages: 448      # Total across all sessions
```

**Generator spans** (`technical_decisions.generate`, `dialogue.generate`):
```
commit_story.chat.messages_count: 448      # Receiving unfiltered data!
```

**Critical insight**: The system ALREADY had filtering logic reducing 448 → 174 messages. The `isNoisyMessage()` function in `context-filter.js` already filters out tool calls, system messages, and command artifacts (lines 81-86). But generators were receiving the unfiltered 448 messages, bypassing existing filtering.

**Step 6: Found when it broke**
- Searched journal entries for "session grouping"
- **Commit 8db5ceb4** (Oct 1): "implement session grouping enhancement"
- Quote: "Grouped messages by sessionId instead of filtering them out"

## Root Cause
Session grouping change bypassed the existing filtering logic, sending all 448 messages to generators instead of the filtered 174-message subset within the commit time window.

## Why Dialogue Timed Out But Others Didn't
Both generators received the same 448 messages, but dialogue's prompt requires intensive search/matching work (finding verbatim quotes, cross-referencing with summary, quality checks) which exceeded 60s with the bloated dataset.

---

## OpenTelemetry's Impact

**What it prevented** 🛡️:
- Building duplicate filtering logic that already existed
- Wasting time on a "fix" that masked an architectural bug
- Missing the real issue: a regression from the session grouping change

**What it revealed** ✅:
- Correlated span attributes (`messages_count`) across root → generator spans showed the filtering bypass
- Proved the system already had working filters (174 messages in root span)
- Showed exactly where the data flow broke (generators receiving 448 instead of 174)

**The key moment**: Your insistence on checking telemetry before implementing a fix revealed we didn't need NEW filtering - we needed to FIX THE PLUMBING so existing filtering reached the generators.

**The power**: OpenTelemetry prevented a band-aid solution and led us to the architectural root cause.
