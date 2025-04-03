import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  useColorMode,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import api from '../../utils/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      toast({
        title: 'Error',
        description: 'Invalid payment session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
      return;
    }

    const verifyPayment = async () => {
      try {
        await api.post('/api/v1/payments/verify', { session_id: sessionId });
        toast({
          title: 'Success',
          description: 'Payment verified successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to verify payment',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, toast]);

  if (isLoading) {
    return (
      <Container maxW="container.md" py={10}>
        <Text>Verifying payment...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={10}>
      <Stack spacing={8}>
        <Box
          p={6}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          rounded="lg"
          shadow="md"
          textAlign="center"
        >
          <Stack spacing={6}>
            <Icon as={CheckCircleIcon} w={16} h={16} color="green.500" mx="auto" />
            <Stack spacing={2}>
              <Heading size="lg">Payment Successful!</Heading>
              <Text color="gray.500">
                Thank you for your purchase. Your credits have been added to your account.
              </Text>
            </Stack>

            <Button
              colorScheme="blue"
              onClick={() => navigate('/dashboard')}
              width="fit-content"
              mx="auto"
            >
              Return to Dashboard
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default PaymentSuccess;
