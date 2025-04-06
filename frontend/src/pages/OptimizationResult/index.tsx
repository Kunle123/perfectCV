import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  useColorMode,
  VStack,
  Icon,
  Badge,
  Divider,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
} from '@chakra-ui/react';
import { FiCheck, FiDownload, FiArrowLeft, FiFile } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { optimizationService, OptimizationResult } from '../../services/optimization';

const OptimizationResultPage = () => {
  const { colorMode } = useColorMode();
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (location.state?.optimizationId) {
      fetchOptimization(location.state.optimizationId);
    } else {
      toast({
        title: 'Error',
        description: 'No optimization ID provided.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/optimize');
    }
  }, [location]);

  const fetchOptimization = async (id: number) => {
    setIsLoading(true);
    try {
      const optimization = await optimizationService.getOptimization(id);
      setResult(optimization.result);
    } catch (error) {
      console.error('Error fetching optimization:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch optimization results. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/optimize');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!location.state?.optimizationId) return;
    
    setIsExporting(true);
    try {
      const blob = await optimizationService.exportOptimization(
        location.state.optimizationId,
        format
      );
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimized-resume.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Export successful',
        description: `Your optimized resume has been exported as ${format.toUpperCase()}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your resume. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Box textAlign="center">
          <Spinner size="xl" />
          <Text mt={4}>Loading optimization results...</Text>
        </Box>
      </Container>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Button
            leftIcon={<Icon as={FiArrowLeft} />}
            onClick={() => navigate('/optimize')}
          >
            Back to Optimization
          </Button>
          
          <HStack>
            <Button
              colorScheme="blue"
              leftIcon={<Icon as={FiDownload} />}
              onClick={() => handleExport('pdf')}
              isLoading={isExporting}
              loadingText="Exporting PDF..."
            >
              Export PDF
            </Button>
            <Button
              colorScheme="green"
              leftIcon={<Icon as={FiFile} />}
              onClick={() => handleExport('docx')}
              isLoading={isExporting}
              loadingText="Exporting DOCX..."
            >
              Export DOCX
            </Button>
          </HStack>
        </HStack>
        
        <Heading as="h1" size="xl" textAlign="center">
          Optimization Results
        </Heading>
        
        <Alert status="success" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Optimization Complete</AlertTitle>
            <AlertDescription>
              Your resume has been optimized using AI to match the job description.
            </AlertDescription>
          </Box>
        </Alert>
        
        <Box
          p={6}
          bg={colorMode === 'dark' ? 'gray.700' : 'white'}
          borderRadius="lg"
          boxShadow="md"
        >
          <VStack spacing={6} align="stretch">
            <Accordion allowMultiple defaultIndex={[0]}>
              <AccordionItem>
                <h3>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Heading as="h3" size="md">
                        Job Requirements
                      </Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h3>
                <AccordionPanel pb={4}>
                  {result.job_requirements && (
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Heading as="h4" size="sm" mb={2}>
                          Key Skills
                        </Heading>
                        <Flex wrap="wrap" gap={2}>
                          {result.job_requirements.skills.map((skill, index) => (
                            <Badge key={index} colorScheme="blue" p={2} borderRadius="md">
                              {skill}
                            </Badge>
                          ))}
                        </Flex>
                      </Box>
                      
                      <Box>
                        <Heading as="h4" size="sm" mb={2}>
                          Important Keywords
                        </Heading>
                        <Flex wrap="wrap" gap={2}>
                          {result.job_requirements.keywords.map((keyword, index) => (
                            <Badge key={index} colorScheme="green" p={2} borderRadius="md">
                              {keyword}
                            </Badge>
                          ))}
                        </Flex>
                      </Box>
                      
                      <Box>
                        <Heading as="h4" size="sm" mb={2}>
                          Main Responsibilities
                        </Heading>
                        <List spacing={2}>
                          {result.job_requirements.responsibilities.map((resp, index) => (
                            <ListItem key={index}>
                              <ListIcon as={FiCheck} color="green.500" />
                              {resp}
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </VStack>
                  )}
                </AccordionPanel>
              </AccordionItem>
              
              <AccordionItem>
                <h3>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Heading as="h3" size="md">
                        Enhanced Skills
                      </Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h3>
                <AccordionPanel pb={4}>
                  {result.enhanced_skills && (
                    <Flex wrap="wrap" gap={2}>
                      {result.enhanced_skills.map((skill, index) => (
                        <Badge key={index} colorScheme="purple" p={2} borderRadius="md">
                          {skill}
                        </Badge>
                      ))}
                    </Flex>
                  )}
                </AccordionPanel>
              </AccordionItem>
              
              <AccordionItem>
                <h3>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Heading as="h3" size="md">
                        Optimization Suggestions
                      </Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h3>
                <AccordionPanel pb={4}>
                  {result.suggestions.map((suggestion, index) => (
                    <Box key={index} mb={4}>
                      <Heading as="h4" size="sm" mb={2}>
                        {suggestion.section}
                      </Heading>
                      <List spacing={2}>
                        {suggestion.suggestions.map((item, itemIndex) => (
                          <ListItem key={itemIndex}>
                            <ListIcon as={FiCheck} color="green.500" />
                            {item}
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  ))}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default OptimizationResultPage;
