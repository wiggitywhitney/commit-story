/**
 * AI-Powered Session Filter for Multi-Session Contamination Prevention
 * Uses semantic analysis to determine which Claude Code sessions relate to git commits
 */

import OpenAI from 'openai';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { OTEL } from '../telemetry/standards.js';
import { createNarrativeLogger } from './trace-logger.js';

// Get tracer instance for session filter instrumentation
const tracer = trace.getTracer('commit-story-session-filter', '1.0.0');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Filter messages to include only sessions relevant to the commit
 * @param {Array} messages - All messages from time window
 * @param {Set} sessionIds - Set of unique session IDs detected
 * @param {string} repoPath - Repository path for context
 * @param {Object} logger - Narrative logger for progress updates
 * @returns {Array} Filtered messages from relevant sessions only
 */
export async function filterRelevantSessions(messages, sessionIds, repoPath, logger) {
  return tracer.startActiveSpan(OTEL.span.filters.session_filter(), {
    attributes: {
      'code.function': 'filterRelevantSessions'
    }
  }, async (span) => {
    const sessionLogger = createNarrativeLogger('session.filter_relevant');
    const startTime = Date.now();

    try {
      sessionLogger.start('session filtering', `Processing ${messages.length} messages from ${sessionIds.size} sessions`);

      // Group messages by sessionId for analysis
      const sessionGroups = await groupMessagesBySession(messages, sessionIds);

      // Get git context for the AI analysis
      const gitContext = await getGitContextForFilter(repoPath);

      // Call AI to analyze which sessions are relevant
      const selectedSessionIds = await analyzeSessionsWithAI(sessionGroups, gitContext, sessionLogger);

      let finalMessages;
      let filterType;

      if (selectedSessionIds.length === 0) {
        sessionLogger.decision('session filtering', 'AI found no relevant sessions - using fallback selection');
        logger.progress('chat message collection', 'AI filter found no relevant sessions - using most recent session as fallback');
        finalMessages = await getMostRecentSessionMessages(sessionGroups);
        filterType = 'fallback';
      } else {
        // Return messages from selected sessions only
        finalMessages = messages.filter(msg => selectedSessionIds.includes(msg.sessionId));
        logger.progress('chat message collection', `AI selected ${selectedSessionIds.length} session(s): ${selectedSessionIds.map(id => id.slice(0, 8)).join(', ')}`);
        filterType = 'ai_analysis';
      }

      const sessionData = {
        totalMessages: messages.length,
        totalSessions: sessionIds.size,
        selectedSessions: selectedSessionIds.length || 1, // Include fallback
        filteredMessages: finalMessages.length,
        filterType,
        processingDuration: Date.now() - startTime
      };

      span.setAttributes(OTEL.attrs.sessionFiltering(sessionData));

      // Emit metrics
      Object.entries(OTEL.attrs.sessionFiltering(sessionData)).forEach(([name, value]) => {
        OTEL.metrics.gauge(name, typeof value === 'string' ? 1 : value, { filter_type: filterType });
      });

      sessionLogger.complete('session filtering', `Session filtering completed using ${filterType} - selected ${finalMessages.length} messages`);
      span.setStatus({ code: SpanStatusCode.OK, message: 'Session filtering completed successfully' });

      return finalMessages;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      sessionLogger.error('session filtering', 'Session filtering failed', error);
      logger.progress('chat message collection', `Session filter error: ${error.message} - using first session as fallback`);

      // Fallback: return messages from first session
      const firstSessionId = Array.from(sessionIds)[0];
      const fallbackMessages = messages.filter(msg => msg.sessionId === firstSessionId);

      const fallbackData = {
        totalMessages: messages.length,
        totalSessions: sessionIds.size,
        selectedSessions: 1,
        filteredMessages: fallbackMessages.length,
        filterType: 'error_fallback',
        processingDuration: Date.now() - startTime
      };

      span.setAttributes(OTEL.attrs.sessionFiltering(fallbackData));

      // Emit fallback metrics
      Object.entries(OTEL.attrs.sessionFiltering(fallbackData)).forEach(([name, value]) => {
        OTEL.metrics.gauge(name, typeof value === 'string' ? 1 : value, { filter_type: 'error_fallback' });
      });

      return fallbackMessages;
    } finally {
      span.end();
    }
  });
}

/**
 * Group messages by sessionId for easier analysis
 */
function groupMessagesBySession(messages, sessionIds) {
  return tracer.startActiveSpan(OTEL.span.filters.session_grouping(), {
    attributes: {
      'code.function': 'groupMessagesBySession'
    }
  }, (span) => {
    const logger = createNarrativeLogger('session.group_messages');
    const startTime = Date.now();

    try {
      logger.start('message grouping', `Grouping ${messages.length} messages by ${sessionIds.size} session IDs`);

      const groups = {};

      for (const sessionId of sessionIds) {
        const sessionMessages = messages.filter(msg => msg.sessionId === sessionId);
        groups[sessionId] = {
          sessionId,
          messages: sessionMessages
        };

        logger.progress('message grouping', `Session ${sessionId.slice(0, 8)}: ${sessionMessages.length} messages`);
      }

      const groupingData = {
        inputMessages: messages.length,
        sessionIds: sessionIds.size,
        groupsCreated: Object.keys(groups).length,
        processingDuration: Date.now() - startTime
      };

      span.setAttributes(OTEL.attrs.sessionGrouping(groupingData));

      // Emit metrics
      Object.entries(OTEL.attrs.sessionGrouping(groupingData)).forEach(([name, value]) => {
        OTEL.metrics.gauge(name, value);
      });

      logger.complete('message grouping', `Created ${Object.keys(groups).length} session groups`);
      span.setStatus({ code: SpanStatusCode.OK, message: 'Message grouping completed successfully' });

      return groups;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      logger.error('message grouping', 'Message grouping failed', error);
      return {};
    } finally {
      span.end();
    }
  });
}

/**
 * Get git context for AI analysis (commit message, files changed, etc.)
 */
async function getGitContextForFilter(repoPath) {
  return tracer.startActiveSpan(OTEL.span.filters.git_context(), {
    attributes: {
      'code.function': 'getGitContextForFilter'
    }
  }, async (span) => {
    const logger = createNarrativeLogger('session.get_git_context');
    const startTime = Date.now();

    try {
      logger.start('git context gathering', `Gathering git context for repository: ${repoPath}`);

      // For now, return basic context - can be enhanced with actual git data
      // TODO: Add actual git commit info when available in the context
      const context = {
        commitMessage: 'PRD-24 packaging and deployment changes',
        files: ['prds/24-package-deploy.md'],
        changes: 'Added new PRD document for packaging version 1.1.0'
      };

      const contextData = {
        commitMessage: context.commitMessage,
        filesCount: context.files.length,
        contextType: 'static', // Will be 'dynamic' when we add real git integration
        gatherDuration: Date.now() - startTime
      };

      span.setAttributes(OTEL.attrs.gitContext(contextData));

      // Emit metrics
      Object.entries(OTEL.attrs.gitContext(contextData)).forEach(([name, value]) => {
        OTEL.metrics.gauge(name, typeof value === 'string' ? 1 : value, { context_type: contextData.contextType });
      });

      logger.complete('git context gathering', `Retrieved ${contextData.contextType} git context with ${contextData.filesCount} files`);
      span.setStatus({ code: SpanStatusCode.OK, message: 'Git context gathering completed successfully' });

      return context;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      logger.error('git context gathering', 'Git context gathering failed', error);

      // Return minimal fallback context
      return {
        commitMessage: 'Unknown commit',
        files: [],
        changes: 'Context unavailable'
      };
    } finally {
      span.end();
    }
  });
}

/**
 * Use AI to analyze which sessions relate to the commit
 */
async function analyzeSessionsWithAI(sessionGroups, gitContext, logger) {
  return tracer.startActiveSpan(OTEL.span.filters.ai_analysis(), {
    attributes: {
      'code.function': 'analyzeSessionsWithAI'
    }
  }, async (span) => {
    const aiLogger = createNarrativeLogger('session.ai_analysis');
    const startTime = Date.now();

    try {
      const sessionIds = Object.keys(sessionGroups);

      aiLogger.start('AI session analysis', `Analyzing ${sessionIds.length} sessions with GPT-4o-mini for relevance`);

      // Build the 4-step structured prompt from research
      const prompt = await buildSessionAnalysisPrompt(sessionGroups, gitContext);

      logger.progress('chat message collection', `Analyzing ${sessionIds.length} sessions with AI semantic filter`);

      const model = 'gpt-4o-mini';
      const temperature = 0.1;

      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are analyzing Claude Code chat sessions to determine which ones led to specific git commits. Be precise and follow the structured analysis format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: 1000
      });

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      aiLogger.progress('AI session analysis', `Received ${aiResponse.length} character response from AI`);

      // Parse JSON response
      const result = await parseAISessionSelection(aiResponse);

      if (!result.sessionIds || result.sessionIds.length === 0) {
        aiLogger.decision('AI session analysis', 'AI found no clearly relevant sessions');
        logger.progress('chat message collection', 'AI analysis found no clearly relevant sessions');

        const analysisData = {
          sessionsAnalyzed: sessionIds.length,
          promptLength: prompt.length,
          responseLength: aiResponse.length,
          analysisSuccess: false,
          processingDuration: Date.now() - startTime,
          model,
          temperature,
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0
        };

        span.setAttributes(OTEL.attrs.aiAnalysis(analysisData));

        // Emit metrics with AI model context
        Object.entries(OTEL.attrs.aiAnalysis(analysisData)).forEach(([name, value]) => {
          OTEL.metrics.gauge(name, typeof value === 'boolean' ? (value ? 1 : 0) : (typeof value === 'string' ? 1 : value), {
            model,
            analysis_result: 'no_sessions_found'
          });
        });

        span.setStatus({ code: SpanStatusCode.OK, message: 'AI analysis completed - no relevant sessions found' });
        return [];
      }

      // Validate and map selected sessions (handle both short and full sessionIds)
      const validSessionIds = result.sessionIds.map(selectedId => {
        // First try exact match
        if (sessionGroups[selectedId]) return selectedId;

        // Then try partial match (in case AI used short form)
        const fullId = Object.keys(sessionGroups).find(fullId => fullId.startsWith(selectedId));
        return fullId;
      }).filter(Boolean);

      logger.progress('chat message collection', `AI confidence: selected ${validSessionIds.length}/${sessionIds.length} sessions as relevant`);

      const analysisData = {
        sessionsAnalyzed: sessionIds.length,
        promptLength: prompt.length,
        responseLength: aiResponse.length,
        analysisSuccess: true,
        processingDuration: Date.now() - startTime,
        model,
        temperature,
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0
      };

      span.setAttributes(OTEL.attrs.aiAnalysis(analysisData));

      // Emit metrics with AI model context
      Object.entries(OTEL.attrs.aiAnalysis(analysisData)).forEach(([name, value]) => {
        OTEL.metrics.gauge(name, typeof value === 'boolean' ? (value ? 1 : 0) : (typeof value === 'string' ? 1 : value), {
          model,
          analysis_result: 'sessions_selected',
          selected_count: validSessionIds.length.toString()
        });
      });

      aiLogger.complete('AI session analysis', `AI selected ${validSessionIds.length}/${sessionIds.length} sessions as relevant`);
      span.setStatus({ code: SpanStatusCode.OK, message: 'AI analysis completed successfully' });

      return validSessionIds;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      aiLogger.error('AI session analysis', 'AI analysis failed', error);
      logger.progress('chat message collection', `AI analysis failed: ${error.message}`);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Build the 4-step structured prompt for AI session analysis
 */
function buildSessionAnalysisPrompt(sessionGroups, gitContext) {
  return tracer.startActiveSpan(OTEL.span.filters.prompt_building(), {
    attributes: {
      'code.function': 'buildSessionAnalysisPrompt'
    }
  }, (span) => {
    const logger = createNarrativeLogger('session.build_prompt');
    const startTime = Date.now();

    try {
      const sessionIds = Object.keys(sessionGroups);

      logger.start('prompt building', `Building AI analysis prompt for ${sessionIds.length} sessions`);

      let prompt = `# Step 1: Review Available Data

Recent commit details:
**Message**: ${gitContext.commitMessage}
**Files**: ${gitContext.files.join(', ') || 'Multiple files'}
**Changes**: ${gitContext.changes}

You have conversation data from ${sessionIds.length} sessions (each from a different Claude Code tab):
`;

      let totalMessages = 0;
      let recentMessages = 0;
      let gitCommitsDetected = 0;

      // Add session summaries
      sessionIds.forEach((sessionId, index) => {
        const session = sessionGroups[sessionId];
        const messageCount = session.messages.length;
        const recentSessionMessages = session.messages.slice(-5); // Last 5 messages for context

        totalMessages += messageCount;
        recentMessages += recentSessionMessages.length;

        prompt += `
Session ${index + 1} (${sessionId.slice(0, 8)}):
- ${messageCount} total messages
- Recent messages:`;

        recentSessionMessages.forEach(msg => {
          // Handle Claude Code message format where content is in msg.message.content
          let content = '';

          // Try different content extraction paths
          const contentSource = msg.message?.content || msg.content;

          if (typeof contentSource === 'string') {
            content = contentSource;
          } else if (Array.isArray(contentSource) && contentSource.length > 0) {
            // Extract text from content array (Claude Code format)
            content = contentSource
              .map(item => {
                if (typeof item === 'string') return item;
                if (item.text) return item.text;
                if (item.type === 'text' && item.text) return item.text;
                if (item.type === 'tool_use') return `[${item.name || 'tool'}]`;
                if (item.type === 'tool_result') return '[tool result]';
                return '';
              })
              .filter(Boolean)
              .join(' ');
          } else if (contentSource && contentSource.text) {
            content = contentSource.text;
          }

          const messageType = msg.message?.role || msg.type || 'unknown';
          const preview = content ? content.substring(0, 100) + '...' : '[no text content]';
          prompt += `\n  - ${messageType}: ${preview}`;
        });

        // Check for git commit evidence
        const hasGitCommit = checkForGitCommit(session.messages);
        if (hasGitCommit) {
          prompt += `\n  - Contains git commit command (strong signal)`;
          gitCommitsDetected++;
        }

        prompt += '\n';
      });

      prompt += `
# Step 2: Examine Sessions

For each session above, what topics were discussed?

# Step 3: Analyze Commit

Look at the commit details to understand what was changed/implemented.

# Step 4: Make Selection

Which session(s) led to this commit?

Note: If a session's last message contains "git commit" in a Bash command, that session definitely relates to this commit.

Respond with a JSON object containing:
- key "sessionIds": value must be an array of sessionId strings (use full sessionIds, not the 8-char previews)
`;

      const promptData = {
        sessionsIncluded: sessionIds.length,
        totalMessages,
        recentMessages,
        gitCommitsDetected,
        promptLength: prompt.length,
        buildDuration: Date.now() - startTime
      };

      span.setAttributes(OTEL.attrs.promptBuilding(promptData));

      // Emit metrics
      Object.entries(OTEL.attrs.promptBuilding(promptData)).forEach(([name, value]) => {
        OTEL.metrics.gauge(name, value, { commit_evidence: gitCommitsDetected > 0 ? 'detected' : 'none' });
      });

      logger.complete('prompt building', `Built ${prompt.length} character prompt with ${gitCommitsDetected} git commit signals`);
      span.setStatus({ code: SpanStatusCode.OK, message: 'Prompt building completed successfully' });

      return prompt;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      logger.error('prompt building', 'Prompt building failed', error);

      // Return minimal fallback prompt
      return `Analyze these sessions and return JSON with sessionIds array: ${JSON.stringify(Object.keys(sessionGroups))}`;
    } finally {
      span.end();
    }
  });
}

/**
 * Check if session contains git commit evidence
 */
function checkForGitCommit(messages) {
  return tracer.startActiveSpan(OTEL.span.filters.commit_detection(), {
    attributes: {
      'code.function': 'checkForGitCommit'
    }
  }, (span) => {
    const logger = createNarrativeLogger('session.check_git_commit');
    const startTime = Date.now();

    try {
      logger.start('git commit detection', `Checking last 3 messages out of ${messages.length} for git commit commands`);

      const lastFewMessages = messages.slice(-3);
      let gitCommitsFound = 0;
      let toolUseMessages = 0;
      let bashCommands = 0;

      const hasCommit = lastFewMessages.some(msg => {
        // Check for git commit in Claude Code message format
        const contentSource = msg.message?.content || msg.content;
        const messageType = msg.message?.role || msg.type;

        if (messageType === 'assistant' && Array.isArray(contentSource)) {
          toolUseMessages++;

          // Look for tool_use blocks with Bash commands containing "git commit"
          return contentSource.some(item => {
            if (item.type === 'tool_use' && item.name === 'Bash') {
              bashCommands++;
              const input = item.input?.command || '';
              const hasGitCommit = input.toLowerCase().includes('git commit');

              if (hasGitCommit) {
                gitCommitsFound++;
                logger.progress('git commit detection', `Found git commit in Bash command: ${input.substring(0, 50)}...`);
              }

              return hasGitCommit;
            }
            if (item.text && typeof item.text === 'string') {
              const hasGitCommit = item.text.toLowerCase().includes('git commit');
              if (hasGitCommit) {
                gitCommitsFound++;
                logger.progress('git commit detection', `Found git commit in text: ${item.text.substring(0, 50)}...`);
              }
              return hasGitCommit;
            }
            return false;
          });
        }
        return false;
      });

      const detectionData = {
        messagesChecked: lastFewMessages.length,
        gitCommitsFound,
        toolUseMessages,
        bashCommands,
        detectionDuration: Date.now() - startTime
      };

      span.setAttributes(OTEL.attrs.commitDetection(detectionData));

      // Emit metrics
      Object.entries(OTEL.attrs.commitDetection(detectionData)).forEach(([name, value]) => {
        OTEL.metrics.gauge(name, value, {
          commit_found: hasCommit ? 'yes' : 'no',
          total_messages: messages.length.toString()
        });
      });

      if (hasCommit) {
        logger.complete('git commit detection', `Git commit evidence found - detected ${gitCommitsFound} git commit commands`);
      } else {
        logger.complete('git commit detection', `No git commit evidence found in recent messages`);
      }

      span.setStatus({ code: SpanStatusCode.OK, message: 'Git commit detection completed successfully' });

      return hasCommit;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      logger.error('git commit detection', 'Git commit detection failed', error);
      return false;
    } finally {
      span.end();
    }
  });
}

/**
 * Parse AI response to extract selected session IDs
 */
function parseAISessionSelection(aiResponse) {
  return tracer.startActiveSpan(OTEL.span.filters.ai_parsing(), {
    attributes: {
      'code.function': 'parseAISessionSelection'
    }
  }, (span) => {
    const logger = createNarrativeLogger('session.parse_ai_response');
    const startTime = Date.now();

    try {
      logger.start('AI response parsing', `Parsing ${aiResponse.length} character AI response for session IDs`);

      // Look for JSON in the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonFound = !!jsonMatch;

      if (!jsonMatch) {
        logger.error('AI response parsing', 'No JSON found in AI response', new Error('JSON not found'));
        throw new Error('No JSON found in AI response');
      }

      logger.progress('AI response parsing', `Found JSON block in response: ${jsonMatch[0].substring(0, 100)}...`);

      const parsed = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(parsed.sessionIds)) {
        logger.error('AI response parsing', 'sessionIds field is not an array', new Error('Invalid sessionIds format'));
        throw new Error('sessionIds must be an array');
      }

      const parseData = {
        responseLength: aiResponse.length,
        jsonFound,
        sessionIdsExtracted: parsed.sessionIds.length,
        parseSuccess: true,
        parseDuration: Date.now() - startTime
      };

      span.setAttributes(OTEL.attrs.aiResponseParsing(parseData));

      // Emit metrics
      Object.entries(OTEL.attrs.aiResponseParsing(parseData)).forEach(([name, value]) => {
        OTEL.metrics.gauge(name, typeof value === 'boolean' ? (value ? 1 : 0) : value, {
          parse_result: 'success',
          session_count: parsed.sessionIds.length.toString()
        });
      });

      logger.complete('AI response parsing', `Successfully extracted ${parsed.sessionIds.length} session IDs from AI response`);
      span.setStatus({ code: SpanStatusCode.OK, message: 'AI response parsing completed successfully' });

      return parsed;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      logger.error('AI response parsing', 'AI response parsing failed', error);

      const parseData = {
        responseLength: aiResponse.length,
        jsonFound: false,
        sessionIdsExtracted: 0,
        parseSuccess: false,
        parseDuration: Date.now() - startTime
      };

      span.setAttributes(OTEL.attrs.aiResponseParsing(parseData));

      // Emit error metrics
      Object.entries(OTEL.attrs.aiResponseParsing(parseData)).forEach(([name, value]) => {
        OTEL.metrics.gauge(name, typeof value === 'boolean' ? (value ? 1 : 0) : value, {
          parse_result: 'error',
          error_type: error.message.includes('JSON') ? 'json_not_found' : 'parse_error'
        });
      });

      throw new Error(`Failed to parse AI response: ${error.message}`);
    } finally {
      span.end();
    }
  });
}

/**
 * Fallback: get messages from most recently active session
 */
function getMostRecentSessionMessages(sessionGroups) {
  return tracer.startActiveSpan(OTEL.span.filters.fallback_selection(), {
    attributes: {
      'code.function': 'getMostRecentSessionMessages'
    }
  }, (span) => {
    const logger = createNarrativeLogger('session.fallback_selection');
    const startTime = Date.now();

    try {
      const sessionIds = Object.keys(sessionGroups);

      logger.start('fallback selection', `Selecting most recent session from ${sessionIds.length} available sessions`);

      if (sessionIds.length === 0) {
        logger.complete('fallback selection', 'No sessions available - returning empty result');

        const fallbackData = {
          sessionsAvailable: 0,
          messagesSelected: 0,
          selectionType: 'none_available',
          selectionDuration: Date.now() - startTime
        };

        span.setAttributes(OTEL.attrs.fallbackSelection(fallbackData));

        // Emit metrics
        Object.entries(OTEL.attrs.fallbackSelection(fallbackData)).forEach(([name, value]) => {
          OTEL.metrics.gauge(name, typeof value === 'string' ? 1 : value, { selection_type: fallbackData.selectionType });
        });

        span.setStatus({ code: SpanStatusCode.OK, message: 'Fallback selection completed - no sessions available' });
        return [];
      }

      // Find session with most recent message
      let mostRecentSession = null;
      let mostRecentTime = null;

      for (const sessionId of sessionIds) {
        const session = sessionGroups[sessionId];
        if (session.messages.length === 0) continue;

        const lastMessage = session.messages[session.messages.length - 1];
        const messageTime = new Date(lastMessage.timestamp);

        if (!mostRecentTime || messageTime > mostRecentTime) {
          mostRecentTime = messageTime;
          mostRecentSession = session;

          logger.progress('fallback selection', `Session ${sessionId.slice(0, 8)} is most recent: ${messageTime.toISOString()}`);
        }
      }

      const selectedMessages = mostRecentSession ? mostRecentSession.messages : [];

      const fallbackData = {
        sessionsAvailable: sessionIds.length,
        messagesSelected: selectedMessages.length,
        selectionType: 'most_recent',
        selectionDuration: Date.now() - startTime
      };

      span.setAttributes(OTEL.attrs.fallbackSelection(fallbackData));

      // Emit metrics
      Object.entries(OTEL.attrs.fallbackSelection(fallbackData)).forEach(([name, value]) => {
        OTEL.metrics.gauge(name, typeof value === 'string' ? 1 : value, { selection_type: fallbackData.selectionType });
      });

      if (mostRecentSession) {
        logger.complete('fallback selection', `Selected session ${mostRecentSession.sessionId.slice(0, 8)} with ${selectedMessages.length} messages (most recent: ${mostRecentTime.toISOString()})`);
      } else {
        logger.complete('fallback selection', 'No session with messages found - returning empty result');
      }

      span.setStatus({ code: SpanStatusCode.OK, message: 'Fallback selection completed successfully' });

      return selectedMessages;

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      logger.error('fallback selection', 'Fallback selection failed', error);
      return [];
    } finally {
      span.end();
    }
  });
}