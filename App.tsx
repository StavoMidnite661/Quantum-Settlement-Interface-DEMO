import React, { useState } from 'react';
import { Header } from './components/Header';
import { PaymentDashboard } from './components/PaymentDashboard';
import { WalletProvider } from './contexts/WalletContext';
import { MonitoredContracts } from './components/MonitoredContracts';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'contracts'>('dashboard');

  return (
    <WalletProvider>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
        <div 
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-5"
          style={{backgroundImage: 'url(https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop)'}}
        ></div>
        <div className="relative z-10">
          <Header activeView={view} onNavigate={setView} />
          <main className="container mx-auto px-4 py-8">
            {view === 'dashboard' && <PaymentDashboard />}
            {view === 'contracts' && <MonitoredContracts />}
          </main>
        </div>
      </div>
    </WalletProvider>
  );
};

export default App;