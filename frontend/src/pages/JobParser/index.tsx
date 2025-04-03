import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  useColorMode,
  Textarea,
} from '@chakra-ui/react';
import { useState } from 'react';

const JobParser = () => {
  const { colorMode } = useColorMode();
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement job description parsing
      console.log('Parsing job description:', jobDescription);
    } catch (error) {
      console.error('Error parsing job description:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <Stack spacing={8}>
        <Box>
          <Heading size="xl">Job Description Parser</Heading>
          <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} mt={2}>
            Paste a job description to analyze and extract key requirements
          </Text>
        </Box>

        <Box p={6} bg={colorMode === 'light' ? 'white' : 'gray.800'} rounded="lg" shadow="md">
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                size="lg"
                rows={10}
              />
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                isLoading={isLoading}
                loadingText="Analyzing..."
              >
                Analyze Job Description
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
};

export default JobParser;
