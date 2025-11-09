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

---

## Setup Steps

### Before start:

**Step 1**: delete any artefacts from past presentation

**Step 2**: commit the changes

**Step 3**: delete the journal file

**Step 4**: get the IDE looking sharp
be ready to show off (1) journal file appearing and (2) instrumented function

**Step 5**: get the Datadog WebUI ready to show off

**Step 6**: have a conversation with Claude Code about a topic relevant to the conference you're about to present at

**EXAMPLE:**

```
I'm in Edinburgh, Scotland! I have a presentation to give later today, and tomorrow (Thursday) I have a single day to sightsee before I fly home to Austin, Texas! Will you help me design an itenerary? I like art a lot, especially modern art and local art. I love nature and hikes and bike rides. I enjoy science and animals. I especially love quirky, offbeat experiences. First recommend some activities to me, then I'll choose some and we can think about an itenerary.

Tell me more about Arthur's Seat hike, the street art in Leith, and the idea of a coastal bike ride along the Firth of Forth, please! I already bough a `Real Mary King's Close` tour ticket for the afternoon but I can move or skip it if needed. Also I'm vegan!

That all looks freaking amazing. I need to try the vegan haggis! Please make an itinerary and save it to a file in the root directory of this repo. Then please stage the changes but don't commit.
```

---

**Step 7**: stage the git commit

**Step 8**: connect to Datadog mcp server

**Step 9**: clear context

---

## You're ready to go!!! Do your best!
