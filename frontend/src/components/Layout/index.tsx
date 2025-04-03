import {
  Box,
  Container,
  Flex,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Flex direction="column" minH="100vh">
      <Box
        as="header"
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        py={4}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Link as={RouterLink} to="/" fontSize="xl" fontWeight="bold">
              PerfectCV
            </Link>
            <Flex gap={4}>
              <Link as={RouterLink} to="/login">
                Login
              </Link>
              <Link as={RouterLink} to="/register">
                Register
              </Link>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Box as="main" flex="1" py={8}>
        <Container maxW="container.xl">{children}</Container>
      </Box>

      <Box
        as="footer"
        bg={bgColor}
        borderTop="1px"
        borderColor={borderColor}
        py={4}
      >
        <Container maxW="container.xl">
          <Text textAlign="center" fontSize="sm" color="gray.500">
            © {new Date().getFullYear()} PerfectCV. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Flex>
  );
};

export default Layout;
