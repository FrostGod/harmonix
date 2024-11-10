let isProcessing = false;
let currentAudioType = null;
let currentUrl = null;

document.addEventListener('DOMContentLoaded', function() {
    const generatePodcastBtn = document.getElementById('generatePodcast');
    const generateEDMBtn = document.getElementById('generateEDM');
    const generateMusicBtn = document.getElementById('generateMusic');
    const audioSection = document.getElementById('audioSection');
    
    generatePodcastBtn.addEventListener('click', () => handleGeneration('podcast'));
    generateEDMBtn.addEventListener('click', () => handleGeneration('edm'));
    generateMusicBtn.addEventListener('click', () => handleGeneration('music'));

    // Add EDM toggle handler
    const edmToggle = document.getElementById('edmToggle');
    const toggleLabel = edmToggle.parentElement.parentElement.querySelector('span');
    
    // Load initial state
    chrome.storage.local.get('isEDMEnabled', (data) => {
        edmToggle.checked = data.isEDMEnabled ?? false;
        toggleLabel.textContent = edmToggle.checked ? 'Auto EDM: On' : 'Auto EDM: Off';
    });

    edmToggle.addEventListener('change', function() {
        const enabled = this.checked;
        chrome.runtime.sendMessage({
            action: "toggleEDM",
            enabled: enabled
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Toggle error:', chrome.runtime.lastError);
                this.checked = !enabled;
                toggleLabel.textContent = !enabled ? 'Auto EDM: On' : 'Auto EDM: Off';
                return;
            }
            
            toggleLabel.textContent = enabled ? 'Auto EDM: On' : 'Auto EDM: Off';
            
            if (enabled) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, { 
                            action: "generateEDM",
                            url: tabs[0].url 
                        });
                    }
                });
            }
        });
    });

    // Add wallet connection handler
    const connectWalletBtn = document.getElementById('connectWallet');
    const tipOptions = document.querySelector('.tip-options');

    connectWalletBtn.addEventListener('click', async () => {
        try {
            const publicKey = await window.SolanaWallet.connect();
            connectWalletBtn.textContent = `Connected: ${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
            tipOptions.style.display = 'flex';
        } catch (error) {
            console.error('Wallet connection error:', error);
            connectWalletBtn.textContent = 'Connection Failed';
            setTimeout(() => {
                connectWalletBtn.textContent = 'Connect Wallet';
            }, 2000);
        }
    });

    // Add tip button handlers
    document.querySelectorAll('.tip-button').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                const amount = parseFloat(button.dataset.amount);
                await window.SolanaWallet.sendTip(amount);
                button.textContent = 'Thank you!';
                setTimeout(() => {
                    button.textContent = `${amount} SOL`;
                }, 2000);
            } catch (error) {
                console.error('Tip error:', error);
                button.textContent = 'Failed';
                setTimeout(() => {
                    button.textContent = `${button.dataset.amount} SOL`;
                }, 2000);
            }
        });
    });

    // Add NFT minting handler
    const mintNFTBtn = document.getElementById('mintNFT');
    const nftStatus = document.getElementById('nftStatus');
    const audioPlayer = document.getElementById('audioPlayer');

    // Enable mint button when audio is generated
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                mintNFTBtn.disabled = audioSection.style.display === 'none';
            }
        });
    });

    observer.observe(audioSection, { attributes: true });

    mintNFTBtn.addEventListener('click', async () => {
        try {
            nftStatus.textContent = 'Connecting wallet...';
            
            // Get the current audio blob
            const response = await fetch(audioPlayer.src);
            const audioBlob = await response.blob();
            
            // Get metadata about the current audio
            const metadata = {
                type: currentAudioType,
                url: currentUrl,
                duration: audioPlayer.duration
            };

            // Mint NFT
            const result = await window.NFTManager.mintAudioNFT(audioBlob, metadata);
            
            nftStatus.textContent = 'NFT minted successfully!';
            nftStatus.style.color = '#4CAF50';
        } catch (error) {
            console.error('NFT minting error:', error);
            nftStatus.textContent = error.message;
            nftStatus.style.color = '#ff4444';
        }
    });
});

async function handleGeneration(outputType) {
    if (isProcessing) return;
    
    isProcessing = true;
    const audioSection = document.getElementById('audioSection');
    audioSection.style.display = 'none';

    try {
        const scrapedText = await scrapeCurrentPage();
        console.log('Scraped text:', scrapedText);

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        const response = await fetch(API_ENDPOINTS.LOCAL_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': outputType === 'music' ? 'application/json' : 'audio/mpeg'
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

        currentAudioType = outputType;
        currentUrl = tab.url;
        
        if (outputType === 'music') {
            const data = await response.json();
            await handleMusicUrl(data.audio_url);
        } else {
            const audioBlob = await response.blob();
            await handleGeneratedAudio(audioBlob, outputType);
        }
        
    } catch (error) {
        console.error('Error:', error);
        audioSection.style.display = 'none';
    } finally {
        isProcessing = false;
    }
}

async function handleMusicUrl(audioUrl) {
    try {
        const audioSection = document.getElementById('audioSection');
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = audioUrl;
        audioSection.style.display = 'block';
        
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.onclick = async () => {
            try {
                const response = await fetch(audioUrl);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const a = document.createElement('a');
                a.href = url;
                a.download = `harmonix-music-${timestamp}.mp3`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Download error:', error);
            }
        };
    } catch (error) {
        throw new Error(`Failed to process music: ${error.message}`);
    }
}

async function handleGeneratedAudio(audioBlob, outputType) {
    try {
        const url = URL.createObjectURL(audioBlob);
        
        const audioSection = document.getElementById('audioSection');
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = url;
        audioSection.style.display = 'block';
        
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.onclick = () => {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const a = document.createElement('a');
            a.href = url;
            a.download = `harmonix-${outputType}-${timestamp}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        const shareBtn = document.getElementById('shareBtn');
        shareBtn.onclick = () => showShareModal(audioBlob, outputType);
        
    } catch (error) {
        throw new Error(`Failed to process audio: ${error.message}`);
    }
}

function showShareModal(audioBlob, outputType) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
        <h3>Share Audio</h3>
        <div class="share-options">
            <button class="share-option" data-action="copy">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
                Copy Link
            </button>
            <button class="share-option" data-action="twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                </svg>
                Twitter
            </button>
            <button class="share-option" data-action="whatsapp">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                WhatsApp
            </button>
            <button class="share-option" data-action="telegram">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Telegram
            </button>
        </div>
    `;

    // Add click handlers for share options
    modal.querySelectorAll('.share-option').forEach(button => {
        button.onclick = () => handleShare(button.dataset.action, audioBlob, outputType);
    });

    // Close modal when clicking overlay
    overlay.onclick = () => {
        overlay.remove();
        modal.remove();
    };

    document.body.appendChild(overlay);
    document.body.appendChild(modal);
}

async function handleShare(action, audioBlob, outputType) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `harmonix-${outputType}-${timestamp}.mp3`;

    try {
        switch (action) {
            case 'copy':
                // Create a temporary URL for the audio
                const url = URL.createObjectURL(audioBlob);
                await navigator.clipboard.writeText(url);
                showCopyFeedback('Link copied to clipboard!');
                break;

            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=Check%20out%20this%20audio%20generated%20by%20Harmonix!%20%23Harmonix%20%23AI%20%23Music`);
                break;

            case 'whatsapp':
                window.open(`https://wa.me/?text=Check%20out%20this%20audio%20generated%20by%20Harmonix!`);
                break;

            case 'telegram':
                window.open(`https://t.me/share/url?url=&text=Check%20out%20this%20audio%20generated%20by%20Harmonix!`);
                break;
        }
    } catch (error) {
        console.error('Share error:', error);
        showCopyFeedback('Failed to share audio');
    }
}

function showCopyFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'copy-feedback';
    feedback.textContent = message;
    document.body.appendChild(feedback);

    // Show feedback
    setTimeout(() => feedback.classList.add('show'), 100);

    // Hide and remove feedback
    setTimeout(() => {
        feedback.classList.remove('show');
        setTimeout(() => feedback.remove(), 300);
    }, 2000);
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
        throw error;
    }
}