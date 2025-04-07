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

// Add token initialization check
const initializeToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token format
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format found in localStorage');
        localStorage.removeItem('token');
        return null;
      }
      
      // Check token expiration
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        const expirationTime = payload.exp * 1000;
        if (Date.now() >= expirationTime) {
          console.error('Expired token found in localStorage');
          localStorage.removeItem('token');
          return null;
        }
        return token;
      } catch (error) {
        console.error('Error parsing token payload:', error);
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

// Add request interceptor
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Initialize and validate token
    const token = initializeToken();
    console.log('API Request Interceptor - Token exists:', !!token);
    
    if (token) {
      console.log('Adding Authorization header with token');
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    } else {
      console.warn('No valid authentication token found. Some API requests may fail.');
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
      
      // Check if we're not already on the login page to avoid redirect loops
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        // Store the current path to redirect back after login
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        window.location.href = '/login';
      }
    }
    
    // Handle CORS errors
    if (error.message.includes('Network Error') || error.message.includes('CORS')) {
      console.error('CORS or Network Error:', error.message);
      // Show a user-friendly error message
      const errorMessage = document.createElement('div');
      errorMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #ff4444;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 9999;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      `;
      errorMessage.textContent = 'Network error: Please check your connection and try again';
      document.body.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 5000);
    }
    
    // Handle token expiration
    if (error.response?.data?.detail?.includes('token has expired')) {
      console.warn('Token has expired');
      localStorage.removeItem('token');
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        window.location.href = '/login';
      }
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