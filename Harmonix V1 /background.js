let isEDMEnabled = true; // Default state for EDM autoplay

chrome.runtime.onInstalled.addListener(() => {
    // enable it by default later
    chrome.storage.local.set({ isEDMEnabled: false });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        chrome.storage.local.get('isEDMEnabled', async (data) => {
            if (data.isEDMEnabled) {
                try {
                    await chrome.tabs.sendMessage(tabId, { 
                        action: "generateEDM",
                        url: tab.url
                    });
                } catch (error) {
                    console.error('Failed to send generateEDM message:', error);
                }
            }
        });
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleEDM") {
        chrome.storage.local.set({ isEDMEnabled: message.enabled }, () => {
            sendResponse({ success: true });
        });
        return true; // Keep the message channel open for async response
    }
});