import axios, { AxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_ENDPOINTS, ensureApiUrl } from './config';

export const uploadApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
    'Origin': 'https://perfect-cv-snowy.vercel.app'
  },
  withCredentials: true
});

uploadApi.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
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
  (error: Error) => Promise.reject(error)
);

// Add response interceptor for better error handling
uploadApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error('Upload API Error:', error.response?.data || error.message);
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