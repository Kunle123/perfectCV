import { apiService } from '../api';
import { API_ENDPOINTS } from '../api/config';

interface Optimization {
  id: number;
  resume_id: number;
  job_description_id: number;
  result: {
    sections: {
      summary: string;
      experience: Array<{
        company: string;
        position: string;
        duration: string;
        bullets: string[];
      }>;
      education: Array<{
        institution: string;
        degree: string;
        field: string;
        graduation_date: string;
      }>;
      skills: string[];
    };
  };
  status: string;
  created_at: string;
  updated_at: string;
}

export const optimizationService = {
  optimizeResume: async (resumeId: number, jobDescriptionId: number): Promise<Optimization> => {
    const response = await apiService.post(API_ENDPOINTS.OPTIMIZATIONS.CREATE, {
      resume_id: resumeId,
      job_description_id: jobDescriptionId,
    });
    return response.data;
  },

  getOptimization: async (id: number): Promise<Optimization> => {
    const response = await apiService.get(API_ENDPOINTS.OPTIMIZATIONS.DETAIL(id.toString()));
    return response.data;
  },

  getOptimizations: async (): Promise<Optimization[]> => {
    const response = await apiService.get(API_ENDPOINTS.OPTIMIZATIONS.LIST);
    return response.data;
  },

  exportOptimization: async (id: number, format: 'pdf' | 'docx'): Promise<Blob> => {
    const response = await apiService.get(API_ENDPOINTS.OPTIMIZATIONS.EXPORT(id.toString()), {
      responseType: 'blob'
    });
    return response.data;
  }
};