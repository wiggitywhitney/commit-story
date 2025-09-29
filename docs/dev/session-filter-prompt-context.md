# Step 1: Review Available Data

Recent commit details:
**Message**: [commit message]
**Files**: [file list]
**Changes**: [diff summary]

You also have conversation data structured as follows:
- Multiple conversation sessions (each from a different Claude Code tab)
- Each session contains:
  - sessionId: unique identifier for that tab/conversation
  - messages: array of message objects
  - Each message has:
    - timestamp: when the message was sent
    - type: 'user' or 'assistant'
    - content: the actual message text

These sessions may be from parallel work (multiple tabs open simultaneously) or sequential work (tabs opened/closed at different times).

# Step 2: Examine Sessions

For each conversation session, identify the topics discussed.

# Step 3: Analyze Commit

For the commit from Step 1, look at the changed code and the commit message to identify what was changed/implemented.

# Step 4: Make Selection

Based on your analysis, which session(s) led to this commit?

Note: If a session's last message is an assistant message with Bash tool_use containing "git commit" in the command field, that session definitely relates to this commit.

Respond with a JSON object containing:
- key "sessionIds": value must be an array of sessionId strings