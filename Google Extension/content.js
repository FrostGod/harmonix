// Create and inject the popup immediately
function createPopup() {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;

    const scrapeButton = document.createElement('button');
    scrapeButton.textContent = 'Scrape Text';
    scrapeButton.style.cssText = `
        padding: 8px 15px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;

    const musicButton = document.createElement('button');
    musicButton.innerHTML = '🔇';
    musicButton.style.cssText = `
        padding: 8px 15px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;

    // Create audio element
    const audio = new Audio(chrome.runtime.getURL('sample.mp3'));
    audio.volume = 0.5;
    audio.loop = true;

    // Add event listeners
    scrapeButton.addEventListener('click', () => {
        const text = document.body.innerText;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().slice(0,10);
        const filename = `scraped-${document.title || 'page'}-${timestamp}.txt`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    musicButton.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            musicButton.innerHTML = '🔊';
        } else {
            audio.pause();
            musicButton.innerHTML = '🔇';
        }
    });

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✖';
    closeButton.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: #666;
    `;
    closeButton.addEventListener('click', () => {
        popup.remove();
    });

    // Add minimize button
    const minimizeButton = document.createElement('button');
    minimizeButton.innerHTML = '−';
    minimizeButton.style.cssText = `
        position: absolute;
        top: 5px;
        right: 25px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: #666;
    `;

    const content = document.createElement('div');
    content.appendChild(scrapeButton);
    content.appendChild(musicButton);

    popup.appendChild(closeButton);
    popup.appendChild(minimizeButton);
    popup.appendChild(content);

    // Minimize functionality
    minimizeButton.addEventListener('click', () => {
        if (content.style.display === 'none') {
            content.style.display = 'flex';
            content.style.flexDirection = 'column';
            content.style.gap = '10px';
            minimizeButton.innerHTML = '−';
        } else {
            content.style.display = 'none';
            minimizeButton.innerHTML = '+';
        }
    });

    // Make popup draggable
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    popup.addEventListener('mousedown', (e) => {
        if (e.target === popup) {
            isDragging = true;
            initialX = e.clientX - popup.offsetLeft;
            initialY = e.clientY - popup.offsetTop;
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            popup.style.left = currentX + 'px';
            popup.style.top = currentY + 'px';
            popup.style.right = 'auto';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    document.body.appendChild(popup);
}

// Create popup when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPopup);
} else {
    createPopup();
}
