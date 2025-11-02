# When the Codebase Starts Instrumenting Itself

**Conference:** KubeCon + CloudNativeCon / Cloud Native AI + Kubeflow Day
**Topic:** RAG & AI Agents
**Level:** Intermediate
**Format:** Talk (25-40 minutes with live demo)
**Open Source Projects Used:** OpenTelemetry

---

## Abstract

Commit Story is an automated engineering journal that is triggered by Git commits. But that's not the point. For the speaker, this personal project became a playground for exploring how telemetry can inform AI coding assistants at development time.

Her path to adding instrumentation likely mirrors that of many teams: an effort to follow OpenTelemetry semantic conventions, reinforced first through documentation, then later through a shared library of standards. Eventually, she built an AI agent that reads OpenTelemetry docs, discovers conventions, extends the standards module, instruments the code, and validates that it all works by querying the backend.

This talk shares what that process revealed—how automation reshapes telemetry design—and includes a live demo showing how integrating OpenTelemetry Weaver formalized those standards, enabling the Telemetry Agent to work across multiple codebases.

---

## Benefits to the Ecosystem

This talk demonstrates a practical application of AI in maintaining observability standards—a pain point many teams face as they scale.

Attendees will learn:
• How to enforce telemetry conventions through code, not just documentation
• A working pattern for AI-assisted instrumentation they can adapt
• How OpenTelemetry Weaver formalizes these standards
• Real-world lessons from building and validating automated instrumentation

The approach is immediately applicable: teams can adopt the builder pattern today, and the AI agent technique works with any LLM API. By showing both the successes and mistakes in this journey, the talk helps others avoid common pitfalls when implementing automated observability.

For the OpenTelemetry community specifically, it demonstrates how AI can make semantic conventions more accessible and increase adoption of standardized telemetry practices.

---

## Additional Resources

**Demo Application & Code:**
- Commit Story (instrumented with OpenTelemetry): https://github.com/wiggitywhitney/commit-story
- The /add-telemetry agent command: https://github.com/wiggitywhitney/commit-story/blob/main/.claude/commands/add-telemetry.md

**Previous Speaking Engagements:**

KubeCon & CloudNativeCon EU 2025 London:
- Choose Your Own Adventure: The Dignified Pursuit of a Developer Platform
  https://youtu.be/hnmtjCkO8FE
- Platform Engineering Day Panel: Are You Ready for Platform Adoption, or Are You Setting Yourself up for Failure?
  https://youtu.be/ESuFV_7p0lk

KubeCon & CloudNativeCon NA 2024 Salt Lake City:
- Choose Your Own Adventure: The Observability Odyssey
  https://youtu.be/R3CFETvCBFU
- Exploring eBPF Use Cases in Cloud-Native Security
  https://youtu.be/towNkbPMDjE

KubeCon & CloudNativeCon EU 2024 Paris:
- Choose Your Own Adventure: The Struggle for Security
  https://youtu.be/sCyCmV0YrKw
- Platform Engineering Day: Sometimes, Lipstick Is Exactly What a Pig Needs!
  https://youtu.be/VhloarnpxVo

KubeCon & CloudNativeCon NA 2023 Chicago:
- Security Showdown: The Overconfident Operator Vs the Nefarious Ne'er-Do-Well
  https://youtu.be/Y1rJY_UlLmM
- Humans of Cloud Native Panel – Finding Your Way in #TeamCloudNative
  https://youtu.be/cMwjUbDh4Ig
- AppDeveloperCon: Secret Word of the Day: Platforms!
  https://youtu.be/HsOnpRfMa4U

KubeCon & CloudNativeCon China 2023 Shanghai:
- Choose Your Own Adventure: The Perilous Passage to Production
  https://youtu.be/RMTgMKpsAws

KubeCon & CloudNativeCon EU 2023 Amsterdam:
- Choose Your Own Adventure: The Treacherous Trek to Development
  https://youtu.be/gZdEvlW-XHY

KubeCon & CloudNativeCon NA 2022 Detroit:
- Keynote: What a RUSH! Let's Deploy Straight to Production!
  https://youtu.be/eJG7uIU9NpM

---

## Talk Outline (Draft)

### Introduction (3 min)
- What is Commit Story? (But that's not the point)
- The real question: Can telemetry inform AI coding assistants?

### The Journey (15 min)
1. **Phase 1: Documentation** (3 min)
   - Created 380-line TELEMETRY.md
   - Problem: Nobody reads it, standards drift

2. **Phase 2: Shared Library** (4 min)
   - Built standards.js with builder pattern
   - Zero hardcoded strings
   - Problem: Still manual, still error-prone

3. **Phase 3: AI Agent** (8 min)
   - The /add-telemetry command
   - How it works: discover → research → extend → instrument → validate
   - Real example: 3 functions instrumented in < 5 minutes
   - 100% Datadog validation

### Live Demo (10 min)
1. Show Weaver schema definition
2. Run /add-telemetry in commit-story
3. Run same agent in different codebase
4. Show Datadog validation

### Lessons Learned (5 min)
- What worked: Automation > documentation
- What surprised: Dual emission pattern
- What failed: Early attempts without validation

### The Weaver Connection (4 min)
- Why schemas matter
- How Weaver enables discoverability
- The future: Schema-driven observability

### Q&A (3 min)

---

## Technical Requirements

- Live demo environment with:
  - Two codebases (commit-story + one other)
  - Weaver installed
  - Claude API access
  - Datadog account for validation queries
- Screen recording backup in case of live demo issues
- Code examples pre-loaded for quick reference

---

## Key Takeaways

1. Documentation alone doesn't enforce standards
2. AI can research and apply conventions automatically
3. Validation is non-negotiable (100% Datadog verification)
4. Weaver schemas make conventions discoverable across codebases
5. The builder pattern works today, even without AI

---

## Status

- ✅ AI agent completed and validated (PRD-9, September 2025)
- ✅ Working in commit-story with 100% Datadog validation
- ✅ Used successfully in other repositories
- 🚧 Weaver integration in progress (planned for talk date)
- 🚧 Multi-codebase demo preparation

---

## Target Audience

- Platform engineers managing observability standards
- Developers struggling with telemetry consistency
- Teams interested in AI-assisted development workflows
- OpenTelemetry practitioners exploring automation
- Anyone who's written a standards document that nobody follows

---

## Why This Talk Matters

Every organization faces the challenge of maintaining observability standards at scale. This talk shows a working solution that combines:
- Practical patterns teams can adopt immediately
- AI automation that actually works in production
- Industry-standard tools (OpenTelemetry Weaver)
- Real-world validation and lessons learned

It's not theoretical—it's a field report from building and using these tools in production, including the mistakes and surprises along the way.
