const extractButton = document.getElementById('extractButton');
const stateContainer = document.getElementById('state-container');
let currentResults = ''; // Store the latest results

// --- UI State Rendering Functions ---

function renderInitialState() {
  stateContainer.innerHTML = `
    <div class="state-container">
      <span class="material-symbols-outlined state-icon">auto_awesome</span>
      <p class="state-text">Click the button above to extract locations, neighborhoods, or cities from the current page.</p>
    </div>
  `;
}

function renderLoadingState() {
  extractButton.disabled = true;
  stateContainer.innerHTML = `
    <div class="state-container">
      <div class="spinner"></div>
      <p class="state-text">Extracting content and asking Gemini...</p>
    </div>
  `;
}

function renderErrorState(message) {
  extractButton.disabled = false;
  stateContainer.innerHTML = `
    <div class="state-container">
      <span class="material-symbols-outlined state-icon error-icon">error</span>
      <p class="state-text">${message}</p>
    </div>
  `;
  // Re-add listener for the options page link if it exists
  const optionsLink = document.getElementById('openOptionsLink');
  if (optionsLink) {
    optionsLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  }
}

function renderResultsState(resultsText) {
  extractButton.disabled = false;
  currentResults = resultsText; // Cache the results
  const isList = resultsText.trim().startsWith('-');

  // The results container will now manage scrolling and fixed actions.
  // The .actions div is now outside the scrollable .results-list.
  stateContainer.innerHTML = `
    <div class="results-container">
      <div class="results-list">${resultsText}</div>
      ${isList ? `
        <div class="actions">
          <button id="openMapsButton" class="button button-secondary">
            <span class="material-symbols-outlined">map</span>
            <span>Create Map</span>
          </button>
          <button id="copyButton" class="button button-secondary">
            <span class="material-symbols-outlined">content_copy</span>
            <span>Copy List</span>
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', renderInitialState);

extractButton.addEventListener('click', async () => {
  // --- Pre-flight check for API Key ---
  const { apiKey } = await chrome.storage.sync.get('apiKey');
  if (!apiKey) {
    renderErrorState('API Key not found. Please <a href="#" id="openOptionsLink">set your key</a> in the options page.');
    return; // Stop execution if no key is found
  }

  try {
    renderLoadingState();
    const itineraryType = document.querySelector('input[name="itineraryType"]:checked').value;

    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      files: ['content.js'],
    });

    if (chrome.runtime.lastError || !injectionResults || !injectionResults[0]) {
      throw new Error('Could not extract content from the page. Try reloading the tab.');
    }

    const pageContent = injectionResults[0].result;
    await callGeminiApi(pageContent, itineraryType, apiKey);
  } catch (error) {
    console.error('Extraction failed:', error);
    renderErrorState(`Error: ${error.message}`);
  }
});

// Use event delegation for action buttons inside the dynamic container
stateContainer.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button?.id === 'openMapsButton') {
    const locations = currentResults.split('\n')
      .map(line => line.replace(/^-/, '').trim())
      .filter(line => line.length > 0);

    if (locations.length === 0) return;

    if (locations.length === 1) {
      const query = encodeURIComponent(locations[0]);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
      chrome.tabs.create({ url: mapsUrl });
    } else {
      const MAX_MAP_STOPS = 10;
      for (let i = 0; i < locations.length; i += MAX_MAP_STOPS) {
        const chunk = locations.slice(i, i + MAX_MAP_STOPS);
        const waypoints = chunk.map(location => encodeURIComponent(location)).join('/');
        const mapsUrl = `https://www.google.com/maps/dir/${waypoints}`;
        chrome.tabs.create({ url: mapsUrl });
      }
    }
  } else if (button?.id === 'copyButton') {
    const buttonTextSpan = button.querySelector('span:last-child');
    navigator.clipboard.writeText(currentResults).then(() => {
      const originalText = buttonTextSpan.innerText;
      buttonTextSpan.innerText = 'Copied!';
      button.disabled = true;
      setTimeout(() => {
        buttonTextSpan.innerText = originalText;
        button.disabled = false;
      }, 1500);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      buttonTextSpan.innerText = 'Failed!';
    });
  }
});

async function callGeminiApi(text, itineraryType, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

  let prompt;
  const baseInstruction = `This is content from a webpage which contains locations for travel plans. Act as an expert travel itinerary assistant. The provided text may contain irrelevant content like ads, navigation links, or unrelated articles. Your task is to analyze the main content and extract a travel itinerary, following these rules strictly: 1. Identify the primary city or region of the itinerary. All extracted locations must belong to this primary area. 2. Ignore any locations mentioned in ads, sidebars, or links to other stories that are not part of the main itinerary. 3. List the locations in the same chronological order they appear in the original text. 4. Format the output as a simple, bulleted list, with each location on a new line starting with a hyphen. 5. For each location, provide context (like the city and country) to make it easy to find on a map. 6. Only include real, verifiable locations that are part of the core itinerary. 7. Do not include any other text, titles, or introductory sentences. 8. Do not include repetitions. 9. If no itinerary or locations are found, please state that.`;

  if (itineraryType === 'locations') {
    prompt = `Extract a list of specific points of interest (like museums, restaurants, landmarks, parks, etc.). Do NOT include the general neighborhood or district name as a separate item in the list, only the specific places within them. ${baseInstruction}`;
  } else if (itineraryType === 'neighborhoods') {
    prompt = `Extract a list of ONLY the neighborhoods, districts, or areas mentioned. Do NOT include specific points of interest like museums or restaurants. ${baseInstruction}`;
  } else { // 'cities'
    prompt = `Extract a list of ONLY the cities mentioned for a multi-city trip (e.g., a trip across a country or continent). Do NOT include specific points of interest, neighborhoods, or districts. ${baseInstruction}`;
  }
  
  prompt += `\n\nWebpage Text:\n---\n${text}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      if (response.status === 400) {
         throw new Error(`Bad request. Is your API key valid? Check the options page.`);
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) {
      const geminiResponse = data.candidates[0].content.parts[0].text.trim();
      renderResultsState(geminiResponse);
    } else {
      renderErrorState("Gemini returned an empty or invalid response.");
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    renderErrorState(`Error: ${error.message}`);
  }
}