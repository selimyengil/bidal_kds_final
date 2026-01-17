import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
});
// Token'ı her isteğe otomatik eklemek için (Opsiyonel ama önerilir)
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('bidal_token');
    if (token) {
        // Backend'in token bekliyorsa buraya Authorization header eklenir
        // req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// --- API Fonksiyonları ---

export const loginUser = (credentials) => API.post('/login', credentials);
export const fetchSezonTrendi = () => API.get('/sezon-trendi');
export const fetchUrunAnaliz = () => API.get('/urun-analiz');
export const fetchCariAnaliz = () => API.get('/cari-analiz');
export const fetchBolgePerformans = () => API.get('/bolge-performans');

export default API;