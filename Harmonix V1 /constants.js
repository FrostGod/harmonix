const API_ENDPOINTS = {
    LOCAL_API: 'https://localhost:8000/process',
    MINT_NFT: 'https://localhost:8000/mint-nft'
};

if (typeof window !== 'undefined') {
    window.API_ENDPOINTS = API_ENDPOINTS;
}