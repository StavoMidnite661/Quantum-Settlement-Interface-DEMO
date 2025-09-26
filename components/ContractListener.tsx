import React, { useState, useEffect, useCallback } from 'react';
import { Interface, type EventLog, isAddress } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { POS_CREDIT_TOKEN_ABI } from '../abi';
import { parsePaymentEvent } from '../utils/helpers';
import { Payment } from '../types';
import { WifiIcon } from './Icons';

interface ContractListenerProps {
  onNewPayment: (payment: Payment) => void;
}

export const ContractListener: React.FC<ContractListenerProps> = ({ onNewPayment }) => {
  const { provider, isConnected } = useWallet();
  const [inputValue, setInputValue] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [monitoredContracts, setMonitoredContracts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleEvent = useCallback(async (log: EventLog) => {
    console.log('Event received:', log);
    if (provider) {
        try {
            const newPayment = await parsePaymentEvent(log, provider);
            onNewPayment(newPayment);
        } catch (err) {
            console.error("Error parsing payment event:", err);
        }
    }
  }, [provider, onNewPayment]);
  
  // Cleanup listeners when component unmounts or when listening stops
  useEffect(() => {
    return () => {
      if (provider) {
        provider.removeAllListeners('block'); // Clean up any block listeners if ethers adds them implicitly
        provider.off('*'); // A more aggressive cleanup for safety
      }
    };
  }, [provider]);

  const handleStartListening = () => {
    if (!provider || !isConnected) {
      setError("Please connect your wallet first.");
      return;
    }
    const addresses = inputValue.split(',').map(addr => addr.trim()).filter(Boolean);
    if (addresses.length === 0) {
        setError("Please enter at least one contract address.");
        return;
    }

    const invalidAddresses = addresses.filter(addr => !isAddress(addr));
    if (invalidAddresses.length > 0) {
        setError(`Invalid address(es) found: ${invalidAddresses.join(', ')}`);
        return;
    }

    setError(null);
    
    try {
        const contractInterface = new Interface(POS_CREDIT_TOKEN_ABI);
        const eventTopic = contractInterface.getEvent('BurnForPurchase').topicHash;
        
        const filter = {
            address: addresses,
            topics: [eventTopic]
        };

        provider.on(filter, handleEvent);
        
        setMonitoredContracts(addresses);
        setIsListening(true);
    } catch(e) {
        console.error("Failed to start listener:", e);
        setError("An unexpected error occurred while starting the listener.");
    }
  };

  const handleStopListening = () => {
    if (provider) {
      provider.removeAllListeners();
    }
    setIsListening(false);
    setMonitoredContracts([]);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3">
        <WifiIcon className={`w-6 h-6 ${isListening ? 'text-green-400 animate-pulse' : 'text-slate-500'}`} />
        <h2 className="text-xl font-semibold text-slate-300">Live Contract Listener</h2>
      </div>
      
      {!isConnected ? (
        <p className="text-sm text-slate-500">Connect your wallet to monitor on-chain events in real-time.</p>
      ) : (
        <>
            <p className="text-sm text-slate-400">
                Enter comma-separated contract addresses to monitor for <code className="bg-slate-800 text-cyan-400 px-1 py-0.5 rounded text-xs">BurnForPurchase</code> events.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="0x..., 0x..."
                    disabled={isListening}
                    className="flex-grow bg-slate-800 border border-slate-700 rounded-md py-2 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
                />
                {!isListening ? (
                <button 
                    onClick={handleStartListening}
                    className="px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                >
                    Start Listening
                </button>
                ) : (
                <button
                    onClick={handleStopListening}
                    className="px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 bg-red-500 text-slate-50 hover:bg-red-400"
                >
                    Stop Listening
                </button>
                )}
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            {isListening && monitoredContracts.length > 0 && (
                <div className="text-xs text-slate-500">
                    <span className="font-semibold text-green-400">Monitoring {monitoredContracts.length} contract(s): </span>
                    <span className="font-mono">{monitoredContracts.join(', ')}</span>
                </div>
            )}
        </>
      )}
    </div>
  );
};
