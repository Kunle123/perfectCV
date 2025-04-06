import axios, { AxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_ENDPOINTS, ensureApiUrl } from './config';

export const uploadApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
    'Origin': 'https://perfect-cv-snowy.vercel.app'
  }
});

uploadApi.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log('Upload API - Token exists:', !!token);
    
    if (token) {
      console.log('Adding Authorization header with token');
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    } else {
      console.warn('No authentication token found for upload request');
    }

    // Ensure Origin header is set
    config.headers = {
      ...config.headers,
      'Origin': 'https://perfect-cv-snowy.vercel.app'
    };

    // Ensure the URL is correct
    if (config.url) {
      config.url = ensureApiUrl(config.url);
    }

    // Log request details in development mode
    if (import.meta.env.DEV) {
      console.log(`Upload API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Request Headers:', config.headers);
      if (config.data instanceof FormData) {
        console.log('FormData contents:', Array.from(config.data.entries()));
      }
    }
    return config;
  },
  (error: Error) => {
    console.error('Upload API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
uploadApi.interceptors.response.use(
  (response) => {
    console.log(`Upload API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('Upload API Error:', {
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
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const uploadService = {
  upload: async (endpoint: string, formData: FormData) => {
    try {
      const response = await uploadApi.post(endpoint, formData);
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },
  uploadResume: async (formData: FormData) => {
    try {
      const response = await uploadApi.post(API_ENDPOINTS.RESUMES.UPLOAD, formData);
      return response.data;
    } catch (error) {
      console.error('Resume upload error:', error);
      throw error;
    }
  }
}; 