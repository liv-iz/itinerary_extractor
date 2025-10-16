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

## Project Roadmap & v1.0 Launch

This project is currently stable and feature-complete for its initial v1.0 release. The core functionality is robust and ready for real-world use.

### Publishing to Gather Feedback

The immediate goal is to publish the extension on the **Chrome Web Store**. This is the most critical step for validating the tool's usefulness and gathering feedback from a diverse user base. The strategy is to:

1.  **Launch v1.0**: Submit the current version to the Chrome Web Store for review and public release.
2.  **Engage with Early Adopters**: Share the extension in relevant communities (like travel forums or subreddits) to attract initial users.
3.  **Listen and Iterate**: Actively monitor user reviews and GitHub issues to identify bugs, understand user needs, and prioritize the most requested features for the next version.

### Future Work (Post-v1.0)

The following features are being considered for future releases, driven by potential user feedback:

-   **Extraction History**: A feature to view and restore the last 5-10 extracted itineraries directly from the popup.
-   **Customizable Prompts**: An advanced option for users to edit the prompt sent to the Gemini API, allowing for more granular control over the output.
-   **Exclusion Keywords**: The ability for users to specify words or phrases (e.g., "sponsored," "advertisement") to be ignored during the extraction process.
-   **Additional Export Options**: Add buttons to export the list as a CSV file or integrate with popular note-taking apps like Notion.
-   **Support for More Map Providers**: Include options to generate routes for other services like Apple Maps or Waze.

## Feedback and Contributions

Found a bug or have a feature request? Please open an issue on GitHub.

Contributions are welcome! Feel free to fork the repository and submit a pull request.

## License

MIT