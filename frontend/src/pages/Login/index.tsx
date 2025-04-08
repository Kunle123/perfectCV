import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  useColorMode,
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { authService } from '../../services/auth';

interface LoginProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<any>;
  isLoading?: boolean;
}

const Login = ({ onLogin, isLoading: externalLoading }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const isLoading = externalLoading || internalLoading;

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('Initial token check:', !!token);
      
      if (token) {
        try {
          const isAuthenticated = await authService.isAuthenticated();
          console.log('Authentication check result:', isAuthenticated);
          
          if (isAuthenticated) {
            console.log('User already authenticated, redirecting to dashboard');
            navigate('/dashboard');
          } else {
            console.log('Token exists but is invalid, clearing token');
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
          localStorage.removeItem('token');
        }
      }
    };
    
    checkAuth();
  }, [navigate]);

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInternalLoading(true);
    
    try {
      if (onLogin) {
        await onLogin({ email, password });
      } else {
        console.log('Attempting login with email:', email);
        
        // Clear any existing token
        localStorage.removeItem('token');
        
        // Attempt login
        const response = await authService.login({ email, password });
        console.log('Login response received:', response);
        
        // Check if token was stored
        const token = localStorage.getItem('token');
        console.log('Token after login:', !!token);
        
        if (!token) {
          throw new Error('Token not found in localStorage after login');
        }
        
        // Add a small delay before verification
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify authentication
        const isAuthenticated = await authService.isAuthenticated();
        console.log('Authentication verification result:', isAuthenticated);
        
        if (!isAuthenticated) {
          throw new Error('Authentication verification failed');
        }

        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Check for redirect path
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.response?.data?.detail || error.message || 'Invalid email or password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box p={8} bg={colorMode === 'light' ? 'white' : 'gray.800'} rounded="lg" shadow="md">
        <Stack spacing={6}>
          <Stack textAlign="center">
            <Heading size="xl">Welcome Back</Heading>
            <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
              Sign in to your account to continue
            </Text>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl isRequired isInvalid={!!emailError}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
                <FormErrorMessage>{emailError}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!passwordError}>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <FormErrorMessage>{passwordError}</FormErrorMessage>
              </FormControl>

              <Button type="submit" colorScheme="blue" size="lg" isLoading={isLoading}>
                Sign In
              </Button>
            </Stack>
          </form>

          <Stack textAlign="center">
            <Text>
              Don't have an account?{' '}
              <Link as={RouterLink} to="/register" color="blue.500">
                Sign up
              </Link>
            </Text>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
};

export default Login;
