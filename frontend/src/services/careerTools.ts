import { api } from '../utils/api';

/**
 * Generate a cover letter based on an uploaded resume and job description
 * @param formData FormData containing resume_file, job_description_text, and optional fields
 * @returns Cover letter data
 */
export const generateCoverLetter = async (formData: FormData) => {
  try {
    const response = await api.post('/career-tools/generate-cover-letter-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
};

/**
 * Get a cover letter by ID
 * @param id Cover letter ID
 * @returns Cover letter data
 */
export const getCoverLetter = async (id: string) => {
  try {
    const response = await api.get(`/career-tools/cover-letter/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cover letter:', error);
    throw error;
  }
};

/**
 * Export a cover letter as PDF or DOCX
 * @param id Cover letter ID
 * @param format Export format ('pdf' or 'docx')
 */
export const exportCoverLetter = async (id: string, format: string) => {
  try {
    const response = await api.get(`/career-tools/export-cover-letter/${id}?format=${format}`, {
      responseType: 'blob',
    });
    
    // Create a download link and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cover_letter_${id}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    console.error(`Error exporting cover letter as ${format}:`, error);
    throw error;
  }
};

/**
 * Analyze skills gap between a resume and job description
 * @param resumeId Resume ID
 * @param jobDescriptionId Job description ID
 * @returns Skills gap analysis data
 */
export const analyzeSkillsGap = async (resumeId: string, jobDescriptionId: string) => {
  try {
    const response = await api.post('/career-tools/analyze-skills-gap', {
      resume_id: parseInt(resumeId),
      job_description_id: parseInt(jobDescriptionId),
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing skills gap:', error);
    throw error;
  }
};

/**
 * Add user-provided skills to a resume based on skills gap analysis
 * @param analysisId Skills gap analysis ID
 * @param userSkills Dictionary of skill names and descriptions
 * @returns Updated resume data
 */
export const addUserSkills = async (analysisId: string, userSkills: Record<string, string>) => {
  try {
    const response = await api.post(`/career-tools/add-user-skills/${analysisId}`, userSkills);
    return response.data;
  } catch (error) {
    console.error('Error adding user skills:', error);
    throw error;
  }
};
