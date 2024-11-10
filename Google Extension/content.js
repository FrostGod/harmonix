// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "scrape") {
        const scrapedText = scrapePageContent();
        sendResponse({text: scrapedText});
    }
    return true; // Required for async response
});

function scrapePageContent() {
    // Basic scraping strategy - you might want to make this more sophisticated
    let content = '';
    
    // Get main content
    const mainContent = document.querySelector('main, article, .content, #content');
    if (mainContent) {
        content = mainContent.textContent;
    } else {
        // Fallback to body if no main content container found
        content = document.body.textContent;
    }
    
    // Clean up the text
    content = cleanText(content);
    
    return content;
}

function cleanText(text) {
    return text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim() // Remove leading/trailing whitespace
        .slice(0, 5000); // Limit text length (adjust as needed)
}

// Optional: Add visual feedback when scraping
function addVisualFeedback() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    overlay.innerHTML = '<div style="background: white; padding: 20px; border-radius: 5px;">Scraping content...</div>';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2000);
}
