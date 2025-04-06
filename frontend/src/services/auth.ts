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
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiService.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },
};

export const logout = (): void => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};
