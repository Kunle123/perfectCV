import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link,
  Stack,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar = ({ isAuthenticated, onLogout }: NavbarProps) => {
  const { colorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Container maxW="container.xl" py={4}>
        <Flex justify="space-between" align="center">
          <Link as={RouterLink} to="/">
            <Heading size="md">PerfectCV</Heading>
          </Link>

          <Stack direction="row" spacing={4}>
            {isAuthenticated ? (
              <>
                <Link as={RouterLink} to="/dashboard">
                  Dashboard
                </Link>
                <Link as={RouterLink} to="/resume-builder">
                  Resume Builder
                </Link>
                <Link as={RouterLink} to="/job-parser">
                  Job Parser
                </Link>
                <Link as={RouterLink} to="/settings">
                  Settings
                </Link>
                <Button variant="ghost" onClick={onLogout} colorScheme="red">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link as={RouterLink} to="/login">
                  Login
                </Link>
                <Button as={RouterLink} to="/register" colorScheme="blue">
                  Sign Up
                </Button>
              </>
            )}
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
