import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { ToastMessage } from '../types';
import { InfoIcon, XIcon, CheckCircleIcon, XCircleIcon } from './Icons';

const typeStyles = {
    info: {
      icon: <InfoIcon className="w-6 h-6 text-cyan-400" />,
      border: 'border-cyan-500/50',
    },
    success: {
      icon: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
      border: 'border-green-500/50',
    },
    error: {
      icon: <XCircleIcon className="w-6 h-6 text-red-400" />,
      border: 'border-red-500/50',
    },
};

const Toast: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Mount animation
        setIsVisible(true);
        // Set up unmount animation
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 4500); // Start fade out before removal

        return () => clearTimeout(timer);
    }, []);

    const { icon, border } = typeStyles[toast.type];

    return (
        <div 
            className={`
                flex items-start gap-4 w-full max-w-sm p-4 bg-slate-800/80 backdrop-blur-sm 
                border ${border} rounded-lg shadow-lg
                transition-all duration-300 ease-in-out
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
            `}
            role="alert"
        >
            <div className="flex-shrink-0">{icon}</div>
            <div className="flex-1">
                <p className="font-semibold text-slate-100">{toast.title}</p>
                {toast.description && <p className="text-sm text-slate-300 mt-1">{toast.description}</p>}
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                aria-label="Close notification"
            >
                <XIcon className="w-5 h-5" />
            </button>
        </div>
    );
};


export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();
  
    return (
      <div className="fixed top-4 right-4 z-[100] space-y-3">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    );
};
