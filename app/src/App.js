import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';

const provider = new ethers.BrowserProvider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

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
    const contractAddress = await escrowContract.getAddress();

    const escrow = {
      address: contractAddress,
      arbiter,
      beneficiary,
      value: value.toString(),
      handleApprove: async (signer) => {
        escrowContract.on('Approved', () => {
          document.getElementById(contractAddress).className =
            'complete';
          document.getElementById(contractAddress).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };

    setEscrows([...escrows, escrow]);
  }

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in Wei)
          <input type="text" id="wei" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div id="container">
          {escrows.map((escrow) => {
            return <Escrow
            key={`${escrow.address}`}
            {...escrow}
            signer={signer} />;
          })}
        </div>
      </div>
    </>
  );
}

export default App;
