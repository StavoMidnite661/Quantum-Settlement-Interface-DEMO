import React from 'react';
import { QuantumIcon } from './Icons';
import { useWallet } from '../contexts/WalletContext';
import { NetworkStatus } from './NetworkStatus';

const WalletConnect: React.FC = () => {
  const { connectWallet, isConnected, account } = useWallet();

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-full px-4 py-1.5">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-sm text-slate-300 font-mono hidden sm:inline">
          {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
        </span>
      </div>
    );
  }

  return (
    <button onClick={connectWallet} className="px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20">
      Connect Wallet
    </button>
  );
};

interface HeaderProps {
  activeView: 'dashboard' | 'contracts';
  onNavigate: (view: 'dashboard' | 'contracts') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onNavigate }) => {
  const getTabClass = (viewName: 'dashboard' | 'contracts') => {
    return activeView === viewName
      ? 'border-cyan-500 text-cyan-400'
      : 'border-transparent text-slate-400 hover:text-slate-100 hover:border-slate-500';
  };

  return (
    <header className="bg-slate-950/50 backdrop-blur-sm border-b border-slate-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <QuantumIcon className="h-8 w-8 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-bold tracking-wider text-slate-100">
              SOVR Empire QSI
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NetworkStatus />
            <div>
              <WalletConnect />
            </div>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-1 py-3 text-sm font-semibold border-b-2 transition-colors ${getTabClass('dashboard')}`}
          >
            Settlement Dashboard
          </button>
          <button
            onClick={() => onNavigate('contracts')}
            className={`px-1 py-3 text-sm font-semibold border-b-2 transition-colors ${getTabClass('contracts')}`}
          >
            Monitored Contracts
          </button>
        </nav>
      </div>
    </header>
  );
};