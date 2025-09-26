import React, { useState } from 'react';
import { Payment, RoutingTrace, PaymentStatus } from '../types';
import { XIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface PaymentDetailModalProps {
  payment: Payment | null;
  onClose: () => void;
  onUserClick: (userId: string) => void;
}

const TraceStep: React.FC<{ trace: RoutingTrace }> = ({ trace }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSuccess = trace.status === 'success';
  const hasDetails = Object.keys(trace.details).length > 0;

  return (
    <div className="flex items-start gap-4 py-3">
      <div>
        {isSuccess ? (
          <CheckCircleIcon className="w-6 h-6 text-green-400" />
        ) : (
          <XCircleIcon className="w-6 h-6 text-red-400" />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="font-semibold text-slate-200">{trace.service}: <span className="font-normal capitalize">{trace.action.replace(/_/g, ' ')}</span></p>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
            <div className="flex items-center gap-2">
                <ClockIcon className="w-3 h-3" />
                <span>{new Date(trace.timestamp).toLocaleString()}</span>
            </div>
            {hasDetails && (
                <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors text-xs font-semibold"
                >
                    {isExpanded ? <ChevronUpIcon className="w-3 h-3"/> : <ChevronDownIcon className="w-3 h-3" />}
                    {isExpanded ? 'Hide Details' : 'Show Details'}
                </button>
            )}
        </div>
        {isExpanded && hasDetails && (
             <pre className="mt-2 text-xs bg-slate-950 p-2 rounded-md text-slate-500 font-mono overflow-x-auto">
                {JSON.stringify(trace.details, null, 2)}
            </pre>
        )}
      </div>
    </div>
  );
};


export const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({ payment, onClose, onUserClick }) => {
  if (!payment) return null;

  const handleUserClick = () => {
    onUserClick(payment.user.id);
    onClose(); // Close modal when navigating
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-100">{payment.description}</h2>
            <p className="text-xs font-mono text-slate-500 mt-1 break-all">{payment.id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
            {payment.status === PaymentStatus.FAILED && (
              <div className="bg-red-900/40 border border-red-700/50 rounded-lg p-3 mb-6 text-sm">
                  <p className="font-semibold text-red-300">Failure Reason</p>
                  <p className="text-red-400 mt-1 font-mono text-xs">{payment.settlement_data.notes[0]}</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 mb-6">
                <div>
                    <p className="text-sm text-slate-400">User</p>
                    <div 
                      className="flex items-center gap-2 mt-1 cursor-pointer"
                      onClick={handleUserClick}
                      title="View user profile"
                    >
                      <p className="font-semibold text-slate-200 hover:text-cyan-400 transition-colors">{payment.user.name}</p>
                      <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{payment.user.type}</span>
                    </div>
                </div>
                <div>
                    <p className="text-sm text-slate-400">Amount</p>
                    <p className="font-semibold text-cyan-400">{payment.amount.amount_in_tokens.toLocaleString()} Tokens</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-400">Status</p>
                    <div className="mt-1"><PaymentStatusBadge status={payment.status} /></div>
                </div>
                 <div>
                    <p className="text-sm text-slate-400">Timestamp</p>
                    <p className="font-semibold text-slate-200">{new Date(payment.created_at).toLocaleString()}</p>
                </div>
                 <div className="sm:col-span-2">
                    <p className="text-sm text-slate-400">Transaction Data Hash</p>
                    <p className="font-mono text-sm text-slate-200 break-all">{payment.transactionDataHash}</p>
                </div>
                {payment.complianceDataHash.replace('0x', '').replace(/0/g, '') !== '' && (
                    <div className="sm:col-span-2">
                        <p className="text-sm text-slate-400">Compliance Data Hash</p>
                        <p className="font-mono text-sm text-slate-200 break-all">{payment.complianceDataHash}</p>
                    </div>
                )}
            </div>

            <h3 className="text-lg font-semibold text-slate-300 mb-2 border-t border-slate-800 pt-4">Routing Trace</h3>
            <div className="divide-y divide-slate-800">
                {payment.routing_trace.map((trace, index) => (
                    <TraceStep key={index} trace={trace} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};