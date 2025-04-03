import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  useColorMode,
  SimpleGrid,
  Icon,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiFileText, FiSearch, FiCheckCircle } from 'react-icons/fi';

const Feature = ({ icon, title, text }: { icon: any; title: string; text: string }) => {
  return (
    <VStack spacing={4} align="start">
      <Icon as={icon} w={8} h={8} color="blue.500" />
      <Text fontWeight="bold" fontSize="lg">
        {title}
      </Text>
      <Text color="gray.600">{text}</Text>
    </VStack>
  );
};

const Home = () => {
  const { colorMode } = useColorMode();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bg={colorMode === 'light' ? 'blue.50' : 'blue.900'}
        py={20}
        borderBottom="1px"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      >
        <Container maxW="container.xl">
          <Stack spacing={8} align="center" textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, blue.500, purple.500)"
              bgClip="text"
            >
              PerfectCV
            </Heading>
            <Text fontSize="xl" maxW="2xl">
              Optimize your resume with AI to match job descriptions perfectly. Get more interviews
              with our intelligent resume builder.
            </Text>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
              <Button as={RouterLink} to="/register" size="lg" colorScheme="blue">
                Get Started
              </Button>
              <Button as={RouterLink} to="/login" size="lg" variant="outline" colorScheme="blue">
                Sign In
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={20}>
        <Stack spacing={12}>
          <Stack textAlign="center" spacing={4}>
            <Heading size="xl">Why Choose PerfectCV?</Heading>
            <Text fontSize="lg" color="gray.600">
              Our AI-powered platform helps you create the perfect resume for your dream job
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <Feature
              icon={FiFileText}
              title="Smart Resume Builder"
              text="Create professional resumes with our intuitive builder and AI-powered suggestions"
            />
            <Feature
              icon={FiSearch}
              title="Job Description Parser"
              text="Upload job descriptions and let our AI analyze the requirements"
            />
            <Feature
              icon={FiCheckCircle}
              title="AI Optimization"
              text="Get personalized suggestions to optimize your resume for each job application"
            />
          </SimpleGrid>
        </Stack>
      </Container>

      {/* CTA Section */}
      <Box
        bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        py={20}
        borderTop="1px"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      >
        <Container maxW="container.xl">
          <Stack spacing={8} align="center" textAlign="center">
            <Heading size="xl">Ready to Get Started?</Heading>
            <Text fontSize="lg" maxW="2xl">
              Join thousands of job seekers who have optimized their resumes with PerfectCV
            </Text>
            <Button as={RouterLink} to="/register" size="lg" colorScheme="blue">
              Create Your Perfect Resume
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
