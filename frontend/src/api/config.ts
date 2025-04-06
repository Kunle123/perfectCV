// API Base URL configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.endsWith('/api/v1')  
    ? import.meta.env.VITE_API_URL 
    : import.meta.env.VITE_API_URL.endsWith('/api')
      ? `${import.meta.env.VITE_API_URL}/v1`  
      : `${import.meta.env.VITE_API_URL}/api/v1`
  : 'http://localhost:8001/api/v1';

/**
 * Constructs a properly formatted API URL
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Remove any duplicate api/v1 in the endpoint
  const normalizedEndpoint = cleanEndpoint.replace(/^api\/v1\//, '');
  
  // Ensure the base URL doesn't end with a slash
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  return `${baseUrl}/${normalizedEndpoint}`;
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    ME: 'auth/me',
  },
  RESUMES: {
    LIST: 'resumes',
    CREATE: 'resumes',
    UPLOAD: 'resumes/upload',
    DETAIL: (id: string) => `resumes/${id}`,
    UPDATE: (id: string) => `resumes/${id}`,
    DELETE: (id: string) => `resumes/${id}`,
  },
  JOB_DESCRIPTIONS: {
    LIST: 'job-descriptions',
    CREATE: 'job-descriptions',
    UPLOAD: 'job-descriptions/upload',
    DETAIL: (id: string) => `job-descriptions/${id}`,
    UPDATE: (id: string) => `job-descriptions/${id}`,
    DELETE: (id: string) => `job-descriptions/${id}`,
  },
  OPTIMIZATIONS: {
    LIST: 'optimizations',
    CREATE: 'optimizations',
    DETAIL: (id: string) => `optimizations/${id}`,
    EXPORT: (id: string) => `optimizations/export/${id}`,
  },
  CAREER_TOOLS: {
    COVER_LETTER: {
      GENERATE: 'career-tools/generate-cover-letter-upload',
      GET: (id: string) => `career-tools/cover-letter/${id}`,
      EXPORT: (id: string, format: string) => `career-tools/export-cover-letter/${id}?format=${format}`,
    },
    SKILLS_GAP: {
      ANALYZE: 'career-tools/analyze-skills-gap',
      ADD_USER_SKILLS: (analysisId: string) => `career-tools/add-user-skills/${analysisId}`,
    },
  },
  PAYMENTS: {
    VERIFY: 'payments/verify',
    CREATE_CHECKOUT: 'payments/create-checkout-session',
  },
  USERS: {
    CREDITS: {
      GET: 'users/credits',
      PURCHASE: 'users/credits/purchase',
    },
  },
};
