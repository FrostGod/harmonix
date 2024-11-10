const API_ENDPOINTS = {
    LOCAL_API: 'http://0.0.0.0:8000/process'
};

if (typeof window !== 'undefined') {
    window.API_ENDPOINTS = API_ENDPOINTS;
}