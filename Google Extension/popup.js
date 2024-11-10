// Scrape text functionality
document.getElementById('scrapeButton').addEventListener('click', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            console.error('No active tab found');
            return;
        }

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: scrapeText,
        });

        const scrapedText = results[0].result;
        
        const timestamp = new Date().toISOString().slice(0,10);
        const filename = `scraped-${tab.title || 'page'}-${timestamp}.txt`;

        chrome.downloads.download({
            url: URL.createObjectURL(new Blob([scrapedText], {type: 'text/plain'})),
            filename: filename,
            saveAs: true
        });

    } catch (error) {
        console.error('Error:', error);
    }
});

// Music toggle functionality
document.getElementById('toggleMusic').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, { action: "toggleMusic" });
    }
});

function scrapeText() {
    try {
        const text = document.body.innerText;
        return text;
    } catch (error) {
        console.error('Scraping error:', error);
        return '';
    }
}
