"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isLoading }: ConfirmModalProps) {
  // Prevent clicks inside modal from closing it if we later add backdrop click
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="modal-content w-full max-w-[360px] p-6 relative overflow-hidden"
          >
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center border-[6px] border-white dark:border-slate-800 shadow-md">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
            </div>
            
            <h3 className="text-lg font-extrabold text-center text-slate-800 dark:text-slate-100 mb-1.5 tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {message}
            </p>

            <div className="flex gap-2.5 w-full">
              <button 
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl transition-colors disabled:opacity-60 font-sans"
              >
                Batal
              </button>
              <button 
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 outline-none text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-red-500/25 disabled:opacity-65 flex items-center justify-center gap-2 font-sans"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Hapus
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
