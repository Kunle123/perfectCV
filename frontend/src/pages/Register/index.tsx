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
import { register } from '../../services/auth';

interface RegisterProps {
  onRegister: () => void;
}

const Register = ({ onRegister }: RegisterProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

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

    setIsLoading(true);

    try {
      await register(email, password);
      onRegister();
      toast({
        title: 'Registration successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'Please try again with different credentials',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
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
