import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  useColorMode,
  Switch,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';

const Settings = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isDarkMode, setIsDarkMode] = useState(colorMode === 'dark');
  const toast = useToast();

  const handleColorModeChange = () => {
    setIsDarkMode(!isDarkMode);
    toggleColorMode();
    toast({
      title: `Switched to ${!isDarkMode ? 'dark' : 'light'} mode`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={10}>
      <Stack spacing={8}>
        <Box>
          <Heading size="xl">Settings</Heading>
          <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} mt={2}>
            Manage your account preferences
          </Text>
        </Box>

        <Box p={6} bg={colorMode === 'light' ? 'white' : 'gray.800'} rounded="lg" shadow="md">
          <Stack spacing={6}>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Dark Mode</FormLabel>
              <Switch isChecked={isDarkMode} onChange={handleColorModeChange} colorScheme="blue" />
            </FormControl>

            <Button
              colorScheme="blue"
              size="lg"
              onClick={() => {
                toast({
                  title: 'Settings saved',
                  status: 'success',
                  duration: 2000,
                  isClosable: true,
                });
              }}
            >
              Save Changes
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default Settings;
