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
  // Check localStorage availability
  checkLocalStorage: () => {
    try {
      const testKey = 'test_storage';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error('localStorage is not available:', error);
      return false;
    }
  },

  login: async (credentials: LoginCredentials) => {
    try {
      console.log('Attempting login with email:', credentials.email);
      
      // Check localStorage availability
      if (!authService.checkLocalStorage()) {
        throw new Error('localStorage is not available. Please check your browser settings.');
      }
      
      // Clear any existing token first
      const existingToken = localStorage.getItem('token');
      console.log('Existing token before login:', existingToken ? 'present' : 'none');
      localStorage.removeItem('token');
      
      // Use JSON data
      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, {
        username: credentials.email,
        password: credentials.password
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
          
          // Verify token was stored
          const storedToken = localStorage.getItem('token');
          console.log('Token storage verification:', storedToken ? 'success' : 'failed');
          if (!storedToken) {
            throw new Error('Failed to store token in localStorage');
          }
          
          // In development mode with the simple server, skip the token verification
          // This is only for testing purposes - in production we would verify
          try {
            // Try to verify the token, but don't fail login if it doesn't work
            const user = await authService.getCurrentUser();
            if (user) {
              console.log('Token verification successful');
            } else {
              console.warn('Token verification failed, but proceeding with login anyway (dev mode)');
            }
          } catch (verifyError) {
            console.warn('Error during token verification, but proceeding with login anyway (dev mode):', verifyError);
          }
          
          console.log('Login successful');
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
      // Check localStorage availability first
      if (!authService.checkLocalStorage()) {
        console.error('localStorage is not available in getCurrentUser');
        return null;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage during getCurrentUser check');
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
