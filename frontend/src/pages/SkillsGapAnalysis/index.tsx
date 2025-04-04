import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Divider, 
  useToast, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  Spinner,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  FormControl,
  FormLabel,
  Textarea,
  Input
} from '@chakra-ui/react';
import { analyzeSkillsGap, addUserSkills } from '../../services/careerTools';

const SkillsGapAnalysis = () => {
  const { resumeId, jobDescriptionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [userSkills, setUserSkills] = useState({});
  const [submittingSkills, setSubmittingSkills] = useState(false);

  const startAnalysis = async () => {
    try {
      setAnalyzing(true);
      const data = await analyzeSkillsGap(resumeId, jobDescriptionId);
      setAnalysis(data.analysis_data);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error analyzing skills gap',
        description: error.message || 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSkillChange = (skillName, description) => {
    setUserSkills({
      ...userSkills,
      [skillName]: description
    });
  };

  const handleSubmitSkills = async () => {
    try {
      setSubmittingSkills(true);
      const result = await addUserSkills(analysis.id, userSkills);
      toast({
        title: 'Skills added successfully',
        description: 'Your skills have been incorporated into your resume',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate(`/optimization-result/${result.id}`);
    } catch (error) {
      toast({
        title: 'Error adding skills',
        description: error.message || 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmittingSkills(false);
    }
  };

  if (loading && !analyzing) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" textAlign="center">
            Skills Gap Analysis
          </Heading>
          
          <Text textAlign="center">
            Analyze the gap between your resume and the job requirements to identify areas for improvement.
          </Text>
          
          <Button
            colorScheme="blue"
            size="lg"
            onClick={startAnalysis}
            isLoading={analyzing}
            loadingText="Analyzing..."
            width="full"
            mt={4}
          >
            Start Analysis
          </Button>
        </VStack>
      </Container>
    );
  }

  if (analyzing) {
    return (
      <Container maxW="container.md" py={8} centerContent>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Analyzing skills gap...</Text>
          <Text fontSize="sm" color="gray.500">This may take a minute as we compare your resume with the job requirements</Text>
        </VStack>
      </Container>
    );
  }

  if (!analysis) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={4} align="stretch">
          <Heading as="h1" size="xl">Analysis Not Found</Heading>
          <Text>The requested skills gap analysis could not be found.</Text>
          <Button colorScheme="blue" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Skills Gap Analysis
        </Heading>

        <Box p={4} borderWidth="1px" borderRadius="lg" bg="blue.50">
          <Text fontWeight="bold">{analysis.summary}</Text>
        </Box>

        <Divider />

        <Tabs isFitted variant="enclosed">
          <TabList mb="1em">
            <Tab>Missing Skills</Tab>
            <Tab>Enhancement Opportunities</Tab>
            <Tab>Implicit Skills</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {analysis.missing_skills.map((skill, index) => (
                  <Box key={index} p={4} borderWidth="1px" borderRadius="lg" bg="white">
                    <HStack mb={2}>
                      <Heading as="h3" size="md">{skill.skill}</Heading>
                      <Badge colorScheme={
                        skill.importance === 'High' ? 'red' : 
                        skill.importance === 'Medium' ? 'orange' : 'yellow'
                      }>
                        {skill.importance}
                      </Badge>
                    </HStack>
                    <Text mb={2}>{skill.description}</Text>
                    <Text fontStyle="italic" mb={2}>Why it matters: {skill.reason}</Text>
                    <Text fontWeight="bold">Suggestion: {skill.suggestion}</Text>
                    
                    <Divider my={4} />
                    
                    <FormControl>
                      <FormLabel>Add your experience with this skill</FormLabel>
                      <Textarea
                        placeholder={`Describe your experience with ${skill.skill}...`}
                        onChange={(e) => handleSkillChange(skill.skill, e.target.value)}
                        value={userSkills[skill.skill] || ''}
                      />
                    </FormControl>
                  </Box>
                ))}
              </VStack>
            </TabPanel>
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {analysis.enhancement_opportunities.map((skill, index) => (
                  <Box key={index} p={4} borderWidth="1px" borderRadius="lg" bg="white">
                    <Heading as="h3" size="md" mb={2}>{skill.skill}</Heading>
                    <Text mb={2}>Current level: {skill.current_level}</Text>
                    <Text mb={2}>Desired level: {skill.desired_level}</Text>
                    <Text fontWeight="bold">Suggestion: {skill.suggestion}</Text>
                    
                    <Divider my={4} />
                    
                    <FormControl>
                      <FormLabel>Enhance your description of this skill</FormLabel>
                      <Textarea
                        placeholder={`Provide an enhanced description of your ${skill.skill} experience...`}
                        onChange={(e) => handleSkillChange(skill.skill, e.target.value)}
                        value={userSkills[skill.skill] || ''}
                      />
                    </FormControl>
                  </Box>
                ))}
              </VStack>
            </TabPanel>
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {analysis.implicit_skills.map((skill, index) => (
                  <Box key={index} p={4} borderWidth="1px" borderRadius="lg" bg="white">
                    <Heading as="h3" size="md" mb={2}>{skill.skill}</Heading>
                    <Text mb={2}>{skill.description}</Text>
                    <Text mb={2}>Evidence needed: {skill.evidence_needed}</Text>
                    <Text fontWeight="bold">Suggestion: {skill.suggestion}</Text>
                    
                    <Divider my={4} />
                    
                    <FormControl>
                      <FormLabel>Demonstrate this skill</FormLabel>
                      <Textarea
                        placeholder={`Describe how you've demonstrated ${skill.skill}...`}
                        onChange={(e) => handleSkillChange(skill.skill, e.target.value)}
                        value={userSkills[skill.skill] || ''}
                      />
                    </FormControl>
                  </Box>
                ))}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Divider />

        <VStack spacing={4}>
          <Button
            colorScheme="green"
            size="lg"
            onClick={handleSubmitSkills}
            isLoading={submittingSkills}
            loadingText="Updating Resume..."
            width="full"
            isDisabled={Object.keys(userSkills).length === 0}
          >
            Update Resume with Added Skills
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

export default SkillsGapAnalysis;
