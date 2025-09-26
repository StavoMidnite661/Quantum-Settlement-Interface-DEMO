import React from 'react';
import { Payment, PaymentStatus, Priority } from '../types';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { UserIcon, CalendarIcon, HashIcon, DollarSignIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon, BrainCircuitIcon } from './Icons';

const PriorityIndicator: React.FC<{ priority: Priority }> = ({ priority }) => {
  const styles: Record<Priority, { icon: React.ReactNode; color: string; label: string }> = {
    [Priority.HIGH]: { icon: <ArrowUpIcon className="w-4 h-4" />, color: 'text-red-400', label: 'High Priority' },
    [Priority.MEDIUM]: { icon: <MinusIcon className="w-4 h-4" />, color: 'text-amber-400', label: 'Medium Priority' },
    [Priority.LOW]: { icon: <ArrowDownIcon className="w-4 h-4" />, color: 'text-sky-400', label: 'Low Priority' },
  };
  const { icon, color, label } = styles[priority];
  return <div title={label} className={color}>{icon}</div>;
};


export const PaymentCard: React.FC<{ payment: Payment; onClick: () => void; onUserClick: (userId: string) => void; }> = ({ payment, onClick, onUserClick }) => {
  const formattedAmount = (payment.amount.amount_in_usd_cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  const cardBorderColor: Record<PaymentStatus, string> = {
    [PaymentStatus.SETTLED]: 'border-green-500/30',
    [PaymentStatus.PROCESSING]: 'border-sky-500/30',
    [PaymentStatus.PENDING]: 'border-amber-500/30',
    [PaymentStatus.FAILED]: 'border-red-500/30',
    [PaymentStatus.CANCELED]: 'border-slate-600/30',
  };

  return (
    <div 
      onClick={onClick}
      className={`
      relative flex flex-col bg-slate-900/50 rounded-lg border ${cardBorderColor[payment.status]}
      transition-all duration-300 ease-in-out
      hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 hover:border-cyan-500/50
      cursor-pointer
    `}>
      {payment.ai_flag && (
        <div className="absolute top-3 right-3" title={payment.ai_flag.reason}>
          <BrainCircuitIcon className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>
      )}
      {payment.isLive && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 text-xs text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Live
        </div>
      )}
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <PriorityIndicator priority={payment.priority} />
            <p className="text-lg font-semibold text-slate-100">{payment.description}</p>
          </div>
          <PaymentStatusBadge status={payment.status} />
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-sm">
          <div className="flex items-center gap-3 text-slate-300">
            <UserIcon className="w-4 h-4 text-slate-500" />
            <span 
              className="font-semibold hover:text-cyan-400 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onUserClick(payment.user.id);
              }}
              title={payment.user.id}
            >
              {payment.user.name}
            </span>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{payment.user.type}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <DollarSignIcon className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-cyan-400">{payment.amount.amount_in_tokens.toLocaleString()} Tokens</span>
            <span className="text-xs text-slate-400">({formattedAmount})</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <span>{new Date(payment.created_at).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <HashIcon className="w-4 h-4 text-slate-500" />
            <a 
              href="#"
              onClick={(e) => e.stopPropagation()}
              className="font-mono text-xs truncate hover:text-cyan-400 transition-colors"
              title={payment.id}
            >
              {payment.id.substring(0, 10)}...{payment.id.substring(58)}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};