import { ethers } from 'ethers';
import { useState } from 'react';
import { Box, Button, Select, Stack, Text, useToast } from '@chakra-ui/react';

export default function Escrow({
    contract,
    address,
    arbiter,
    beneficiary,
    value,
    signer
  }) {

  const [isApproved, setIsApproved] = useState(false);
  const [unit, setUnit] = useState('wei'); // State to store the selected unit
  const toast = useToast();

  // Approve escrow method
  async function approve(escrowContract, signer) {
    const approveTxn = await escrowContract.connect(signer).approve();
    await approveTxn.wait();
  }

  // Convert value to the selected unit
  const convertValue = (value, unit) => {
    switch (unit) {
      case 'gwei':
        return ethers.formatUnits(value, 'gwei');
      case 'ether':
        return ethers.formatUnits(value, 'ether');
      default:
        return value.toString(); // Default is wei
    }
  };

  // Approve button handler
  const handleButtonClick = async (e) => {
    e.preventDefault();
    try {
      await approve(contract, signer);
      setIsApproved(true);
      toast({
        title: "Approval Successful",
        description: "The escrow has been approved successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "There was an error approving the escrow.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box 
      border="1px" 
      borderColor="gray.200" 
      p={4} 
      borderRadius="md" 
      shadow="md"
      mx="auto"
    >
      <Text 
        fontSize="lg"
        fontWeight="bold"
        mb={2}
        bg="gray.100"
        borderRadius="md"
      >
          Contract Address: {address}
      </Text>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Text fontWeight="bold">Arbiter</Text>
          <Text>{arbiter}</Text>
        </Stack>
        <Stack spacing={1}>
          <Text fontWeight="bold">Beneficiary</Text>
          <Text>{beneficiary}</Text>
        </Stack>
        <Stack spacing={1}>
          <Text fontWeight="bold">Value</Text>
            <Select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              size="sm"
              mb={2}
            >
              <option value="wei">Wei</option>
              <option value="gwei">Gwei</option>
              <option value="ether">Ether</option>
            </Select>
          <Text>{convertValue(value, unit)}</Text>
        </Stack>
        <Button
          colorScheme={isApproved ? "green" : "teal"}
          onClick={handleButtonClick}
          width="full"
          isDisabled={isApproved}
        >
          {isApproved ? "Approved ✓" : "Approve"}
        </Button>
      </Stack>
    </Box>
  );
}
