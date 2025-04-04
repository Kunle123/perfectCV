import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Text,
  useColorMode,
  Button,
  Stack,
  Icon,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiFileText, FiSearch, FiShoppingCart, FiUpload } from 'react-icons/fi';

const Dashboard = () => {
  const { colorMode } = useColorMode();

  return (
    <Container maxW="container.xl" py={10}>
      <Stack spacing={8}>
        <Box>
          <Heading size="xl">Welcome back!</Heading>
          <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} mt={2}>
            Here's an overview of your account
          </Text>
        </Box>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Stat p={6} bg={colorMode === 'light' ? 'white' : 'gray.800'} rounded="lg" shadow="md">
            <StatLabel>Available Credits</StatLabel>
            <StatNumber>25</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              Last purchase: 2 days ago
            </StatHelpText>
          </Stat>
          <Stat p={6} bg={colorMode === 'light' ? 'white' : 'gray.800'} rounded="lg" shadow="md">
            <StatLabel>Resumes Created</StatLabel>
            <StatNumber>3</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              Last created: 1 week ago
            </StatHelpText>
          </Stat>
          <Stat p={6} bg={colorMode === 'light' ? 'white' : 'gray.800'} rounded="lg" shadow="md">
            <StatLabel>Job Descriptions Analyzed</StatLabel>
            <StatNumber>5</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              Last analyzed: 3 days ago
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Quick Actions */}
        <Box p={6} bg={colorMode === 'light' ? 'white' : 'gray.800'} rounded="lg" shadow="md">
          <Stack spacing={6}>
            <Heading size="md">Quick Actions</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <Button
                as={RouterLink}
                to="/resume-builder"
                leftIcon={<Icon as={FiFileText} />}
                colorScheme="blue"
                size="lg"
                height="auto"
                py={4}
              >
                Create New Resume
              </Button>
              <Button
                as={RouterLink}
                to="/resume-upload"
                leftIcon={<Icon as={FiUpload} />}
                colorScheme="teal"
                size="lg"
                height="auto"
                py={4}
              >
                Upload Resume
              </Button>
              <Button
                as={RouterLink}
                to="/job-parser"
                leftIcon={<Icon as={FiSearch} />}
                colorScheme="green"
                size="lg"
                height="auto"
                py={4}
              >
                Analyze Job Description
              </Button>
              <Button
                as={RouterLink}
                to="/settings"
                leftIcon={<Icon as={FiShoppingCart} />}
                colorScheme="purple"
                size="lg"
                height="auto"
                py={4}
              >
                Buy Credits
              </Button>
            </SimpleGrid>
          </Stack>
        </Box>

        {/* Recent Activity */}
        <Box p={6} bg={colorMode === 'light' ? 'white' : 'gray.800'} rounded="lg" shadow="md">
          <Stack spacing={4}>
            <Heading size="md">Recent Activity</Heading>
            <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
              No recent activity. Start by creating your first resume!
            </Text>
            <Button as={RouterLink} to="/resume-builder" colorScheme="blue" width="fit-content">
              Create Resume
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default Dashboard;
