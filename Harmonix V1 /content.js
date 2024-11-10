let currentAudio = null;

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
    else if (request.action === "generateEDM") {
        // For generateEDM, we'll send an immediate response and handle the async operation separately
        sendResponse({ status: 'EDM generation started' });
        handleAutoEDM().catch(error => {
            console.error('EDM generation error:', error);
        });
    }
    return true; // Keep the message channel open for async response
});

async function handleAutoEDM() {
    try {
        // First test the connection
        const testResponse = await fetch(API_ENDPOINTS.LOCAL_API.replace('/process', '/test'), {
            method: 'GET',
            mode: 'cors'
        });

        if (!testResponse.ok) {
            throw new Error('Backend server is not responding');
        }

        const scrapedText = scrapePageContent();
        
        if (!scrapedText) {
            console.error('No content found to generate EDM');
            return;
        }

        console.log('Sending request to:', API_ENDPOINTS.LOCAL_API);
        const response = await fetch(API_ENDPOINTS.LOCAL_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg',
                'Origin': window.location.origin
            },
            mode: 'cors',
            body: JSON.stringify({
                url: window.location.href,
                content: scrapedText,
                output_type: "edm"
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', response.status, errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const audioBlob = await response.blob();
        if (!audioBlob || audioBlob.size === 0) {
            throw new Error('Received empty audio response');
        }

        await playGeneratedEDM(audioBlob);

    } catch (error) {
        console.error('Error generating EDM:', error);
        if (error.message.includes('Failed to fetch')) {
            console.error('Connection error - Make sure the backend server is running at', API_ENDPOINTS.LOCAL_API);
            console.error('Also check if SSL certificates are properly set up');
        }
    }
}

async function playGeneratedEDM(audioBlob) {
    try {
        // Stop any currently playing audio
        if (currentAudio) {
            currentAudio.pause();
            URL.revokeObjectURL(currentAudio.src);
            currentAudio.remove();
        }

        // Create new audio element
        const audioUrl = URL.createObjectURL(audioBlob);
        currentAudio = new Audio(audioUrl);
        currentAudio.volume = 0.3;
        currentAudio.loop = true;
        
        // Add to page but hide it
        currentAudio.style.display = 'none';
        document.body.appendChild(currentAudio);
        
        // Create play button if it doesn't exist
        let playButton = document.querySelector('#harmonixPlayButton');
        if (!playButton) {
            playButton = document.createElement('button');
            playButton.id = 'harmonixPlayButton';
            playButton.textContent = '▶️ Play EDM';
            playButton.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                padding: 10px 20px;
                background: #0070f3;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;
                font-family: system-ui, -apple-system, sans-serif;
                transition: all 0.3s ease;
            `;

            // Add hover effect
            playButton.onmouseenter = () => {
                playButton.style.transform = 'translateY(-2px)';
                playButton.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            };
            playButton.onmouseleave = () => {
                playButton.style.transform = 'translateY(0)';
                playButton.style.boxShadow = 'none';
            };
            
            document.body.appendChild(playButton);
        }

        let isPlaying = false;
        playButton.onclick = async () => {
            try {
                if (!isPlaying) {
                    await currentAudio.play();
                    playButton.textContent = '⏸️ Pause EDM';
                    isPlaying = true;
                } else {
                    currentAudio.pause();
                    playButton.textContent = '▶️ Play EDM';
                    isPlaying = false;
                }
            } catch (err) {
                console.error('Playback error:', err);
                playButton.textContent = '❌ Playback Failed';
                setTimeout(() => {
                    playButton.textContent = '▶️ Try Again';
                }, 2000);
            }
        };

        // Add volume control
        const volumeControl = document.createElement('input');
        volumeControl.type = 'range';
        volumeControl.min = 0;
        volumeControl.max = 100;
        volumeControl.value = 30;
        volumeControl.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            z-index: 10000;
            width: 100px;
        `;
        volumeControl.oninput = () => {
            currentAudio.volume = volumeControl.value / 100;
        };
        document.body.appendChild(volumeControl);

        // Cleanup function
        const cleanup = () => {
            if (playButton) playButton.remove();
            if (volumeControl) volumeControl.remove();
            if (currentAudio) {
                currentAudio.pause();
                URL.revokeObjectURL(currentAudio.src);
                currentAudio.remove();
            }
        };

        // Add cleanup to window unload
        window.addEventListener('unload', cleanup);

        // Return success
        console.log('EDM controls added successfully');
        return true;

    } catch (error) {
        console.error('Error setting up EDM playback:', error);
        if (currentAudio) {
            URL.revokeObjectURL(currentAudio.src);
            currentAudio.remove();
        }
        throw error;
    }
}

// Update cleanupPlayButton function
function cleanupPlayButton() {
    const playButton = document.querySelector('#harmonixPlayButton');
    const volumeControl = document.querySelector('input[type="range"]');
    if (playButton) playButton.remove();
    if (volumeControl) volumeControl.remove();
}

window.addEventListener('unload', () => {
    if (currentAudio) {
        URL.revokeObjectURL(currentAudio.src);
        currentAudio.remove();
    }
    cleanupPlayButton();
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