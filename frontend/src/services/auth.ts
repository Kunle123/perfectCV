import api from '../utils/api';

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

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post('/api/v1/auth/login', {
    email,
    password,
  });
  const { access_token, token_type, user } = response.data;
  localStorage.setItem('token', access_token);
  return { access_token, token_type, user };
};

export const register = async (
  email: string,
  password: string,
  full_name: string
): Promise<RegisterResponse> => {
  const response = await api.post('/api/v1/auth/register', {
    email,
    password,
    full_name,
  });
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/api/v1/auth/me');
  return response.data;
};
