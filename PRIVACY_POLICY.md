# Privacy Policy for Itinerary Extractor

**Last Updated:** [Date of publishing]

Thank you for using Itinerary Extractor. This privacy policy explains what information the extension collects, how it's used, and how it's protected. Your privacy and trust are very important to us.

### 1. What Information We Collect

Itinerary Extractor is designed to be privacy-focused. We only handle two types of data:

*   **Web Page Content:** The text content of the web page in your **active browser tab**. This data is only accessed when you explicitly click the "Extract Itinerary" button within the extension. The extension does not and cannot access content from any other tabs or windows.
*   **Your Gemini API Key:** You must provide your own Google Gemini API key for the extension to function. This key is a form of personal credential.

### 2. How We Use Your Information

*   **Web Page Content:** The extracted text from your active tab is sent directly to the Google Gemini API. This is necessary for the AI to analyze the text and identify the travel itinerary as requested.
*   **Your Gemini API Key:** Your API key is securely stored using Chrome's built-in `chrome.storage.sync` service. This means it is associated with your Google account and is not accessible by the developer of this extension. The key is included in the request sent to the Google Gemini API to authenticate you as a valid user of their service.
*   **Web Page Content:** The extracted text from your active tab is first sent to our secure server, which then forwards it to the Google Gemini API for processing. This is necessary for the AI to analyze the text and identify the travel itinerary.
*   **Your Gemini API Key:** This extension no longer requires you to provide your own API key.

### 3. Data Sharing and Third Parties

Your data is processed by our server and shared with **Google** via the Google Gemini API.

*   We send the webpage content from your active tab to our server. Our server then sends this content to Google's servers for processing.
*   We do **not** log, store, or permanently save the webpage content you process. The data is only held in memory on our server for the duration of the request to Google.
*   We do **not** sell or share your data with any other third parties besides Google for the purpose of generating the itinerary.

Your interaction with the Google Gemini API is also subject to Google's own Privacy Policy, which you can review here: https://policies.google.com/privacy

### 4. Security

We take the security of your information seriously. All communication between the extension and our server, and between our server and the Google Gemini API, is encrypted using HTTPS. Your secret API key is stored securely on our server and is never exposed to the client.

### 5. Changes to This Privacy Policy

We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.

### 6. Contact Us

If you have any questions about this privacy policy, you can open an issue on our GitHub repository: https://github.com/liv-iz/itinerary_extractor/issues
