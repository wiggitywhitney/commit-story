#!/usr/bin/env node

/**
 * OpenTelemetry Semantic Convention Compliance Validator
 *
 * Validates that all attributes and span names follow OpenTelemetry semantic conventions
 * per PRD-8 requirements and research documentation.
 */

import fs from 'fs';
import path from 'path';

const SRC_DIR = 'src';

// Expected compliant patterns based on PRD-8 documentation
const COMPLIANT_PATTERNS = {
  // Standard OpenTelemetry attributes
  genai: /^gen_ai\./,
  http: /^http\./,
  server: /^server\./,
  network: /^network\./,
  url: /^url\./,
  user_agent: /^user_agent\./,

  // Project-specific namespace
  project: /^commit_story\./,

  // Allowed system/framework attributes
  system: /^(service|host|process|telemetry)\./,
};

// Non-compliant patterns that should not exist
const VIOLATION_PATTERNS = {
  // Mixed AI conventions (forbidden)
  mixed_ai: /^ai\.(?!.*gen_ai)/,

  // Unnamespaced custom attributes (forbidden)
  unnamespaced_commit: /^commit\.(?!story)/,
  unnamespaced_repo: /^repo\.(?!story)/,
  unnamespaced_chat: /^chat\.(?!story)/,
  unnamespaced_context: /^context\.(?!story)/,
  unnamespaced_sections: /^sections\.(?!story)/,
  unnamespaced_journal: /^journal\.(?!story)/,
  unnamespaced_previous: /^previous\.(?!story)/,
  unnamespaced_generation: /^generation\.(?!story)/,
};

// Expected span naming convention (underscores only)
const SPAN_NAME_PATTERN = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*$/;
const HYPHEN_VIOLATION = /-/;

function findJSFiles(dir, files = []) {
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !entry.startsWith('.')) {
      findJSFiles(fullPath, files);
    } else if (entry.endsWith('.js') && !entry.endsWith('.test.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractAttributes(content) {
  const attributes = [];

  // Match attribute patterns in setAttributes calls and span creation
  const attributeRegex = /'([^']+)'\s*:/g;
  let match;

  while ((match = attributeRegex.exec(content)) !== null) {
    const attrName = match[1];
    // Skip if it looks like a property access or comment
    if (!attrName.includes('.') || attrName.includes('//')) continue;
    attributes.push(attrName);
  }

  return [...new Set(attributes)]; // Remove duplicates
}

function extractSpanNames(content) {
  const spans = [];

  // Match span names in tracer.startActiveSpan calls
  const spanRegex = /tracer\.startActiveSpan\(['"`]([^'"`]+)['"`]/g;
  let match;

  while ((match = spanRegex.exec(content)) !== null) {
    spans.push(match[1]);
  }

  return [...new Set(spans)]; // Remove duplicates
}

function validateAttributes(attributes, filePath) {
  const violations = [];

  for (const attr of attributes) {
    let isCompliant = false;

    // Check if attribute matches any compliant pattern
    for (const [category, pattern] of Object.entries(COMPLIANT_PATTERNS)) {
      if (pattern.test(attr)) {
        isCompliant = true;
        break;
      }
    }

    // Check for specific violation patterns
    for (const [violationType, pattern] of Object.entries(VIOLATION_PATTERNS)) {
      if (pattern.test(attr)) {
        violations.push({
          type: 'attribute_violation',
          violation: violationType,
          attribute: attr,
          file: filePath,
          description: `Attribute '${attr}' violates ${violationType} convention`
        });
        isCompliant = false;
      }
    }

    // If not compliant and no specific violation found, it's unknown
    if (!isCompliant) {
      violations.push({
        type: 'attribute_unknown',
        attribute: attr,
        file: filePath,
        description: `Unknown/non-standard attribute '${attr}' - needs namespace classification`
      });
    }
  }

  return violations;
}

function validateSpanNames(spanNames, filePath) {
  const violations = [];

  for (const spanName of spanNames) {
    // Check for hyphens (should use underscores)
    if (HYPHEN_VIOLATION.test(spanName)) {
      violations.push({
        type: 'span_naming_violation',
        span: spanName,
        file: filePath,
        description: `Span name '${spanName}' uses hyphens - should use underscores`
      });
    }

    // Check overall naming pattern
    if (!SPAN_NAME_PATTERN.test(spanName)) {
      violations.push({
        type: 'span_pattern_violation',
        span: spanName,
        file: filePath,
        description: `Span name '${spanName}' doesn't follow naming conventions`
      });
    }
  }

  return violations;
}

function generateReport(results) {
  console.log('\n🔍 OpenTelemetry Semantic Convention Compliance Report');
  console.log('=' .repeat(60));

  const totalFiles = results.length;
  const totalAttributes = results.reduce((sum, r) => sum + r.attributes.length, 0);
  const totalSpans = results.reduce((sum, r) => sum + r.spans.length, 0);
  const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);

  console.log(`\n📊 Summary:`);
  console.log(`   Files analyzed: ${totalFiles}`);
  console.log(`   Total attributes: ${totalAttributes}`);
  console.log(`   Total spans: ${totalSpans}`);
  console.log(`   Violations found: ${totalViolations}`);

  if (totalViolations === 0) {
    console.log('\n✅ COMPLIANCE STATUS: 100% COMPLIANT');
    console.log('   All attributes and span names follow OpenTelemetry semantic conventions');
    return true;
  }

  console.log('\n❌ COMPLIANCE STATUS: VIOLATIONS FOUND');

  // Group violations by type
  const violationsByType = {};
  for (const result of results) {
    for (const violation of result.violations) {
      if (!violationsByType[violation.type]) {
        violationsByType[violation.type] = [];
      }
      violationsByType[violation.type].push(violation);
    }
  }

  // Report violations by category
  for (const [type, violations] of Object.entries(violationsByType)) {
    console.log(`\n🚨 ${type.toUpperCase().replace('_', ' ')} (${violations.length} violations):`);
    for (const violation of violations) {
      console.log(`   ❌ ${violation.file}`);
      console.log(`      ${violation.description}`);
      if (violation.attribute) console.log(`      Attribute: '${violation.attribute}'`);
      if (violation.span) console.log(`      Span: '${violation.span}'`);
    }
  }

  console.log('\n📋 Required Actions:');
  console.log('   1. Fix all attribute violations by adding proper namespaces');
  console.log('   2. Update span names to use underscores instead of hyphens');
  console.log('   3. Re-run validation to confirm 100% compliance');

  return false;
}

function main() {
  console.log('🔭 Starting OpenTelemetry semantic convention validation...');

  const jsFiles = findJSFiles(SRC_DIR);
  const results = [];

  for (const filePath of jsFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const attributes = extractAttributes(content);
    const spans = extractSpanNames(content);

    if (attributes.length === 0 && spans.length === 0) {
      continue; // Skip files with no instrumentation
    }

    const attributeViolations = validateAttributes(attributes, filePath);
    const spanViolations = validateSpanNames(spans, filePath);

    results.push({
      file: filePath,
      attributes,
      spans,
      violations: [...attributeViolations, ...spanViolations]
    });
  }

  const isCompliant = generateReport(results);
  process.exit(isCompliant ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}