import { apiService } from '../api';
import { API_ENDPOINTS } from '../api/config';

interface JobDescription {
  id: number;
  title: string;
  content: string;
  parsed_data: {
    skills: string[];
    experience_level: string;
    education: string[];
    responsibilities: string[];
    requirements: string[];
  };
  created_at: string;
  updated_at: string;
}

export const jobDescriptionService = {
  createJobDescription: async (data: any) => {
    const response = await apiService.post(API_ENDPOINTS.JOB_DESCRIPTIONS.CREATE, data);
    return response.data;
  },

  getJobDescriptions: async () => {
    const response = await apiService.get(API_ENDPOINTS.JOB_DESCRIPTIONS.LIST);
    return response.data;
  },

  getJobDescription: async (id: string) => {
    const response = await apiService.get(API_ENDPOINTS.JOB_DESCRIPTIONS.DETAIL(id));
    return response.data;
  },

  deleteJobDescription: async (id: string) => {
    await apiService.delete(API_ENDPOINTS.JOB_DESCRIPTIONS.DELETE(id));
  }
};
