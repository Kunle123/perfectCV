// API Base URL configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.endsWith('/api/v1')  
    ? import.meta.env.VITE_API_URL 
    : import.meta.env.VITE_API_URL.endsWith('/api')
      ? `${import.meta.env.VITE_API_URL}/v1`  
      : `${import.meta.env.VITE_API_URL}/api/v1`
  : 'https://perfectcv-production.up.railway.app/api/v1';

// Log the API base URL in development mode
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

/**
 * Constructs a properly formatted API URL
 */
export function getApiUrl(endpoint: string): string {
  // Remove any leading or trailing slashes
  const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
  
  // Remove any api/v1 prefix from the endpoint if it exists
  const normalizedEndpoint = cleanEndpoint.replace(/^api\/v1\//, '');
  
  // Ensure the base URL doesn't end with a slash
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  
  const url = `${baseUrl}/${normalizedEndpoint}`;
  
  // Log the constructed URL in development mode
  if (import.meta.env.DEV) {
    console.log('Constructed API URL:', url);
  }
  
  return url;
}

// Helper function to ensure we're using the correct API URL
export function ensureApiUrl(url: string): string {
  // If the URL is already absolute, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Otherwise, use getApiUrl to construct the full URL
  return getApiUrl(url);
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    REFRESH: 'auth/refresh',
    LOGOUT: 'auth/logout',
    ME: 'auth/me',
  },
  RESUMES: {
    BASE: 'resumes',
    UPLOAD: 'resumes/upload',
    LIST: 'resumes',
    DETAIL: (id: string) => `resumes/${id}`,
    CREATE: 'resumes',
    UPDATE: (id: string) => `resumes/${id}`,
    DELETE: (id: string) => `resumes/${id}`,
  },
  OPTIMIZATIONS: {
    BASE: 'optimizations',
    LIST: 'optimizations',
    DETAIL: (id: string) => `optimizations/${id}`,
    CREATE: 'optimizations',
    OPTIMIZE_RESUME: 'optimizations/optimize-resume',
    OPTIMIZE_RESUME_WITH_JOB_DESCRIPTION: 'optimizations/optimize-resume-with-job-description',
    EXPORT: (id: string) => `optimizations/${id}/export`,
  },
  JOB_DESCRIPTIONS: {
    BASE: 'job-descriptions',
  },
  USER: {
    PROFILE: 'user/profile',
    CREDITS: 'user/credits',
  },
};
