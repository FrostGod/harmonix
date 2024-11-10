document.addEventListener('DOMContentLoaded', function() {
    // Load saved API keys
    chrome.storage.sync.get(['openaiKey', 'musicKey'], function(result) {
        document.getElementById('openaiKey').value = result.openaiKey || '';
        document.getElementById('musicKey').value = result.musicKey || '';
    });

    // Save API keys
    document.getElementById('saveKeys').addEventListener('click', function() {
        const openaiKey = document.getElementById('openaiKey').value;
        const musicKey = document.getElementById('musicKey').value;
        
        chrome.storage.sync.set({
            openaiKey: openaiKey,
            musicKey: musicKey
        }, function() {
            updateStatus('API keys saved!');
        });
    });

    // Generate Song button
    document.getElementById('scrapeAndGenerate').addEventListener('click', function() {
        updateStatus('Processing...');
        
        // Send message to content script to start scraping
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "scrape"}, function(response) {
                if (response && response.text) {
                    processScrapedText(response.text);
                } else {
                    updateStatus('Error: Could not scrape text');
                }
            });
        });
    });

    // Generate Podcast button
    document.getElementById('generatePodcast').addEventListener('click', function() {
        updateStatus('Generating podcast...');
        // Similar to song generation but for podcast
        // Implement podcast generation logic here
    });
});

function processScrapedText(text) {
    // First, summarize with OpenAI
    summarizeText(text)
        .then(summary => generateMusic(summary))
        .then(() => updateStatus('Song generated successfully!'))
        .catch(error => updateStatus('Error: ' + error.message));
}

async function summarizeText(text) {
    const openaiKey = await chrome.storage.sync.get('openaiKey');
    // Implement OpenAI API call here
    // Return summary
}

async function generateMusic(summary) {
    const musicKey = await chrome.storage.sync.get('musicKey');
    // Implement music generation API call here
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}
