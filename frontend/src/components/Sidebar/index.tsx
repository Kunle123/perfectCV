import {
  Box,
  VStack,
  Icon,
  Text,
  useColorMode,
  Flex,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiHome,
  FiUpload,
  FiEdit,
  FiUser,
  FiLogOut,
} from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavItemProps {
  icon: any;
  label: string;
  to: string;
  isActive: boolean;
}

const NavItem = ({ icon, label, to, isActive }: NavItemProps) => {
  const { colorMode } = useColorMode();
  
  return (
    <Tooltip label={label} placement="right">
      <Link to={to}>
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bg={isActive ? (colorMode === 'dark' ? 'gray.700' : 'blue.50') : 'transparent'}
          color={isActive ? (colorMode === 'dark' ? 'white' : 'blue.500') : 'inherit'}
          _hover={{
            bg: colorMode === 'dark' ? 'gray.700' : 'blue.50',
            color: colorMode === 'dark' ? 'white' : 'blue.500',
          }}
        >
          <Icon
            mr="4"
            fontSize="16"
            as={icon}
          />
          <Text>{label}</Text>
        </Flex>
      </Link>
    </Tooltip>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { colorMode } = useColorMode();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <Box
      bg={colorMode === 'dark' ? 'gray.800' : 'white'}
      w="60"
      pos="fixed"
      h="full"
      borderRight="1px"
      borderRightColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
    >
      <VStack h="full" spacing={0} align="stretch">
        <Box p={4}>
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color={colorMode === 'dark' ? 'white' : 'blue.500'}
          >
            PerfectCV
          </Text>
        </Box>
        
        <VStack flex={1} spacing={1} align="stretch">
          <NavItem
            icon={FiHome}
            label="Dashboard"
            to="/"
            isActive={location.pathname === '/'}
          />
          <NavItem
            icon={FiUpload}
            label="Upload Resume"
            to="/upload"
            isActive={location.pathname === '/upload'}
          />
          <NavItem
            icon={FiEdit}
            label="Optimize Resume"
            to="/optimize"
            isActive={location.pathname === '/optimize'}
          />
          <NavItem
            icon={FiUser}
            label="Profile"
            to="/profile"
            isActive={location.pathname === '/profile'}
          />
        </VStack>
        
        <Box p={4}>
          <Flex
            align="center"
            p="4"
            mx="4"
            borderRadius="lg"
            role="group"
            cursor="pointer"
            onClick={handleLogout}
            _hover={{
              bg: colorMode === 'dark' ? 'gray.700' : 'red.50',
              color: colorMode === 'dark' ? 'white' : 'red.500',
            }}
          >
            <Icon
              mr="4"
              fontSize="16"
              as={FiLogOut}
            />
            <Text>Logout</Text>
          </Flex>
        </Box>
      </VStack>
    </Box>
  );
};

export default Sidebar; 