import { apiService } from '../api';
import { API_ENDPOINTS } from '../api/config';

interface Resume {
  id: number;
  title: string;
  content: string;
  original_file_path: string;
  created_at: string;
  updated_at: string;
}

interface ResumeCreate {
  title: string;
  content: any;
  original_file_path?: string;
}

export const resumeService = {
  uploadResume: async (formData: FormData): Promise<Resume> => {
    const response = await apiService.post(API_ENDPOINTS.RESUMES.UPLOAD, formData);
    return response.data;
  },

  getResumes: async (): Promise<Resume[]> => {
    const response = await apiService.get(API_ENDPOINTS.RESUMES.LIST);
    return response.data;
  },

  getResume: async (id: number): Promise<Resume> => {
    const response = await apiService.get(API_ENDPOINTS.RESUMES.DETAIL(id.toString()));
    return response.data;
  },

  createResume: async (data: ResumeCreate): Promise<Resume> => {
    const response = await apiService.post(API_ENDPOINTS.RESUMES.CREATE, data);
    return response.data;
  },

  updateResume: async (id: number, data: Partial<ResumeCreate>): Promise<Resume> => {
    const response = await apiService.put(API_ENDPOINTS.RESUMES.UPDATE(id.toString()), data);
    return response.data;
  },

  deleteResume: async (id: string): Promise<void> => {
    await apiService.delete(API_ENDPOINTS.RESUMES.DELETE(id));
  }
}; 