import api from '../utils/api';

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

  const response = await api.post<Resume>('/api/v1/resumes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getResumes = async (): Promise<Resume[]> => {
  const response = await api.get<Resume[]>('/api/v1/resumes');
  return response.data;
};

export const getResume = async (id: number): Promise<Resume> => {
  const response = await api.get<Resume>(`/api/v1/resumes/${id}`);
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

export const deleteResume = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/resumes/${id}`);
};
