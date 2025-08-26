# AI Prompts Catalog

## Overview

The old mcp-commit-story project used multiple AI prompts to generate different sections of journal entries. This document catalogs all the AI prompts used, their purposes, and key design principles.

**Note**: The prompts shown here are partial extracts from the source code. The actual implementation contains much more detailed instructions, anti-hallucination rules, and specific guidelines that were too lengthy to extract completely. For the full prompts, refer directly to the functions in `src/mcp_commit_story/journal_generate.py` in the original repository.

## Prompt Engineering Principles

### Core Philosophy
All prompts in the system follow these key principles:

1. **Anti-Hallucination Focus**: Strict rules against inventing or speculating
2. **Authenticity Preservation**: Use developer's own words and expressions
3. **Explicit Evidence Only**: Extract only what's explicitly stated
4. **Concrete Language**: Avoid abstract or generic descriptions
5. **Context-Driven**: Work only from provided git and chat context

## Journal Section Prompts

### 1. Summary Section Prompt

**Purpose**: Generate narrative overview of changes focusing on "what changed and why"

**Full Prompt**:
```
You are helping build a high-quality development journal system that tracks coding work across commits. Your job is to generate a summary section. The quality of the entire journal depends on your output.

Input: JournalContext containing git metadata, chat history, and previous journal entries.
Output: Return the TypedDict structure defined in the function signature.

AVAILABLE DATA in JournalContext:
- git: Git context with commit metadata, changed files, statistics, and file_diffs (dict mapping file paths to actual diff content)
- chat: Developer's conversations with AI coding assistants (may contain more than what's relevant to the current commit - think critically about what chat should be considered)
- journal: Recent journal entries for context and continuity (don't duplicate content, but feel free to weave in quotes from reflections if relevant)

AI Prompt for Summary Section Generation

Purpose: Generate a narrative paragraph that captures the essential "story" of what changed and why, using conversational language that preserves the developer's authentic voice and technical context.

Instructions: Extract explicit purpose statements and technical context from chat history and git changes to create a conversational summary. Focus on WHAT changed and WHY, told as a story.

[Additional detailed instructions follow in the actual implementation]
```

**Key Instructions**:
- Extract explicit purpose statements from context
- Use developer's own words about motivation
- Create conversational narrative of "what changed and why"
- Avoid corporate speak and abstractions
- Use concrete, specific language
- Preserve authentic technical voice
- No invention or speculation

### 2. Technical Synopsis Section Prompt

**Purpose**: Provide code-focused technical analysis of implementation details

**Full Prompt**:
```
You are helping build a high-quality development journal system that tracks coding work across commits. Your job is to generate a technical synopsis section. The quality of the entire journal depends on your output.

Input: JournalContext containing git metadata, chat history, and previous journal entries.
Output: Return the TypedDict structure defined in the function signature.

AVAILABLE DATA in JournalContext:
- git: Git context with commit metadata, changed files, statistics, and file_diffs (dict mapping file paths to actual diff content)
- chat: Developer's conversations with AI coding assistants (may contain more than what's relevant to the current commit - think critically about what chat should be considered)
- journal: Recent journal entries for context and continuity (don't duplicate content, but feel free to weave in quotes from reflections if relevant)

AI Prompt for Technical Synopsis Section Generation

Purpose: Generate a code-focused analysis of what changed in this commit, providing technical implementation details that complement the narrative summary.

[Additional detailed instructions for technical analysis, language translation, anti-hallucination rules, and comprehensive checklist for AI-generated content follow in the actual implementation]
```

**Key Instructions**:
- Extract technical implementation details
- Analyze architectural patterns and design decisions
- Describe specific code changes
- Match detail level to commit complexity
- Preserve authentic technical language
- Focus on explicit technical evidence

### 3. Accomplishments Section Prompt

**Purpose**: Highlight successful work, progress made, and learning moments

**Full Prompt**:
```
You are helping build a high-quality development journal system that tracks coding work across commits. Your job is to generate an accomplishments section. The quality of the entire journal depends on your output.

[Emphasizes extracting explicit statements of success, focusing on meaningful progress, capturing both technical achievements and learning moments, using specific concrete language, avoiding generic task references]

[Context provided as JSON]
```

**Key Instructions**:
- Extract explicit statements of success
- Focus on meaningful progress indicators
- Capture technical achievements and learning moments
- Use specific, concrete language
- Avoid generic task references
- Highlight both technical and learning accomplishments

### 4. Frustrations Section Prompt

**Purpose**: Capture challenges, blocking issues, and developer difficulties

**Full Prompt**:
```
You are helping build a high-quality development journal system that tracks coding work across commits. Your job is to generate a frustrations section. The quality of the entire journal depends on your output.

[Concentrates on identifying explicit challenges and blocking issues, extracting developer's authentic expressions of difficulty, using specific technical frustration indicators, avoiding speculation about emotional states]

[Context provided as JSON]
```

**Key Instructions**:
- Identify explicit challenges and blocking issues
- Extract developer's authentic expressions of difficulty
- Use specific technical frustration indicators
- Avoid speculation about emotional states
- Focus on concrete obstacles and problems
- Preserve authentic frustration language

### 5. Tone/Mood Section Prompt

**Purpose**: Assess emotional context and mood indicators from development work

**Full Prompt**:
```
You are helping build a high-quality development journal system that tracks coding work across commits. Your job is to generate a tone/mood section. The quality of the entire journal depends on your output.

[Focuses on analyzing emotional language in chat, extracting mood indicators, preserving authentic emotional expression, avoiding psychological interpretation, using only explicit emotional evidence]

[Context provided as JSON]
```

**Key Instructions**:
- Analyze emotional language in chat context
- Extract explicit mood indicators
- Preserve authentic emotional expression
- Avoid psychological interpretation or analysis
- Use only explicit emotional evidence
- Respect developer's emotional authenticity

### 6. Discussion Notes Section Prompt

**Purpose**: Extract meaningful technical discussions and conversations

**Full Prompt**:
```
You are helping build a high-quality development journal system that tracks coding work across commits. Your job is to generate a discussion notes section. The quality of the entire journal depends on your output.

[Emphasizes extracting verbatim quotes, filtering for meaningful technical discussions, preserving conversation flow, avoiding routine or off-topic content, using strict speaker attribution]

[Context provided as JSON]
```

**Key Instructions**:
- Extract verbatim quotes from conversations
- Filter for meaningful technical discussions
- Preserve natural conversation flow
- Avoid routine or off-topic content
- Use strict speaker attribution
- Focus on relevant technical dialogue

## Summary Generation Prompts

### Daily Summary Prompt

**Purpose**: Synthesize multiple journal entries into daily overview

**Key Philosophy**: 
```
Focus on what made this day unique rather than routine workflow. Filter out routine development work. Capture unique "signal" moments including technical challenges, architectural decisions, emotional journey, and learning moments.
```

**Sections Generated**:
- Summary overview
- Reflections
- Progress Made
- Technical Progress
- Challenges Overcome
- Learning Insights

**Instructions**:
- Extract unique "signal" moments from routine work
- Focus on meaningful technical challenges
- Capture architectural and design decisions
- Document emotional journey authentically
- Highlight learning and growth moments
- Avoid routine workflow documentation

## Prompt Structure Pattern

### Standard Template
All prompts follow this consistent structure:

1. **System Role Definition**
   ```
   You are helping build a high-quality development journal system that tracks coding work across commits. Your job is to generate a [SECTION_TYPE] section. The quality of the entire journal depends on your output.
   ```

2. **Section-Specific Instructions**
   - Detailed guidelines for the specific section
   - Anti-hallucination rules
   - Authenticity requirements
   - Specific extraction focus

3. **Context Provision**
   ```
   [Context provided as JSON]
   ```

### Context Structure
The context provided to all prompts includes:
- **Git Context**: Commit metadata, diffs, file changes, statistics
- **Chat Context**: Relevant AI conversations and discussions
- **Journal Context**: Previous journal entries and reflections

## Anti-Hallucination Rules

### Strict Guidelines Applied to All Prompts

1. **No Invention**: Never create information not present in context
2. **No Speculation**: Avoid guessing motivations or unstated reasons
3. **Explicit Only**: Extract only what's explicitly stated
4. **Authentic Voice**: Preserve developer's original language
5. **Concrete Evidence**: Use specific, factual information
6. **Context Boundaries**: Work only within provided context

### Enforcement Mechanisms
- Repeated emphasis in prompt instructions
- Explicit "do not invent" statements
- Focus on "extracting" rather than "generating"
- Requirement for explicit evidence
- Preservation of original language patterns

## Prompt Complexity Assessment

### Strengths
1. **Consistent Philosophy**: All prompts share anti-hallucination principles
2. **Section Specialization**: Each prompt optimized for specific content type
3. **Authenticity Focus**: Strong emphasis on preserving developer voice
4. **Evidence-Based**: Require explicit evidence for all content

### Potential Issues
1. **Repetitive Structure**: Similar opening statements across all prompts
2. **Verbose Instructions**: Long, detailed prompt instructions
3. **Multiple AI Calls**: 6+ separate AI invocations per journal
4. **Complex Context**: Large JSON context objects for each call

### Simplification Opportunities for MVP
1. **Reduce Sections**: Combine related sections (technical + accomplishments)
2. **Shorter Prompts**: Simplify verbose instructions
3. **Single AI Call**: Generate multiple sections in one call
4. **Streamlined Context**: Provide focused, minimal context

## Key Takeaways

### What Works Well
- Anti-hallucination focus prevents AI fabrication
- Section specialization produces targeted content
- Authenticity preservation maintains developer voice
- Evidence-based approach ensures factual content

### What's Bloated
- Too many separate sections requiring individual AI calls
- Overly verbose and repetitive prompt instructions
- Complex context formatting and JSON serialization
- Redundant anti-hallucination rules in every prompt

### MVP Recommendations
- Consolidate to 2-3 key sections maximum
- Simplify prompt language while preserving core principles
- Use single AI call with structured output
- Streamline context to essential information only