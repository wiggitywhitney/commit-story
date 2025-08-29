/**
 * Development Dialogue Section Prompt
 * 
 * Extracts supporting human quotes based on summary content
 * using the summary-guided extraction approach.
 */

export const dialoguePrompt = `
CRITICAL: The quality of the entire development journal depends on getting this dialogue extraction exactly right. This section captures the authentic human voice that brought the development session to life.

Overall Goal:
Your goal is to find human quotes from the chat messages that illustrate, support, or provide authentic voice to the points made in the development session summary. Use the summary as your guide for what matters.

Summary-Guided Approach:
You have been provided with a summary of this development session. Use it as your roadmap to identify what was important in this session, then find human quotes that show how those important moments actually unfolded in conversation.

Step 1: Understand the summary context
Read the provided summary carefully.
Identify the key points, decisions, discoveries, and challenges mentioned.
These are your targets for finding supporting quotes.

Step 2: Find supporting human quotes
Look through the chat messages for messages where type: "user" - these contain the human developer's actual input.

Find user messages that:
- Illustrate decisions or reasoning mentioned in the summary
- Show the human's authentic reaction to challenges described
- Demonstrate the problem-solving process that led to outcomes in the summary  
- Capture the human's voice during key moments identified in the summary
- Reveal the human's thought process behind actions summarized

AVOID simple confirmations and commands like "yes", "ok", "git push", "run the tests", or other routine responses.

Extract 3-8 quotes MAXIMUM. Quality over quantity.
Only include quotes that genuinely support or illustrate the summary narrative.
If no user messages support the summary narrative, return "No significant dialogue found for this development session".

Step 3: Verify authenticity
Every human quote must be EXACTLY verbatim from the chat messages.
Do not paraphrase, shorten, edit, or "improve" any human text.
If a quote needs context to be understood, add AI context in Step 4.
If a quote can't be extracted verbatim, skip it entirely.

Step 4: Add AI context where essential
For each human quote, decide if nearby AI messages are essential for understanding.
If yes, include relevant assistant quotes immediately before or after.
Use [...] to truncate long assistant replies, keeping only the essential part.
Do not paraphrase, rephrase, or fabricate any assistant text - only truncate if needed.

Step 5: Final output
Present quotes in chronological order.
Format each as shown below.
No commentary, explanations, or analysis.
Let the authentic dialogue speak for itself.

Format example:
> **Human:** "Wait, why is this function returning undefined?"  
> **Assistant:** "[...] That happens because the variable is declared inside the block."

> **Human:** "Actually, let's try a different approach - this is getting too complex."

> **Human:** "I think I see the issue now - we're overthinking this completely."

Reminder:
Use the summary as your guide to find quotes that matter. Extract only verbatim text. The goal is to let readers hear the human developer's authentic voice during the key moments that shaped this development session.
`.trim();