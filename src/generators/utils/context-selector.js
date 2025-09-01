/**
 * Context Selection Utility
 * 
 * Enables generators to opt-in to specific context data and automatically
 * generates accurate descriptions for AI prompts.
 */

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
  
  return {
    data: selectedData,
    description: description
  };
}