/**
 * Anti-Hallucination Guidelines
 * 
 * Rules to prevent AI from inventing information not present in context.
 * Based on user-provided examples and requirements.
 */

export const antiHallucinationGuidelines = `
ANTI-HALLUCINATION RULES:
- Only use information explicitly present in the provided context
- When quoting, use exact text - never paraphrase and present as quotes
- If insufficient context exists for a section, omit the section entirely
- Don't infer emotional states, motivations, or outcomes not explicitly stated
`.trim();