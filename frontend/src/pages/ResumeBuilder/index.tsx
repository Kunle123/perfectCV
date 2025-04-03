import {
  Box,
  Container,
  Heading,
  Stack,
  Text,
  useColorMode,
  Button,
  VStack,
  Icon,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  SimpleGrid,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FiPlus, FiTrash2, FiSave, FiEye, FiBriefcase, FiBook, FiCheck } from 'react-icons/fi';

interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
}

interface Skill {
  category: string;
  items: string[];
}

const ResumeBuilder = () => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Form state
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([
    { category: 'Technical Skills', items: [] },
    { category: 'Soft Skills', items: [] },
  ]);

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const addExperience = () => {
    setExperiences([...experiences, { company: '', position: '', duration: '', description: '' }]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExperiences = [...experiences];
    newExperiences[index] = { ...newExperiences[index], [field]: value };
    setExperiences(newExperiences);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([...education, { institution: '', degree: '', field: '', graduationDate: '' }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newEducation = [...education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setEducation(newEducation);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addSkill = (category: string) => {
    setSkills(
      skills.map((skill) =>
        skill.category === category ? { ...skill, items: [...skill.items, ''] } : skill
      )
    );
  };

  const updateSkill = (category: string, index: number, value: string) => {
    setSkills(
      skills.map((skill) =>
        skill.category === category
          ? {
              ...skill,
              items: skill.items.map((item, i) => (i === index ? value : item)),
            }
          : skill
      )
    );
  };

  const removeSkill = (category: string, index: number) => {
    setSkills(
      skills.map((skill) =>
        skill.category === category
          ? {
              ...skill,
              items: skill.items.filter((_, i) => i !== index),
            }
          : skill
      )
    );
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    toast({
      title: 'Resume saved',
      description: 'Your resume has been saved successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const PreviewModal = () => (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{personalInfo.fullName || 'Your Name'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={8}>
          <Stack spacing={6}>
            {/* Contact Info */}
            <Stack spacing={1}>
              <Text fontSize="sm" color="gray.500">
                {personalInfo.email} • {personalInfo.phone} • {personalInfo.location}
              </Text>
            </Stack>

            {/* Summary */}
            {personalInfo.summary && (
              <Box>
                <Heading size="sm" mb={2}>
                  Professional Summary
                </Heading>
                <Text>{personalInfo.summary}</Text>
              </Box>
            )}

            {/* Experience */}
            {experiences.length > 0 && (
              <Box>
                <Heading size="sm" mb={4}>
                  Work Experience
                </Heading>
                <Stack spacing={4}>
                  {experiences.map((exp, index) => (
                    <Box key={index}>
                      <Text fontWeight="bold">{exp.position}</Text>
                      <Text color="gray.600">
                        {exp.company} • {exp.duration}
                      </Text>
                      <Text mt={2}>{exp.description}</Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Education */}
            {education.length > 0 && (
              <Box>
                <Heading size="sm" mb={4}>
                  Education
                </Heading>
                <Stack spacing={4}>
                  {education.map((edu, index) => (
                    <Box key={index}>
                      <Text fontWeight="bold">
                        {edu.degree} in {edu.field}
                      </Text>
                      <Text color="gray.600">
                        {edu.institution} • {edu.graduationDate}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Skills */}
            {skills.some((skill) => skill.items.length > 0) && (
              <Box>
                <Heading size="sm" mb={4}>
                  Skills
                </Heading>
                <Stack spacing={4}>
                  {skills.map(
                    (skillCategory) =>
                      skillCategory.items.length > 0 && (
                        <Box key={skillCategory.category}>
                          <Text fontWeight="bold" mb={2}>
                            {skillCategory.category}
                          </Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                            {skillCategory.items.map((item, index) => (
                              <HStack key={index}>
                                <ListIcon as={FiCheck} color="green.500" />
                                <Text>{item}</Text>
                              </HStack>
                            ))}
                          </SimpleGrid>
                        </Box>
                      )
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  return (
    <Container maxW="container.xl" py={10}>
      <Stack spacing={8}>
        <Box>
          <Heading size="xl">Resume Builder</Heading>
          <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} mt={2}>
            Create your professional resume
          </Text>
        </Box>

        <Accordion allowMultiple defaultIndex={[0]}>
          {/* Personal Information */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Personal Information
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={personalInfo.fullName}
                    onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                    placeholder="John Doe"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                    placeholder="john.doe@example.com"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    value={personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input
                    value={personalInfo.location}
                    onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                    placeholder="City, Country"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Professional Summary</FormLabel>
                  <Textarea
                    value={personalInfo.summary}
                    onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                    placeholder="Write a brief summary of your professional background..."
                    rows={4}
                  />
                </FormControl>
              </Stack>
            </AccordionPanel>
          </AccordionItem>

          {/* Experience */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Work Experience
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Stack spacing={6}>
                {experiences.map((exp, index) => (
                  <Box
                    key={index}
                    p={4}
                    bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
                    rounded="md"
                  >
                    <HStack justify="space-between" mb={4}>
                      <Heading size="sm">Experience {index + 1}</Heading>
                      <IconButton
                        aria-label="Remove experience"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeExperience(index)}
                      />
                    </HStack>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel>Company</FormLabel>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          placeholder="Company name"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Position</FormLabel>
                        <Input
                          value={exp.position}
                          onChange={(e) => updateExperience(index, 'position', e.target.value)}
                          placeholder="Job title"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Duration</FormLabel>
                        <Input
                          value={exp.duration}
                          onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                          placeholder="e.g., Jan 2020 - Present"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          placeholder="Describe your responsibilities and achievements..."
                          rows={4}
                        />
                      </FormControl>
                    </Stack>
                  </Box>
                ))}
                <Button leftIcon={<Icon as={FiPlus} />} onClick={addExperience} colorScheme="blue">
                  Add Experience
                </Button>
              </Stack>
            </AccordionPanel>
          </AccordionItem>

          {/* Education */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Education
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Stack spacing={6}>
                {education.map((edu, index) => (
                  <Box
                    key={index}
                    p={4}
                    bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
                    rounded="md"
                  >
                    <HStack justify="space-between" mb={4}>
                      <Heading size="sm">Education {index + 1}</Heading>
                      <IconButton
                        aria-label="Remove education"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeEducation(index)}
                      />
                    </HStack>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel>Institution</FormLabel>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          placeholder="University name"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Degree</FormLabel>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          placeholder="e.g., Bachelor's"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Field of Study</FormLabel>
                        <Input
                          value={edu.field}
                          onChange={(e) => updateEducation(index, 'field', e.target.value)}
                          placeholder="e.g., Computer Science"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Graduation Date</FormLabel>
                        <Input
                          value={edu.graduationDate}
                          onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                          placeholder="e.g., May 2020"
                        />
                      </FormControl>
                    </Stack>
                  </Box>
                ))}
                <Button leftIcon={<Icon as={FiPlus} />} onClick={addEducation} colorScheme="blue">
                  Add Education
                </Button>
              </Stack>
            </AccordionPanel>
          </AccordionItem>

          {/* Skills */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Skills
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Stack spacing={6}>
                {skills.map((skillCategory) => (
                  <Box key={skillCategory.category}>
                    <HStack justify="space-between" mb={4}>
                      <Heading size="sm">{skillCategory.category}</Heading>
                      <Button
                        leftIcon={<Icon as={FiPlus} />}
                        size="sm"
                        onClick={() => addSkill(skillCategory.category)}
                      >
                        Add Skill
                      </Button>
                    </HStack>
                    <Stack spacing={2}>
                      {skillCategory.items.map((item, index) => (
                        <HStack key={index}>
                          <Input
                            value={item}
                            onChange={(e) =>
                              updateSkill(skillCategory.category, index, e.target.value)
                            }
                            placeholder={`Add ${skillCategory.category.toLowerCase()}`}
                          />
                          <IconButton
                            aria-label="Remove skill"
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeSkill(skillCategory.category, index)}
                          />
                        </HStack>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        {/* Action Buttons */}
        <Box>
          <HStack spacing={4}>
            <Button leftIcon={<Icon as={FiEye} />} colorScheme="green" size="lg" onClick={onOpen}>
              Preview Resume
            </Button>
            <Button
              leftIcon={<Icon as={FiSave} />}
              colorScheme="blue"
              size="lg"
              onClick={handleSave}
            >
              Save Resume
            </Button>
          </HStack>
        </Box>
      </Stack>

      <PreviewModal />
    </Container>
  );
};

export default ResumeBuilder;
