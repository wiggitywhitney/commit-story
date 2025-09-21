# OpenTelemetry Telemetry Standards

Quick reference for telemetry patterns in the Commit Story application.

## Import Pattern
```javascript
import { OTEL } from './src/telemetry/standards.js';
```

**Note**: OpenTelemetry logs are automatically configured via `src/logging.js` and sent to Datadog with trace correlation.

**Dev Mode Control**: Narrative logging to Datadog is controlled by the `dev` flag in `commit-story.config.json`, independent of the `debug` flag.

## Basic Usage
```javascript
return await tracer.startActiveSpan(OTEL.span.ai.summary(), {
  attributes: {
    ...OTEL.attrs.genAI.request(model, temperature, messageCount),
    ...OTEL.attrs.commit(commitData)
  }
}, async (span) => {
  try {
    // Business logic
    span.setAttributes(OTEL.attrs.genAI.usage(response));
    return result;
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw error;
  }
});
```

## Narrative Logging
```javascript
import { createNarrativeLogger } from './src/utils/trace-logger.js';
const logger = createNarrativeLogger('operation.name');

logger.start('operation description', 'Starting process', { context });
logger.progress('operation description', 'Status update', { context });
logger.complete('operation description', 'Process finished', { context });
logger.error('operation description', 'Error occurred', error, { context });
```

Logs automatically sent to Datadog with trace correlation. Only outputs in debug mode.

## Attribute Namespaces

- **`gen_ai.*`** - AI operations (OpenTelemetry standard + extensions)
- **`commit_story.*`** - Application-specific attributes

## Available Patterns

All available span names and attribute builders are defined in `src/telemetry/standards.js`. Use the OTEL constant for all patterns:

### Span Names
Use `OTEL.span.*` builders for consistent span naming.

### Attribute Builders
Use `OTEL.attrs.*` builders for consistent attribute patterns.

**Examples of what builders return:**
```javascript
OTEL.attrs.genAI.request(model, temperature, messageCount)
// Returns: { 'gen_ai.request.model': model, 'gen_ai.request.temperature': temperature, ... }

OTEL.attrs.genAI.usage(response)
// Returns: { 'gen_ai.usage.input_tokens': tokens, 'gen_ai.usage.output_tokens': tokens, ... }

OTEL.attrs.commit(commitData)
// Returns: { 'commit_story.commit.hash': data.hash, 'commit_story.commit.message': data.message, ... }

OTEL.attrs.context(contextData)
// Returns: { 'commit_story.context.filtered_messages': count, 'commit_story.context.token_reduction': percent, ... }
```

### Provider Detection
```javascript
import { getProviderFromModel } from './src/telemetry/standards.js';

getProviderFromModel('gpt-4o-mini');    // 'openai'
getProviderFromModel('claude-3');       // 'anthropic'
```

## Validation
```bash
# Check for standards violations in source code
npm run validate:telemetry

# Test that spans are actually created properly
npm run validate:trace
```

## Rules

1. **Always use builders** - No hardcoded attribute strings outside standards.js
2. **Use underscores** - Span names and attribute suffixes use underscores, not hyphens
3. **Consistent naming** - Same logical attribute must have same name across files
4. **Proper namespaces** - `gen_ai.*` for AI, `commit_story.*` for application logic
5. **Dev mode control** - Narrative logs to Datadog controlled by `dev` flag in config (independent of `debug`)
6. **Dual emission** - Key business metrics emitted as both span attributes and queryable metrics

## Metrics Emission

Emit key business and performance data as both span attributes and queryable metrics using the dual emission pattern:

### Dual Emission Pattern
```javascript
// 1. Set span attributes (for debugging and trace context)
const chatData = { userMessagesOverTwenty: count };
span.setAttributes(OTEL.attrs.chat(chatData));

// 2. Emit metrics (for aggregation and dashboards)
OTEL.metrics.gauge('commit_story.chat.user_messages_over_twenty', count, {
  service: 'commit-story-dev'
});
```

### Metric Types and Usage

**Gauge** - Point-in-time values:
```javascript
OTEL.metrics.gauge('commit_story.chat.total_messages', messageCount);
OTEL.metrics.gauge('commit_story.journal.entry_size', entrySize);
```

**Counter** - Incrementing values:
```javascript
OTEL.metrics.counter('commit_story.journal.entries_saved', 1);
OTEL.metrics.counter('commit_story.ai.requests_total', 1);
```

**Histogram** - Distribution data:
```javascript
OTEL.metrics.histogram('commit_story.journal.write_duration_ms', duration);
OTEL.metrics.histogram('commit_story.ai.response_time_ms', responseTime);
```

### When to Emit Metrics

- **Business KPIs**: User message counts, generation success rates
- **Performance indicators**: Duration, token counts, file sizes
- **Error rates**: Failed operations, timeout counts
- **Resource utilization**: Memory usage, processing times

### Metric Naming Conventions

Follow OpenTelemetry semantic conventions:
- Use hierarchical naming: `commit_story.category.metric_name`
- Units in suffix: `_ms` for milliseconds, `_bytes` for bytes
- Dimensionless counts: no unit suffix
- Consistent with span attribute names for correlation

### Available Metrics

Current metrics automatically emitted:
- `commit_story.chat.user_messages_over_twenty` (gauge)
- `commit_story.chat.total_messages` (gauge)
- `commit_story.chat.raw_messages_count` (gauge)
- `commit_story.journal.entry_size` (gauge)
- `commit_story.journal.write_duration_ms` (histogram)
- `commit_story.journal.entries_saved` (counter)
- `commit_story.sections.*_length` (gauge)

### Querying Metrics

Access via Datadog API:
```javascript
// Average user messages across sessions
avg:commit_story.chat.user_messages_over_twenty{*}

// 95th percentile journal entry size
p95:commit_story.journal.entry_size{*}

// Total entries saved per day
sum:commit_story.journal.entries_saved{*}.rollup(sum, 86400)
```

## Configuration Flags

### Debug Mode (`debug: true`)
- Runs journal generation in foreground
- Shows detailed logging during commits
- Used for troubleshooting hook execution

### Dev Mode (`dev: true`)
- Enables narrative logging output to Datadog
- Independent from debug mode
- Controls telemetry visibility in development

## Migration Pattern

When adding telemetry to new components:

1. Import: `import { OTEL } from '../telemetry/standards.js';`
2. Use span builder: `OTEL.span.category.operation()`
3. Use attribute builders: `OTEL.attrs.category(data)`
4. **Add dual emission**: Emit metrics alongside span attributes
5. Run validation: `npm run validate:telemetry`

For new patterns, extend the standards module first, then use the new builders.