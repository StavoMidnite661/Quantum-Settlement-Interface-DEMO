import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

export const NetworkStatus: React.FC = () => {
    const { provider, isConnected } = useWallet();
    const [blockNumber, setBlockNumber] = useState<number | null>(null);

    useEffect(() => {
        if (!provider) {
            setBlockNumber(null);
            return;
        }

        const getInitialBlock = async () => {
            try {
                const currentBlock = await provider.getBlockNumber();
                setBlockNumber(currentBlock);
            } catch (error) {
                console.error("Could not fetch initial block number:", error);
            }
        };

        const handleNewBlock = (newBlockNumber: number) => {
            setBlockNumber(newBlockNumber);
        };
        
        getInitialBlock();

        provider.on('block', handleNewBlock);

        return () => {
            provider.removeListener('block', handleNewBlock);
        };
    }, [provider]);

    if (!isConnected) {
        return (
            <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-full pl-4 pr-4 py-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                <span className="text-sm text-slate-400 font-mono hidden sm:inline">Offline</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-full pl-4 pr-4 py-1.5">
            <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></div>
            <span className="text-sm text-slate-400 font-mono hidden sm:inline">
                Live Block: <span className="text-cyan-400 font-semibold">{blockNumber ?? '...'}</span>
            </span>
        </div>
    );
};
