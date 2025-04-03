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

const JobDescriptionUpload = () => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF or TXT file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Simulate file upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          setUploadProgress(i);
        }

        // TODO: Implement actual file upload
        console.log('Uploading file:', file);

        toast({
          title: 'Upload successful',
          description: 'Your job description has been uploaded successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: 'There was an error uploading your job description',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  return (
    <Container maxW="container.xl" py={10}>
      <Stack spacing={8}>
        <Box>
          <Heading size="xl">Upload Job Description</Heading>
          <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} mt={2}>
            Upload a job description to analyze and optimize your resume
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
                    ? 'Drop your job description here'
                    : 'Drag and drop your job description here, or click to select'}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  PDF or TXT files only
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
              • Make sure the job description is clear and complete
              <br />
              • Include all required qualifications and responsibilities
              <br />
              • Keep the file size under 5MB
              <br />
              • Ensure all text is selectable (not scanned)
              <br />• Remove any company-specific formatting
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default JobDescriptionUpload;
