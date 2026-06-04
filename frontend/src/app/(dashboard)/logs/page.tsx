"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, ChevronLeft, ChevronRight, Clock, User, Globe, Activity } from 'lucide-react';
import { useLogStore } from '@/store/useLogStore';

export default function LogsPage() {
  const { logs, pagination, isLoading, fetchLogs } = useLogStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1, search);
  };

  const actionColor: Record<string, string> = {
    'CREATE': 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/50',
    'UPDATE': 'bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400 dark:border-indigo-800/50',
    'DELETE': 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800/50',
    'LOGIN': 'bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200 dark:bg-fuchsia-900/40 dark:text-fuchsia-400 dark:border-fuchsia-800/50',
    'DEACTIVATE': 'bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800/50',
    'ACTIVATE': 'bg-teal-50 text-teal-600 border border-teal-200 dark:bg-teal-900/40 dark:text-teal-400 dark:border-teal-800/50',
  };

  return (
    <div className="pb-12 pt-1 relative">
      <div className="mb-7 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="page-header-title">Log Aktivitas Sistem</h1>
          <p className="page-header-subtitle">Rekam jejak dan audit trail seluruh tindakan transaksional pengguna</p>
        </div>
      </div>

      <div className="card-premium overflow-hidden flex flex-col min-h-[500px] relative">
        {/* Search Bar */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Cari deskripsi, aksi, atau entitas..." 
                className="search-input" 
              />
            </div>
            <button 
              type="submit" 
              className="btn-primary"
            >
              Cari Log
            </button>
          </form>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 p-6 relative">
          {isLoading && logs.length === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          )}

          {logs.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                 <Activity className="w-7 h-7 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-400 text-center">Belum ada aktivitas terekam untuk kueri tersebut.</p>
            </div>
          ) : (
            <div className="space-y-0 pl-2">
              {logs.map((log, idx) => (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, x: -16 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: Math.min(idx * 0.03, 0.5) }} 
                  className="flex gap-5 py-4 border-b border-slate-100 dark:border-slate-800/80 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors -mx-6 px-6"
                >
                  {/* Timeline Node */}
                  <div className="flex flex-col items-center pt-1.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/30 ring-4 ring-indigo-50 dark:ring-indigo-900/30" />
                    {idx < logs.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700/60 mt-2" />}
                  </div>

                  {/* Log Card */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${actionColor[log.action] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                        {log.action}
                      </span>
                      <div className="flex items-center text-[11px] font-medium text-slate-400 gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(log.created_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed max-w-3xl">
                      {log.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-5 mt-2.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-fit border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {log.user?.email || 'System Operation'}
                      </div>
                      {log.ip_address && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium font-mono">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            {log.ip_address}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex justify-between items-center px-5 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 mt-auto">
            <button 
              disabled={pagination.current_page <= 1} 
              onClick={() => fetchLogs(pagination.current_page - 1, search)} 
              className="pagination-btn"
            >
              ← Prev
            </button>
            <span className="text-xs font-semibold text-slate-500">
              Hal {pagination.current_page} / {pagination.last_page}
            </span>
            <button 
              disabled={pagination.current_page >= pagination.last_page} 
              onClick={() => fetchLogs(pagination.current_page + 1, search)} 
              className="pagination-btn"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
