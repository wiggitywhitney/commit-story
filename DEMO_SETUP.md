# Demo Setup Guide

## Setting up This Lying Has To Stop / How To Trust a Liar

---

### For Reference: Demo Prompts

#### Prompt 1: Commit with Conference Name

```
Commit the staged changes with the message "[[CONFERENCE NAME HERE]]!!! Woo woo ow ow ow"
```

#### Prompt 2: Trace Visualization

```
Get trace id from console logs. Using this plus correlated logs and metrics, draw me a diagram of how this system works. Search smartly and minimize token usage. Add some color with a sprinkling of telemetry facts.

I especially want a detailed diagram of how chat data gets collected and prepared for the downstream journal generator functions. Again, don't use too many tokens.
```

#### Prompt 3: Message Filtering Stats

```
How many messages were there from this commit window, and how many did it filter down to?
```

---

## Setup Steps

### Before start:

**Step 0**: make sure you have a Claude Code actor who has a mic!

**Step 1**: delete any artefacts from past presentation

**Step 2**: commit the changes

**Step 3**: delete the journal file

**Step 4**: get the IDE looking sharp
be ready to show off (1) journal file appearing and (2) instrumented function

**Step 5**: get the Datadog WebUI ready to show off

**Step 6**: have a conversation with Claude Code about a topic relevant to the conference you're about to present at

**EXAMPLE:**

```
I'm attending Cloud Native + Kubernetes AI Day at KubeCon this year. What can I expect to learn?

Do you think AI is here to stay or do you think it's just hype? I heard a stat recently that roughly 95% of enterprise pilots of generative-AI (GenAI) projects failed to deliver measurable business impact or return on P&L. This is according to a recent study by Massachusetts Institute of Technology (MIT)'s "GenAI Divide: State of AI in Business 2025" initiative.

I have questions. That 5% that's providing measurable business impact. Are we talking about business impact from developing a GenAI feature they're selling? Or is that business impact coming from integrating GenAI tools into their workflow with the result of increased velocity and productivity? My second question is: Are you biased on this topic? If not, would you tell me?
```

---

**Step 7**: stage the git commit

**Step 8**: connect to datadog mcp

**Step 9**: clear context

**Step 10**: pull up prompts on iPhone

---

## You're ready to go!!! Do your best!
