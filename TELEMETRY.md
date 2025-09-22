# OpenTelemetry Telemetry Standards

Quick reference for adding telemetry to commit-story application.

## Initialization

Import `src/tracing.js` at the start of your application to initialize OpenTelemetry traces and metrics.

```javascript
import { OTEL } from './src/telemetry/standards.js';
```

## What Already Exists

### Existing Spans
```javascript
// Main application
commit_story.main
commit_story.connectivity_test

// Context operations
context.gather_for_commit
context.filter_messages

// AI generation
summary.generate
dialogue.generate
technical_decisions.generate

// Data collection
claude.collect_messages
git.collect_data

// Journal operations
journal.generate_entry
journal.save_entry

// Utilities
utils.select_context
utils.journal_paths.generate_path
utils.journal_paths.create_directory
utils.journal_paths.format_date
utils.journal_paths.format_timestamp
config.openai
filters.redact_sensitive_data
```

### Existing Metrics
```javascript
// Chat metrics (gauge)
commit_story.chat.assistant_messages
commit_story.chat.messages_count
commit_story.chat.raw_messages_count
commit_story.chat.total_messages
commit_story.chat.user_messages
commit_story.chat.user_messages_over_twenty

// Journal metrics
commit_story.journal.entries_saved (counter)
commit_story.journal.entry_size (gauge)
commit_story.journal.write_duration_ms (histogram)

// Section metrics (gauge)
commit_story.sections.summary_length
commit_story.sections.dialogue_length
commit_story.sections.technical_decisions_length
commit_story.sections.commit_details_length
commit_story.sections.total_count

// Collector metrics (gauge)
commit_story.collector.diff_size_chars
commit_story.collector.diff_size_lines
commit_story.collector.message_redacted
commit_story.collector.files_found
commit_story.collector.files_processed
commit_story.collector.files_skipped
commit_story.collector.total_lines
commit_story.collector.messages_collected
commit_story.collector.messages_filtered

// Context processing metrics (gauge)
commit_story.context.original_messages
commit_story.context.filtered_messages
commit_story.context.removed_messages
commit_story.context.token_reduction
commit_story.context.token_reduction_percent
commit_story.context.original_chat_tokens
commit_story.context.filtered_chat_tokens
commit_story.context.diff_tokens
commit_story.context.total_estimated_tokens
commit_story.context.final_messages
commit_story.context.final_chat_tokens
commit_story.context.aggressive_filtering

// Context integration metrics (gauge) - Previous commit tracking and window analysis
commit_story.previous_commit.timestamp_ms

// AI Generation metrics (gauge) - OpenTelemetry GenAI semantic conventions
gen_ai.request.model
gen_ai.request.temperature
gen_ai.request.messages_count
gen_ai.operation.name
gen_ai.provider.name
gen_ai.response.model
gen_ai.response.message_length
gen_ai.usage.prompt_tokens
gen_ai.usage.completion_tokens

// Utility metrics (gauge) - Utility function performance and behavior
commit_story.utils.selections_found
commit_story.utils.selections_requested
commit_story.utils.description_length
commit_story.utils.processing_duration_ms
commit_story.utils.path_generated (counter)
commit_story.utils.directory_operations (counter)
commit_story.utils.directory_operation_duration_ms (histogram)
commit_story.utils.directories_created (counter)
commit_story.utils.directory_errors (counter)
commit_story.config.api_key_valid
commit_story.config.init_duration_ms
commit_story.generation.completed

// Main execution flow metrics (gauge) - End-to-end operation visibility
commit_story.journal.completed
commit_story.journal.file_path
commit_story.journal.dir_created
```

### Existing Narrative Logs
```javascript
// Operations with narrative logging
'git data collection'
'chat message collection'
'context filtering'
'context selection'
'summary generation'
'dialogue generation'
'journal entry save'
'journal.path_generation'
'journal.directory_creation'
```

## Adding New Telemetry

### Adding Spans
```javascript
return await tracer.startActiveSpan(OTEL.span.category.operation(), {
  attributes: {
    ...OTEL.attrs.genAI.request(model, temperature, messageCount),
    ...OTEL.attrs.commit(commitData)
  }
}, async (span) => {
  try {
    // Your logic here
    span.setAttributes(OTEL.attrs.genAI.usage(response));
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw error;
  } finally {
    span.end();
  }
});
```

### Adding Metrics
Emit important data as both span attributes AND metrics:
```javascript
// 1. Set span attributes (for trace debugging)
span.setAttributes(OTEL.attrs.chat(chatData));

// 2. Emit metrics (for dashboards/alerting)
OTEL.metrics.gauge('commit_story.chat.total_messages', messageCount);
OTEL.metrics.counter('commit_story.operations.completed', 1);
OTEL.metrics.histogram('commit_story.operation.duration_ms', duration);
```

### Adding Narrative Logs
```javascript
import { createNarrativeLogger } from './src/utils/trace-logger.js';
const logger = createNarrativeLogger('operation.name');

logger.start('operation description', 'Starting process', { context });
logger.progress('operation description', 'Status update', { context });
logger.complete('operation description', 'Process finished', { context });
logger.error('operation description', 'Error occurred', error, { context });
```

## Validation

After adding telemetry, validate your work:

```bash
# Test that traces and metrics are emitted correctly
npm run test:trace

# Check for standards violations and consistency
npm run validate:telemetry
```

## Core Rules

- **Use builders**: Always use `OTEL.span.*` and `OTEL.attrs.*` - no hardcoded strings
- **Underscores**: Use underscores in names (`operation_name`), not hyphens (`operation-name`)
- **Consistency**: Follow existing patterns - check lists above before creating new metrics/spans
- **Namespaces**: `gen_ai.*` for AI operations, `commit_story.*` for application logic
- **Emit both**: For important data, set span attributes AND emit metrics
- **GenAI standard**: Use official OpenTelemetry GenAI semantic conventions for AI operations

For new patterns not covered above, extend `src/telemetry/standards.js` first, then use the builders.