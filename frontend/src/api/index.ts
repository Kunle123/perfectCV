import axios, { AxiosRequestConfig } from 'axios';
import { API_BASE_URL, getApiUrl } from './config';

// Create API instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error: Error) => Promise.reject(error)
);

export default api;

export const apiService = {
  get: (endpoint: string) => api.get(getApiUrl(endpoint)),
  post: (endpoint: string, data: any) => api.post(getApiUrl(endpoint), data),
  put: (endpoint: string, data: any) => api.put(getApiUrl(endpoint), data),
  delete: (endpoint: string) => api.delete(getApiUrl(endpoint)),
}; 