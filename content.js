// This script runs in the context of the active web page.
// It intelligently extracts the most relevant content for itinerary planning.

(() => {
  /**
   * Clones an element, removes common non-content tags, and returns its text.
   * This provides a cleaner text block to the LLM.
   * @param {HTMLElement} element The element to process.
   * @returns {string} The cleaned text content.
   */
  function getCleanedText(element) {
    if (!element) return '';
    // Clone the element to avoid modifying the live page
    const clone = element.cloneNode(true);
    // Remove common non-content elements
    const selectorsToRemove = 'nav, footer, aside, header, script, style, [role="navigation"], [role="banner"], [role="contentinfo"]';
    clone.querySelectorAll(selectorsToRemove).forEach(el => el.remove());
    return clone.innerText.trim();
  }

  /**
   * Finds and returns the text content from the most relevant element on the page.
   * The priority is:
   * 1. The last response in a known LLM chat interface.
   * 2. The content within a <main> element.
   * 3. The content within the first <article> element.
   * 4. As a fallback, the entire text of the page body.
   * @returns {string} The extracted text content.
   */
  function getPageContent() {
    // Priority 1: Find the last response in an LLM chat.
    const selectors = [
      '.model-response-text .markdown', // Gemini
      'div[data-message-author-role="assistant"] .markdown', // ChatGPT
      '.model-response-text', // Gemini (fallback)
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        // Return the last matching element's text
        return getCleanedText(elements[elements.length - 1]);
      }
    }

    // Priority 2: Find the <main> element, which is semantically correct for main content.
    const mainElement = document.querySelector('main');
    if (mainElement) return getCleanedText(mainElement);

    // Priority 3: Find the first <article> element.
    const articleElement = document.querySelector('article');
    if (articleElement) return getCleanedText(articleElement);

    // Priority 4: Fallback to the entire body's text.
    // The body is a special case; we clean it directly.
    return getCleanedText(document.body);
  }

  return getPageContent();
})();