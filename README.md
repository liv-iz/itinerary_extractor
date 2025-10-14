# Itinerary Extractor

<p align="center">
  <img src="https://raw.githubusercontent.com/liv-iz/itinerary_extractor/main/icons/icon128.png" alt="Itinerary Extractor Logo" width="128">
</p>

<p align="center">
  A smart Chrome extension that uses the Google Gemini API to instantly extract travel itineraries from any webpage into a clean, usable list.
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/liv-iz/itinerary_extractor/main/icons/readme/better_working_gif.gif" alt="Demonstration of extracting locations from a travel blog." width="80%">
</p>

## Features

- **AI-Powered Extraction**: Leverages the power of Google's Gemini AI to intelligently identify and pull travel plans from articles, blogs, and guides.
- **Smart Content Detection**: Automatically ignores irrelevant content like ads, sidebars, and navigation links to focus only on the core itinerary.
- **Multiple Extraction Types**: Choose to extract specific points of interest (locations), broader neighborhoods, or a list of cities for a multi-destination trip.
- **Instant Google Maps Integration**: Turn your extracted list into a multi-stop Google Maps route with a single click.
- **Copy to Clipboard**: Easily copy the clean, formatted list for use in your favorite notes app or travel planner.
- **Secure & Private**: Your API key is stored securely in your browser's local storage and is never shared. The extension only reads page content when you tell it to.

## Installation

### From the Chrome Web Store (Recommended)

1.  Visit the [Itinerary Extractor page on the Chrome Web Store](https://chrome.google.com/webstore/detail/your-extension-id-here).
2.  Click "Add to Chrome".

### For Developers (Manual Installation)

1.  Clone this repository: `git clone https://github.com/liv-iz/itinerary_extractor.git`
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Enable "Developer mode" in the top right corner.
4.  Click "Load unpacked".
5.  Select the cloned repository folder.

## Setup: Getting Your API Key

This extension requires a Google Gemini API key to function. The free tier is generous and perfect for personal use.

1.  **Get Your Key**: Visit **Google AI Studio** to create your free API key.
2.  **Open Extension Options**: Right-click the Itinerary Extractor icon in your Chrome toolbar and select "Options".
3.  **Save Your Key**: Paste the API key into the input field and click "Save Key".

This is a one-time setup. Your key is stored securely using `chrome.storage.sync` and is never transmitted to anyone other than Google's API.

<p align="center">
  <img src="https://raw.githubusercontent.com/liv-iz/itinerary_extractor/main/icons/readme/image.png" alt="Options page screenshot" width="500">
</p>

## How to Use

1.  Navigate to a webpage that contains a travel itinerary (e.g., a travel blog, a "top 10" list).
2.  Click the Itinerary Extractor icon in your toolbar.
3.  Select whether you want to extract **Locations**, **Neighborhoods**, or **Cities**.
4.  Click the **"Extract Itinerary"** button.
5.  Within seconds, the AI will process the page and display a formatted list.
6.  From there, you can:
    - Click **"Create Map"** to open a new Google Maps tab with all locations plotted.
    - Click **"Copy List"** to copy the text to your clipboard.

## Privacy

Your privacy is a top priority. The extension only accesses the content of your active tab when you click the "Extract" button. No data is ever sent to the developer. For full details, please read the **[Privacy Policy](PRIVACY_POLICY.md)**.

## Feedback and Contributions

Found a bug or have a feature request? Please open an issue on GitHub.

Contributions are welcome! Feel free to fork the repository and submit a pull request.

## License

MIT