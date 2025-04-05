// Extract the base URL without the /api/v1 suffix
export const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.endsWith('/api/v1') 
    ? import.meta.env.VITE_API_URL 
    : `${import.meta.env.VITE_API_URL}/api/v1`
  : 'http://localhost:8001/api/v1';

// Endpoints should NOT include the /api/v1 prefix as it's already in the base URL
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  RESUMES: {
    LIST: '/resumes',
    CREATE: '/resumes',
    UPLOAD: '/resumes/upload',
    DETAIL: (id: string) => `/resumes/${id}`,
    UPDATE: (id: string) => `/resumes/${id}`,
    DELETE: (id: string) => `/resumes/${id}`,
  },
  JOB_DESCRIPTIONS: {
    LIST: '/job-descriptions',
    CREATE: '/job-descriptions',
    UPLOAD: '/job-descriptions/upload',
    DETAIL: (id: string) => `/job-descriptions/${id}`,
    UPDATE: (id: string) => `/job-descriptions/${id}`,
    DELETE: (id: string) => `/job-descriptions/${id}`,
  },
  OPTIMIZATIONS: {
    CREATE: '/optimizations',
    DETAIL: (id: string) => `/optimizations/${id}`,
  },
};
