document.getElementById('extractButton').addEventListener('click', () => {
  const resultsDiv = document.getElementById('results');
  document.getElementById('actionsContainer').style.display = 'none'; // Hide actions on new request
  resultsDiv.innerText = 'Extracting content...';

  // Get the current active tab
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
          resultsDiv.innerText = 'Error: Could not extract content from the page.';
          return;
        }
        
        const pageContent = injectionResults[0].result;
        resultsDiv.innerText = 'Content extracted. Asking Gemini...';
        callGeminiApi(pageContent);
      }
    );
  });
});

// Add event listener for the new map button
document.getElementById('openMapsButton').addEventListener('click', () => {
  const resultsDiv = document.getElementById('results');
  const locationsText = resultsDiv.innerText;

  // Parse the bulleted list into an array of locations
  const locations = locationsText.split('\n')
    .map(line => line.replace(/^-/,'').trim()) // Remove leading hyphens and trim whitespace
    .filter(line => line.length > 0); // Remove any empty lines

  const MAX_MAP_STOPS = 10;
  let locationsForMap = locations;

  // Check if the number of locations exceeds the Google Maps limit.
  if (locations.length > MAX_MAP_STOPS) {
    alert(`Your itinerary has more than ${MAX_MAP_STOPS} stops. The map will only show the first ${MAX_MAP_STOPS}.`);
    // Truncate the array to the maximum allowed size.
    locationsForMap = locations.slice(0, MAX_MAP_STOPS);
  }

  if (locationsForMap.length > 1) { // More than one location, create a directions route
    const waypoints = locationsForMap.map(location => encodeURIComponent(location)).join('/');
    const mapsUrl = `https://www.google.com/maps/dir/${waypoints}`;
    chrome.tabs.create({ url: mapsUrl });
  } else if (locationsForMap.length === 1) { // Exactly one location, create a search query
    const query = encodeURIComponent(locationsForMap[0]);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    chrome.tabs.create({ url: mapsUrl });
  }
  // If locations.length is 0, do nothing.
});

// Add event listener for the new copy button
document.getElementById('copyButton').addEventListener('click', () => {
  const resultsDiv = document.getElementById('results');
  const copyButton = document.getElementById('copyButton');
  const textToCopy = resultsDiv.innerText;

  navigator.clipboard.writeText(textToCopy).then(() => {
    // Provide user feedback that copy was successful
    const originalText = copyButton.innerText;
    copyButton.innerText = 'Copied!';
    setTimeout(() => {
      copyButton.innerText = originalText;
    }, 1500); // Revert text after 1.5 seconds
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
});

async function callGeminiApi(text) {
  const resultsDiv = document.getElementById('results');  
  
  // Securely retrieve the API key from user's storage
  chrome.storage.sync.get(['apiKey'], async (result) => {
    if (!result.apiKey) {
      // Guide the user to the options page if the key is not set
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

    // The rest of the API call logic remains inside this callback
    const prompt = `From the following text from a webpage, please extract a list of all locations mentioned in the itinerary. Format the output as a simple, bulleted list, with each location on a new line starting with a hyphen. For example: "- Paris, France". Do not include any other text, titles, or introductory sentences. If no itinerary or locations are found, please state that.
    const prompt = `From the following text from a webpage, please extract a list of all locations mentioned in the itinerary. For each location, provide as much context as possible (like the city and country) to make it easy to find on a map. For example, if the text says "visit the tower" in a section about Paris, you should output "- Eiffel Tower, Paris, France". Format the output as a simple, bulleted list, with each location on a new line starting with a hyphen. Do not include any other text, titles, or introductory sentences. If no itinerary or locations are found, please state that.

Webpage Text:
---
${text}`;

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
        resultsDiv.innerText = geminiResponse;
        // Show the action buttons if the response seems to contain a list
        if (geminiResponse.includes('-')) {
          document.getElementById('actionsContainer').style.display = 'block';
        }
      } else {
        resultsDiv.innerText = "Gemini returned an empty response.";
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      resultsDiv.innerText = `Error: Could not get response from Gemini API. ${error.message}`;
    }
  });
}