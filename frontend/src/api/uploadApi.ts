import axios, { AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './config';

export const uploadApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

uploadApi.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (import.meta.env.DEV) {
      console.log(`Upload API Request: ${config.method?.toUpperCase()} ${config.url}`);
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
}; 