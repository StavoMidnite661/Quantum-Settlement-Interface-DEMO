
import React from 'react';
import { PaymentStatus } from '../types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  const statusStyles: Record<PaymentStatus, { text: string; bg: string; dot: string }> = {
    [PaymentStatus.PENDING]: { text: 'text-amber-300', bg: 'bg-amber-900/50', dot: 'bg-amber-400' },
    [PaymentStatus.PROCESSING]: { text: 'text-sky-300', bg: 'bg-sky-900/50', dot: 'bg-sky-400 animate-pulse' },
    [PaymentStatus.SETTLED]: { text: 'text-green-300', bg: 'bg-green-900/50', dot: 'bg-green-400' },
    [PaymentStatus.FAILED]: { text: 'text-red-300', bg: 'bg-red-900/50', dot: 'bg-red-400' },
    [PaymentStatus.CANCELED]: { text: 'text-slate-400', bg: 'bg-slate-700/50', dot: 'bg-slate-500' },
  };

  const { text, bg, dot } = statusStyles[status] || statusStyles[PaymentStatus.CANCELED];
  const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${text} ${bg}`}>
      <div className={`w-2 h-2 rounded-full ${dot}`}></div>
      <span>{formattedStatus}</span>
    </div>
  );
};
