import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { API_BASE_URL, getApiUrl, ensureApiUrl } from './config';

// Create API instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://perfect-cv-snowy.vercel.app'
  }
});

// Add request interceptor
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log('API Request Interceptor - Token exists:', !!token);
    
    if (token) {
      console.log('Adding Authorization header with token');
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    } else {
      console.warn('No authentication token found. Some API requests may fail.');
    }

    // Log the request details in development
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
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
  get: async (url: string, config?: AxiosRequestConfig) => {
    const apiUrl = getApiUrl(url);
    return api.get(apiUrl, config);
  },

  post: async (url: string, data?: any, config?: AxiosRequestConfig) => {
    const apiUrl = getApiUrl(url);
    return api.post(apiUrl, data, config);
  },

  put: async (url: string, data?: any, config?: AxiosRequestConfig) => {
    const apiUrl = getApiUrl(url);
    return api.put(apiUrl, data, config);
  },

  delete: async (url: string, config?: AxiosRequestConfig) => {
    const apiUrl = getApiUrl(url);
    return api.delete(apiUrl, config);
  },
}; 