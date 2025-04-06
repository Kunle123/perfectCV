import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { API_BASE_URL, getApiUrl, ensureApiUrl } from './config';

// Create API instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://perfect-cv-snowy.vercel.app'
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
    } else {
      console.warn('No authentication token found. Some API requests may fail.');
    }

    // Ensure Origin header is set
    config.headers = {
      ...config.headers,
      'Origin': 'https://perfect-cv-snowy.vercel.app'
    };

    // For FormData, don't set Content-Type header - let the browser set it with the boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Ensure the URL is correct
    if (config.url) {
      config.url = ensureApiUrl(config.url);
    }

    // Log request details in development mode
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Request Headers:', config.headers);
      if (config.data instanceof FormData) {
        console.log('FormData contents:', Array.from(config.data.entries()));
      } else {
        console.log('Request Data:', config.data);
      }
    }
    return config;
  },
  (error: Error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Log detailed error information
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
    });

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.warn('Authentication error: Token may be invalid or expired');
      // Clear token and redirect to login if not already there
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle CORS errors
    if (error.message.includes('Network Error') || error.message.includes('CORS')) {
      console.error('CORS or Network Error:', error.message);
      // You might want to show a user-friendly message here
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  get: (endpoint: string, config?: AxiosRequestConfig) => api.get(getApiUrl(endpoint), config),
  post: (endpoint: string, data: any, config?: AxiosRequestConfig) => api.post(getApiUrl(endpoint), data, config),
  put: (endpoint: string, data: any, config?: AxiosRequestConfig) => api.put(getApiUrl(endpoint), data, config),
  delete: (endpoint: string, config?: AxiosRequestConfig) => api.delete(getApiUrl(endpoint), config),
}; 