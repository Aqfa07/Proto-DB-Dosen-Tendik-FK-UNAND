"use client"; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error("Caught by Next.js Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 w-full relative z-[9999]">
      <div className="card-premium w-full max-w-md p-8 sm:p-10 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6 shadow-sm border border-red-100 dark:border-red-900/30">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Oops! Terjadi Kesalahan
        </h2>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6 font-medium leading-relaxed">
          Maaf, sistem mengalami kendala saat memproses halaman ini. 
          {error.message && (
            <span className="block mt-3 px-3 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-[11px] font-mono text-slate-600 dark:text-slate-300 break-words text-left border border-slate-200 dark:border-slate-700">
              {error.message}
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors shadow-sm text-sm"
          >
            <RefreshCcw className="w-4 h-4" />
            Coba Lagi
          </button>
          
          <button
            onClick={() => {
              // Optionally push to home or reload completely
              window.location.href = '/';
            }}
            className="btn-primary w-full sm:w-auto px-5 py-2.5 text-sm"
          >
            <Home className="w-4 h-4" />
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
