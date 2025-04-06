import axios, { AxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from './config';

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

    if (import.meta.env.DEV) {
      console.log(`Upload API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Request Headers:', config.headers);
    }
    return config;
  },
  (error: Error) => Promise.reject(error)
);

export const uploadService = {
  upload: async (endpoint: string, formData: FormData) => {
    const response = await uploadApi.post(endpoint, formData);
    return response.data;
  },
  uploadResume: async (formData: FormData) => {
    const response = await uploadApi.post(API_ENDPOINTS.RESUMES.UPLOAD, formData);
    return response.data;
  }
}; 