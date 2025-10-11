document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements for better performance and readability
  const apiKeyInput = document.getElementById('apiKey');
  const showApiKeyCheckbox = document.getElementById('showApiKey');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');

  // Saves options to chrome.storage using async/await for cleaner code
  const saveOptions = async () => {
    const apiKey = apiKeyInput.value;
    try {
      await chrome.storage.sync.set({ apiKey });
      statusDiv.textContent = 'API Key saved successfully!';
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 2000);
    } catch (error) {
      console.error('Error saving API key:', error);
      statusDiv.textContent = 'Error saving key.';
    }
  };

  // Restores input box state using async/await
  const restoreOptions = async () => {
    try {
      const items = await chrome.storage.sync.get({ apiKey: '' });
      apiKeyInput.value = items.apiKey;
    } catch (error) {
      console.error('Error restoring API key:', error);
      statusDiv.textContent = 'Error loading key.';
    }
  };

  // Toggles API key visibility
  const toggleApiKeyVisibility = () => {
    apiKeyInput.type = showApiKeyCheckbox.checked ? 'text' : 'password';
  };

  // --- Initialize and attach event listeners ---

  // Restore saved options when the page loads
  restoreOptions();

  saveButton.addEventListener('click', saveOptions);
  showApiKeyCheckbox.addEventListener('change', toggleApiKeyVisibility);
});