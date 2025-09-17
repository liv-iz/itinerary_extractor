const extractButton = document.getElementById('extractButton');
const resultsDiv = document.getElementById('results');
const actionsContainer = document.getElementById('actionsContainer');
const spinner = document.getElementById('spinner');

function setUIState(isLoading, message = '') {
  extractButton.disabled = isLoading;
  spinner.style.display = isLoading ? 'block' : 'none';
  resultsDiv.style.display = isLoading ? 'none' : 'block';
  if (message) {
    resultsDiv.innerText = message;
  }
  // Only show/hide actions based on whether the final result is a list
  actionsContainer.style.display = !isLoading && resultsDiv.innerText.includes('-') ? 'flex' : 'none';
}

document.getElementById('extractButton').addEventListener('click', () => {
  actionsContainer.style.display = 'none'; // Hide actions on new request
  const itineraryType = document.querySelector('input[name="itineraryType"]:checked').value;
  setUIState(true, 'Extracting content...');
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];

    // Inject the content script to get the page's text content
    chrome.scripting.executeScript(
      {
        target: { tabId: activeTab.id },
        files: ['content.js'],
      },
      (injectionResults) => {
        if (chrome.runtime.lastError || !injectionResults || !injectionResults[0]) {
          setUIState(false, 'Error: Could not extract content from the page.');
          return;
        }
        
        const pageContent = injectionResults[0].result;
        resultsDiv.innerText = 'Content extracted. Asking Gemini...';
        callGeminiApi(pageContent, itineraryType);
      }
    );
  });
});

// Add event listener for the new map button
document.getElementById('openMapsButton').addEventListener('click', () => {
  const locationsText = resultsDiv.innerText;

  // Parse the bulleted list into an array of locations
  const locations = locationsText.split('\n')
    .map(line => line.replace(/^-/,'').trim()) // Remove leading hyphens and trim whitespace
    .filter(line => line.length > 0); // Remove any empty lines

  if (locations.length === 0) {
    return; // Do nothing if no locations were parsed
  } else if (locations.length === 1) { // Exactly one location, create a search query
    const query = encodeURIComponent(locations[0]);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    chrome.tabs.create({ url: mapsUrl });
  } else { // More than one location, create one or more directions routes in chunks
    const MAX_MAP_STOPS = 10;
    for (let i = 0; i < locations.length; i += MAX_MAP_STOPS) {
      const chunk = locations.slice(i, i + MAX_MAP_STOPS);
      const waypoints = chunk.map(location => encodeURIComponent(location)).join('/');
      const mapsUrl = `https://www.google.com/maps/dir/${waypoints}`;
      chrome.tabs.create({ url: mapsUrl });
    }
  }
});

// Add event listener for the new copy button
document.getElementById('copyButton').addEventListener('click', () => {
  const copyButton = document.getElementById('copyButton');
  const buttonText = copyButton.querySelector('.button-text');
  const textToCopy = resultsDiv.innerText;

  navigator.clipboard.writeText(textToCopy).then(() => {
    // Provide user feedback that copy was successful
    const originalText = buttonText.innerText;
    buttonText.innerText = 'Copied!';
    setTimeout(() => {
      buttonText.innerText = originalText;
    }, 1500); // Revert text after 1.5 seconds
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
});

async function callGeminiApi(text, itineraryType) {
  // Securely retrieve the API key from user's storage
  chrome.storage.sync.get(['apiKey'], async (result) => {
    if (!result.apiKey) {
      // Guide the user to the options page if the key is not set
      setUIState(false);
      resultsDiv.innerHTML = 'API Key not found. Please <a href="#" id="openOptionsLink">set your key in the options page</a>.';
      // Add a click listener to the new link to correctly open the options page
      document.getElementById('openOptionsLink').addEventListener('click', (e) => {
        e.preventDefault(); // Prevent the link from navigating
        chrome.runtime.openOptionsPage();
      });
      return;
    }

    const apiKey = result.apiKey;
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
           throw new Error(`API request failed: Bad request. Is your API key valid?`);
        }
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        const geminiResponse = data.candidates[0].content.parts[0].text;
        setUIState(false, geminiResponse);
      } else {
        setUIState(false, "Gemini returned an empty response.");
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setUIState(false, `Error: Could not get response from Gemini API. ${error.message}`);
    }
  });
}