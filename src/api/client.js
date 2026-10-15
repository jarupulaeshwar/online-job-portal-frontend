import axios from 'axios';

const TOKEN_KEY = 'careerbridge_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 20000,
});

// Send the JWT with every request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says the token is no longer valid, log the user out everywhere.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && getToken() && !url.includes('/api/auth/login')) {
      clearToken();
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

/** Turns any Axios error into a short message that is safe to show to the user. */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ERR_NETWORK' || (!error?.response && error?.request)) {
    return 'Cannot reach the server. Check that the backend is running and try again.';
  }
  return fallback;
}

export default api;
