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
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
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
} from '@chakra-ui/react';
import { FiCheck, FiX, FiAlertCircle, FiUpload, FiFile, FiEdit, FiArrowRight } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { optimizationService } from '../../services/optimization';
import { resumeService } from '../../services/resume';

interface OptimizationResult {
  optimized: boolean;
  suggestions: Array<{
    section: string;
    suggestions: string[];
  }>;
  method: string;
  enhanced_skills?: string[];
  optimized_experience?: Array<{
    company: string;
    position: string;
    duration: string;
    bullets: string[];
  }>;
  job_requirements?: {
    skills: string[];
    keywords: string[];
    responsibilities: string[];
  };
}

const ResumeOptimization = () => {
  const { colorMode } = useColorMode();
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeId, setResumeId] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Check if we have a resume ID from the location state
    if (location.state?.resumeId) {
      setResumeId(location.state.resumeId);
      fetchResume(location.state.resumeId);
    }
  }, [location]);

  const fetchResume = async (id: number) => {
    try {
      const resume = await resumeService.getResume(id);
      setResumeText(resume.content);
    } catch (error) {
      console.error('Error fetching resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch resume. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleOptimize = async () => {
    if (!resumeText || !jobDescription) {
      toast({
        title: 'Missing information',
        description: 'Please provide both resume text and job description.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const optimizationResult = await optimizationService.optimizeResumeWithJobDescription(
        resumeText,
        jobDescription
      );
      setResult(optimizationResult.result);
      
      toast({
        title: 'Optimization complete',
        description: 'Your resume has been optimized for the job description.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Optimization error:', error);
      toast({
        title: 'Optimization failed',
        description: 'There was an error optimizing your resume. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOptimization = async () => {
    if (!result || !resumeId) return;
    
    try {
      // Create a job description first
      const jobDescResponse = await fetch('/api/v1/job-descriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: 'Job Description',
          content: jobDescription,
        }),
      });
      
      if (!jobDescResponse.ok) {
        throw new Error('Failed to create job description');
      }
      
      const jobDescData = await jobDescResponse.json();
      
      // Create optimization
      const optimization = await optimizationService.optimizeResume(
        resumeId,
        jobDescData.id
      );
      
      toast({
        title: 'Optimization saved',
        description: 'Your optimized resume has been saved.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Navigate to the optimization result page
      navigate('/optimization-result', { state: { optimizationId: optimization.id } });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Save failed',
        description: 'There was an error saving your optimization. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          AI-Powered Resume Optimization
        </Heading>
        
        <Text textAlign="center" fontSize="lg">
          Upload your resume and job description to get AI-powered optimization suggestions.
        </Text>
        
        <Box
          p={6}
          bg={colorMode === 'dark' ? 'gray.700' : 'white'}
          borderRadius="lg"
          boxShadow="md"
        >
          <VStack spacing={6} align="stretch">
            <FormControl>
              <FormLabel>Resume Text</FormLabel>
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                size="lg"
                minH="200px"
              />
              <FormHelperText>
                Paste the text content of your resume here.
              </FormHelperText>
            </FormControl>
            
            <FormControl>
              <FormLabel>Job Description</FormLabel>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                size="lg"
                minH="200px"
              />
              <FormHelperText>
                Paste the job description you want to optimize your resume for.
              </FormHelperText>
            </FormControl>
            
            <Button
              colorScheme="blue"
              size="lg"
              leftIcon={<Icon as={FiEdit} />}
              onClick={handleOptimize}
              isLoading={isLoading}
              loadingText="Optimizing..."
              isDisabled={!resumeText || !jobDescription}
            >
              Optimize Resume
            </Button>
          </VStack>
        </Box>
        
        {isLoading && (
          <Box textAlign="center" py={4}>
            <Spinner size="xl" />
            <Text mt={4}>AI is analyzing your resume and job description...</Text>
          </Box>
        )}
        
        {result && (
          <Box
            p={6}
            bg={colorMode === 'dark' ? 'gray.700' : 'white'}
            borderRadius="lg"
            boxShadow="md"
          >
            <VStack spacing={6} align="stretch">
              <Heading as="h2" size="lg">
                Optimization Results
              </Heading>
              
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Optimization Complete</AlertTitle>
                  <AlertDescription>
                    Your resume has been optimized for the job description using AI.
                  </AlertDescription>
                </Box>
              </Alert>
              
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
                                <ListIcon as={FiArrowRight} color="green.500" />
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
              
              <Button
                colorScheme="green"
                size="lg"
                leftIcon={<Icon as={FiFile} />}
                onClick={handleSaveOptimization}
                isDisabled={!resumeId}
              >
                Save Optimization
              </Button>
            </VStack>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default ResumeOptimization; 