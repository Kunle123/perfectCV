import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Heading, Text, VStack, HStack, Divider, useToast, Tabs, TabList, TabPanels, Tab, TabPanel, Spinner } from '@chakra-ui/react';
import { careerToolsService } from '../../services/careerTools';

const CoverLetterResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [coverLetter, setCoverLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchCoverLetter = async () => {
      try {
        const data = await careerToolsService.getCoverLetter(id);
        setCoverLetter(data.cover_letter_data);
      } catch (error) {
        toast({
          title: 'Error fetching cover letter',
          description: error.message || 'An unexpected error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCoverLetter();
    }
  }, [id, toast]);

  const handleExport = async (format) => {
    try {
      setExporting(true);
      await careerToolsService.exportCoverLetter(id, format);
      toast({
        title: 'Export successful',
        description: `Cover letter exported as ${format.toUpperCase()}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error.message || 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.md" py={8} centerContent>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading your cover letter...</Text>
        </VStack>
      </Container>
    );
  }

  if (!coverLetter) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={4} align="stretch">
          <Heading as="h1" size="xl">Cover Letter Not Found</Heading>
          <Text>The requested cover letter could not be found.</Text>
          <Button colorScheme="blue" onClick={() => navigate('/cover-letter-generator')}>
            Create New Cover Letter
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Your AI-Generated Cover Letter
        </Heading>

        <HStack spacing={4} justify="center">
          <Button
            colorScheme="blue"
            onClick={() => handleExport('pdf')}
            isLoading={exporting}
            loadingText="Exporting..."
          >
            Export as PDF
          </Button>
          <Button
            colorScheme="green"
            onClick={() => handleExport('docx')}
            isLoading={exporting}
            loadingText="Exporting..."
          >
            Export as DOCX
          </Button>
        </HStack>

        <Divider />

        <Tabs isFitted variant="enclosed">
          <TabList mb="1em">
            <Tab>Preview</Tab>
            <Tab>Sections</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box
                p={6}
                borderWidth="1px"
                borderRadius="lg"
                bg="white"
                boxShadow="md"
                whiteSpace="pre-line"
              >
                {coverLetter.full_text}
              </Box>
            </TabPanel>
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading as="h3" size="md" mb={2}>
                    Date
                  </Heading>
                  <Text>{coverLetter.date}</Text>
                </Box>

                <Box>
                  <Heading as="h3" size="md" mb={2}>
                    Recipient
                  </Heading>
                  <Text>{coverLetter.recipient.name}</Text>
                  {coverLetter.recipient.title && (
                    <Text>{coverLetter.recipient.title}</Text>
                  )}
                  <Text>{coverLetter.recipient.company}</Text>
                  {coverLetter.recipient.address && (
                    <Text>{coverLetter.recipient.address}</Text>
                  )}
                </Box>

                <Box>
                  <Heading as="h3" size="md" mb={2}>
                    Greeting
                  </Heading>
                  <Text>{coverLetter.greeting}</Text>
                </Box>

                <Box>
                  <Heading as="h3" size="md" mb={2}>
                    Introduction
                  </Heading>
                  <Text>{coverLetter.introduction}</Text>
                </Box>

                <Box>
                  <Heading as="h3" size="md" mb={2}>
                    Body
                  </Heading>
                  {coverLetter.body_paragraphs.map((paragraph, index) => (
                    <Text key={index} mb={4}>
                      {paragraph}
                    </Text>
                  ))}
                </Box>

                <Box>
                  <Heading as="h3" size="md" mb={2}>
                    Closing
                  </Heading>
                  <Text>{coverLetter.closing_paragraph}</Text>
                </Box>

                <Box>
                  <Heading as="h3" size="md" mb={2}>
                    Signature
                  </Heading>
                  <Text>{coverLetter.signature}</Text>
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Divider />

        <VStack spacing={4}>
          <Button
            colorScheme="blue"
            onClick={() => navigate('/cover-letter-generator')}
          >
            Create Another Cover Letter
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </VStack>
      </VStack>
    </Container>
  );
};

export default CoverLetterResult;
