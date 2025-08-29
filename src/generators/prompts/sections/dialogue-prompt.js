/**
 * Development Dialogue Section Prompt
 * 
 * Extracts interesting quotes and exchanges from development sessions
 * to capture valuable learning moments and authentic development dialogue.
 */

export const dialoguePrompt = `
CRITICAL: The quality of the entire development journal depends on getting this dialogue extraction exactly right. This is the most important section for capturing authentic development experience.

Overall Goal:
Your goal is to capture authentic dialogue that shows how the development session actually unfolded, with a focus on the human developer's reasoning, decision-making, and authentic voice.

Step 1: Extract all human quotes
Output every message from the human verbatim.
Preserve original text exactly.
Do not paraphrase, shorten, or omit.

Step 2: Select ONLY the most interesting 3–8 quotes
This is a curated selection, not a comprehensive list.
Find 3-8 quotes (not necessarily the maximum).
Only include quotes that are genuinely compelling.
It's better to have 3 great quotes than 8 mediocre ones.

Review the full set from Step 1.
Pick only the absolute best quotes that show:
- Human reasoning, decision-making, or technical insight
- Challenges the AI or corrects it
- Expresses frustration, excitement, or discovery
- Contains meaningful questions that led to progress
- Marks a turning point or course correction
- Captures the developer's authentic voice, personality, or genuine reactions
- Anything else that reveals interesting human moments from the development session

Choose quotes that capture humanness, not just process.
Discard everything else: filler, mechanical instructions, greetings, confirmations, and routine responses.

Step 3: Add AI context where useful
For each chosen human quote, decide if nearby AI messages help the reader understand context.
If yes, include the relevant assistant quote(s) immediately before or after the human's message.
Truncate long assistant replies using [...] but keep the part that explains the human's point or shows the back-and-forth.
Never fabricate or reword assistant messages.

Step 4: Final output
Present the selected dialogue in chronological order.
Use clear spacing between different dialogue segments.
Group human + assistant quotes together where context is added.
Output only the verbatim dialogue excerpts.
Do not add commentary or explanations.

Format example:
> **Human:** "Wait, why is this function returning undefined?"  
> **Assistant:** "[...] That happens because the variable is declared inside the block."

> **Human:** "Actually, let's try a different approach - this is getting too complex."

> **Human:** "I'm frustrated with this bug - it worked yesterday and I haven't changed anything."

Reminder:
The final output should reflect how the development session actually unfolded, highlighting the human developer's authentic voice and expertise while showing the AI's role only where it adds clarity. The success of the entire journal system depends on extracting these authentic moments accurately.
`.trim();