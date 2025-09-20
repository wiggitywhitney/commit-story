/**
 * Minimal security filter for sensitive data
 * Catches the obvious leaks without over-engineering
 *
 * Follows DD-004 (Minimal Implementation Only) - ship fast, learn fast
 */

import { trace, SpanStatusCode } from '@opentelemetry/api';
import { OTEL } from '../../telemetry/standards.js';

// Get tracer instance for sensitive data filter instrumentation
const tracer = trace.getTracer('commit-story-sensitive-data-filter', '1.0.0');

/**
 * Redacts common sensitive data patterns from text
 * @param {string} text - Text to filter
 * @returns {string} Text with sensitive data redacted
 */
export function redactSensitiveData(text) {
  if (!text) return text;

  return tracer.startActiveSpan(OTEL.span.filters.sensitiveData(), {
    attributes: {
      [`${OTEL.NAMESPACE}.filter.input_length`]: text.length
    }
  }, (span) => {
    try {
      const startTime = Date.now();

      // Count redactions by type (security-conscious: count only, never capture values)
      let keysRedacted = 0;
      let jwtsRedacted = 0;
      let tokensRedacted = 0;
      let emailsRedacted = 0;

      let result = text;

      // Known API key prefixes (comprehensive)
      result = result.replace(/\b(sk-|pk-|rk-|AIza|AKIA|gho_|ghp_|ghs_|ghu_|glpat-)[a-zA-Z0-9_-]{10,}/g, (match) => {
        keysRedacted++;
        return '[REDACTED_KEY]';
      });

      // Contextual key detection - hex keys near key-related words
      result = result.replace(/\b(api_?key|token|secret|password|credential)[\s:=]+[a-f0-9]{16,64}\b/gi, (match) => {
        keysRedacted++;
        return '[REDACTED_KEY]';
      });

      // Contextual key detection - alphanumeric keys near key-related words
      result = result.replace(/\b(api_?key|token|secret|password|credential)[\s:=]+[a-zA-Z0-9_-]{20,}\b/gi, (match) => {
        keysRedacted++;
        return '[REDACTED_KEY]';
      });

      // Partial keys with truncation indicators
      result = result.replace(/\b[a-zA-Z0-9_-]{8,}(\*{3}|\.{3})\b/g, (match) => {
        keysRedacted++;
        return '[REDACTED_KEY]';
      });

      // JWT tokens (base64 with dots)
      result = result.replace(/\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, (match) => {
        jwtsRedacted++;
        return '[REDACTED_JWT]';
      });

      // Auth Bearer tokens
      result = result.replace(/Bearer\s+[a-zA-Z0-9-._~+/]+/gi, (match) => {
        tokensRedacted++;
        return '[REDACTED_TOKEN]';
      });

      // Email addresses
      result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => {
        emailsRedacted++;
        return '[REDACTED_EMAIL]';
      });

      const processingDuration = Date.now() - startTime;
      const totalRedactions = keysRedacted + jwtsRedacted + tokensRedacted + emailsRedacted;

      // Set span attributes with counts only (no sensitive data)
      span.setAttributes(OTEL.attrs.filters.sensitiveData({
        inputLength: text.length,
        outputLength: result.length,
        keysRedacted,
        jwtsRedacted,
        tokensRedacted,
        emailsRedacted,
        totalRedactions,
        processingDuration
      }));

      span.setStatus({ code: SpanStatusCode.OK });
      return result;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  });
}