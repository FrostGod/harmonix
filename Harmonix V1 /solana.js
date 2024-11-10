class SolanaWallet {
    constructor() {
        this.publicKey = null;
        this.RECIPIENT_WALLET = '5FHwkrdxkrPfBYwdsGjrPgwghvGZqeNxg4mJFzGez6JU';
    }

    async getProvider() {
        if ('phantom' in window) {
            const provider = window.phantom?.solana;

            if (provider?.isPhantom) {
                return provider;
            }
        }

        window.open('https://phantom.app/', '_blank');
        throw new Error('Please install Phantom wallet from phantom.app');
    }

    async connect() {
        try {
            const provider = await this.getProvider();
            
            try {
                const resp = await provider.connect();
                this.publicKey = resp.publicKey.toString();
                console.log('Connected to wallet:', this.publicKey);
                return this.publicKey;
            } catch (err) {
                if (err.code === 4001) {
                    throw new Error('Please accept the connection request in Phantom');
                }
                throw err;
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
        }
    }

    async sendTip(amount) {
        try {
            if (!this.publicKey) {
                throw new Error('Please connect your wallet first');
            }

            const provider = await this.getProvider();
            
            try {
                const transaction = await provider.request({
                    method: 'transfer',
                    params: {
                        to: this.RECIPIENT_WALLET,
                        amount: amount * 1000000000 // Convert SOL to lamports
                    }
                });

                console.log('Transaction sent:', transaction);
                return transaction;
            } catch (err) {
                if (err.code === 4001) {
                    throw new Error('Transaction was cancelled');
                } else if (err.message.includes('insufficient')) {
                    throw new Error('Insufficient funds in wallet');
                }
                throw err;
            }
        } catch (error) {
            console.error('Error sending tip:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            const provider = await this.getProvider();
            await provider.disconnect();
            this.publicKey = null;
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
        }
    }
}

// Initialize wallet instance
window.SolanaWallet = new SolanaWallet();

// Add event listener for Phantom injection
window.addEventListener('load', () => {
    // Check if Phantom is already available
    if ('phantom' in window) {
        console.log('Phantom is installed!');
    } else {
        // If Phantom is not available, listen for it to be injected
        window.addEventListener('phantom#initialized', () => {
            console.log('Phantom has been initialized!');
        }, { once: true });
        
        // You can also check after a timeout
        setTimeout(() => {
            if ('phantom' in window) {
                console.log('Phantom was found after timeout!');
            }
        }, 1000);
    }
});