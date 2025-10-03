import React from 'react';
import { XIcon, AlertTriangleIcon } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md flex flex-col shadow-2xl shadow-cyan-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <AlertTriangleIcon className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="p-6">
          <p className="text-slate-300">{message}</p>
        </div>
        <footer className="flex justify-end gap-3 p-4 bg-slate-950/50 border-t border-slate-800 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
          >
            Confirm
          </button>
        </footer>
      </div>
    </div>
  );
};