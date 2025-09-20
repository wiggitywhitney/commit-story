/**
 * Context Selection Utility
 *
 * Enables generators to opt-in to specific context data and automatically
 * generates accurate descriptions for AI prompts.
 */

import { trace, SpanStatusCode } from '@opentelemetry/api';
import { OTEL } from '../../telemetry/standards.js';

// Get tracer instance for context selection instrumentation
const tracer = trace.getTracer('commit-story-utils', '1.0.0');

/**
 * Selects specific context pieces and generates accurate descriptions
 *
 * @param {Object} context - Self-documenting context object from context-integrator
 * @param {string[]} selections - Array of context keys to select (e.g., ['commit', 'chatMessages'])
 * @returns {Object} Selected data with auto-generated description
 * @returns {Object} return.data - The selected context data
 * @returns {string} return.description - Accurate description of available data
 */
export function selectContext(context, selections) {
  return tracer.startActiveSpan(OTEL.span.utils.contextSelect(), {
    attributes: {
      ...OTEL.attrs.utils.contextSelect({
        selectionsRequested: selections.length
      })
    }
  }, (span) => {
    try {
      const startTime = Date.now();

      // Build selected data object
      const selectedData = {};
      const descriptions = [];

      selections.forEach(key => {
        if (context[key]) {
          selectedData[key] = context[key].data;
          descriptions.push(context[key].description);
        }
      });

      // Generate description of what's actually available
      const description = descriptions.length > 0
        ? `AVAILABLE DATA:\n- ${descriptions.join('\n- ')}`
        : 'AVAILABLE DATA: (none selected)';

      const result = {
        data: selectedData,
        description: description
      };

      // Track completion metrics
      span.setAttributes(OTEL.attrs.utils.contextSelect({
        selectionsFound: descriptions.length,
        descriptionLength: description.length,
        dataKeys: Object.keys(selectedData).join(','),
        processingDuration: Date.now() - startTime
      }));

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
}