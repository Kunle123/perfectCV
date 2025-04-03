import api from '../utils/api';

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

export const optimizeResume = async (
  resumeId: number,
  jobDescriptionId: number
): Promise<Optimization> => {
  const response = await api.post('/api/v1/optimizations', {
    resume_id: resumeId,
    job_description_id: jobDescriptionId,
  });
  return response.data;
};

export const getOptimization = async (id: number): Promise<Optimization> => {
  const response = await api.get(`/api/v1/optimizations/${id}`);
  return response.data;
};

export const getOptimizations = async (): Promise<Optimization[]> => {
  const response = await api.get('/api/v1/optimizations');
  return response.data;
};

export const exportOptimization = async (id: number, format: 'pdf' | 'docx'): Promise<Blob> => {
  const response = await api.post(
    `/api/v1/optimizations/export/${id}`,
    {
      format,
    },
    {
      responseType: 'blob',
    }
  );
  return response.data;
};
