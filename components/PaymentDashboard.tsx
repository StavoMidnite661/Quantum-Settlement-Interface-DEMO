import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Payment, PaymentStatus, Priority } from '../types';
import { MOCK_PAYMENTS } from '../constants';
import { PaymentCard } from './PaymentCard';
import { ProgressBar } from './ProgressBar';
import { FilterControls, type SortOption } from './FilterControls';
import { PaymentDetailModal } from './PaymentDetailModal';
import UserProfile from './UserProfile';
import { AISentinel } from './AISentinel';
import { ContractListener } from './ContractListener';

export const PaymentDashboard: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(() => [...MOCK_PAYMENTS].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [view, setView] = useState<{ page: 'dashboard' | 'profile'; userId?: string }>({ page: 'dashboard' });

  // Simulate real-time updates more realistically
  useEffect(() => {
    const interval = setInterval(() => {
      setPayments(currentPayments => {
        let hasChanged = false;
        const newPayments = currentPayments.map(p => {
          // Do not update live transactions
          if (p.isLive) return p;
          
          // Give pending payments a chance to start processing
          if (p.status === PaymentStatus.PENDING && Math.random() < 0.2) { // 20% chance
            hasChanged = true;
            return {
              ...p,
              status: PaymentStatus.PROCESSING,
              updated_at: new Date().toISOString(),
            };
          }
          // Give processing payments a chance to resolve
          if (p.status === PaymentStatus.PROCESSING && Math.random() < 0.3) { // 30% chance
            hasChanged = true;
            const newStatus = Math.random() > 0.1 ? PaymentStatus.SETTLED : PaymentStatus.FAILED;
            return {
              ...p,
              status: newStatus,
              updated_at: new Date().toISOString(),
              settlement_data: {
                ...p.settlement_data,
                status: newStatus === PaymentStatus.SETTLED ? 'confirmed' : 'reverted',
                blockchain_tx_hash: p.id,
                settled_at: new Date().toISOString(),
              },
            };
          }
          return p;
        });

        // Only return a new array if something actually changed
        return hasChanged ? newPayments : currentPayments;
      });
    }, 3000); // Update every 3 seconds for a more dynamic feel

    return () => clearInterval(interval);
  }, []);

  const handleNewPayment = useCallback((newPayment: Payment) => {
    setPayments(currentPayments => [newPayment, ...currentPayments]);
  }, []);

  const filteredPayments = useMemo(() => {
    const priorityOrder = { [Priority.HIGH]: 1, [Priority.MEDIUM]: 2, [Priority.LOW]: 3 };
    
    return payments
      .filter(p => filterStatus === 'all' || p.status === filterStatus)
      .filter(p => 
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOption === 'priority-desc') {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [payments, filterStatus, searchTerm, sortOption]);

  const stats = useMemo(() => {
      const settled = payments.filter(p => p.status === PaymentStatus.SETTLED).length;
      return {
          total: payments.length,
          pending: payments.filter(p => p.status === PaymentStatus.PENDING).length,
          processing: payments.filter(p => p.status === PaymentStatus.PROCESSING).length,
          failed: payments.filter(p => p.status === PaymentStatus.FAILED).length,
          settled,
          progress: payments.length > 0 ? (settled / payments.length) * 100 : 0
      };
  }, [payments]);

  const handleCardClick = (payment: Payment) => setSelectedPayment(payment);
  const handleCloseModal = () => setSelectedPayment(null);
  const handleUserClick = (userId: string) => setView({ page: 'profile', userId });

  const handleExport = () => {
    const headers = ["Tx Hash", "Timestamp", "User Name", "Retailer ID", "Amount (Tokens)", "Status"];
    const csvRows = [headers.join(',')];
    filteredPayments.forEach(p => {
        const row = [
            p.id, new Date(p.created_at).toLocaleString(), p.user.name,
            p.description, p.amount.amount_in_tokens, p.status.toUpperCase()
        ];
        csvRows.push(row.join(','));
    });
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'settlements.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (view.page === 'profile' && view.userId) {
    return <UserProfile 
        userId={view.userId} 
        allPayments={payments} 
        onBack={() => setView({ page: 'dashboard' })} 
    />;
  }

  return (
    <>
      <div className="space-y-8 animate-fade-in">
            <AISentinel payments={payments} />
            
            <ContractListener onNewPayment={handleNewPayment} />

            <div>
            <h2 className="text-xl font-semibold text-slate-300 mb-2">Settlement Overview</h2>
            <ProgressBar percentage={stats.progress} />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 text-center">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800"><div className="text-2xl font-bold text-cyan-400">{stats.total}</div><div className="text-sm text-slate-400">Total</div></div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800"><div className="text-2xl font-bold text-amber-400">{stats.pending}</div><div className="text-sm text-slate-400">Pending</div></div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800"><div className="text-2xl font-bold text-sky-400">{stats.processing}</div><div className="text-sm text-slate-400">Processing</div></div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800"><div className="text-2xl font-bold text-green-400">{stats.settled}</div><div className="text-sm text-slate-400">Settled</div></div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800"><div className="text-2xl font-bold text-red-400">{stats.failed}</div><div className="text-sm text-slate-400">Failed</div></div>
            </div>
            </div>
            
            <div>
            <FilterControls 
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortOption={sortOption}
                setSortOption={setSortOption}
                onExport={handleExport}
            />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPayments.map(payment => (
                <PaymentCard 
                    key={payment.id} 
                    payment={payment}
                    onClick={() => handleCardClick(payment)}
                    onUserClick={handleUserClick}
                />
            ))}
            {filteredPayments.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500">
                    <p>No payments found matching your criteria.</p>
                </div>
            )}
            </div>
      </div>
      <PaymentDetailModal 
        payment={selectedPayment} 
        onClose={handleCloseModal}
        onUserClick={handleUserClick}
      />
    </>
  );
};