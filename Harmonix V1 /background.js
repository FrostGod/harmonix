// Listen for installation
self.addEventListener('install', (event) => {
    console.log('Harmonix Extension installed');
});

// Listen for activation
self.addEventListener('activate', (event) => {
    console.log('Harmonix Extension activated');
});

// Initialize chrome.runtime listeners
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in background:', message);
    return true;
});