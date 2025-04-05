// Extract the base URL without the /api/v1 suffix
export const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.endsWith('/api/v1') 
    ? import.meta.env.VITE_API_URL 
    : `${import.meta.env.VITE_API_URL}/api/v1`
  : 'http://localhost:8001/api/v1';

// All endpoints should include the /api/v1 prefix
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    ME: '/api/v1/auth/me',
  },
  RESUMES: {
    LIST: '/api/v1/resumes',
    CREATE: '/api/v1/resumes',
    UPLOAD: '/api/v1/resumes/upload',
    DETAIL: (id: string) => `/api/v1/resumes/${id}`,
    UPDATE: (id: string) => `/api/v1/resumes/${id}`,
    DELETE: (id: string) => `/api/v1/resumes/${id}`,
  },
  JOB_DESCRIPTIONS: {
    LIST: '/api/v1/job-descriptions',
    CREATE: '/api/v1/job-descriptions',
    UPLOAD: '/api/v1/job-descriptions/upload',
    DETAIL: (id: string) => `/api/v1/job-descriptions/${id}`,
    UPDATE: (id: string) => `/api/v1/job-descriptions/${id}`,
    DELETE: (id: string) => `/api/v1/job-descriptions/${id}`,
  },
  OPTIMIZATIONS: {
    CREATE: '/api/v1/optimizations',
    DETAIL: (id: string) => `/api/v1/optimizations/${id}`,
  },
};
