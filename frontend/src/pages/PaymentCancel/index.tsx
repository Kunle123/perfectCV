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
import { useNavigate } from 'react-router-dom';
import { CloseIcon } from '@chakra-ui/icons';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

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
            <Icon as={CloseIcon} w={16} h={16} color="red.500" mx="auto" />
            <Stack spacing={2}>
              <Heading size="lg">Payment Cancelled</Heading>
              <Text color="gray.500">
                Your payment was cancelled. No charges were made to your account.
              </Text>
            </Stack>

            <Stack spacing={4}>
              <Button
                colorScheme="blue"
                onClick={() => navigate('/payment')}
                width="fit-content"
                mx="auto"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                width="fit-content"
                mx="auto"
              >
                Return to Dashboard
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default PaymentCancel;
