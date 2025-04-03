import { Box, Button, Container, Heading, Stack, Text, useColorMode, Icon } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { WarningIcon } from '@chakra-ui/icons';

const NotFound = () => {
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
            <Icon as={WarningIcon} w={16} h={16} color="yellow.500" mx="auto" />
            <Stack spacing={2}>
              <Heading size="lg">Page Not Found</Heading>
              <Text color="gray.500">
                The page you're looking for doesn't exist or has been moved.
              </Text>
            </Stack>

            <Button colorScheme="blue" onClick={() => navigate('/')} width="fit-content" mx="auto">
              Return to Home
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default NotFound;
