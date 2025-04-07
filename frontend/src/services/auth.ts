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
      
      // Clear any existing token first
      localStorage.removeItem('token');
      
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
        // Validate token format before storing
        const tokenParts = response.data.access_token.split('.');
        if (tokenParts.length !== 3) {
          console.error('Invalid token format received from server');
          throw new Error('Invalid token format received from server');
        }
        
        try {
          // Validate token payload
          const payload = JSON.parse(atob(tokenParts[1]));
          if (!payload.exp || !payload.sub) {
            console.error('Invalid token payload: missing required fields');
            throw new Error('Invalid token payload received from server');
          }
          
          console.log('Token received and validated, storing in localStorage');
          localStorage.setItem('token', response.data.access_token);
          
          // Add a longer delay before verification to account for network latency
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verify the token with retries
          let retryCount = 0;
          const maxRetries = 3;
          let user = null;
          
          while (retryCount < maxRetries && !user) {
            try {
              console.log(`Verifying token with getCurrentUser (attempt ${retryCount + 1}/${maxRetries})`);
              user = await authService.getCurrentUser();
              if (user) {
                console.log('Token verification successful');
                break;
              }
            } catch (error) {
              console.warn(`Token verification attempt ${retryCount + 1} failed:`, error);
              if (retryCount < maxRetries - 1) {
                // Wait before retrying, with exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
              }
            }
            retryCount++;
          }
          
          if (!user) {
            console.error('Token verification failed after all retries');
            localStorage.removeItem('token');
            throw new Error('Failed to verify authentication token after multiple attempts');
          }
          
          console.log('Login successful and verified');
          return response.data;
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('token');
          throw error;
        }
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
    try {
      console.log('Attempting registration with email:', data.email);
      
      // Clear any existing token first
      localStorage.removeItem('token');
      
      const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, data);
      console.log('Registration response:', response.data);
      
      if (response.data.access_token) {
        // Validate token format before storing
        const tokenParts = response.data.access_token.split('.');
        if (tokenParts.length !== 3) {
          console.error('Invalid token format received from server');
          throw new Error('Invalid token format received from server');
        }
        
        try {
          // Validate token payload
          const payload = JSON.parse(atob(tokenParts[1]));
          if (!payload.exp || !payload.sub) {
            console.error('Invalid token payload: missing required fields');
            throw new Error('Invalid token payload received from server');
          }
          
          console.log('Token received and validated, storing in localStorage');
          localStorage.setItem('token', response.data.access_token);
          
          // Verify the token immediately after registration
          console.log('Verifying token with getCurrentUser');
          const user = await authService.getCurrentUser();
          console.log('getCurrentUser result:', user);
          
          if (!user) {
            console.error('Token verification failed - no user returned');
            localStorage.removeItem('token');
            throw new Error('Failed to verify authentication token');
          }
          
          console.log('Registration successful and verified');
          return response.data;
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('token');
          throw error;
        }
      } else {
        console.error('No access token in registration response');
        throw new Error('No access token received from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      localStorage.removeItem('token');
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('getCurrentUser - token exists:', !!token);
      
      if (!token) {
        console.log('No token found in localStorage');
        return null;
      }
      
      // Add token validation check
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.error('Invalid token format');
          localStorage.removeItem('token');
          return null;
        }
        
        const payload = JSON.parse(atob(tokenParts[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        
        if (Date.now() >= expirationTime) {
          console.error('Token has expired');
          localStorage.removeItem('token');
          return null;
        }
      } catch (error) {
        console.error('Error validating token:', error);
        localStorage.removeItem('token');
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
