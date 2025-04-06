import { apiService } from '../api';
import { API_ENDPOINTS } from '../api/config';

interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  credits: number;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface RegisterResponse {
  user: User;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }
      const response = await apiService.get(API_ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};
