import axios from "axios";

export const REGISTRATION_API_TIMEOUT = 30000;

// Use proxy in dev, direct URL in production
const isDev = import.meta.env.DEV;
const baseURL = isDev ? "/api-regist" : "https://regist_api.vhu.edu.vn/api";

const registrationApi = axios.create({
	baseURL,
	headers: {
		apikey: "pscRBF0zT2Mqo6vMw69YMOH43IrB2RtXBS0EHit2kzvL2auxaFJBvw==",
		clientid: "vhu",
		accept: "application/json, text/plain, */*",
	},
	timeout: REGISTRATION_API_TIMEOUT,
});

registrationApi.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("registToken");
		if (token) {
			try {
				const tokenData = JSON.parse(atob(token.split(".")[1]));
				// Check if token is expired (giving 10s buffer)
				if (tokenData.exp * 1000 > Date.now() + 10000) {
					config.headers.authorization = `Bearer ${token}`;
				} else {
					console.warn("Registration token expired");
					localStorage.removeItem("registToken");
					localStorage.removeItem("registToken_authSource");
					// Consider triggering a re-auth flow here if possible
				}
			} catch {
				localStorage.removeItem("registToken");
				localStorage.removeItem("registToken_authSource");
			}
		}
		return config;
	},
	(error) => Promise.reject(error),
);

registrationApi.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem("registToken");
			localStorage.removeItem("registToken_authSource");
		}
		return Promise.reject(error);
	},
);

export default registrationApi;
