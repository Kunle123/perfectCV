import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, FormControl, FormLabel, Heading, Input, Textarea, VStack, Text, useToast, Divider } from '@chakra-ui/react';
import { careerToolsService } from '../../services/careerTools';

const CoverLetterGenerator = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [resumeFile, setResumeFile] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const onSubmit = async (data) => {
    try {
      if (!resumeFile) {
        toast({
          title: 'Resume required',
          description: 'Please upload your resume',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const formData = new FormData();
      formData.append('resume_file', resumeFile);
      formData.append('job_description_text', data.jobDescription);
      
      if (data.companyName) {
        formData.append('company_name', data.companyName);
      }
      
      if (data.hiringManager) {
        formData.append('hiring_manager', data.hiringManager);
      }
      
      if (data.additionalNotes) {
        formData.append('additional_notes', data.additionalNotes);
      }

      const response = await careerToolsService.generateCoverLetter(resumeFile);
      
      // Navigate to cover letter result page
      navigate(`/cover-letter-result/${response.id}`);
    } catch (error) {
      toast({
        title: 'Error generating cover letter',
        description: error.message || 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is PDF or DOCX
      const fileType = file.type;
      if (fileType === 'application/pdf' || 
          fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setResumeFile(file);
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF or DOCX file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        e.target.value = null;
      }
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          AI Cover Letter Generator
        </Heading>
        
        <Text>
          Create a personalized cover letter tailored to your resume and the job you're applying for.
          Our AI will highlight your most relevant experience and skills to make your application stand out.
        </Text>
        
        <Divider />
        
        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Upload Your Resume</FormLabel>
              <Input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                p={1}
              />
              <Text fontSize="sm" color="gray.500">
                Upload your resume in PDF or DOCX format
              </Text>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Job Description</FormLabel>
              <Textarea
                placeholder="Paste the job description here"
                rows={8}
                {...register('jobDescription', { required: 'Job description is required' })}
              />
              {errors.jobDescription && (
                <Text color="red.500">{errors.jobDescription.message}</Text>
              )}
            </FormControl>
            
            <FormControl>
              <FormLabel>Company Name</FormLabel>
              <Input
                placeholder="Enter the company name"
                {...register('companyName')}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Hiring Manager (if known)</FormLabel>
              <Input
                placeholder="Enter the hiring manager's name"
                {...register('hiringManager')}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Additional Notes</FormLabel>
              <Textarea
                placeholder="Any specific points you'd like to emphasize in your cover letter"
                rows={3}
                {...register('additionalNotes')}
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              isLoading={isSubmitting}
              loadingText="Generating..."
              width="full"
              mt={4}
            >
              Generate Cover Letter
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CoverLetterGenerator;
