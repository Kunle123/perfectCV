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
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../../services/auth';

interface RegisterProps {
  onRegister?: (user: { email: string; password: string; full_name: string }) => Promise<void>;
  isLoading?: boolean;
}

const Register = ({ onRegister, isLoading: externalLoading }: RegisterProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const isLoading = externalLoading || internalLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!fullName.trim()) {
      toast({
        title: 'Full name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setInternalLoading(true);

    try {
      if (onRegister) {
        await onRegister({ email, password, full_name: fullName });
      } else {
        console.log('Attempting registration with email:', email);
        const response = await authService.register({ email, password, full_name: fullName });
        console.log('Registration response:', response);
        
        if (response.access_token) {
          console.log('Token received from registration, storing in localStorage');
          localStorage.setItem('token', response.access_token);
          
          // Verify the token immediately after registration
          console.log('Verifying token with getCurrentUser');
          const user = await authService.getCurrentUser();
          console.log('getCurrentUser result:', user);
          
          if (!user) {
            console.error('Token verification failed - no user returned');
            throw new Error('Failed to verify authentication token');
          }
          
          console.log('Registration successful and verified');
          toast({
            title: 'Registration successful',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          navigate('/dashboard');
        } else {
          console.error('No access token in registration response');
          throw new Error('No access token received from server');
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error.response?.data?.detail || 'Please try again with different credentials',
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
            <Heading size="xl">Create Account</Heading>
            <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
              Sign up to get started with PerfectCV
            </Text>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                />
              </FormControl>

              <Button type="submit" colorScheme="blue" size="lg" isLoading={isLoading}>
                Sign Up
              </Button>
            </Stack>
          </form>

          <Stack textAlign="center">
            <Text>
              Already have an account?{' '}
              <Link as={RouterLink} to="/login" color="blue.500">
                Sign in
              </Link>
            </Text>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
};

export default Register;
