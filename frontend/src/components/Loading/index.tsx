import { Box, Center, Spinner, Text } from '@chakra-ui/react';

const Loading = () => {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Center flexDirection="column" gap={4}>
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
        <Text>Loading...</Text>
      </Center>
    </Box>
  );
};

export default Loading;
