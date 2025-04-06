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
  useToast,
} from '@chakra-ui/react';
import { FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { optimizationService } from '../../services/optimization';

interface OptimizationResult {
  id: number;
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
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const optimizationId = location.state?.optimizationId;
        if (!optimizationId) {
          throw new Error('No optimization ID provided');
        }

        const optimizationResult = await optimizationService.getOptimization(optimizationId);
        setResult(optimizationResult);
      } catch (error) {
        console.error('Error fetching optimization result:', error);
        toast({
          title: 'Error',
          description: 'Failed to load optimization results',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [location.state, navigate, toast]);

  const handleApplySuggestions = async () => {
    if (!result) return;

    try {
      setIsLoading(true);
      await optimizationService.optimizeResume(result.id, result.resume_id);
      toast({
        title: 'Success',
        description: 'Resume has been optimized with AI suggestions',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error applying suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply AI suggestions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!result) return;

    try {
      setIsLoading(true);
      const blob = await optimizationService.exportOptimization(result.id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimized-resume.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to export resume',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={10}>
        <Stack spacing={8}>
          <Box>
            <Heading size="xl">Loading Results...</Heading>
            <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} mt={2}>
              Please wait while we analyze your resume
            </Text>
          </Box>
        </Stack>
      </Container>
    );
  }

  if (!result) {
    return (
      <Container maxW="container.xl" py={10}>
        <Stack spacing={8}>
          <Box>
            <Heading size="xl">No Results Found</Heading>
            <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} mt={2}>
              Please try optimizing your resume again
            </Text>
          </Box>
        </Stack>
      </Container>
    );
  }

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
              <Button
                colorScheme="blue"
                size="lg"
                onClick={handleApplySuggestions}
                isLoading={isLoading}
              >
                Apply AI Suggestions
              </Button>
              <Button
                variant="outline"
                colorScheme="blue"
                size="lg"
                onClick={() => handleExport('pdf')}
                isLoading={isLoading}
              >
                Export as PDF
              </Button>
              <Button
                variant="outline"
                colorScheme="blue"
                size="lg"
                onClick={() => handleExport('docx')}
                isLoading={isLoading}
              >
                Export as DOCX
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default OptimizationResult;
