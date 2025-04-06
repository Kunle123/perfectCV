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

interface LoginProps {
  onLogin?: () => Promise<void>;
  isLoading?: boolean;
}

const Login = ({ onLogin, isLoading: externalLoading }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const isLoading = externalLoading || internalLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalLoading(true);

    try {
      if (onLogin) {
        await onLogin();
      } else {
        const response = await authService.login({ email, password });
        // Store the token
        localStorage.setItem('token', response.access_token);
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password',
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
                  placeholder="Enter your password"
                />
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
