import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { API_BASE_URL, getApiUrl } from './config';

// Create API instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies
});

// Add request interceptor
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error: Error) => Promise.reject(error)
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login if not already there
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const apiService = {
  get: (endpoint: string) => api.get(getApiUrl(endpoint)),
  post: (endpoint: string, data: any) => api.post(getApiUrl(endpoint), data),
  put: (endpoint: string, data: any) => api.put(getApiUrl(endpoint), data),
  delete: (endpoint: string) => api.delete(getApiUrl(endpoint)),
}; 