class NFTManager {
    constructor() {
        this.connection = null;
        this.metaplex = null;
        this.RECIPIENT_WALLET = '5FHwkrdxkrPfBYwdsGjrPgwghvGZqeNxg4mJFzGez6JU';
    }

    async initialize() {
        try {
            if (!window.phantom?.solana) {
                throw new Error('Please install Phantom wallet');
            }
            
            const provider = window.phantom?.solana;
            await provider.connect();
            
            return true;
        } catch (error) {
            console.error('NFT initialization error:', error);
            throw error;
        }
    }

    async mintAudioNFT(audioBlob, metadata) {
        try {
            await this.initialize();
            
            // Convert audio blob to base64
            const base64Audio = await this.blobToBase64(audioBlob);
            
            // Send to backend for minting
            const response = await fetch(`${API_ENDPOINTS.LOCAL_API.replace('process', 'mint-nft')}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audio_data: base64Audio,
                    metadata: {
                        name: `Harmonix Audio - ${metadata.type}`,
                        description: `Generated ${metadata.type} from ${metadata.url}`,
                        attributes: [
                            {
                                trait_type: 'Type',
                                value: metadata.type
                            },
                            {
                                trait_type: 'Duration',
                                value: metadata.duration
                            },
                            {
                                trait_type: 'Source',
                                value: metadata.url
                            }
                        ]
                    }
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Minting failed: ${error}`);
            }

            const result = await response.json();
            console.log('NFT minted successfully:', result);
            return result;

        } catch (error) {
            console.error('Error minting NFT:', error);
            throw error;
        }
    }

    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]); // Remove data URL prefix
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}

window.NFTManager = new NFTManager(); 