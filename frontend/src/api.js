import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const api = axios.create({
    baseURL: import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001'),
    timeout: 60000, // 60 seconds timeout (Render Cold Start safe)
});



// Helper to get or create guest ID
const getGuestId = () => {
    let guestId = localStorage.getItem('guest_id');
    if (!guestId) {
        guestId = uuidv4();
        localStorage.setItem('guest_id', guestId);
    }
    return guestId;
};

// Add a request interceptor to include the token or guest ID
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            // If no token, send Guest ID
            config.headers['x-guest-id'] = getGuestId();
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
