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
      
      // Convert credentials to URLSearchParams for proper form data encoding
      const formData = new URLSearchParams();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);
      
      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.access_token) {
        console.log('Token received, storing in localStorage');
        localStorage.setItem('token', response.data.access_token);
        
        // Add a small delay before verifying the token
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify the token
        console.log('Verifying token with getCurrentUser');
        const user = await authService.getCurrentUser();
        console.log('getCurrentUser result:', user);
        
        if (!user) {
          console.error('Token verification failed - no user returned');
          localStorage.removeItem('token');
          throw new Error('Failed to verify authentication token');
        }
        
        console.log('Login successful and verified');
        return response.data;
      } else {
        console.error('No access token in login response');
        throw new Error('No access token received from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('token');
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, data);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
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
