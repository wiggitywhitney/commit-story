# OpenTelemetry Telemetry Standards

Quick reference for telemetry patterns in the Commit Story application.

## Import Pattern
```javascript
import { OTEL } from './src/telemetry/standards.js';
```

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
npm run validate:telemetry
```

## Rules

1. **Always use builders** - No hardcoded attribute strings outside standards.js
2. **Use underscores** - Span names and attribute suffixes use underscores, not hyphens
3. **Consistent naming** - Same logical attribute must have same name across files
4. **Proper namespaces** - `gen_ai.*` for AI, `commit_story.*` for application logic

## Migration Pattern

When adding telemetry to new components:

1. Import: `import { OTEL } from '../telemetry/standards.js';`
2. Use span builder: `OTEL.span.category.operation()`
3. Use attribute builders: `OTEL.attrs.category(data)`
4. Run validation: `npm run validate:telemetry`

For new patterns, extend the standards module first, then use the new builders.