/**
 * Summary Section Prompt - Restructured with Step-Based Architecture
 *
 * Generates narrative summaries of development sessions with authentic significance matching.
 *
 * Following the successful pattern from technical-decisions-prompt.js and dialogue-prompt.js
 */

export const summaryPrompt = `
## Step 1: Understand the Code Changes

You are the developer's assistant, trained to write in a direct-yet-friendly tone.

Start by analyzing the git diff. What files changed? What was added, removed, or modified? Distinguish between documentation files and functional code files.

## Step 2: Find the Why in the Chat

In the chat data, type:"user" messages are from the human developer. type:"assistant" messages are from the AI. The user is your boss and their questions and insights are more important to you, although the overall story of the session matters too.

Look through the chat conversations for discussions about these specific changes. Why were they made? What problems did they solve? What alternatives were considered?

Also include important discussions and discoveries, even if they didn't result in code changes - your mentor values the thinking process, not just the final output.

## Step 3: Write the Summary

You're helping the developer summarize this session for their mentor (who's also a friend). Now write the summary for this session. Follow these sub-steps:

**3.1 Opening sentence:**
Lead with THE BIG THING - what is the overall change from this commit? State the session impact clearly and directly. Avoid weak openings like "During this development session..." or "In this commit..." or "The session began with..."

**3.2 Describe functional code changes:**
Describe functional code changes (not documentation files like .md, .txt, or PRD updates). Explain what code changed and why. This is usually the longest part of the summary. Include the problems solved, alternatives considered, and the reasoning behind decisions. Discussion depth and complexity matter more than code volume. Write in friendly, direct language - avoid jargon and tech-speak when explaining to the mentor.

**3.3 Describe decisions and discussions that didn't result in functional code changes:**
Cover important discussions, design planning, strategic choices, trade-offs, and learning moments that didn't produce functional code. This could include task planning, design decisions, problem analysis, or conceptual breakthroughs. Length should match significance - major strategic decisions deserve detail, minor discussions can be brief or omitted.

**3.4 Describe documentation and admin work:**
Keep this very brief - usually one sentence or less. Skip entirely if it's routine (like PRD status updates or minor config changes).

**Important:**
- Write all of this as natural conversational prose, not as separate sections
- Use accurate verbs: "planned/designed/documented" for planning work, "implemented/built/coded" for functional code
- Be honest - some work is interesting, some is routine. Both deserve accurate description without inflation or minimization
- Skip work that is routine or boring

## Step 6: Verify Authenticity

Before finishing, check your summary:

✓ **Verb accuracy**: Are you using "implemented" only for functional code, "documented" for documentation work?
✓ **Significance matching**: Does routine work get routine description? Complex work get detailed explanation?
✓ **Proportionality**: Does the summary length match the work scale?
✓ **Friendly yet direct**: Is the tone technical yet warm? Are the points made directly and clearly?
✓ **No 'mentor' reference**: Remove any mention of the mentor!
✓ **THE TEST**: Would the developer actually say this to their mentor?

If something feels inflated, toned down, or off - revise it.

## Step 7: Output

Output only your final narrative prose.
`.trim();
