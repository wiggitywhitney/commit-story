/**
 * Minimal security filter for sensitive data
 * Catches the obvious leaks without over-engineering
 * 
 * Follows DD-004 (Minimal Implementation Only) - ship fast, learn fast
 */

/**
 * Redacts common sensitive data patterns from text
 * @param {string} text - Text to filter
 * @returns {string} Text with sensitive data redacted
 */
export function redactSensitiveData(text) {
  if (!text) return text;
  
  return text
    // API Keys
    .replace(/sk-[a-zA-Z0-9]{20,}/g, '[REDACTED_KEY]')
    .replace(/gh[ps]_[a-zA-Z0-9]{36}/g, '[REDACTED_TOKEN]')
    .replace(/AKIA[A-Z0-9]{16}/g, '[REDACTED_AWS_KEY]')
    
    // Auth tokens
    .replace(/Bearer\s+[a-zA-Z0-9-._~+/]+/gi, '[REDACTED_TOKEN]')
    
    // Personal info
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    
    // Passwords in configs
    .replace(/password[\s]*[:=][\s]*["']?[^"'\s]+/gi, '[REDACTED_PASSWORD]');
}