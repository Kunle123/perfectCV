import api from '../utils/api';  // Import the shared API instance
import axios from 'axios';  // Keep this import for direct file uploads

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

export const uploadResume = async (file: File): Promise<Resume> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

  // Create a separate axios instance just for file uploads
  const uploadApi = axios.create({
    baseURL: 'https://perfectcv-production.up.railway.app',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }) ;
  
  // Add auth token to this instance
  const token = localStorage.getItem('token');
  if (token) {
    uploadApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Make direct request to Railway backend for file uploads
  const response = await uploadApi.post<Resume>('/api/v1/resumes/upload', formData);
  return response.data;
};

// Use the shared API instance for all other resume operations
export const getResumes = async (): Promise<Resume[]> => {
  const response = await api.get<Resume[]>('/resumes');
  return response.data;
};

export const getResume = async (id: number): Promise<Resume> => {
  const response = await api.get<Resume>(`/resumes/${id}`);
  return response.data;
};

export const createResume = async (data: ResumeCreate): Promise<Resume> => {
  const response = await api.post<Resume>('/resumes', data);
  return response.data;
};

export const updateResume = async (id: number, data: Partial<ResumeCreate>): Promise<Resume> => {
  const response = await api.put<Resume>(`/resumes/${id}`, data);
  return response.data;
};

export const deleteResume = async (id: string): Promise<void> => {
  const response = await api.delete(`/resumes/${id}`);
  return response.data;
};
