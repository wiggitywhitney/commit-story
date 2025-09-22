/**
 * OpenTelemetry Standards Module
 *
 * Centralizes OpenTelemetry semantic conventions and provides builders to enforce
 * correct attribute naming, span patterns, and metric emission. Prevents instrumentation
 * errors and ensures consistency across the entire codebase.
 *
 * Semantic Namespace Guidelines:
 * - gen_ai.*: Direct AI operation characteristics (model params, tokens, response metrics)
 * - commit_story.*: Application-specific attributes (business logic, infrastructure)
 *
 * Metric Conventions:
 * - Use hierarchical naming: commit_story.category.metric_name
 * - Follow OpenTelemetry units: milliseconds for duration, dimensionless "1" for counts
 * - Gauge: Point-in-time values (message counts, current state)
 * - Counter: Incrementing values (total operations, cumulative errors)
 * - Histogram: Distribution data (durations, payload sizes)
 */

import { metrics } from '@opentelemetry/api';

/**
 * Detects AI provider from model name for telemetry
 * @param {string} modelName - The model name (e.g., 'gpt-4o-mini', 'claude-3')
 * @returns {string} Provider name ('openai', 'anthropic', 'google', 'meta', 'unknown')
 */
export function getProviderFromModel(modelName) {
  if (!modelName) return 'unknown';
  const model = modelName.toLowerCase();
  if (model.startsWith('gpt')) return 'openai';
  if (model.includes('claude')) return 'anthropic';
  if (model.includes('gemini')) return 'google';
  if (model.includes('llama')) return 'meta';
  return 'unknown';
}

/**
 * Get OpenTelemetry Meter instance for commit-story metrics
 * Follows OpenTelemetry best practices for meter naming and versioning
 */
function getMeter() {
  return metrics.getMeter('commit-story', '1.0.0');
}

/**
 * OpenTelemetry standards constant - centralized patterns and conventions
 */
export const OTEL = {
  // Application namespace for custom attributes
  NAMESPACE: 'commit_story',

  // Span name builders (enforce correct naming patterns)
  span: {
    main: () => 'commit_story.main',

    // Application infrastructure operations
    connectivity: () => 'commit_story.connectivity_test',

    // Context and data operations
    context: {
      gather: () => 'context.gather_for_commit',
      filter: () => 'context.filter_messages'
    },

    // Journal generation operations
    journal: {
      generate: () => 'journal.generate_entry',
      save: () => 'journal.save_entry'
    },

    // AI generation operations
    ai: {
      summary: () => 'summary.generate',
      dialogue: () => 'dialogue.generate',
      technical: () => 'technical_decisions.generate'
    },

    // Data collection operations
    collectors: {
      claude: () => 'claude.collect_messages',
      git: () => 'git.collect_data'
    },

    // Configuration operations
    config: {
      openai: () => 'config.openai'
    },

    // Data filtering operations
    filters: {
      sensitiveData: () => 'filters.redact_sensitive_data'
    },

    // Utility operations
    utils: {
      contextSelect: () => 'utils.select_context',
      journal_paths: {
        generate_path: () => 'utils.journal_paths.generate_path',
        create_directory: () => 'utils.journal_paths.create_directory',
        format_date: () => 'utils.journal_paths.format_date',
        format_timestamp: () => 'utils.journal_paths.format_timestamp'
      }
    }
  },

  // Attribute builders (enforce correct conventions)
  attrs: {

    /**
     * Official OpenTelemetry GenAI attributes
     * Based on: https://opentelemetry.io/docs/specs/semconv/gen-ai/
     */
    genAI: {
      /**
       * Request attributes for AI operations
       * @param {string} model - Model name
       * @param {number} temperature - Generation temperature
       * @param {number} msgCount - Number of messages sent to AI
       * @returns {Object} Official GenAI request attributes
       */
      request: (model, temperature, msgCount) => ({
        'gen_ai.request.model': model,
        'gen_ai.request.temperature': temperature,
        'gen_ai.request.messages_count': msgCount, // Extension: AI-specific metric
        'gen_ai.operation.name': 'chat',
        'gen_ai.provider.name': getProviderFromModel(model)
      }),

      /**
       * Usage/response attributes for AI operations
       * @param {Object} response - AI response object
       * @returns {Object} Official GenAI usage attributes
       */
      usage: (response) => ({
        'gen_ai.response.model': response.model,
        'gen_ai.response.message_length': response.content?.length || 0, // Extension: AI response characteristic
        'gen_ai.usage.prompt_tokens': response.usage?.prompt_tokens || 0,
        'gen_ai.usage.completion_tokens': response.usage?.completion_tokens || 0
      }),

      /**
       * Conversation tracking attributes
       * @param {string} conversationId - Unique conversation ID
       * @returns {Object} Conversation attributes
       */
      conversation: (conversationId) => ({
        'gen_ai.conversation.id': conversationId
      })
    },

    /**
     * Application-specific commit attributes
     * @param {Object} commitData - Commit information
     * @returns {Object} Commit attributes with commit_story namespace
     */
    commit: (commitData) => ({
      [`${OTEL.NAMESPACE}.commit.hash`]: commitData.hash,
      [`${OTEL.NAMESPACE}.commit.message`]: commitData.message?.split('\n')[0], // First line only
      [`${OTEL.NAMESPACE}.commit.timestamp`]: commitData.timestamp?.toISOString(),
      [`${OTEL.NAMESPACE}.commit.author`]: commitData.author,
      [`${OTEL.NAMESPACE}.commit.ref`]: commitData.ref
    }),

    /**
     * Application chat context attributes
     * @param {Object} chatData - Chat statistics
     * @returns {Object} Chat attributes with commit_story namespace
     */
    chat: (chatData) => ({
      [`${OTEL.NAMESPACE}.chat.messages_count`]: chatData.filtered || chatData.count,
      [`${OTEL.NAMESPACE}.chat.raw_messages_count`]: chatData.raw,
      [`${OTEL.NAMESPACE}.chat.total_messages`]: chatData.total,
      [`${OTEL.NAMESPACE}.chat.user_messages`]: chatData.userMessages,
      [`${OTEL.NAMESPACE}.chat.assistant_messages`]: chatData.assistantMessages,
      [`${OTEL.NAMESPACE}.chat.user_messages_over_twenty`]: chatData.userMessagesOverTwenty
    }),

    /**
     * Context processing attributes
     * @param {Object} contextData - Context processing metrics
     * @returns {Object} Context attributes
     */
    context: (contextData) => ({
      [`${OTEL.NAMESPACE}.context.original_messages`]: contextData.originalCount,
      [`${OTEL.NAMESPACE}.context.filtered_messages`]: contextData.filteredCount,
      [`${OTEL.NAMESPACE}.context.removed_messages`]: contextData.removedCount,
      [`${OTEL.NAMESPACE}.context.token_reduction`]: contextData.tokensSaved,
      [`${OTEL.NAMESPACE}.context.token_reduction_percent`]: contextData.reductionPercent,
      [`${OTEL.NAMESPACE}.context.original_chat_tokens`]: contextData.originalChatTokens,
      [`${OTEL.NAMESPACE}.context.filtered_chat_tokens`]: contextData.filteredChatTokens,
      [`${OTEL.NAMESPACE}.context.diff_tokens`]: contextData.diffTokens,
      [`${OTEL.NAMESPACE}.context.total_estimated_tokens`]: contextData.totalTokens,
      [`${OTEL.NAMESPACE}.context.final_messages`]: contextData.finalMessages,
      [`${OTEL.NAMESPACE}.context.final_chat_tokens`]: contextData.finalChatTokens,
      [`${OTEL.NAMESPACE}.context.aggressive_filtering`]: contextData.aggressiveFiltering
    }),

    /**
     * Journal section length attributes
     * @param {Object} sectionLengths - Length of each journal section
     * @returns {Object} Section attributes
     */
    sections: (sectionLengths) => ({
      [`${OTEL.NAMESPACE}.sections.summary_length`]: sectionLengths.summary,
      [`${OTEL.NAMESPACE}.sections.dialogue_length`]: sectionLengths.dialogue,
      [`${OTEL.NAMESPACE}.sections.technical_decisions_length`]: sectionLengths.technical,
      [`${OTEL.NAMESPACE}.sections.commit_details_length`]: sectionLengths.details
    }),

    /**
     * Repository and environment attributes
     * @param {Object} repoData - Repository information
     * @returns {Object} Repository attributes
     */
    repository: (repoData) => ({
      [`${OTEL.NAMESPACE}.repository.path`]: repoData.path,
      [`${OTEL.NAMESPACE}.repository.name`]: repoData.name
    }),

    /**
     * Journal operation attributes
     */
    journal: {
      /**
       * Journal completion attributes (from main execution)
       * @param {Object} journalData - Journal completion information
       * @returns {Object} Journal attributes
       */
      completion: (journalData) => ({
        [`${OTEL.NAMESPACE}.journal.file_path`]: journalData.filePath,
        [`${OTEL.NAMESPACE}.journal.completed`]: journalData.completed
      }),

      /**
       * Journal save operation attributes
       * @param {Object} saveData - Journal save operation data
       * @returns {Object} Journal save attributes
       */
      save: (saveData) => ({
        [`${OTEL.NAMESPACE}.journal.file_path`]: saveData.filePath,
        [`${OTEL.NAMESPACE}.journal.entry_size`]: saveData.entrySize,
        [`${OTEL.NAMESPACE}.journal.directory_created`]: saveData.dirCreated,
        [`${OTEL.NAMESPACE}.journal.write_duration_ms`]: saveData.writeDuration
      })
    },

    /**
     * Configuration operation attributes
     */
    config: {
      /**
       * OpenAI client initialization attributes
       * @param {Object} configData - OpenAI configuration data
       * @returns {Object} Config attributes
       */
      openai: (configData) => ({
        [`${OTEL.NAMESPACE}.config.api_key_valid`]: configData.apiKeyValid,
        [`${OTEL.NAMESPACE}.config.model`]: configData.model,
        [`${OTEL.NAMESPACE}.config.provider`]: configData.provider,
        [`${OTEL.NAMESPACE}.config.init_duration_ms`]: configData.initDuration
      })
    },

    /**
     * Data filtering operation attributes
     */
    filters: {
      /**
       * Sensitive data redaction attributes (NO sensitive data captured, only counts)
       * @param {Object} filterData - Filter operation metrics
       * @returns {Object} Filter attributes (counts and performance only)
       */
      sensitiveData: (filterData) => ({
        [`${OTEL.NAMESPACE}.filter.input_length`]: filterData.inputLength,
        [`${OTEL.NAMESPACE}.filter.output_length`]: filterData.outputLength,
        [`${OTEL.NAMESPACE}.filter.keys_redacted`]: filterData.keysRedacted,
        [`${OTEL.NAMESPACE}.filter.jwts_redacted`]: filterData.jwtsRedacted,
        [`${OTEL.NAMESPACE}.filter.tokens_redacted`]: filterData.tokensRedacted,
        [`${OTEL.NAMESPACE}.filter.emails_redacted`]: filterData.emailsRedacted,
        [`${OTEL.NAMESPACE}.filter.total_redactions`]: filterData.totalRedactions,
        [`${OTEL.NAMESPACE}.filter.processing_duration_ms`]: filterData.processingDuration
      })
    },

    /**
     * Utility function operation attributes
     */
    utils: {
      /**
       * Context selection operation attributes
       * @param {Object} selectionData - Context selection metrics
       * @returns {Object} Context selection attributes
       */
      contextSelect: (selectionData) => ({
        [`${OTEL.NAMESPACE}.utils.selections_requested`]: selectionData.selectionsRequested,
        [`${OTEL.NAMESPACE}.utils.selections_found`]: selectionData.selectionsFound,
        [`${OTEL.NAMESPACE}.utils.description_length`]: selectionData.descriptionLength,
        [`${OTEL.NAMESPACE}.utils.data_keys`]: selectionData.dataKeys,
        [`${OTEL.NAMESPACE}.utils.processing_duration_ms`]: selectionData.processingDuration
      }),

      /**
       * Journal paths operation attributes
       * @param {Object} pathData - Path operation data
       * @returns {Object} Journal paths attributes
       */
      journalPaths: {
        generatePath: (pathData) => ({
          [`${OTEL.NAMESPACE}.journal.type`]: pathData.type,
          [`${OTEL.NAMESPACE}.path.month_dir`]: pathData.monthDir,
          [`${OTEL.NAMESPACE}.path.file_name`]: pathData.fileName,
          [`${OTEL.NAMESPACE}.path.full_path`]: pathData.fullPath,
          'file.path': pathData.fullPath // OpenTelemetry semantic convention
        }),

        createDirectory: (directoryData) => ({
          [`${OTEL.NAMESPACE}.directory.path`]: directoryData.path,
          [`${OTEL.NAMESPACE}.directory.type`]: directoryData.type,
          [`${OTEL.NAMESPACE}.directory.created`]: directoryData.created,
          [`${OTEL.NAMESPACE}.directory.operation_duration_ms`]: directoryData.operationDuration,
          'file.directory': directoryData.path // OpenTelemetry semantic convention
        }),

        formatDate: (dateData) => ({
          [`${OTEL.NAMESPACE}.date.year`]: dateData.year,
          [`${OTEL.NAMESPACE}.date.month`]: dateData.month,
          [`${OTEL.NAMESPACE}.date.day`]: dateData.day,
          [`${OTEL.NAMESPACE}.path.month_dir`]: dateData.monthDir,
          [`${OTEL.NAMESPACE}.path.file_name`]: dateData.fileName
        }),

        formatTimestamp: (timestampData) => ({
          [`${OTEL.NAMESPACE}.timestamp.formatted`]: timestampData.formatted,
          [`${OTEL.NAMESPACE}.timestamp.timezone`]: timestampData.timezone
        })
      }
    }
  },

  // Event builders for structured events
  events: {
    /**
     * GenAI prompt event
     * @param {Array} messages - Messages sent to AI
     * @param {string} model - Model used
     * @returns {Object} Event attributes
     */
    genAI: {
      prompt: (messages, model) => ({
        'gen_ai.content.prompt': JSON.stringify(messages),
        'gen_ai.request.model': model,
        'gen_ai.provider.name': getProviderFromModel(model)
      }),

      /**
       * GenAI completion event
       * @param {Object} response - AI response
       * @returns {Object} Event attributes
       */
      completion: (response) => ({
        'gen_ai.content.completion': response.content,
        'gen_ai.response.model': response.model,
        'gen_ai.usage.prompt_tokens': response.usage?.prompt_tokens || 0,
        'gen_ai.usage.completion_tokens': response.usage?.completion_tokens || 0
      })
    }
  },

  // Metrics builders for dual emission (span attributes + queryable metrics)
  metrics: {
    /**
     * Emit a gauge metric (point-in-time value)
     * @param {string} name - Metric name (should match span attribute name)
     * @param {number} value - Metric value
     * @param {Object} attributes - Metric attributes (tags)
     */
    gauge: (name, value, attributes = {}) => {
      try {
        const meter = getMeter();
        const gauge = meter.createGauge(name, {
          description: `Gauge metric: ${name}`,
          unit: name.includes('_ms') || name.includes('duration') ? 'ms' : '1'
        });

        const defaultAttributes = {
          'service.name': 'commit-story-dev',
          'environment': 'development'
        };

        gauge.record(value, { ...defaultAttributes, ...attributes });
      } catch (error) {
        console.warn(`Failed to emit gauge metric ${name}:`, error.message);
      }
    },

    /**
     * Emit a counter metric (incrementing value)
     * @param {string} name - Metric name
     * @param {number} value - Increment value (default 1)
     * @param {Object} attributes - Metric attributes (tags)
     */
    counter: (name, value = 1, attributes = {}) => {
      try {
        const meter = getMeter();
        const counter = meter.createCounter(name, {
          description: `Counter metric: ${name}`,
          unit: '1'
        });

        const defaultAttributes = {
          'service.name': 'commit-story-dev',
          'environment': 'development'
        };

        counter.add(value, { ...defaultAttributes, ...attributes });
      } catch (error) {
        console.warn(`Failed to emit counter metric ${name}:`, error.message);
      }
    },

    /**
     * Emit a histogram metric (distribution data)
     * @param {string} name - Metric name
     * @param {number} value - Measurement value
     * @param {Object} attributes - Metric attributes (tags)
     */
    histogram: (name, value, attributes = {}) => {
      try {
        const meter = getMeter();
        const histogram = meter.createHistogram(name, {
          description: `Histogram metric: ${name}`,
          unit: name.includes('_ms') || name.includes('duration') ? 'ms' : '1'
        });

        const defaultAttributes = {
          'service.name': 'commit-story-dev',
          'environment': 'development'
        };

        histogram.record(value, { ...defaultAttributes, ...attributes });
      } catch (error) {
        console.warn(`Failed to emit histogram metric ${name}:`, error.message);
      }
    }
  }
};

/**
 * Utility for structured logging with trace context
 * @param {import('@opentelemetry/api').Span} span - Active span
 * @returns {Object} Trace context for logging
 */
export function getTraceContext(span) {
  if (!span) return {};

  const spanContext = span.spanContext();
  if (!spanContext) return {};

  return {
    trace_id: spanContext.traceId,
    span_id: spanContext.spanId,
    service: OTEL.NAMESPACE
  };
}