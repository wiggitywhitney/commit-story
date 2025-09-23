#!/usr/bin/env node
/**
 * OpenTelemetry Telemetry Validation Script
 *
 * Validates telemetry implementation for semantic convention compliance,
 * consistency, and proper usage of standards module patterns.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const STANDARDS_FILE = path.join(SRC_DIR, 'telemetry', 'standards.js');

// Official OpenTelemetry GenAI semantic convention patterns
const OFFICIAL_GENAI_PATTERNS = new Set([
  'gen_ai.operation.name',
  'gen_ai.request.model',
  'gen_ai.request.temperature',
  'gen_ai.response.model',
  'gen_ai.usage.input_tokens',
  'gen_ai.usage.output_tokens',
  'gen_ai.provider.name',
  'gen_ai.conversation.id',
  'gen_ai.content.prompt',
  'gen_ai.content.completion'
]);

// Custom extensions to gen_ai namespace (allowed by design)
const CUSTOM_GENAI_EXTENSIONS = new Set([
  'gen_ai.request.messages_count',
  'gen_ai.response.message_length',
  'gen_ai.usage.prompt_tokens',
  'gen_ai.usage.completion_tokens'
]);

// Expected attribute namespaces
const VALID_NAMESPACES = new Set([
  'gen_ai',          // Official OpenTelemetry GenAI semantic conventions + our extensions
  'commit_story',    // Application-specific attributes
  'rpc',             // OpenTelemetry RPC semantic conventions (rpc.system, rpc.service, rpc.method)
  'code',            // OpenTelemetry code semantic conventions (code.function.name, code.file.path, etc.)
  'file',            // OpenTelemetry file semantic conventions (file.path, file.directory, etc.)
  'service',         // OpenTelemetry service semantic conventions (service.name, etc.)
  'error',           // OpenTelemetry error semantic conventions (error.type, etc.)
  'dd',              // Datadog-specific attributes (trace correlation)
  'mcp',             // MCP protocol attributes (for metrics tags)
  'reflection'       // Reflection-specific attributes (for metrics tags)
]);

// Official OpenTelemetry semantic conventions
const OFFICIAL_OTEL_ATTRIBUTES = new Set([
  'rpc.system',
  'rpc.service',
  'rpc.method',
  'code.function.name',
  'code.file.path',
  'code.line.number',
  'code.column.number',
  'code.stacktrace',
  'file.path',
  'file.directory',
  'file.name',
  'file.extension',
  'service.name',
  'service.namespace',
  'service.version',
  'service.instance.id',
  'error.type'
]);

// Deprecated patterns that should not exist
const DEPRECATED_PATTERNS = new Set([
  'ai.request',
  'ai.response',
  'ai.usage',
  'ai.model',
  'ai.provider'
]);

let validationResults = {
  errors: [],
  warnings: [],
  summary: {
    filesScanned: 0,
    attributesFound: new Map(),
    spanNamesFound: new Map(),
    hardcodedAttributes: [],
    deprecatedUsage: []
  }
};

/**
 * Recursively find all JavaScript files in directory
 */
function findJSFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...findJSFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract attribute strings from code
 */
function extractAttributes(content) {
  const attributePattern = /['"`]([a-z_]+\.[a-z_.\[\]]+)['"`]\s*:/g;
  const spanNamePattern = /startActiveSpan\s*\(\s*['"`]([a-z_]+\.[a-z_.]+)['"`]/g;
  const hardcodedAttrPattern = /setAttributes\s*\(\s*\{[^}]*['"`]([a-z_]+\.[a-z_.]+)['"`]\s*:/g;

  const attributes = new Set();
  const spanNames = new Set();
  const hardcodedAttrs = new Set();

  let match;

  // Extract attribute keys
  while ((match = attributePattern.exec(content)) !== null) {
    attributes.add(match[1]);
  }

  // Extract span names
  while ((match = spanNamePattern.exec(content)) !== null) {
    spanNames.add(match[1]);
  }

  // Extract hardcoded attributes in setAttributes calls
  while ((match = hardcodedAttrPattern.exec(content)) !== null) {
    hardcodedAttrs.add(match[1]);
  }

  return { attributes, spanNames, hardcodedAttrs };
}

/**
 * Validate attribute naming conventions
 */
function validateAttribute(attr, filePath, lineNum) {
  const parts = attr.split('.');
  const namespace = parts[0];

  // Check if namespace is valid
  if (!VALID_NAMESPACES.has(namespace)) {
    if (DEPRECATED_PATTERNS.has(`${parts[0]}.${parts[1]}`)) {
      validationResults.errors.push({
        type: 'deprecated_pattern',
        file: filePath,
        line: lineNum,
        message: `Deprecated attribute pattern: '${attr}' should use gen_ai.* namespace`,
        severity: 'error'
      });
    } else {
      validationResults.warnings.push({
        type: 'invalid_namespace',
        file: filePath,
        line: lineNum,
        message: `Unknown namespace: '${namespace}' in attribute '${attr}'`,
        severity: 'warning'
      });
    }
    return false;
  }

  // Special validation for gen_ai attributes
  if (namespace === 'gen_ai') {
    if (!OFFICIAL_GENAI_PATTERNS.has(attr) && !CUSTOM_GENAI_EXTENSIONS.has(attr)) {
      validationResults.warnings.push({
        type: 'unofficial_genai_extension',
        file: filePath,
        line: lineNum,
        message: `Custom gen_ai extension '${attr}' - ensure this follows OpenTelemetry GenAI conventions`,
        severity: 'warning'
      });
    }
  }

  // Check for dot vs underscore consistency
  if (parts.length > 2) {
    for (let i = 2; i < parts.length; i++) {
      if (parts[i].includes('_') && attr.includes('.', attr.indexOf(parts[i]))) {
        validationResults.warnings.push({
          type: 'mixed_separators',
          file: filePath,
          line: lineNum,
          message: `Mixed dot/underscore separators in '${attr}' - prefer underscores for suffixes`,
          severity: 'warning'
        });
      }
    }
  }

  return true;
}

/**
 * Validate span naming conventions
 */
function validateSpanName(spanName, filePath, lineNum) {
  // Span names should use underscores, not hyphens
  if (spanName.includes('-')) {
    validationResults.errors.push({
      type: 'invalid_span_naming',
      file: filePath,
      line: lineNum,
      message: `Span name '${spanName}' uses hyphens - should use underscores`,
      severity: 'error'
    });
    return false;
  }

  return true;
}

/**
 * Check for hardcoded attributes that should use standards module
 */
function validateHardcodedAttributes(hardcodedAttrs, filePath, content) {
  if (hardcodedAttrs.size > 0 && !filePath.includes('standards.js')) {
    // Check if file imports OTEL from standards
    const hasOtelImport = content.includes('import { OTEL }') || content.includes('from \'../telemetry/standards.js\'');

    if (hasOtelImport) {
      for (const attr of hardcodedAttrs) {
        validationResults.warnings.push({
          type: 'hardcoded_attribute',
          file: filePath,
          message: `Hardcoded attribute '${attr}' found - consider using OTEL.attrs.* builders from standards module`,
          severity: 'warning'
        });
      }
    } else if (hardcodedAttrs.size > 2) { // Allow small amounts of hardcoded attrs
      validationResults.warnings.push({
        type: 'missing_standards_import',
        file: filePath,
        message: `File has ${hardcodedAttrs.size} hardcoded attributes but doesn't import standards module`,
        severity: 'warning'
      });
    }
  }
}

/**
 * Detect inconsistent attribute usage across files
 */
function detectInconsistentAttributes() {
  const attributeUsage = new Map();

  // Group similar attributes
  for (const [attr, files] of validationResults.summary.attributesFound.entries()) {
    const baseName = attr.replace(/\.(count|length|size|total|messages)$/, '.*');
    if (!attributeUsage.has(baseName)) {
      attributeUsage.set(baseName, new Map());
    }
    attributeUsage.get(baseName).set(attr, files);
  }

  // Find conflicts
  for (const [baseName, variants] of attributeUsage.entries()) {
    if (variants.size > 1) {
      const variantList = Array.from(variants.keys()).join(', ');
      validationResults.warnings.push({
        type: 'inconsistent_attributes',
        message: `Potentially inconsistent attribute naming for ${baseName}: ${variantList}`,
        severity: 'warning',
        details: Array.from(variants.entries()).map(([attr, files]) => ({
          attribute: attr,
          files: Array.from(files)
        }))
      });
    }
  }
}

/**
 * Validate a single file
 */
function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relativePath = path.relative(PROJECT_ROOT, filePath);

  validationResults.summary.filesScanned++;

  const { attributes, spanNames, hardcodedAttrs } = extractAttributes(content);

  // Track all found attributes and spans
  for (const attr of attributes) {
    if (!validationResults.summary.attributesFound.has(attr)) {
      validationResults.summary.attributesFound.set(attr, new Set());
    }
    validationResults.summary.attributesFound.get(attr).add(relativePath);
  }

  for (const spanName of spanNames) {
    if (!validationResults.summary.spanNamesFound.has(spanName)) {
      validationResults.summary.spanNamesFound.set(spanName, new Set());
    }
    validationResults.summary.spanNamesFound.get(spanName).add(relativePath);
  }

  // Validate attributes line by line
  lines.forEach((line, index) => {
    const lineNum = index + 1;

    for (const attr of attributes) {
      if (line.includes(attr)) {
        validateAttribute(attr, relativePath, lineNum);
      }
    }

    for (const spanName of spanNames) {
      if (line.includes(spanName)) {
        validateSpanName(spanName, relativePath, lineNum);
      }
    }
  });

  // Validate hardcoded attributes
  validateHardcodedAttributes(hardcodedAttrs, relativePath, content);

  // Store hardcoded attributes for summary
  for (const attr of hardcodedAttrs) {
    validationResults.summary.hardcodedAttributes.push({
      file: relativePath,
      attribute: attr
    });
  }
}

/**
 * Generate validation report
 */
function generateReport() {
  console.log('🔍 OpenTelemetry Telemetry Validation Report');
  console.log('============================================\n');

  // Summary
  console.log(`📊 Summary:`);
  console.log(`  Files scanned: ${validationResults.summary.filesScanned}`);
  console.log(`  Unique attributes found: ${validationResults.summary.attributesFound.size}`);
  console.log(`  Unique span names found: ${validationResults.summary.spanNamesFound.size}`);
  console.log(`  Errors: ${validationResults.errors.length}`);
  console.log(`  Warnings: ${validationResults.warnings.length}\n`);

  // Errors
  if (validationResults.errors.length > 0) {
    console.log('❌ ERRORS:');
    validationResults.errors.forEach(error => {
      console.log(`  ${error.file}${error.line ? `:${error.line}` : ''}`);
      console.log(`    ${error.message}\n`);
    });
  }

  // Warnings
  if (validationResults.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    validationResults.warnings.forEach(warning => {
      console.log(`  ${warning.file || 'Global'}${warning.line ? `:${warning.line}` : ''}`);
      console.log(`    ${warning.message}`);
      if (warning.details) {
        warning.details.forEach(detail => {
          console.log(`      - ${detail.attribute} (${detail.files.join(', ')})`);
        });
      }
      console.log();
    });
  }

  // Attribute usage summary
  console.log('📋 Attribute Usage Summary:');
  const sortedAttrs = Array.from(validationResults.summary.attributesFound.entries())
    .sort(([a], [b]) => a.localeCompare(b));

  for (const [attr, files] of sortedAttrs) {
    console.log(`  ${attr} (${files.size} files)`);
    if (files.size <= 3) {
      console.log(`    Used in: ${Array.from(files).join(', ')}`);
    }
  }
  console.log();

  // Hardcoded attributes summary
  if (validationResults.summary.hardcodedAttributes.length > 0) {
    console.log('🔧 Hardcoded Attributes (consider using standards module):');
    const hardcodedByFile = new Map();
    for (const item of validationResults.summary.hardcodedAttributes) {
      if (!hardcodedByFile.has(item.file)) {
        hardcodedByFile.set(item.file, []);
      }
      hardcodedByFile.get(item.file).push(item.attribute);
    }

    for (const [file, attrs] of hardcodedByFile.entries()) {
      console.log(`  ${file}: ${attrs.join(', ')}`);
    }
    console.log();
  }

  // Final assessment
  const hasErrors = validationResults.errors.length > 0;
  const hasWarnings = validationResults.warnings.length > 0;

  if (!hasErrors && !hasWarnings) {
    console.log('✅ All telemetry validation checks passed!');
    return 0;
  } else if (!hasErrors && hasWarnings) {
    console.log('⚠️  Validation completed with warnings. Consider addressing them.');
    return 0;
  } else {
    console.log('❌ Validation failed with errors. Please fix the issues above.');
    return 1;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('Starting telemetry validation...\n');

  try {
    // Find all JS files in src directory
    const jsFiles = findJSFiles(SRC_DIR);

    // Validate each file
    for (const file of jsFiles) {
      validateFile(file);
    }

    // Detect cross-file inconsistencies
    detectInconsistentAttributes();

    // Generate and display report
    const exitCode = generateReport();
    process.exit(exitCode);

  } catch (error) {
    console.error('❌ Validation script failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { main, validateFile };