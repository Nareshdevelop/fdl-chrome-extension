// Minimal service worker — keeps the extension installable on Chrome MV3.
// All real work happens in popup.js when the user clicks the toolbar icon.

chrome.runtime.onInstalled.addListener(() => {
  // Optional: open the registry on first install
  chrome.tabs.create({ url: 'https://fivedaylaunch.com/sites?ref=chrome-extension-install' });
});
