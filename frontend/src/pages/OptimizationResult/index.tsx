import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  useColorMode,
  VStack,
  Icon,
  Progress,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

interface OptimizationResult {
  matchScore: number;
  suggestions: {
    type: 'improvement' | 'missing' | 'warning';
    text: string;
  }[];
  keywords: string[];
  missingKeywords: string[];
}

const OptimizationResult = () => {
  const { colorMode } = useColorMode();

  // TODO: Replace with actual data from API
  const result: OptimizationResult = {
    matchScore: 75,
    suggestions: [
      {
        type: 'improvement',
        text: 'Add more details about your experience with React',
      },
      {
        type: 'missing',
        text: 'Include experience with TypeScript',
      },
      {
        type: 'warning',
        text: 'Consider adding a portfolio section',
      },
    ],
    keywords: ['React', 'JavaScript', 'Node.js', 'Git'],
    missingKeywords: ['TypeScript', 'Docker', 'AWS'],
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'improvement':
        return 'green';
      case 'missing':
        return 'red';
      case 'warning':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'improvement':
        return FiCheck;
      case 'missing':
        return FiX;
      case 'warning':
        return FiAlertCircle;
      default:
        return FiAlertCircle;
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <Stack spacing={8}>
        <Box>
          <Heading size="xl">Optimization Results</Heading>
          <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} mt={2}>
            Here's how your resume matches the job description
          </Text>
        </Box>

        {/* Match Score */}
        <Box p={6} bg={colorMode === 'light' ? 'white' : 'gray.800'} rounded="lg" shadow="md">
          <VStack spacing={4}>
            <Heading size="lg">Match Score</Heading>
            <Progress
              value={result.matchScore}
              colorScheme={result.matchScore >= 80 ? 'green' : 'yellow'}
              size="lg"
              w="100%"
            />
            <Text fontSize="xl" fontWeight="bold">
              {result.matchScore}%
            </Text>
          </VStack>
        </Box>

        {/* Suggestions */}
        <Box p={6} bg={colorMode === 'light' ? 'white' : 'gray.800'} rounded="lg" shadow="md">
          <Stack spacing={6}>
            <Heading size="md">Suggestions for Improvement</Heading>
            <VStack spacing={4} align="stretch">
              {result.suggestions.map((suggestion, index) => (
                <Box
                  key={index}
                  p={4}
                  bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
                  rounded="md"
                >
                  <Stack direction="row" spacing={3} align="center">
                    <Icon
                      as={getSuggestionIcon(suggestion.type)}
                      color={`${getSuggestionColor(suggestion.type)}.500`}
                      w={5}
                      h={5}
                    />
                    <Text>{suggestion.text}</Text>
                  </Stack>
                </Box>
              ))}
            </VStack>
          </Stack>
        </Box>

        {/* Keywords */}
        <Box p={6} bg={colorMode === 'light' ? 'white' : 'gray.800'} rounded="lg" shadow="md">
          <Stack spacing={6}>
            <Heading size="md">Keyword Analysis</Heading>
            <Stack spacing={4}>
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Matching Keywords
                </Text>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {result.keywords.map((keyword, index) => (
                    <Badge key={index} colorScheme="green" fontSize="md" px={3} py={1}>
                      {keyword}
                    </Badge>
                  ))}
                </Stack>
              </Box>
              <Divider />
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Missing Keywords
                </Text>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {result.missingKeywords.map((keyword, index) => (
                    <Badge key={index} colorScheme="red" fontSize="md" px={3} py={1}>
                      {keyword}
                    </Badge>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* Actions */}
        <Box p={6} bg={colorMode === 'light' ? 'white' : 'gray.800'} rounded="lg" shadow="md">
          <Stack spacing={4}>
            <Heading size="md">Next Steps</Heading>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
              <Button colorScheme="blue" size="lg">
                Apply AI Suggestions
              </Button>
              <Button variant="outline" colorScheme="blue" size="lg">
                Edit Manually
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default OptimizationResult;
