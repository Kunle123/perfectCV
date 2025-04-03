import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  useColorMode,
  useToast,
  Radio,
  RadioGroup,
  VStack,
  HStack,
  Divider,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createCheckoutSession } from "../../services/payment";

const CREDIT_PACKAGES = [
  {
    credits: 10,
    price: 9.99,
    description: "Perfect for trying out the service",
  },
  { credits: 50, price: 39.99, description: "Best value for regular users" },
  { credits: 100, price: 69.99, description: "Best value for power users" },
];

const Payment = () => {
  const [selectedPackage, setSelectedPackage] = useState("50");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const session = await createCheckoutSession(parseInt(selectedPackage));
      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate payment",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <Stack spacing={8}>
        <Box
          p={6}
          bg={colorMode === "light" ? "white" : "gray.800"}
          rounded="lg"
          shadow="md"
        >
          <Stack spacing={6}>
            <Stack spacing={2}>
              <Heading size="lg">Purchase Credits</Heading>
              <Text color="gray.500">
                Choose a credit package that best suits your needs
              </Text>
            </Stack>

            <Divider />

            <RadioGroup onChange={setSelectedPackage} value={selectedPackage}>
              <VStack spacing={4} align="stretch">
                {CREDIT_PACKAGES.map((pkg) => (
                  <Box
                    key={pkg.credits}
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    cursor="pointer"
                    onClick={() => setSelectedPackage(pkg.credits.toString())}
                    bg={
                      selectedPackage === pkg.credits.toString()
                        ? colorMode === "light"
                          ? "blue.50"
                          : "blue.900"
                        : "transparent"
                    }
                  >
                    <Radio value={pkg.credits.toString()} size="lg">
                      <Stack spacing={1} ml={2}>
                        <HStack justify="space-between">
                          <Text fontWeight="bold">{pkg.credits} Credits</Text>
                          <Text fontWeight="bold">${pkg.price}</Text>
                        </HStack>
                        <Text color="gray.500" fontSize="sm">
                          {pkg.description}
                        </Text>
                      </Stack>
                    </Radio>
                  </Box>
                ))}
              </VStack>
            </RadioGroup>

            <Divider />

            <Stack spacing={4}>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={handlePayment}
                isLoading={isLoading}
              >
                Proceed to Payment
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default Payment;
