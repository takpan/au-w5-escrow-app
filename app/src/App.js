import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Box, Button, Container, Flex, FormControl, FormLabel, Grid, Input, Select, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import deploy from './deploy';
import Escrow from './Escrow';

const provider = new ethers.BrowserProvider(window.ethereum);

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();
  const [unit, setUnit] = useState('wei');

  // Initialiaze account
  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      setSigner(await provider.getSigner());
    }

    getAccounts();
  }, []);

  // Update the account and current signer whenever the Metamask account changes
  window.ethereum.on('accountsChanged', async (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setSigner(await provider.getSigner());
    }
  });

  // Connect wallet method
  async function connectWallet() {
    try {
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
      setSigner(await provider.getSigner());
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  }

  // Create new escrow contract
  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const amount = document.getElementById('amount').value; // Convert amount to wei based on the selected unit
    const value = ethers.parseUnits(amount, unit);
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);
    const contrctAddress = await escrowContract.getAddress();

    const escrow = {
      contract: escrowContract,
      address: contrctAddress,
      arbiter,
      beneficiary,
      value: value.toString(),
    };

    setEscrows([...escrows, escrow]); // Update the escrows state adding the new escrow
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
              Escrow Dapp
            </Text>
            <Button
              colorScheme="teal"
              onClick={connectWallet}
              position="absolute"
              top="6"
              right="6"
            >
              {account ? `Connected account: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
            </Button>
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
              <Stack spacing={2}>
                <Input id="amount" placeholder="Amount" size="lg" />
                <Select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Select unit"
                >
                  <option value="wei">Wei</option>
                  <option value="gwei">Gwei</option>
                  <option value="ether">Ether</option>
                </Select>
              </Stack>
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
                <Text>No pending escrows</Text>
              )}
          </Box>
        </Box>
      </Grid>
    </Flex>
  );
}

export default App;
