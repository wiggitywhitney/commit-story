# OpenTelemetry Semantic Conventions Research

**Generated**: September 18, 2025
**Version**: 1.0
**OpenTelemetry Specification Version**: 1.37.0
**Purpose**: Comprehensive research on OpenTelemetry semantic conventions to guide commit-story instrumentation standardization

## Executive Summary

This research documents the latest OpenTelemetry semantic conventions as of September 2025, with focus on GenAI, general attributes, and custom namespacing requirements. The research identifies specific conventions applicable to the commit-story project and provides guidance for migrating from mixed conventions to full compliance.

### Key Findings
- ✅ **GenAI conventions are experimental** with `OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental` required
- ⚠️ **No specific VCS conventions found** - need custom namespace for git operations
- ✅ **Clear namespacing guidelines** for custom business attributes
- 🎯 **Latest GenAI attributes documented** with provider-agnostic design

## OpenTelemetry Semantic Conventions Overview

### Current Version Status
- **Latest Stable Version**: 1.37.0 (September 2025)
- **Python Version**: 0.57b0 (pre-release, July 29, 2025)
- **JavaScript/Node**: 1.37.0 (active development)

### Convention Categories (As of v1.37.0)
1. **General Conventions** - Base patterns and naming rules
2. **Cloud Providers** - AWS, Azure, GCP specific attributes
3. **Database Operations** - Database client instrumentation
4. **HTTP** - HTTP client/server operations
5. **Messaging** - Message queue operations
6. **RPC** - Remote procedure call operations
7. **System** - System resource attributes
8. **Runtime Environments** - Language runtime attributes
9. **CICD** - Continuous Integration/Deployment
10. **CloudEvents** - Event-driven architectures
11. **Code** - Code operations (limited documentation found)
12. **Generative AI** - AI/ML model operations (experimental)

## GenAI Semantic Conventions (Experimental)

### Status and Version Control
- **Current Status**: Experimental (Development)
- **Opt-in Required**: `OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental`
- **Default Behavior**: Continues to emit version 1.36.0 or prior
- **Stability**: Subject to breaking changes in minor releases

### Core GenAI Attributes

#### Operation and Provider Attributes
| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `gen_ai.operation.name` | string | Operation type identifier | `"chat"`, `"completion"`, `"embedding"` |
| `gen_ai.provider.name` | string | AI provider discriminator | `"openai"`, `"anthropic"`, `"google"` |
| `gen_ai.request.model` | string | Model name for request | `"gpt-4o-mini"`, `"claude-3-5-sonnet"` |
| `gen_ai.response.model` | string | Model name from response | `"gpt-4o-mini"` |

#### Usage and Token Attributes
| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `gen_ai.usage.prompt_tokens` | int | Input tokens consumed | `4766` |
| `gen_ai.usage.completion_tokens` | int | Output tokens generated | `451` |
| `gen_ai.usage.total_tokens` | int | Total tokens (prompt + completion) | `5217` |
| `gen_ai.usage.reasoning_tokens` | int | OpenAI-specific reasoning tokens | `128` |

#### Content and Message Attributes
| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `gen_ai.input.messages` | structured/JSON | Input messages array | `[{"role": "user", "content": "..."}]` |
| `gen_ai.output.messages` | structured/JSON | Output messages array | `[{"role": "assistant", "content": "..."}]` |
| `gen_ai.system_instructions` | string | System-level instructions | `"You are a helpful assistant"` |
| `gen_ai.output.type` | string | Output modality | `"text"`, `"image"`, `"audio"` |

#### OpenAI-Specific Attributes
| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `gen_ai.request.reasoning_effort` | string | Requested reasoning level | `"high"`, `"medium"`, `"low"` |
| `gen_ai.response.reasoning_effort` | string | Actual reasoning level used | `"medium"` |
| `gen_ai.request.reasoning_summary` | string | Reasoning summary request | `"brief"`, `"detailed"` |

#### Server and Error Attributes
| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `server.address` | string | AI service address | `"api.openai.com"` |
| `server.port` | int | Service port | `443` |
| `error.type` | string | Error code or exception type | `"rate_limit_exceeded"` |

### GenAI Events (Experimental)

#### Event Types
| Event | Purpose | Content |
|-------|---------|---------|
| `gen_ai.content.prompt` | Record input prompts | Structured prompt data |
| `gen_ai.content.completion` | Record model responses | Structured completion data |

#### Event Control
- **Environment Variable**: `OTEL_GENAI_CAPTURE_CONTENT=true` (recommended for debugging)
- **Privacy Consideration**: Contains actual prompt/completion content
- **Structure**: Events use structured format, spans may use JSON strings if structured not supported

### GenAI Convention Categories

#### Spans
- **Model Spans**: Direct model operation calls
- **Agent Spans**: AI agent framework operations (2025 focus area)

#### Metrics
- **Operation Metrics**: Performance measurements for AI operations
- **Usage Metrics**: Token consumption and cost tracking

#### Provider-Specific Extensions
- **OpenAI**: Full semantic conventions defined
- **Azure AI Inference**: Specific conventions for Azure
- **AWS Bedrock**: Bedrock-specific attributes

## General Attribute Naming Conventions

### Naming Rules and Patterns
1. **Lowercase with dots**: Use lowercase letters with dot notation for hierarchy
   - Example: `network.protocol.name`, `server.address`
2. **Hierarchical structure**: Reflect semantic context in naming
   - Example: `gen_ai.usage.prompt_tokens` (category.subcategory.metric)
3. **Descriptive and specific**: Attribute names should be self-documenting
   - Example: `gen_ai.operation.name` vs generic `operation`
4. **Consistent normalization**: Protocol and network values should be lowercase

### Custom Attribute Namespacing

#### Recommended Patterns
1. **Reverse Domain Style**: `com.yourcompany.custom.attribute`
2. **Project Prefix**: `project_name.category.attribute`
3. **Service Prefix**: `service_name.operation.attribute`

#### Examples for Custom Namespaces
```
# Good Examples
commit_story.commit.hash
commit_story.sections.summary_length
commit_story.journal.file_path

# Avoid
custom.attribute
my_app.thing
cs.data
```

### Best Practices
1. **Be specific**: Provide clear, contextual information
2. **Maintain consistency**: Follow established patterns within your namespace
3. **Use meaningful hierarchies**: Group related attributes logically
4. **Document custom attributes**: Maintain clear documentation for non-standard attributes

## VCS (Version Control System) Conventions

### Research Finding
**❌ No official VCS semantic conventions found** in OpenTelemetry 1.37.0 specification.

### Recommendation for Git Operations
Since no official VCS conventions exist, recommend custom namespace following general patterns:

#### Proposed Git Attribute Namespace
```
# Repository Information
vcs.repository.url         # Git repository URL
vcs.repository.path        # Local repository path
vcs.branch.name            # Current branch name
vcs.branch.ref             # Branch reference (HEAD, refs/heads/main)

# Commit Information
vcs.commit.id              # Full commit hash
vcs.commit.id.short        # Short commit hash (7-8 chars)
vcs.commit.message         # Commit message (first line recommended)
vcs.commit.author.name     # Commit author name
vcs.commit.author.email    # Commit author email
vcs.commit.timestamp       # Commit timestamp (ISO 8601)

# Change Information
vcs.diff.files_changed     # Number of files changed
vcs.diff.lines_added       # Lines added in diff
vcs.diff.lines_deleted     # Lines deleted in diff
```

#### Alternative: Project-Specific Namespace
```
# If VCS conventions are not standardized, use project namespace
commit_story.git.commit_hash
commit_story.git.commit_message
commit_story.git.repository_path
```

## Code Operations Conventions

### Research Finding
**⚠️ Limited documentation found** for Code semantic conventions in OpenTelemetry 1.37.0.

### Recommendation for File Operations
Propose following general naming patterns for file system operations:

#### File System Attributes
```
# File Information
file.path                  # File path (absolute or relative)
file.name                  # File name with extension
file.extension             # File extension (.js, .md, .json)
file.size                  # File size in bytes

# Directory Information
dir.path                   # Directory path
dir.name                   # Directory name

# Operation Information
operation.type             # read, write, create, delete
operation.duration_ms      # Operation duration in milliseconds
```

## Current Commit-Story Attribute Analysis

### ✅ Compliant Attributes (Already Correct)
| Current Attribute | Status | Notes |
|------------------|--------|-------|
| `gen_ai.request.model` | ✅ Correct | Follows GenAI conventions |
| `gen_ai.response.model` | ✅ Correct | Follows GenAI conventions |
| `gen_ai.operation.name` | ✅ Correct | Set to "chat" appropriately |
| `gen_ai.provider.name` | ✅ Correct | Provider detection implemented |
| `gen_ai.usage.input_tokens` | ✅ Correct | Standard usage metric |
| `gen_ai.usage.output_tokens` | ✅ Correct | Standard usage metric |
| `gen_ai.request.temperature` | ✅ Correct | Standard request parameter |

### ⚠️ Mixed Convention Attributes (Need Migration)
| Current Attribute | Issue | Recommended Fix |
|------------------|-------|------------------|
| `ai.request.messages.count` | Mixed with GenAI | `gen_ai.request.messages.count` |
| `ai.response.length` | Mixed with GenAI | `gen_ai.response.length` OR `commit_story.response.length` |

### ❌ Custom Attributes (Need Namespace)
| Current Attribute | Issue | Recommended Fix |
|------------------|-------|------------------|
| `commit.hash` | No standard VCS conventions | `vcs.commit.id` OR `commit_story.commit.hash` |
| `commit.message` | No standard VCS conventions | `vcs.commit.message` OR `commit_story.commit.message` |
| `commit.ref` | No standard VCS conventions | `vcs.branch.ref` OR `commit_story.commit.ref` |
| `repo.path` | No standard VCS conventions | `vcs.repository.path` OR `commit_story.repository.path` |
| `chat.messages.count` | Custom business metric | `commit_story.chat.messages.count` |
| `sections.summary.length` | Custom business metric | `commit_story.sections.summary.length` |
| `journal.filePath` | Custom business metric | `commit_story.journal.file_path` |
| `context.tokens.reduction` | Custom processing metric | `commit_story.context.tokens.reduction` |

## Migration Recommendations

### Phase 1: Fix Mixed Conventions (Priority 1)
1. Replace `ai.request.messages.count` → `gen_ai.request.messages.count`
2. Replace `ai.response.length` → `gen_ai.response.length`
3. Apply changes across all AI generators (3 files)

### Phase 2: Establish Custom Namespace (Priority 2)
1. **Decision Required**: Choose between `vcs.*` or `commit_story.*` for git operations
2. **Recommendation**: Use `commit_story.*` for all custom attributes for consistency
3. Update all custom business attributes to use consistent namespace

### Phase 3: Add Missing GenAI Features (Priority 3)
1. Add `gen_ai.input.messages` and `gen_ai.output.messages` (structured or JSON)
2. Add `gen_ai.content.prompt` and `gen_ai.content.completion` events
3. Add conversation ID tracking with `gen_ai.conversation.id`

## Implementation Notes

### Environment Variables
```bash
# Enable latest experimental GenAI conventions
export OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental

# Optional: Enable GenAI content capture for debugging
export OTEL_GENAI_CAPTURE_CONTENT=true
```

### Structured vs JSON Attributes
- **Preferred**: Use structured format when supported by language SDK
- **Fallback**: Serialize to JSON string for spans, use structured format for events
- **Example**: `gen_ai.input.messages` as structured array vs JSON string

### Provider Detection
Current implementation is correct and follows best practices:
```javascript
function getProviderFromModel(model) {
  if (model.startsWith('gpt-') || model.startsWith('o1-')) return 'openai';
  if (model.startsWith('claude')) return 'anthropic';
  if (model.startsWith('gemini')) return 'google';
  if (model.startsWith('llama')) return 'meta';
  return 'unknown';
}
```

## Next Steps

1. **Complete Migration Plan**: Create detailed attribute mapping table
2. **Implementation Priority**: Start with mixed convention fixes (highest impact)
3. **Custom Namespace Decision**: Choose between `vcs.*` vs `commit_story.*` approach
4. **Validation Plan**: Update test scripts to verify convention compliance
5. **Documentation**: Update instrumentation guide with new conventions

## References

- OpenTelemetry Semantic Conventions v1.37.0
- OpenTelemetry GenAI Semantic Conventions (Experimental)
- OpenTelemetry General Attribute Guidelines
- AI Agent Observability Best Practices (2025)

---

**Generated by**: OpenTelemetry Semantic Conventions Research
**For**: commit-story project
**Last Updated**: September 18, 2025