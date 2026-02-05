import axios from 'axios';

export const REGISTRATION_API_TIMEOUT = 30000;

const registrationApi = axios.create({
    baseURL: '/api-regist',
    headers: {
        apikey: 'pscRBF0zT2Mqo6vMw69YMOH43IrB2RtXBS0EHit2kzv',
        clientid: 'dtl',
        accept: 'application/json, text/plain, */*',
    },
    timeout: REGISTRATION_API_TIMEOUT,
});

registrationApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Check if token is valid without decoding entirely just for existence logic
                // Or reuse existing logic if needed. 
                // Since this is a different API system, let's assume it accepts the same Bearer token.
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

registrationApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default registrationApi;
