# KubeCon Atlanta 2025: AI Observability & The GenAI Divide

## The Problem: 95% of Enterprise AI Pilots Are Failing

### MIT Study Overview
**Source**: MIT "GenAI Divide: State of AI in Business 2025" (August 2025)

**Research Scope**:
- 52 executive interviews
- 153 leader surveys
- 300+ public AI deployments analyzed

**Key Finding**: 95% of enterprise GenAI pilots failed to deliver measurable business impact or return on P&L.

### What Failed (The 95%)

**Internal AI Builds**:
- Companies building AI systems from scratch
- Centralized AI labs and R&D initiatives underperformed
- Enterprise-grade custom systems: 60% evaluated → 20% reached pilot → **only 5% went live**

**Large Workflow Replacements**:
- Attempting to automate entire processes at once
- Particularly in compliance, customer service, and regulated environments

**Key Failure Reasons**:
1. **Static System Limitations**: AI systems don't improve with use, don't retain feedback, don't adapt to edge cases
2. **Expectation Misalignment**: Flashy demos created unrealistic production timelines
3. **Measurement Problems**: Pursued visible metrics (deflection rates) rather than meaningful impact (CSAT, retention, resolution quality)
4. **Workflow Mismatch**: Large-scale replacements instead of targeted, specific problems

### What Worked (The 5%)

**Buying Vendor Tools**:
- **67% success rate** - twice as effective as internal builds
- Customizable, learning-capable systems from specialized vendors

**Back-Office Automation**:
- **$2-10M in annual savings**
- Document review, support tasks, pattern detection
- Low-complexity, high-volume tasks paired with human workers

**Shadow AI Economy**:
- **90% of workers use ChatGPT/Claude daily** for work tasks
- Only 40% have official company subscriptions
- Suggests Type 2 (productivity tools) IS working - just unofficially

## Type 1 vs Type 2 AI Projects

**Type 1: Building AI Products to Sell**
- Example: Adding AI-powered recommendations to SaaS products
- Requires: ML expertise, model management, production AI infrastructure
- **Much harder** - you're building and maintaining AI systems
- **This is where most of the 95% failures occurred**

**Type 2: Using AI Tools Internally**
- Example: Developers using GitHub Copilot/Claude Code for productivity
- Requires: Change management, security reviews, workflow integration
- **Should be easier** - you're consuming AI as a tool
- **Actually succeeding via shadow AI adoption**

## The Core Issue: Execution Failure, Not Technology Failure

Organizations lack:
1. Ability to measure AI impact
2. Knowledge of whether systems work in production
3. Feedback loops for improvement
4. Cost visibility and control
5. Quality metrics beyond "did it respond?"

## How Observability Solves the AI Pilot Problem

Observability is the **execution layer** that enables:

1. **Measuring Actual ROI**: Instrument AI systems to prove impact, not guess
2. **Feedback Loops**: Collect data to implement feedback manually since AI doesn't self-improve
3. **Cost Visibility**: Track token usage, API calls, resource consumption
4. **Quality Metrics**: Move beyond "did it respond?" to "did it respond well?"
5. **Shadow AI Discovery**: Observe what's actually being used in the organization

## KubeCon Atlanta 2025 Sessions That Address These Problems

### Monday, November 10
**Observability Day** (9:00 AM - 6:00 PM)
- Foundation for cloud-native observability
- OpenTelemetry, Prometheus, Fluentd, Fluent Bit
- Vendor-neutral best practices

### Tuesday, November 11

**"Taming Telemetry at Scale: Platform Blueprints for Consistent Observability"**
- **Time**: 11:15 AM - 11:45 AM
- **Speakers**: Nancy Chauhan (Agno) & Marino Wijay (Kong Inc.)
- **Problem Solved**: Internal builds fail because they don't scale or standardize. This provides patterns for consistent measurement across teams.
- **Why It Matters**: If different teams measure AI differently, you'll never prove ROI.

**"Instrumentation Score: The Difference Between Telemetry and Good Telemetry"**
- **Time**: 4:15 PM - 4:45 PM
- **Speakers**: Juraci Paixão Kröhling (OllyGarden) & Michele Mancioppi (Dash0)
- **Problem Solved**: Companies measure wrong things (deflection rates vs actual quality). This teaches how to assess whether telemetry measures what matters.
- **Why It Matters**: Can't fix "95% fail to deliver measurable impact" if measuring vanity metrics.
- **Priority**: **MUST ATTEND**

### Wednesday, November 12

**"Tracing the Untraceable: OpenTelemetry for 'Vibe-Coded' LLM Apps"**
- **Time**: 5:41 PM - 5:46 PM (Lightning Talk)
- **Speaker**: Pranay Prateek (SigNoz)
- **Problem Solved**: MIT study says "AI systems don't improve with use because they don't retain feedback." This addresses tracing non-deterministic LLM behavior.
- **Why It Matters**: THE core problem - how do you observe and measure something that gives different outputs each time?
- **Priority**: **MUST ATTEND**

**"UX Research Report: Prometheus and OTel's Resource Attributes"**
- **Time**: 2:15 PM - 2:45 PM
- **Speakers**: Victoria Nduka & Amy Super (Grafana Labs)
- **Problem Solved**: Research findings on telemetry attribute handling and user experience

### Thursday, November 13

**"Help! My LLM Is a Resource Hog"**
- **Time**: 2:30 PM - 3:00 PM
- **Speakers**: Aditya Soni (Forrester Research) & Hrittik Roy (Loft Labs)
- **Problem Solved**: Back-office automation works when cost-controlled ($2-10M savings). Teaches resource management for LLM workloads.
- **Why It Matters**: Token costs killed many pilots. Observable resource usage = controllable costs.
- **Priority**: **MUST ATTEND**

**"Resilient by Design: Building Durable AI Agents on Kubernetes"**
- **Speaker**: Yaron Schneider (Diagrid)
- **Problem Solved**: Building reliable AI systems on Kubernetes infrastructure

## Top 3 Priority Sessions

If attending only a few sessions, prioritize these:

1. **"Instrumentation Score"** (Tue 4:15 PM) - Teaches WHAT to measure
2. **"Tracing the Untraceable"** (Wed 5:41 PM) - Teaches HOW to measure LLMs
3. **"Help! My LLM Is a Resource Hog"** (Thu 2:30 PM) - Teaches cost control

These three directly address why 95% failed: **couldn't measure what mattered, couldn't trace AI behavior, couldn't control costs**.

## Additional Resources

**OpenTelemetry Observatory** (Expo Hall)
- Presented by Splunk
- Informal chats with maintainers
- SIG Office Hours
- Contribution opportunities

**Conference Details**:
- Full schedule: https://kccncna2025.sched.com/
- OpenTelemetry activities: https://opentelemetry.io/blog/2025/kubecon-na/

## Key Takeaways

1. **AI isn't hype, but implementation is hard**: The technology works; organizations struggle with execution
2. **Observability is the missing piece**: You can't improve what you can't measure
3. **Start small and targeted**: Back-office automation with clear ROI beats moonshots
4. **Buy > Build**: Vendor tools succeed 67% of the time vs 33% for internal builds
5. **Measure what matters**: Quality, retention, and resolution > deflection rates
6. **Shadow AI is real**: 90% of workers already use AI tools - observe and manage it

---

*Document created: November 10, 2025*
*Event: KubeCon + CloudNativeCon North America 2025, Atlanta*
*Data source: MIT "GenAI Divide: State of AI in Business 2025" study (August 2025)*
