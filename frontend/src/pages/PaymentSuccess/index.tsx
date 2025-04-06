import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Heading, Text, VStack, useToast } from '@chakra-ui/react';
import { paymentService } from '../../services/payment';
import { API_ENDPOINTS } from '../../api/config';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      toast({
        title: 'Error',
        description: 'No session ID found',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/payment');
    }
  }, [searchParams, navigate, toast]);

  const verifyPayment = async (sessionId: string) => {
    try {
      setIsLoading(true);
      await paymentService.verifyPayment(sessionId);
      toast({
        title: 'Payment successful',
        description: 'Your credits have been added to your account',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: 'Error',
        description: 'There was an error verifying your payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={8} maxW="container.md" mx="auto">
      <VStack spacing={6} align="center">
        <Heading>Payment Processing</Heading>
        <Text>Please wait while we verify your payment...</Text>
        {isLoading && (
          <Button isLoading loadingText="Verifying payment..." colorScheme="blue" isDisabled>
            Verifying Payment
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default PaymentSuccess;
