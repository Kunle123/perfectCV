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
import { useState } from 'react';
import { authService } from '../../services/auth';

interface LoginProps {
  onLogin?: () => Promise<void>;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setInternalLoading(true);

    try {
      if (onLogin) {
        await onLogin();
      } else {
        const response = await authService.login({ email, password });
        
        // Verify authentication was successful
        const isAuthenticated = await authService.isAuthenticated();
        if (!isAuthenticated) {
          throw new Error('Authentication verification failed');
        }

        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.response?.data?.detail || 'Invalid email or password',
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
                <FormErrorMessage>{emailError}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!passwordError}>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
