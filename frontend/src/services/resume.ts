import api from '../utils/api';  // Import the shared API instance

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

  const response = await api.post<Resume>('/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

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
