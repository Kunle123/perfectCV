import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  useColorMode,
  useToast,
  VStack,
  Icon,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Collapse,
} from '@chakra-ui/react';
import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { resumeService } from '../../services/resume';
import { optimizationService } from '../../services/optimization';
import { authService } from '../../services/auth';

const ResumeUpload = () => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const navigate = useNavigate();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('ResumeUpload: Checking authentication status');
      const token = authService.getToken();
      console.log('ResumeUpload: Token exists:', !!token);
      
      if (!token) {
        console.log('ResumeUpload: No token found, redirecting to login');
        toast({
          title: 'Authentication required',
          description: 'Please log in to upload a resume',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
        return;
      }
      
      try {
        console.log('ResumeUpload: Fetching current user');
        const user = await authService.getCurrentUser();
        console.log('ResumeUpload: User data received:', user);
        setIsAuthenticated(!!user);
        
        if (!user) {
          console.log('ResumeUpload: No user data returned, redirecting to login');
          toast({
            title: 'Authentication error',
            description: 'Your session may have expired. Please log in again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/login');
        } else {
          console.log('ResumeUpload: Authentication successful');
        }
      } catch (error) {
        console.error('ResumeUpload: Error checking authentication:', error);
        setIsAuthenticated(false);
        toast({
          title: 'Authentication error',
          description: 'There was a problem verifying your account. Please log in again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [toast, navigate]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Check authentication first
      if (!isAuthenticated) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to upload a resume',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
        return;
      }
      
      const file = acceptedFiles[0];
      if (!file) return;

      // Check for valid file types
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/rtf',
        'text/rtf'
      ];
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF, DOC, DOCX, or RTF file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      setErrorDetails(null);

      try {
        // Create FormData and append file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name.replace(/\.[^/.]+$/, '')); // Remove file extension

        // Log the request details
        console.log('Uploading resume:', {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          formData: Array.from(formData.entries())
        });

        // Upload the file
        const result = await resumeService.uploadResume(formData);
        console.log('Upload result:', result);

        // Update progress to 50% after successful upload
        setUploadProgress(50);

        // Create an optimization for the uploaded resume
        console.log('Creating optimization for resume ID:', result.id);
        const optimizationResult = await optimizationService.optimizeResume(result.id, 0);
        console.log('Optimization result:', optimizationResult);

        // Update progress to 100% after successful optimization
        setUploadProgress(100);

        toast({
          title: 'Upload successful',
          description: 'Your resume has been uploaded and optimized successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Navigate to the optimization result page
        navigate('/optimization-result', { 
          state: { optimizationId: optimizationResult.id },
          replace: true // Replace the current history entry
        });
      } catch (error) {
        console.error('Upload error:', error);
        
        // Extract error message
        let errorMessage = 'There was an error uploading your resume. Please try again.';
        let errorData = null;
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
          
          errorMessage = error.response.data?.detail || 
                        error.response.data?.message || 
                        `Server error: ${error.response.status}`;
          errorData = error.response.data;
          
          // Handle authentication errors
          if (error.response.status === 401) {
            toast({
              title: 'Authentication error',
              description: 'Your session may have expired. Please log in again.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            navigate('/login');
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Error request:', error.request);
          errorMessage = 'No response received from server. Please check your connection.';
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', error.message);
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        setErrorDetails(errorData);
        
        toast({
          title: 'Upload failed',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsUploading(false);
      }
    },
    [toast, navigate, isAuthenticated]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/rtf': ['.rtf'],
      'text/rtf': ['.rtf']
    },
    maxFiles: 1,
  });

  return (
    <Container maxW="container.xl" py={10}>
      <Stack spacing={8}>
        <Box>
          <Heading size="xl">Upload Resume</Heading>
          <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} mt={2}>
            Upload your resume to get started with AI optimization
          </Text>
        </Box>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Upload Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              {errorDetails && (
                <Box mt={2}>
                  <Button 
                    size="sm" 
                    rightIcon={showErrorDetails ? <FiChevronUp /> : <FiChevronDown />}
                    onClick={() => setShowErrorDetails(!showErrorDetails)}
                    variant="outline"
                    colorScheme="red"
                  >
                    {showErrorDetails ? 'Hide Details' : 'Show Details'}
                  </Button>
                  <Collapse in={showErrorDetails}>
                    <Box mt={2} p={2} bg="gray.100" borderRadius="md">
                      <Code whiteSpace="pre-wrap" p={2}>
                        {JSON.stringify(errorDetails, null, 2)}
                      </Code>
                    </Box>
                  </Collapse>
                </Box>
              )}
            </Box>
          </Alert>
        )}

        <Box>
          <VStack spacing={6}>
            <Box
              {...getRootProps()}
              w="100%"
              p={8}
              border="2px dashed"
              borderColor={isDragActive ? 'blue.500' : 'gray.300'}
              rounded="lg"
              cursor="pointer"
              _hover={{ borderColor: 'blue.500' }}
              transition="all 0.2s"
            >
              <input {...getInputProps()} />
              <VStack spacing={4}>
                <Icon as={FiUpload} w={10} h={10} color="blue.500" />
                <Text fontSize="lg" textAlign="center">
                  {isDragActive
                    ? 'Drop your resume here'
                    : 'Drag and drop your resume here, or click to select'}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  PDF, DOC, DOCX, or RTF files (max 5MB)
                </Text>
              </VStack>
            </Box>

            {isUploading && (
              <Box w="100%">
                <Progress value={uploadProgress} colorScheme="blue" />
                <Text mt={2} textAlign="center" color="gray.500">
                  {uploadProgress < 50 ? 'Uploading resume...' : 'Optimizing resume...'} {uploadProgress}%
                </Text>
              </Box>
            )}

            <Button
              leftIcon={<Icon as={FiFile} />}
              colorScheme="blue"
              size="lg"
              onClick={() => document.getElementById('file-upload')?.click()}
              isLoading={isUploading}
              loadingText="Processing..."
            >
              Select File
            </Button>
          </VStack>
        </Box>

        <Box>
          <Stack spacing={4}>
            <Heading size="md">Tips for Best Results</Heading>
            <Text>
              • Make sure your resume is in PDF, DOC, DOCX, or RTF format
              <br />
              • Keep the file size under 5MB
              <br />
              • Ensure all text is selectable (not scanned)
              <br />
              • Include your most recent work experience
              <br />• Double-check for any sensitive information
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default ResumeUpload;
