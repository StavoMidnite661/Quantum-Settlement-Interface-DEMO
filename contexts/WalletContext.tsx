import React, { useState, useContext, createContext, useEffect, useCallback } from 'react';
import { BrowserProvider, type Signer } from 'ethers';

interface WalletContextType {
    provider: BrowserProvider | null;
    signer: Signer | null;
    account: string | null;
    isConnected: boolean;
    connectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
    provider: null,
    signer: null,
    account: null,
    isConnected: false,
    connectWallet: async () => {},
});

export const useWallet = () => useContext(WalletContext);

/**
 * Finds a compatible Ethereum provider from the window object.
 * Handles modern wallets that inject an array of providers.
 * @returns The detected Ethereum provider or null if none is found.
 */
const getEthereumProvider = () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }
  
  // Modern EIP-6963 wallets inject an array of providers
  if (window.ethereum.providers?.length) {
    // Prioritize MetaMask if available
    const metamaskProvider = window.ethereum.providers.find((p: any) => p.isMetaMask);
    if (metamaskProvider) return metamaskProvider;
    // Fallback to the first provider in the array
    return window.ethereum.providers[0];
  }
  
  // Fallback for older wallets that only inject a single window.ethereum object
  return window.ethereum;
};


export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<Signer | null>(null);
    const [account, setAccount] = useState<string | null>(null);

    const isConnected = !!provider && !!signer && !!account;
    
    const clearState = () => {
        setProvider(null);
        setSigner(null);
        setAccount(null);
    };

    const connectWallet = useCallback(async () => {
        const injectedProvider = getEthereumProvider();

        if (injectedProvider) {
            try {
                // Ethers v6 requires the provider instance, not the raw window object
                const web3Provider = new BrowserProvider(injectedProvider);
                // This will prompt the user to connect if they haven't already
                const web3Signer = await web3Provider.getSigner();
                const userAccount = await web3Signer.getAddress();
                
                setProvider(web3Provider);
                setSigner(web3Signer);
                setAccount(userAccount);
            } catch (error) {
                console.error("Error connecting to wallet:", error);
                clearState();
            }
        } else {
            alert('No compatible Web3 wallet detected. Please install a wallet like MetaMask. Note: Some environments (like sandboxed iframes) may block wallet access.');
        }
    }, []);

    useEffect(() => {
        const injectedProvider = getEthereumProvider();
        if (!injectedProvider) return;

        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                clearState();
            } else {
                // Re-connect to update the signer and account
                connectWallet();
            }
        };

        const handleChainChanged = () => {
            // Reloading is the simplest and most robust way to handle network changes.
            window.location.reload();
        };

        injectedProvider.on('accountsChanged', handleAccountsChanged);
        injectedProvider.on('chainChanged', handleChainChanged);

        return () => {
            injectedProvider.removeListener('accountsChanged', handleAccountsChanged);
            injectedProvider.removeListener('chainChanged', handleChainChanged);
        };
    }, [connectWallet]);

    const value = {
        provider,
        signer,
        account,
        isConnected,
        connectWallet,
    };

    return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

// Define ethereum on the window object for TypeScript
declare global {
  interface Window {
    // Accommodate for EIP-6963 which injects an array of providers
    ethereum?: any & { providers?: any[] };
  }
}