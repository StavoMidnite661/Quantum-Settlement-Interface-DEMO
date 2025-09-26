import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Contract, Interface, isAddress, JsonRpcProvider, type EventLog } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { MonitoredContract, NormalizedEvent } from '../types';
import { PlusCircleIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon, ClockIcon } from './Icons';

const JsonViewer: React.FC<{ data: Record<string, any> }> = ({ data }) => {
    const jsonString = JSON.stringify(
      data,
      (key, value) => (typeof value === 'bigint' ? value.toString() : value),
      2
    );
  
    // Basic syntax highlighting with regex
    const highlightedJson = jsonString
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') // HTML escape
      .replace(/"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?/g, (match) => { // Match strings and keys
        let cls = 'text-green-400'; // String color
        if (/:$/.test(match)) {
          cls = 'text-amber-400'; // Key color
        }
        return `<span class="${cls}">${match}</span>`;
      })
      .replace(/\b(true|false)\b/g, '<span class="text-purple-400">$1</span>') // Boolean
      .replace(/\b(null)\b/g, '<span class="text-slate-500">$1</span>') // Null
      .replace(/\b-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b(?!<\/span>)/g, '<span class="text-sky-400">$&</span>'); // Number (ensuring it's not inside a span already)
  
    return (
      <pre
        className="mt-2 text-xs bg-slate-950 p-3 rounded-md text-slate-400 font-mono overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: highlightedJson }}
      />
    );
};

const EventCard: React.FC<{ event: NormalizedEvent }> = ({ event }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const etherscanLink = `https://etherscan.io/tx/${event.transactionHash}`;

    return (
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-slate-400">{event.contractName}</p>
                    <p className="text-lg font-semibold text-cyan-400">{event.eventName}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ClockIcon className="w-3 h-3" />
                    <span>{new Date(event.timestamp).toLocaleString()}</span>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-300">Tx Hash:</span>
                    <a href={etherscanLink} target="_blank" rel="noopener noreferrer" className="font-mono text-cyan-400 hover:underline truncate flex items-center gap-1.5">
                        <span>{`${event.transactionHash.substring(0, 10)}...${event.transactionHash.substring(event.transactionHash.length - 8)}`}</span>
                        <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                </div>
                <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs font-semibold">
                    {isExpanded ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
                    {isExpanded ? 'Hide Data' : 'Show Data'}
                </button>
                {isExpanded && <JsonViewer data={event.args} />}
            </div>
        </div>
    );
};

export const MonitoredContracts: React.FC = () => {
    const { provider, isConnected } = useWallet();
    const [contracts, setContracts] = useState<MonitoredContract[]>([]);
    const [events, setEvents] = useState<NormalizedEvent[]>([]);
    const [form, setForm] = useState({ name: '', network: '', address: '', abi: '' });
    const [error, setError] = useState<string | null>(null);

    const listeners = useRef<Map<string, Contract>>(new Map());

    // Load contracts from localStorage on mount
    useEffect(() => {
        try {
            const savedContracts = localStorage.getItem('monitoredContracts');
            if (savedContracts) {
                setContracts(JSON.parse(savedContracts));
            }
        } catch (e) {
            console.error("Failed to parse contracts from localStorage", e);
        }
    }, []);

    // Save contracts to localStorage on change
    useEffect(() => {
        localStorage.setItem('monitoredContracts', JSON.stringify(contracts));
    }, [contracts]);
    
    const normalizeEventArgs = (args: any) => {
        const normalized: Record<string, any> = {};
        for (const key in args) {
            if (isNaN(parseInt(key))) { // Filter out numeric array indices from ethers
                normalized[key] = args[key];
            }
        }
        return normalized;
    }

    // Effect to manage blockchain listeners
    useEffect(() => {
        // Clear all existing listeners
        listeners.current.forEach(contract => contract.removeAllListeners());
        listeners.current.clear();

        if (!isConnected) return;

        contracts.forEach(c => {
            try {
                const contractProvider = new JsonRpcProvider(c.network);
                const contractInstance = new Contract(c.address, JSON.parse(c.abi), contractProvider);
                
                const handler = async (log: any) => {
                    const eventLog = log as EventLog;
                    console.log(`Event received from ${c.name}:`, eventLog);
                    const block = await contractProvider.getBlock(eventLog.blockNumber);

                    const newEvent: NormalizedEvent = {
                        id: crypto.randomUUID(),
                        contractId: c.id,
                        contractName: c.name,
                        contractAddress: c.address,
                        network: c.network,
                        eventName: eventLog.eventName || 'Unknown Event',
                        args: normalizeEventArgs(eventLog.args),
                        transactionHash: eventLog.transactionHash,
                        blockNumber: eventLog.blockNumber,
                        timestamp: block.timestamp * 1000,
                    };
                    setEvents(prev => [newEvent, ...prev.slice(0, 99)]); // Keep last 100 events
                };

                contractInstance.on('*', handler);
                listeners.current.set(c.id, contractInstance);
            } catch (e) {
                console.error(`Failed to set up listener for ${c.name}:`, e);
            }
        });
        
        // Cleanup function
        return () => {
            listeners.current.forEach(contract => contract.removeAllListeners());
            listeners.current.clear();
        };

    }, [contracts, isConnected]);

    const handleAddContract = () => {
        setError(null);
        if (!form.name || !form.network || !form.address || !form.abi) {
            setError("All fields are required.");
            return;
        }
        if (!isAddress(form.address)) {
            setError("Invalid contract address provided.");
            return;
        }
        try {
            // Validate ABI
            new Interface(JSON.parse(form.abi));
        } catch (e) {
            setError("Invalid ABI format. Please provide a valid JSON ABI.");
            return;
        }

        const newContract: MonitoredContract = {
            id: crypto.randomUUID(),
            ...form
        };
        setContracts(prev => [...prev, newContract]);
        setForm({ name: '', network: '', address: '', abi: '' }); // Clear form
    };
    
    const handleRemoveContract = (id: string) => {
        setContracts(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Add & Manage */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Add Contract Form */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                        <h2 className="text-xl font-semibold text-slate-300 mb-3">Add Contract</h2>
                        {!isConnected ? <p className="text-sm text-amber-400">Please connect your wallet to enable monitoring.</p> :
                        <div className="space-y-3 text-sm">
                            <input type="text" placeholder="Friendly Name (e.g., Treasury V1)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-800 border-slate-700 rounded-md p-2" />
                            <input type="text" placeholder="Network RPC URL (e.g., from Alchemy)" value={form.network} onChange={e => setForm({...form, network: e.target.value})} className="w-full bg-slate-800 border-slate-700 rounded-md p-2" />
                            <input type="text" placeholder="Contract Address (0x...)" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full bg-slate-800 border-slate-700 rounded-md p-2" />
                            <textarea placeholder="Contract ABI (JSON format)" value={form.abi} onChange={e => setForm({...form, abi: e.target.value})} rows={5} className="w-full bg-slate-800 border-slate-700 rounded-md p-2 font-mono text-xs"></textarea>
                            {error && <p className="text-xs text-red-400">{error}</p>}
                            <button onClick={handleAddContract} className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-md transition-colors bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                                <PlusCircleIcon className="w-5 h-5" />
                                Add & Monitor Contract
                            </button>
                        </div>}
                    </div>
                    {/* Monitored Contracts List */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                        <h2 className="text-xl font-semibold text-slate-300 mb-3">Currently Monitored</h2>
                        <div className="space-y-2">
                            {contracts.length > 0 ? contracts.map(c => (
                                <div key={c.id} className="flex justify-between items-center bg-slate-800 p-2 rounded-md text-sm">
                                    <div>
                                        <p className="font-semibold text-slate-200">{c.name}</p>
                                        <p className="font-mono text-xs text-slate-400">{c.address}</p>
                                    </div>
                                    <button onClick={() => handleRemoveContract(c.id)} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )) : <p className="text-sm text-slate-500">No contracts are being monitored.</p>}
                        </div>
                    </div>
                </div>

                {/* Right Side: Event Feed */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold text-slate-300 mb-3">Live Event Feed</h2>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-4 h-[70vh] overflow-y-auto">
                        {events.length > 0 ? events.map(e => (
                            <EventCard key={e.id} event={e} />
                        )) : (
                            <div className="text-center py-12 text-slate-500">
                                <p>Waiting for events...</p>
                                <p className="text-xs mt-1">Events from monitored contracts will appear here in real-time.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};