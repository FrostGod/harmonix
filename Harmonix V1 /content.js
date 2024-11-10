// Initialize message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrape") {
        try {
            const text = scrapePageContent();
            if (text && text.length > 0) {
                sendResponse({ text: text });
            } else {
                sendResponse({ error: 'No content found on page' });
            }
        } catch (error) {
            console.error('Scraping error:', error);
            sendResponse({ error: error.message });
        }
    }
    return true;
});

function scrapePageContent() {
    const selectors = [
        'article',
        'main',
        '.content',
        '#content',
        '.article',
        '.post-content',
        '.entry-content',
        'p',
        '.text'
    ];

    let textContent = '';

    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            elements.forEach(element => {
                textContent += element.innerText + ' ';
            });
            break;
        }
    }

    if (!textContent.trim()) {
        textContent = document.body.innerText;
    }

    const cleanedText = cleanText(textContent);
    
    if (!cleanedText) {
        throw new Error('No readable content found on page');
    }

    return cleanedText;
}

function cleanText(text) {
    return text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ')
        .replace(/\t+/g, ' ')
        .replace(/[^\w\s.,!?-]/g, '')
        .trim()
        .slice(0, 5000);
}

console.log('Harmonix content script loaded');