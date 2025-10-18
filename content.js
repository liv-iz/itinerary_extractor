// This script runs in the context of the active web page.
// It extracts the most relevant content for itinerary planning.

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
    for (const el of clone.querySelectorAll(selectorsToRemove)) {
      el.remove();
    }
    return clone.innerText.trim();
  }

  /**
   * From a list of elements, finds the one with the most text content.
   * @param {NodeListOf<HTMLElement>} elements The elements to check.
   * @returns {HTMLElement|null} The element with the most text, or null.
   */
  function findBestElement(elements) {
    if (!elements || elements.length === 0) {
      return null;
    }
    return Array.from(elements).reduce((best, current) => {
      if (!best) return current;
      return (current.innerText.length > best.innerText.length) ? current : best;
    }, null);
  }

  /**
   * Finds and returns the text content from the most relevant element on the page.
   * The priority is:
   * 1. Known LLM chat interfaces (e.g., Gemini, ChatGPT).
   * 2. The <main> element.
   * 3. The longest <article> element.
   * 4. Common content container selectors (e.g., #content, .post-body).
   * 5. As a fallback, the entire text of the page body.
   * @returns {string} The extracted text content.
   */
  function getPageContent() {
    // Priority 1: LLM chat interfaces
    const llmSelectors = [
      '.model-response-text .markdown', // Gemini
      'div[data-message-author-role="assistant"] .markdown', // ChatGPT
      '.model-response-text', // Gemini (fallback)
    ];

    for (const selector of llmSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        return getCleanedText(elements.at(-1));
      }
    }

    // Priority 2: The <main> element
    const mainElement = document.querySelector('main');
    if (mainElement) return getCleanedText(mainElement);

    // Priority 3: The longest <article> element
    const bestArticle = findBestElement(document.querySelectorAll('article'));
    if (bestArticle) return getCleanedText(bestArticle);

    // Priority 4: Common content container selectors for blogs/articles
    const commonContentSelectors = [
      '#content', '#main-content', '#main', // Common IDs
      '.post-content', '.entry-content', '.post-body', '.main-content', // Common classes
    ];
    for (const selector of commonContentSelectors) {
        const element = document.querySelector(selector);
        if (element) return getCleanedText(element);
    }

    // Priority 5: Fallback to the entire body's text.
    return getCleanedText(document.body);
  }

  return getPageContent();
})();