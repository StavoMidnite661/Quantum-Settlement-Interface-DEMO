import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Payment, PaymentStatus, Priority } from '../types';
import { PaymentCard } from './PaymentCard';
import { FilterControls, type SortOption } from './FilterControls';
import { PaymentDetailModal } from './PaymentDetailModal';
import UserProfile from './UserProfile';
import { AISentinel } from './AISentinel';
import { ContractListener } from './ContractListener';
import { useToast } from '../contexts/ToastContext';
import { generateInitialMockData, generateMockPayment } from '../utils/mockData';
import { LedgerVisualizer } from './LedgerVisualizer';
import { XIcon } from './Icons';

export const PaymentDashboard: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(() => generateInitialMockData(20));
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [view, setView] = useState<{ page: 'dashboard' | 'profile'; userId?: string }>({ page: 'dashboard' });
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { addToast } = useToast();

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
        const newMockPayment = generateMockPayment(true); // isNew = true
        setPayments(currentPayments => 
            [newMockPayment, ...currentPayments]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        );
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const handleNewPayment = useCallback((newPayment: Payment) => {
    setPayments(currentPayments => [newPayment, ...currentPayments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    if (newPayment.isLive) {
        addToast({
            id: newPayment.id,
            title: 'New Live Transaction Received',
            description: `From: ${newPayment.user.name} for ${newPayment.description}`,
            type: 'info'
        });
    }
  }, [addToast]);

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

  const displayedPayments = useMemo(() => {
    if (!selectedNodeId) {
        return filteredPayments;
    }
    return filteredPayments.filter(p => p.user.id === selectedNodeId || p.description === selectedNodeId);
  }, [filteredPayments, selectedNodeId]);

  const selectedNodeLabel = useMemo(() => {
    if (!selectedNodeId) return null;
    const paymentWithNode = payments.find(p => p.user.id === selectedNodeId || p.description === selectedNodeId);
    if (!paymentWithNode) return selectedNodeId;
    return paymentWithNode.user.id === selectedNodeId ? paymentWithNode.user.name : paymentWithNode.description;
  }, [selectedNodeId, payments]);

  const handleCardClick = (payment: Payment) => setSelectedPayment(payment);
  const handleCloseModal = () => setSelectedPayment(null);
  const handleUserClick = (userId: string) => setView({ page: 'profile', userId });

  const handleExport = () => {
    const headers = ["Tx Hash", "Timestamp", "User Name", "Retailer ID", "Amount (Tokens)", "Status"];
    const csvRows = [headers.join(',')];
    displayedPayments.forEach(p => {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <AISentinel payments={payments} onHighlightNodes={setHighlightedNodeIds} />
            </div>
            <div className="lg:col-span-2">
                <LedgerVisualizer 
                    payments={filteredPayments} 
                    onTransactionClick={handleCardClick}
                    highlightedNodeIds={highlightedNodeIds}
                    selectedNodeId={selectedNodeId}
                    onNodeSelect={setSelectedNodeId}
                />
            </div>
        </div>

        <ContractListener onNewPayment={handleNewPayment} />
        
        <div>
        <FilterControls 
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortOption={sortOption}
            setSortOption={setSortOption}
            onExport={handleExport}
            onFilterChange={() => setSelectedNodeId(null)}
        />
        </div>

        {selectedNodeId && selectedNodeLabel && (
            <div className="my-4 flex items-center justify-between rounded-lg border border-cyan-800 bg-slate-900 p-3 shadow-md animate-fade-in">
                <p className="text-sm text-slate-300">
                    Focusing on: <span className="font-semibold text-cyan-400">{selectedNodeLabel}</span>
                </p>
                <button
                    onClick={() => setSelectedNodeId(null)}
                    className="flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700"
                >
                    <XIcon className="h-3 w-3" />
                    Clear Focus
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedPayments.map(payment => (
            <PaymentCard 
                key={payment.id} 
                payment={payment}
                onClick={() => handleCardClick(payment)}
                onUserClick={handleUserClick}
            />
        ))}
        {displayedPayments.length === 0 && (
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