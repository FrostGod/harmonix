let isProcessing = false;

document.addEventListener('DOMContentLoaded', function() {
    const generatePodcastBtn = document.getElementById('generatePodcast');
    const generateEDMBtn = document.getElementById('generateEDM');
    
    generatePodcastBtn.addEventListener('click', () => handleGeneration('podcast'));
    generateEDMBtn.addEventListener('click', () => handleGeneration('edm'));
});

async function handleGeneration(outputType) {
    if (isProcessing) return;
    
    isProcessing = true;
    showLoading(true);
    updateStatus('');

    try {
        const scrapedText = await scrapeCurrentPage();
        console.log('Scraped text:', scrapedText);

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        updateStatus('Processing content...');
        const response = await fetch(API_ENDPOINTS.LOCAL_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: tab.url,
                content: scrapedText,
                output_type: outputType
            })
        });

        if (!response.ok) {
            throw new Error('Failed to process content');
        }

        const audioBlob = await response.blob();
        await handleGeneratedAudio(audioBlob, outputType);
        
    } catch (error) {
        console.error('Error:', error);
        updateStatus(error.message, true);
    } finally {
        isProcessing = false;
        showLoading(false);
    }
}

async function scrapeCurrentPage() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            throw new Error('Cannot access the current tab');
        }

        if (!tab.url || tab.url.startsWith('chrome://')) {
            throw new Error('Cannot scrape content from this page type');
        }

        const result = await new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tab.id, { action: "scrape" }, response => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else if (response && response.error) {
                    reject(new Error(response.error));
                } else if (response && response.text) {
                    resolve(response.text);
                } else {
                    reject(new Error('Failed to get content from page'));
                }
            });
        });

        if (!result || result.length === 0) {
            throw new Error('No content found on page');
        }

        return result;

    } catch (error) {
        console.error('Scraping error:', error);
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
            return await scrapeCurrentPage();
        } catch (injectionError) {
            throw new Error('Please refresh the page and try again');
        }
    }
}

async function handleGeneratedAudio(audioBlob, outputType) {
    try {
        const url = URL.createObjectURL(audioBlob);
        
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = url;
        audioPlayer.style.display = 'block';
        
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.style.display = 'block';
        downloadBtn.onclick = () => {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const a = document.createElement('a');
            a.href = url;
            a.download = `harmonix-${outputType}-${timestamp}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        
        updateStatus(`${outputType.toUpperCase()} generated successfully!`);
    } catch (error) {
        throw new Error(`Failed to process audio: ${error.message}`);
    }
}

function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    const generateBtn = document.getElementById('generatePodcast');
    
    if (show) {
        loadingElement.classList.add('active');
        generateBtn.disabled = true;
    } else {
        loadingElement.classList.remove('active');
        generateBtn.disabled = false;
    }
}

function updateStatus(message, isError = false) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.style.display = message ? 'block' : 'none';
    statusElement.className = isError ? 'error' : 'success';
}

// Cleanup
window.addEventListener('unload', function() {
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer.src) {
        URL.revokeObjectURL(audioPlayer.src);
    }
});

// Global error handlers
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    updateStatus('An unexpected error occurred', true);
    showLoading(false);
    isProcessing = false;
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    updateStatus('An unexpected error occurred', true);
    showLoading(false);
    isProcessing = false;
});