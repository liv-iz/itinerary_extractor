// Saves options to chrome.storage
const saveOptions = () => {
  const apiKey = document.getElementById('apiKey').value;
  chrome.storage.sync.set(
    { apiKey: apiKey },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'API Key saved successfully!';
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
    }
  );
};

// Restores input box state using the preferences stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get({ apiKey: '' }, (items) => {
    document.getElementById('apiKey').value = items.apiKey;
  });
};

// Add event listener to toggle API key visibility
const toggleApiKeyVisibility = () => {
  const apiKeyInput = document.getElementById('apiKey');
  const showApiKeyCheckbox = document.getElementById('showApiKey');
  if (showApiKeyCheckbox.checked) {
    apiKeyInput.type = 'text';
  } else {
    apiKeyInput.type = 'password';
  }
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('showApiKey').addEventListener('change', toggleApiKeyVisibility);