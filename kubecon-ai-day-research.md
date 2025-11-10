# Cloud Native + Kubernetes AI Day Research

## KubeCon North America 2025 - Atlanta, GA
**Date:** November 10, 2025
**Location:** Building B | Level 4 | B401-402

---

## Event Overview

Cloud Native & Kubernetes AI Day is a co-located event bringing together AI/ML, High Performance Computing (HPC), and cloud-native communities. Previously separate events (Batch/HPC and Cloud Native AI days) have merged due to overlapping requirements and interests.

### Main Theme: "Agent"
Focus on Agentic AI and the cloud-native infrastructure supporting it.

### Format
- 10 full sessions with Q&A time
- 4 lightning talks
- Breakout discussions
- Mix of researchers, project maintainers, and end users sharing practical experiences

---

## Key Topics & Learning Areas

### 1. Large Language Models (LLMs)
- Deployment and scaling practices
- Production considerations
- Infrastructure requirements

### 2. Graph RAGs (Retrieval-Augmented Generation)
- Implementation strategies
- Integration with cloud-native systems
- Addressing memory and context limitations

### 3. Ethical Considerations in AI
- Best practices for responsible AI deployment
- Governance frameworks

### 4. AI/ML Workloads on Kubernetes
- Running batch computing and HPC workloads
- Cloud-native infrastructure requirements
- Success stories and challenges from real end users

### 5. Agentic AI Infrastructure
- Systems that retain data and adapt over time
- Autonomous operation in production workflows
- State management and learning capabilities

---

## The MIT GenAI Divide Study

### Study Details
**Title:** The GenAI Divide: State of AI in Business 2025
**Organization:** MIT NANDA (Networked Agents And Decentralized Architecture)
**Authors:** Aditya Challapally, Chris Pease, Ramesh Raskar, Pradyumna Chari
**Publication Date:** August 2025
**Report Link:** https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf

### Research Methodology
- Systematic review of over 300 publicly disclosed AI initiatives
- Structured interviews with representatives from 52 organizations
- Survey responses from 153 senior leaders
- Data collected across four major industry conferences

---

## Key Findings

### The 95% Failure Rate
Despite $30-40 billion in enterprise investment, **95% of generative AI projects yield no measurable business return on P&L**.

- Only 5% of AI pilot programs achieve rapid revenue acceleration
- Only 5% of custom enterprise AI tools reach production
- The vast majority stall with little to no measurable impact

### Root Causes
The core issue is **not** insufficient infrastructure, learning, or talent. Instead, failures stem from:
- Inability of AI systems to retain data
- Lack of adaptation capabilities
- No learning over time
- Flawed enterprise integration

### Build vs. Buy Success Rates
- **Vendor partnerships:** 67% success rate
- **Internal builds:** 33% success rate (only one-third as often)

---

## Investment Misdirection

### Where Money is Going (And Failing)
**50-70% of GenAI budgets** allocated to **sales and marketing initiatives**:
- Primarily customer-facing/revenue-generating projects
- Largely failing to deliver measurable P&L impact
- Focus on chatbots, customer service automation, recommendation systems

### Where Success is Actually Happening (That 5%)
**Back-office automation** delivering real ROI:
- **$2-10M savings** from eliminating BPO contracts
- **30% cuts** in agency spend
- Replacing expensive consultants with AI-powered internal capabilities
- Focus areas: operations, finance, procurement

### Industry-Specific Results
- **Material impact:** Technology and Media/Telecom sectors only
- **Inconsequential results:** Healthcare, Financial Services, Manufacturing

---

## The Two Categories of AI Initiatives

### 1. Product Features (External/Revenue-Generating)
**"We're building GenAI into our product to sell"**

Challenges:
- Chatbots that frustrate users
- "AI-powered" features that don't improve conversion
- Hard to measure incremental revenue
- High infrastructure costs eating margins
- Compliance and liability concerns
- Need for near-perfection in customer-facing contexts

This is where **most failures** occur.

### 2. Internal Tooling (Productivity/Cost Reduction)
**"Our teams use AI tools in their workflow"**

Success factors:
- Clear baselines to measure against (time-to-completion, throughput)
- Lower stakes (human in the loop can catch mistakes)
- Faster feedback loops
- More tolerance for imperfection
- Examples: GitHub Copilot, contract review, document processing

This is where the **5% successes** are concentrated.

---

## General-Purpose Tool Adoption

### Current State
- **80%+ of organizations** have explored or piloted ChatGPT/Copilot
- Primarily for individual productivity rather than measurable business returns

### Enterprise-Grade Systems
- **60% of organizations** evaluated enterprise-grade systems
- Only **20%** reached pilot stage
- Only **5%** reached production

### Key Limitation
Consumer LLM tools excel for drafting but fail for mission-critical work due to lacking memory and learning capabilities.

---

## How Cloud Native + Kubernetes AI Day Addresses These Failures

### 1. Agentic AI Infrastructure (Main Theme)
**Problem:** MIT study shows failures stem from "inability of AI systems to retain data, to adapt, and to learn over time"

**Solution:** Agentic AI architecture designed to:
- Maintain state and memory
- Learn and adapt from interactions
- Operate autonomously in production workflows

This addresses the **exact infrastructure gap** causing the 95% failure rate.

### 2. Production Deployment Challenges
**Problem:** Only 5% of custom enterprise AI tools reach production

**Topics:**
- Moving from pilot to production at scale
- Real-world case studies of successful deployments
- Infrastructure patterns that work in enterprise environments

### 3. MLOps on Kubernetes
**Problem:** Internal builds succeed only 33% vs. vendor partnerships at 67%

**Topics:**
- When to build vs. buy
- Integration patterns with vendor solutions
- Building AI infrastructure that doesn't fail

### 4. Back-Office Automation Infrastructure
**Problem:** Investment misdirection - money going to sales/marketing instead of back-office where ROI is proven

**Topics:**
- Batch processing and HPC workloads
- Automating operational workflows
- Cost-effective AI for internal operations

### 5. Observability & Cost Management
**Problem:** Can't prove P&L impact without measurement

**Topics:**
- Monitoring AI/ML workloads
- Cost attribution and optimization
- Performance metrics that matter

### 6. Graph RAGs
**Problem:** "Lack of memory and customization" in chatbots

**Solution:** RAG systems allow:
- Context retention across sessions
- Integration with enterprise knowledge bases
- Custom behavior for critical workflows

---

## Key Questions to Ask at Sessions

1. **"How do you measure P&L impact from this infrastructure?"**
   - Since 95% can't prove ROI

2. **"What's your pilot-to-production success rate?"**
   - Since only 5% make it to production

3. **"How does this handle state/memory/learning over time?"**
   - The core technical gap MIT identified

4. **"Is this better for back-office automation or customer-facing features?"**
   - Since there's a clear ROI gap between these use cases

---

## Key Takeaways

### Is AI Here to Stay or Hype?

**Both:** The underlying technology represents genuine capability advances, but expectations have been unrealistic.

**What's Real:**
- Transformers work and can do things not possible 5 years ago
- Inference costs have dropped ~90% in 2 years
- Infrastructure is maturing (cloud-native ecosystem catching up)

**What's Hype:**
- "AI will revolutionize everything immediately"
- "No code changes needed, just add AI"
- ROI without clear use cases or measurement frameworks

### The Sustainable Path Forward

The technology is here to stay, but **sustainable applications will be narrower and more specific** than current hype suggests.

Organizations succeeding are those:
- Picking specific, measurable use cases
- Building proper infrastructure (observability, cost management, governance)
- Treating AI as an engineering problem, not magic
- Focusing on back-office automation before customer-facing features

### Why This Conference Matters

Cloud Native + Kubernetes AI Day is literally about solving the infrastructure problems causing the 95% failure rate. It's the right place to understand:
- Why most companies are failing
- What the 5% are doing differently
- How to build AI systems that actually deliver business value
