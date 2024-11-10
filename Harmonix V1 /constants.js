const API_ENDPOINTS = {
    LOCAL_API: 'https://localhost:8000/process'
};

if (typeof window !== 'undefined') {
    window.API_ENDPOINTS = API_ENDPOINTS;
}