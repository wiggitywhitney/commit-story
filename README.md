# Commit Story: Your Engineering Journey, Remembered

Automatically capture not just what you built, but why it mattered and how you solved it.

## What is Commit Story?

Commit Story transforms your git commits into rich journal entries by combining:
- Your actual code changes
- Conversations with your AI coding assistant (currently Claude Code)
- The technical decisions and trade-offs you made

Every commit triggers a background process that creates a narrative record of your development work - no workflow interruption, just automatic documentation that captures the real story.

**Automated Daily Summaries**: On the first commit of each new day, Commit Story automatically generates daily summaries from your journal entries, creating a higher-level view of your development journey.

## Why Use It?

**For yourself:**
- Remember why you made certain choices and how you overcame obstacles
- See your growth as a developer, not just a list of commits
- Boost your learning - [15 minutes of daily reflection improves performance by 20-25%](https://larryferlazzo.edublogs.org/files/2013/08/reflection-1di0i76.pdf)

**For your career:**
- Evidence for performance reviews and career advancement
- Material for conference talks and blog posts
- Documentation that captures the real engineering journey

**For your team:**
- Onboard new developers with the actual story behind decisions
- Make retrospectives meaningful with concrete examples
- Preserve institutional knowledge that usually gets lost

## Prerequisites

- Node.js 18.0.0 or higher
- Git repository
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Active Claude Code usage

## Quick Start

### 1. Install the Package

```bash
npm install --save-dev commit-story
```

### 2. Set Up Your OpenAI API Key

Add your OpenAI API key to your `.env` file:

```bash
OPENAI_API_KEY=your-api-key-here
```

Need an API key? Get one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 3. Activate Git Hook

**Note:** This will overwrite any existing `.git/hooks/post-commit` file in this repository. If you have other post-commit hooks in this repo, you'll need to merge them manually.

```bash
npx commit-story-init
```

This installs a git hook that automatically generates journal entries after each commit.

### 4. Start Developing

That's it! Your next git commit will automatically generate a journal entry in the `journal/entries/` directory.

## Usage Examples

Here's what a journal entry looks like after you commit some development work:

### Sample Entry: `journal/entries/2025-09/2025-09-05.md`

```markdown
## 9:46:42 AM CDT - Commit: 1502704e

### Summary - 1502704e
The developer created a new PRD for restructuring the prompts used in the system. They analyzed successful prompt patterns from existing commands and proposed applying the same step-based principles to avoid format-first antipatterns that could lead to lower quality outputs.

### Development Dialogue - 1502704e
**Human:** "Look at prompts that consistently work well for me like /prd-create and /prd-next. I'm considering whether the Technical Decisions section prompt needs to be updated to follow steps to prevent AI from skipping ahead."

**Human:** "I like this except I want two additional things: an analysis step to make sure no critical bit gets lost, and before/after tests on multiple commits with human approval."

### Technical Decisions - 1502704e
- **DECISION: Step-Based Prompt Architecture PRD Creation** (Discussed)
  - Restructuring prompts to follow successful patterns
  - Emphasis on preventing AI from skipping critical analysis steps
  - Inclusion of mandatory human approval testing

### Commit Details - 1502704e
**Files Changed**: prds/1-automated-git-journal-system.md, prds/4-step-based-prompt-architecture.md  
**Lines Changed**: ~213 lines  
**Message**: "feat(prd-4): create step-based prompt architecture PRD"
```

Each entry captures what you built, why it mattered, and the key conversations that led to your decisions.

## Configuration

Commit Story creates a `commit-story.config.json` file automatically during installation. You can modify it to change the behavior:

### Configuration Options

Edit `commit-story.config.json` in your project root:

- **`debug`**: Set to `true` to see journal generation output during commits. Set to `false` (default) to run silently in background.

- **`enabled`**: Set to `false` to temporarily disable journal generation while keeping the hook installed. Set to `true` (default) to enable.

### Example Configuration

```json
{
  "debug": true,
  "_debug_help": "Set to true to run journal generation in foreground with detailed logging visible during commits.",
  
  "enabled": true,
  "_enabled_help": "Set to false to temporarily disable automatic journal generation while keeping the hook installed."
}
```

## Troubleshooting

### First Step: Enable Debug Mode

For any issue, start by enabling debug mode to see exactly what's happening:

1. Edit `commit-story.config.json` and set `"debug": true`
2. Make a test commit
3. Watch the output for detailed status information

The debug output will show you:
- Whether the hook is running ("Post-commit hook triggered")
- If Commit Story is enabled for this repository (runs vs skips)
- OpenAI API connectivity status ("✅ connectivity confirmed" or error details)
- Chat data availability ("X messages found" or "No chat data found")
- Detailed error messages for any failures

### Common Issues

**Hook not running at all:**
- Missing `commit-story.config.json` file
- Hook not installed (missing `.git/hooks/post-commit`)

**Hook runs but no journal created:**
- Invalid OpenAI API key in `.env` file  
- No Claude Code chat data for the time window
- OpenAI API errors or rate limits

**Can't find journal entries:**
- Check `journal/entries/YYYY-MM/YYYY-MM-DD.md`
- Journal directory is in `.gitignore` by default (private)

### Connectivity Test

Verify your OpenAI setup works:
```bash
npm run commit-story:test
```

## Uninstalling

### Temporary Disable

To temporarily stop journal generation without uninstalling:

Edit `commit-story.config.json` and set `"enabled": false`

### Complete Removal

To fully remove Commit Story from your project:

```bash
npx commit-story-remove
npm uninstall commit-story
```

This removes the git hook, optionally removes the configuration file, and uninstalls the package. Your existing journal entries are preserved.