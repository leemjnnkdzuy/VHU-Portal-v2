import axios from 'axios';

export const API_TIMEOUT = 30000;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://portal_api.vhu.edu.vn/api',
    headers: {
        apikey: import.meta.env.VITE_API_KEY || 'pscRBF0zT2Mqo6vMw69YMOH43IrB2RtXBS0EHit2kzvL2auxaFJBvw==',
        clientid: 'vhu',
        accept: 'application/json, text/plain, */*',
    },
    timeout: API_TIMEOUT,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                if (tokenData.exp * 1000 > Date.now()) {
                    config.headers.authorization = `Bearer ${token}`;
                } else {
                    localStorage.removeItem('authToken');
                    window.location.href = '/login';
                }
            } catch {
                localStorage.removeItem('authToken');
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
