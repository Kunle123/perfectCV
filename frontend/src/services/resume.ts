import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../api/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

  const response = await api.post<Resume>(API_ENDPOINTS.RESUMES.UPLOAD, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getResumes = async (): Promise<Resume[]> => {
  const response = await api.get<Resume[]>(API_ENDPOINTS.RESUMES.LIST);
  return response.data;
};

export const getResume = async (id: number): Promise<Resume> => {
  const response = await api.get<Resume>(API_ENDPOINTS.RESUMES.DETAIL(id.toString()));
  return response.data;
};

export const createResume = async (data: ResumeCreate): Promise<Resume> => {
  const response = await api.post<Resume>('/api/v1/resumes', data);
  return response.data;
};

export const updateResume = async (id: number, data: Partial<ResumeCreate>): Promise<Resume> => {
  const response = await api.put<Resume>(`/api/v1/resumes/${id}`, data);
  return response.data;
};

export const deleteResume = async (id: string): Promise<void> => {
  const response = await api.delete(API_ENDPOINTS.RESUMES.DELETE(id));
  return response.data;
};
