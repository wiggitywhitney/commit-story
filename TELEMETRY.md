# Telemetry Implementation Guide

AI-friendly reference for adding OpenTelemetry instrumentation to commit-story. All patterns use official semantic conventions and our builder API. Optimized for AI-assisted development.

## Quick Start

```javascript
import { OTEL } from './telemetry/standards.js';
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('commit-story', '1.0.0');
```

## Core Patterns

### Pattern 1: Basic Span with Semantic Conventions

```javascript
// REQUIRED: Add these imports at top of file
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { OTEL } from '../telemetry/standards.js';

// REQUIRED: Initialize tracer (add this to your file)
const tracer = trace.getTracer('commit-story', '1.0.0');

export async function myFunction(data) {
  return tracer.startActiveSpan(OTEL.span.collectors.claude(), { // Use actual span name
    attributes: {
      ...OTEL.attrs.commit(data),
      'code.function': 'myFunction'  // REQUIRED: Function name for APM navigation
    }
  }, async (span) => {
    try {
      // Your logic here
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    }
  });
}
```

### Pattern 2: Dual Emission (Spans + Metrics)

```javascript
// IMPORTS: Already included from Pattern 1 setup

// 1. Span attributes (trace debugging)
const attrs = OTEL.attrs.chat(chatData);
span.setAttributes(attrs);

// 2. Metrics (dashboards/alerting) - use OTEL.metrics builders
OTEL.metrics.gauge('commit_story.chat.messages_count', chatData.count);
OTEL.metrics.counter('commit_story.operations.completed', 1);
OTEL.metrics.histogram('commit_story.operation.duration_ms', executionTime);
```

### Pattern 3: AI Operations (GenAI Conventions)

```javascript
return tracer.startActiveSpan(OTEL.span.ai.summary(), {
  attributes: {
    ...OTEL.attrs.genAI.request(model, temperature, messages.length),
    'code.function': 'generateSummary'
  }
}, async (span) => {
  const response = await openai.chat.completions.create(request);

  // Add response metrics
  span.setAttributes(OTEL.attrs.genAI.usage(response));
  return response;
});
```

### Pattern 4: File Operations (Semantic Conventions)

```javascript
return tracer.startActiveSpan(OTEL.span.utils.journal_paths.create_directory(), {
  attributes: {
    'code.function': 'createDirectory',
    'code.filepath': dirPath  // File semantic convention
  }
}, async (span) => {
  // File operation logic
});
```

### Pattern 5: MCP Context Propagation

```javascript
// Extract context from MCP request
extractTraceContext(request) {
  try {
    const headers = request.meta?.headers || request.headers || {};
    return propagation.extract(context.active(), headers);
  } catch (error) {
    return context.active();
  }
}

// Use in MCP handlers
this.server.setRequestHandler(Schema, async (request) => {
  const extractedContext = this.extractTraceContext(request);

  return context.with(extractedContext, () => {
    return tracer.startActiveSpan(OTEL.span.mcp.tool_invocation(), {
      attributes: {
        ...OTEL.attrs.mcp.server({ method: toolName }),
        'code.function': 'handleTool'
      }
    }, async (span) => {
      // Tool logic
    });
  });
});
```

## Semantic Convention Standards

### Official OpenTelemetry Attributes (Always Use These)

```javascript
// Code attributes (enables APM navigation)
'code.function': 'functionName'     // REQUIRED for all spans
'code.filepath': '/path/to/file.js' // For file operations

// GenAI attributes (official AI semantic conventions)
'gen_ai.request.model': 'gpt-4o-mini'
'gen_ai.provider.name': 'openai'
'gen_ai.usage.prompt_tokens': 150

// RPC attributes (for MCP operations)
'rpc.system': 'jsonrpc'
'rpc.service': 'mcp_server'
'rpc.method': 'journal_add_reflection'
```

### Custom Application Attributes

```javascript
// Use commit_story.* namespace for application-specific data
'commit_story.commit.hash': 'abc123'
'commit_story.chat.messages_count': 42
'commit_story.journal.file_path': '/path/to/journal.md'
```

## Builder Reference

### Span Names (Always use builders)
```javascript
// Application operations
OTEL.span.main()                    // commit_story.main
OTEL.span.connectivity()            // commit_story.connectivity_test

// AI operations
OTEL.span.ai.summary()             // summary.generate
OTEL.span.ai.dialogue()            // dialogue.generate

// Data operations
OTEL.span.collectors.claude()      // claude.collect_messages
OTEL.span.collectors.git()         // git.collect_data

// Utilities
OTEL.span.utils.journal_paths.generate_path()  // utils.journal_paths.generate_path
OTEL.span.config.openai()          // config.openai
```

### Attribute Builders
```javascript
// AI operations
OTEL.attrs.genAI.request(model, temperature, msgCount)
OTEL.attrs.genAI.usage(response)

// Application data
OTEL.attrs.commit(commitData)       // Git commit attributes
OTEL.attrs.chat(chatData)          // Chat message metrics
OTEL.attrs.context(contextData)     // Context processing stats

// MCP operations
OTEL.attrs.mcp.server(serverData)   // MCP server attributes
OTEL.attrs.mcp.tool(toolData)       // Tool execution attributes
```

### Metrics
```javascript
OTEL.metrics.gauge(name, value, attributes)     // Point-in-time values
OTEL.metrics.counter(name, value, attributes)   // Incrementing counts
OTEL.metrics.histogram(name, value, attributes) // Distribution data
```

## Implementation Checklist

For every new span, ensure it has:

- ✅ **Semantic span name** using `OTEL.span.*` builder
- ✅ **code.function attribute** for APM navigation
- ✅ **Proper error handling** with `recordException()` and status
- ✅ **Relevant attributes** using `OTEL.attrs.*` builders
- ✅ **Metrics emission** for key performance indicators

## Finding Existing Metrics & Spans

Before creating new telemetry, check what already exists to avoid duplication:

### Discovery Commands
```bash
# Find existing metrics in code
grep -r "OTEL.metrics" src/
grep -r "commit_story\." src/telemetry/standards.js

# Find existing spans
grep -r "OTEL.span" src/
grep -r "startActiveSpan" src/

# Query Datadog for active metrics (use in Datadog UI)
service:commit-story-dev
```

### Existing Metric Categories
- `commit_story.journal.*` - Journal operations (entries_saved, entry_size, write_duration_ms)
- `commit_story.chat.*` - Chat processing (messages_count, total_messages, user_messages)
- `commit_story.collector.*` - Data collection (files_found, messages_collected, diff_size_chars)
- `commit_story.context.*` - Context processing (token_reduction, filtered_messages)
- `commit_story.utils.*` - Utility functions (processing_duration_ms, selections_found)
- `commit_story.mcp.*` - MCP operations (tool_invocations, server_errors)
- `gen_ai.*` - AI operations (official OpenTelemetry semantic conventions)

### Existing Span Categories
- `commit_story.main`, `commit_story.connectivity_test` - Application lifecycle
- `summary.generate`, `dialogue.generate`, `technical_decisions.generate` - AI generation
- `claude.collect_messages`, `git.collect_data` - Data collection
- `journal.generate_entry`, `journal.save_entry` - Journal operations
- `utils.journal_paths.*`, `config.openai` - Utilities
- `mcp.server_*`, `mcp.tool_*` - MCP operations

## Validation

```bash
# Validate telemetry standards compliance
node scripts/validate-telemetry.js

# Generate test traces
npm run trace:test
```

## Copy-Paste Examples (Real Working Code)

### File Template - Complete Setup
```javascript
// 1. REQUIRED IMPORTS (top of file)
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { OTEL } from '../telemetry/standards.js';
import { createNarrativeLogger } from '../utils/trace-logger.js'; // Optional

// 2. REQUIRED TRACER (after imports)
const tracer = trace.getTracer('commit-story', '1.0.0');

// 3. FUNCTION WITH SPAN (copy this pattern)
export async function yourFunction(data) {
  return await tracer.startActiveSpan(OTEL.span.collectors.claude(), {
    attributes: {
      'code.function': 'yourFunction', // REQUIRED: Exact function name
      ...OTEL.attrs.commit(data)       // Optional: Add relevant attributes
    }
  }, async (span) => {
    try {
      // Your business logic here
      const result = await doWork(data);

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    }
  });
}
```

### Real Examples from Codebase

**Git Collector Pattern:**
```javascript
export function getLatestCommitData(commitRef = 'HEAD') {
  return tracer.startActiveSpan(OTEL.span.collectors.git(), {
    attributes: {
      'code.function': 'getLatestCommitData',
      [`${OTEL.NAMESPACE}.collector.commit_ref`]: commitRef
    }
  }, (span) => {
    // Git collection logic
  });
}
```

**Journal Manager Pattern:**
```javascript
export async function saveJournalEntry(commitHash, timestamp, commitMessage, sections) {
  return await tracer.startActiveSpan(OTEL.span.journal.save(), {
    attributes: {
      'code.function': 'saveJournalEntry',
      [`${OTEL.NAMESPACE}.commit.hash`]: commitHash,
      [`${OTEL.NAMESPACE}.commit.message`]: commitMessage?.split('\n')[0]
    }
  }, async (span) => {
    // Save logic with dual metrics emission
    const attrs = OTEL.attrs.journal.save(saveData);
    span.setAttributes(attrs);
    OTEL.metrics.counter('commit_story.journal.entries_saved', 1);
  });
}
```

**File Utilities Pattern:**
```javascript
export async function ensureJournalDirectory(filePath) {
  return await tracer.startActiveSpan(OTEL.span.utils.journal_paths.create_directory(), {
    attributes: {
      'code.function': 'ensureJournalDirectory',
      'code.filepath': filePath  // File semantic convention
    }
  }, async (span) => {
    // Directory creation logic
  });
}
```

## Standards Summary

1. **Always use builders** - No hardcoded strings
2. **Always add code.function** - Enables APM code navigation
3. **Use official semantic conventions** - OpenTelemetry standard attributes
4. **Dual emission pattern** - Span attributes + metrics for key data
5. **Proper error handling** - Record exceptions and set error status
6. **Consistent naming** - Use underscores, follow existing patterns

## Common Queries for AI Assistants

```javascript
// Find spans by function
service:commit-story-dev @code.function:"generateSummary"

// Find AI operations
service:commit-story-dev @gen_ai.provider.name:"openai"

// Find MCP operations
service:commit-story-dev @rpc.service:"mcp_server"

// Find file operations
service:commit-story-dev @code.filepath:*

// Find errors
service:commit-story-dev status:error
```