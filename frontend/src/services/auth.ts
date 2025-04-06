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
    try {
      console.log('Attempting login with email:', credentials.email);
      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      console.log('Login response:', response.data);
      
      if (response.data.access_token) {
        console.log('Token received, storing in localStorage');
        localStorage.setItem('token', response.data.access_token);
        
        // Verify the token immediately after login
        console.log('Verifying token with getCurrentUser');
        const user = await authService.getCurrentUser();
        console.log('getCurrentUser result:', user);
        
        if (!user) {
          console.error('Token verification failed - no user returned');
          throw new Error('Failed to verify authentication token');
        }
        
        console.log('Login successful and verified');
      } else {
        console.error('No access token in login response');
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('token');
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('getCurrentUser - token exists:', !!token);
      
      if (!token) {
        console.log('No token found in localStorage');
        return null;
      }
      
      console.log('Fetching user data from API');
      const response = await apiService.get(API_ENDPOINTS.AUTH.ME);
      console.log('User data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      localStorage.removeItem('token');
      return null;
    }
  },

  getToken: () => {
    const token = localStorage.getItem('token');
    console.log('getToken called - token exists:', !!token);
    return token;
  },

  isAuthenticated: async () => {
    try {
      console.log('isAuthenticated check started');
      const user = await authService.getCurrentUser();
      console.log('isAuthenticated result:', !!user);
      return !!user;
    } catch (error) {
      console.error('isAuthenticated error:', error);
      return false;
    }
  },

  logout: () => {
    console.log('Logging out - removing token');
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};
