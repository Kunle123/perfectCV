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
} from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { uploadResume } from '../../services/resume';

const ResumeUpload = () => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const navigate = useNavigate();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
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

      try {
        const response = await uploadResume(file);

        toast({
          title: 'Upload successful',
          description: 'Your resume has been uploaded successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Navigate to the optimization result page
        navigate('/optimization-result', { state: { resumeId: response.id } });
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Upload failed',
          description: 'There was an error uploading your resume. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [toast, navigate]
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

        <Box p={8} bg={colorMode === 'light' ? 'white' : 'gray.800'} rounded="lg" shadow="md">
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
                  Uploading... {uploadProgress}%
                </Text>
              </Box>
            )}

            <Button
              leftIcon={<Icon as={FiFile} />}
              colorScheme="blue"
              size="lg"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Select File
            </Button>
          </VStack>
        </Box>

        <Box p={6} bg={colorMode === 'light' ? 'white' : 'gray.800'} rounded="lg" shadow="md">
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
