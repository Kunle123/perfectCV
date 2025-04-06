import { apiService } from '../api';
import { API_ENDPOINTS } from '../api/config';

export const careerToolsService = {
  /**
   * Generate a cover letter based on an uploaded resume and job description
   * @param formData FormData containing resume_file, job_description_text, and optional fields
   * @returns Cover letter data
   */
  generateCoverLetter: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiService.post(
      API_ENDPOINTS.CAREER_TOOLS.COVER_LETTER.GENERATE,
      formData
    );
    return response.data;
  },

  /**
   * Get a cover letter by ID
   * @param id Cover letter ID
   * @returns Cover letter data
   */
  getCoverLetter: async (id: string) => {
    const response = await apiService.get(
      API_ENDPOINTS.CAREER_TOOLS.COVER_LETTER.GET(id)
    );
    return response.data;
  },

  /**
   * Export a cover letter as PDF or DOCX
   * @param id Cover letter ID
   * @param format Export format ('pdf' or 'docx')
   */
  exportCoverLetter: async (id: string, format: string) => {
    const response = await apiService.get(
      API_ENDPOINTS.CAREER_TOOLS.COVER_LETTER.EXPORT(id, format)
    );
    return response.data;
  },

  /**
   * Analyze skills gap between a resume and job description
   * @param resumeId Resume ID
   * @param jobDescriptionId Job description ID
   * @returns Skills gap analysis data
   */
  analyzeSkillsGap: async (data: any) => {
    const response = await apiService.post(
      API_ENDPOINTS.CAREER_TOOLS.SKILLS_GAP.ANALYZE,
      data
    );
    return response.data;
  },

  /**
   * Add user-provided skills to a resume based on skills gap analysis
   * @param analysisId Skills gap analysis ID
   * @param userSkills Dictionary of skill names and descriptions
   * @returns Updated resume data
   */
  addUserSkills: async (analysisId: string, userSkills: string[]) => {
    const response = await apiService.post(
      API_ENDPOINTS.CAREER_TOOLS.SKILLS_GAP.ADD_USER_SKILLS(analysisId),
      userSkills
    );
    return response.data;
  }
};
