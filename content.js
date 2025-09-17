// This script runs in the context of the active web page.
// It intelligently extracts the most relevant content for itinerary planning.

(() => {
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
        return elements[elements.length - 1].innerText.trim();
      }
    }

    // Priority 2: Find the <main> element, which is semantically correct for main content.
    const mainElement = document.querySelector('main');
    if (mainElement) return mainElement.innerText.trim();

    // Priority 3: Find the first <article> element.
    const articleElement = document.querySelector('article');
    if (articleElement) return articleElement.innerText.trim();

    // Priority 4: Fallback to the entire body's text.
    return document.body.innerText.trim();
  }

  return getPageContent();
})();