# Datadog MCP Server Setup & Troubleshooting Guide

This guide documents the challenges and solutions encountered while setting up the Datadog MCP server for the Commit Story project (September 2025).

## Overview

Getting the Datadog MCP server connected and working took approximately **3 hours of debugging** across multiple sessions. The main issues were: agent configuration, MCP authentication, and timestamp formatting.

---

## Challenge 1: MCP Server Access Restrictions ⛔

### Problem
The Datadog MCP server was in preview and not publicly available. The server was non-functional until access was granted.

### Solution
1. Request access from Datadog
2. Document the access request process in your PRD
3. Wait for Datadog approval
4. Server became operational by September 20, 2025

**Key Insight**: This is a preview feature - your friend needs to ensure they have access first before troubleshooting other issues.

---

## Challenge 2: Authentication Configuration 🔐

### Problem
MCP authentication setup required multiple credentials:
- Both API key AND application key needed
- Organization ID needed secure storage
- Unclear documentation on what credentials were required

### Solutions
1. **Create Datadog Application Key** (in addition to API key)
   - Go to Datadog UI → Organization Settings → Application Keys
   - Generate new application key

2. **Store credentials securely**
   - API key: `DD_API_KEY`
   - Application key: `DD_APP_KEY`
   - Organization ID: Store in local `.env` file (keep out of git)

3. **Use secrets management**
   - Used Teller for secrets management
   - Integrated with Google Secret Manager
   - Created `.teller.yml` configuration

**Key Insight**: You need BOTH keys. The API key alone is not sufficient for MCP server access.

---

## Challenge 3: Datadog Agent Configuration 🔧

### Problem
Datadog Agent was not receiving traces/logs properly, even though the application was sending them.

### Solutions

#### 1. Verify Agent is Running
```bash
datadog-agent status
```

#### 2. Enable OTLP Ingestion
Edit Datadog Agent configuration (`datadog.yaml`):
```yaml
otlp_config:
  receiver:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
```

#### 3. Add API Key to Agent Config
Ensure `datadog.yaml` contains:
```yaml
api_key: <your-datadog-api-key>
```

#### 4. Verify OTLP Receiver is Listening
```bash
# Check agent is listening on OTLP ports
lsof -i :4318
lsof -i :4317
```

#### 5. Test Connection
Send traces to `localhost:4318` (HTTP) or `localhost:4317` (gRPC)

**Key Insight**: The Datadog Agent acts as an intermediary. Even if your app sends telemetry correctly, the agent must be configured to receive and forward it.

---

## Challenge 4: Timestamp Issues ⏰

### Problem
Logs and metrics were being sent to Datadog but appeared with no timestamps, making them unusable. This was similar to an earlier issue with metrics.

### Debug Process
1. Checked what was being sent to Datadog endpoint
2. Added debugging to see exact payload
3. Compared sent format vs. Datadog's expected format
4. Discovered timestamp overflow/formatting issues

### Solution
Fixed timestamp formatting to match OpenTelemetry and Datadog requirements (nanosecond precision, proper Unix timestamp format).

**Key Insight**: Even if data appears in Datadog, check that timestamps are valid. Invalid timestamps make data unqueryable.

---

## Challenge 5: Missing Root Spans 🔍

### Problem
Child spans appeared in Datadog traces, but the root span `commit_story.main` was missing entirely.

### Debug Process
1. Confirmed root span was being created in code
2. Verified child spans were exporting correctly
3. Traced execution flow
4. Discovered timing issue with `gracefulShutdown`

### Solution
The root span was being flushed before completion due to shutdown timing:
- Fixed double shutdown issues
- Adjusted function call sequence
- Ensured root span completes before shutdown triggers

**Key Insight**: OpenTelemetry span lifecycle matters. Spans must complete and be flushed before the process exits.

---

## Challenge 6: Query Validation Issues 🔎

### Problem
When validating telemetry with MCP queries, searches returned no results even though data existed in Datadog.

### Solutions
1. **Fix query syntax errors**
   - Remove invalid wildcard characters
   - Use correct Datadog query syntax

2. **Use broader search approaches**
   - Initial queries were too narrow/specific
   - Start with broader searches, then narrow down
   - Example: Search for `service:commit-story-dev` before adding specific attributes

**Key Insight**: If you don't see data, try a broader query first. The data might be there but your query is too specific.

---

## Why Datadog Agent Instead of OTLP Direct Endpoint?

**Decision Rationale** (from September 8, 2025 journal entry):

> "Concluded that the Datadog Agent is preferable for the current project due to its **integration with the Datadog MCP server**."

The key factor was MCP server integration. While presenting at KubeCon and wanting to keep things OSS-friendly, the integration capabilities with the MCP server ultimately tipped the decision in favor of the Datadog Agent.

---

## Complete Setup Checklist ✅

Use this checklist to help your friend get connected:

### Pre-requisites
- [ ] Request and receive Datadog MCP server preview access
- [ ] Have Datadog account with appropriate permissions

### Credentials
- [ ] Create Datadog API key
- [ ] Create Datadog Application key
- [ ] Note your organization ID
- [ ] Store credentials securely (not in git)

### Datadog Agent Setup
- [ ] Install Datadog Agent
- [ ] Configure `datadog.yaml` with API key
- [ ] Enable OTLP receiver in agent config
- [ ] Restart Datadog Agent
- [ ] Verify agent status: `datadog-agent status`
- [ ] Confirm OTLP ports listening (4317, 4318)

### Application Configuration
- [ ] Configure OpenTelemetry SDK
- [ ] Set OTLP exporter endpoint to `localhost:4318` (or 4317 for gRPC)
- [ ] Ensure proper timestamp formatting (nanosecond precision)
- [ ] Implement graceful shutdown for span flushing

### Validation
- [ ] Send test trace from application
- [ ] Check Datadog Agent logs for incoming telemetry
- [ ] Verify traces appear in Datadog UI (APM → Traces)
- [ ] Test MCP server queries
- [ ] Verify log-trace correlation

---

## Debugging Timeline Summary

**September 8**: Agent configuration and OTLP setup
**September 18**: MCP authentication troubleshooting
**September 20**: 3 hours debugging logs (agent config + timestamps)
**September 21**: Fixed missing root spans and metrics issues
**September 28**: Query validation improvements

**Total debugging time**: Approximately 3+ hours across multiple sessions

---

## Key Takeaways

1. **MCP server is preview** - Access must be granted first
2. **Two keys required** - API key + Application key (not just API key)
3. **Agent is intermediary** - Must be running and configured correctly
4. **Timestamps matter** - Invalid timestamps make data unusable
5. **Start broad** - Use broad queries first, then narrow down
6. **Shutdown timing** - Ensure spans complete before process exits

---

## Quick Start for Your Friend

If your friend is stuck, have them check these in order:

1. **Access**: Do they have MCP server preview access?
2. **Keys**: Do they have both API key AND application key?
3. **Agent**: Is `datadog-agent status` showing running/healthy?
4. **OTLP**: Is OTLP receiver enabled in agent config?
5. **Connection**: Can they see ANY traces in Datadog UI?
6. **Queries**: Are they using broad enough search queries?

---

## Additional Resources

- [Datadog Agent Configuration](https://docs.datadoghq.com/agent/)
- [OpenTelemetry OTLP Exporter](https://opentelemetry.io/docs/specs/otlp/)
- [Datadog MCP Server Documentation](https://docs.datadoghq.com/bits_ai/mcp_server/setup/)

---

*This guide was generated from actual debugging sessions documented in the Commit Story project journal (September 2025).*
