import React, { useState, useEffect, useMemo } from 'react';
import { Payment, User } from '../types';
import { MOCK_PAYMENTS } from '../constants'; // To find user details
import { ArrowLeftIcon, UserIcon, ArrowUpIcon, ArrowDownIcon } from './Icons';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface UserProfileProps {
  userId: string;
  allPayments: Payment[];
  onBack: () => void;
}

type SortKey = 'created_at' | 'description' | 'amount_in_tokens';
type SortDirection = 'asc' | 'desc';

const UserProfile: React.FC<UserProfileProps> = ({ userId, allPayments, onBack }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'created_at', direction: 'desc' });

  useEffect(() => {
    // In a real app, you might fetch user details. Here we find them.
    const paymentWithUser = allPayments.find(p => p.user.id === userId);
    if (paymentWithUser) {
        setUser(paymentWithUser.user);
    }
    const filtered = allPayments.filter(p => p.user.id === userId);
    setUserPayments(filtered);
  }, [userId, allPayments]);

  const sortedPayments = useMemo(() => {
    const sortableItems = [...userPayments];
    sortableItems.sort((a, b) => {
        let aValue: string | number, bValue: string | number;
        if (sortConfig.key === 'amount_in_tokens') {
            aValue = a.amount.amount_in_tokens;
            bValue = b.amount.amount_in_tokens;
        } else {
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
    return sortableItems;
  }, [userPayments, sortConfig]);

  const requestSort = (key: SortKey) => {
      let direction: SortDirection = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
      if (sortConfig.key !== key) return null;
      const className="w-3 h-3 ml-1 flex-shrink-0";
      return sortConfig.direction === 'asc' ? <ArrowUpIcon className={className} /> : <ArrowDownIcon className={className} />;
  };

  const SortableHeader: React.FC<{ sortKey: SortKey; className?: string; children: React.ReactNode }> = ({ sortKey, className, children }) => (
    <th className={`px-4 py-3 text-sm font-semibold text-slate-400 ${className}`}>
        <button onClick={() => requestSort(sortKey)} className="flex items-center transition-colors hover:text-slate-200">
            {children}
            {getSortIcon(sortKey)}
        </button>
    </th>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors mb-4 font-semibold">
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Dashboard
        </button>
        {user && (
            <div className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                <UserIcon className="w-10 h-10 text-slate-500 flex-shrink-0" />
                <div className="min-w-0">
                    <h2 className="text-xl font-bold text-slate-100 truncate">{user.name}</h2>
                    <div className="flex items-center gap-2">
                        <p className="font-mono text-sm text-slate-400 break-all">{user.id}</p>
                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">{user.type}</span>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
        <h3 className="text-lg font-semibold text-slate-300 p-4 border-b border-slate-800">Transaction History</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-900 border-b border-slate-800">
                <tr>
                    <SortableHeader sortKey="created_at">Timestamp</SortableHeader>
                    <SortableHeader sortKey="description">Description</SortableHeader>
                    <SortableHeader sortKey="amount_in_tokens" className="text-right">Amount (Tokens)</SortableHeader>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-400">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-400">Tx Hash</th>
                </tr>
                </thead>
                <tbody>
                {sortedPayments.length > 0 ? (
                    sortedPayments.map(p => (
                    <tr key={p.id} className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/40">
                        <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">{new Date(p.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-slate-200 font-semibold">{p.description}</td>
                        <td className="px-4 py-3 text-sm text-cyan-400 font-mono text-right">{p.amount.amount_in_tokens.toLocaleString()}</td>
                        <td className="px-4 py-3"><PaymentStatusBadge status={p.status} /></td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400 hover:text-cyan-300">
                        <a href="#" title={p.id}>{`${p.id.substring(0, 6)}...${p.id.substring(p.id.length - 4)}`}</a>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500">No transactions found for this user.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;