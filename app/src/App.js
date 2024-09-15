import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Box, Flex, Text, Grid, Container, Stack, FormControl, FormLabel, Input, Button, useColorModeValue } from '@chakra-ui/react';
import deploy from './deploy';
import Escrow from './Escrow';

const provider = new ethers.BrowserProvider(window.ethereum);

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      setSigner(await provider.getSigner());
    }

    getAccounts();
  }, [account]);

  window.ethereum.on('accountsChanged', async (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    }
  });

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const value = ethers.toBigInt(document.getElementById('wei').value);
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);
    const contrctAddress = await escrowContract.getAddress();

    const escrow = {
      contract: escrowContract,
      address: contrctAddress,
      arbiter,
      beneficiary,
      value: value.toString(),
    };

    setEscrows([...escrows, escrow]);
  }

  return (
    <Flex
      minH="100vh"
      direction="column"
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      {/* Header */}
      <Box
        as="header"
        bg="teal.500"
        p={6}
        color="white"
        width="100%"
        >
          <Container maxW="container.xlg">
          <Flex align="center" justify="flex-start" h="100%">
            <Text fontSize="3xl" fontWeight="bold">
              Escrow App
            </Text>
            </Flex>
          </Container>
      </Box>

      {/* Main Content */}
      <Grid
        templateColumns={{ base: '1fr', lg: '1fr 2fr' }}
        gap={6}
        p={6}
        flex="1"
      >
        {/* Form Section */}
        <Box bg="white" p={6} borderRadius="md" shadow="md">
          <Text 
            fontSize="2xl"
            fontWeight="bold"
            mb={2}
          >
            Create Escrow Contract
          </Text>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Arbiter Address</FormLabel>
              <Input id="arbiter" placeholder="0x..." size="lg" />
            </FormControl>
            <FormControl>
              <FormLabel>Beneficiary Address</FormLabel>
              <Input id="beneficiary" placeholder="0x..." size="lg" />
            </FormControl>
            <FormControl>
              <FormLabel>Deposit Amount</FormLabel>
              <Input id="wei" placeholder="wei" size="lg" />
            </FormControl>
            <Button
              colorScheme="teal"
              size="lg"
              mt={6}
              onClick={(e) => {
                e.preventDefault();
                newContract();
              }}
            >
              Deploy
            </Button>
          </Stack>
        </Box>

        {/* Pending Escrows Section */}
        <Box
          bg="white"
          p={6}
          borderRadius="md"
          shadow="md"
          display={{ base: 'none', lg: 'block' }} // Hide on small screens
        >
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Escrows
          </Text>
          {/* Placeholder for pending escrows content */}
          <Box border="1px" borderColor="gray.200" p={4} borderRadius="md">
            {escrows.length > 0 ? (
                escrows.map((escrow) => (
                  <Escrow
                    key={escrow.address}
                    {...escrow}
                    signer={signer}
                  />
                ))
              ) : (
                <Text>No pending escrows at the moment.</Text>
              )}
          </Box>
        </Box>
      </Grid>
    </Flex>
  );
}

export default App;
