import api from '../utils/api';

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

export const uploadJobDescription = async (
  title: string,
  content: string
): Promise<JobDescription> => {
  const response = await api.post('/api/v1/job-descriptions', {
    title,
    content,
  });
  return response.data;
};

export const getJobDescriptions = async (): Promise<JobDescription[]> => {
  const response = await api.get('/api/v1/job-descriptions');
  return response.data;
};

export const getJobDescription = async (id: number): Promise<JobDescription> => {
  const response = await api.get(`/api/v1/job-descriptions/${id}`);
  return response.data;
};

export const deleteJobDescription = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/job-descriptions/${id}`);
};
