import api from '../utils/api';  // Import the main API instance instead of creating a new one

// Remove these lines:
// import axios from 'axios';
// import { API_BASE_URL, API_ENDPOINTS } from '../api/config';
// 
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
// 
// // Add auth token to requests
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Then update the upload function to use the correct path:
export const uploadResume = async (file: File): Promise<Resume> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

  const response = await api.post<Resume>('/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Also update other functions to use relative paths:
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
