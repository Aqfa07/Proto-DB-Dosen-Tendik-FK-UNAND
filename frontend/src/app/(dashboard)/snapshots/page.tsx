"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Clock, Loader2, PlayCircle, X, Calendar } from 'lucide-react';
import { useSnapshotStore } from '@/store/useSnapshotStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function SnapshotManagement() {
  const { history, isLoading, isArchiving, fetchHistory, createSnapshot } = useSnapshotStore();
  const { user } = useAuthStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    quarter: 'Q1',
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm(`Yakin ingin mengarsipkan data untuk ${formData.quarter} ${formData.year}? Tindakan ini akan membekukan data Dosen dan Tendik saat ini menjadi history permanen yang diproses dalam 1 Transactional Batch.`)) {
      await createSnapshot(formData.quarter, formData.year);
      setIsModalOpen(false);
    }
  };

  if (user?.role_id !== 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-5">
          <Archive className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Akses Ditolak</h2>
        <p className="text-slate-400 text-sm mt-2 max-w-sm leading-relaxed">
          Hanya <strong className="text-slate-600 dark:text-slate-300">Administrator Induk</strong> yang memiliki wewenang untuk mengeksekusi dan mengelola Arsip Kinerja Triwulanan.
        </p>
      </div>
    );
  }

  const quarterColors: Record<string, string> = {
    Q1: 'from-blue-500 to-indigo-600',
    Q2: 'from-emerald-500 to-teal-600',
    Q3: 'from-amber-500 to-orange-500',
    Q4: 'from-rose-500 to-pink-600',
  };

  return (
    <div className="pb-12 pt-1 relative">
      {/* Header */}
      <div className="mb-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-header-title">Arsip Kinerja Triwulanan</h1>
          <p className="page-header-subtitle">Rekam dan bekukan data Dosen & Tendik secara permanen pada akhir kuartal</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-500/30 hover:shadow-lg hover:shadow-orange-500/35 hover:-translate-y-0.5 transition-all self-start"
        >
          <PlayCircle className="w-4 h-4" />
          Buat Snapshot Baru
        </button>
      </div>

      {/* Snapshot Grid */}
      <div className="card-premium p-6 min-h-[360px] relative">
        {isLoading && history.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl z-10">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        )}

        {history.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Archive className="w-7 h-7 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-medium text-slate-400">Belum ada arsip snapshot yang dibuat.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {history.map((snap) => {
              const gradient = quarterColors[snap.quarter] || 'from-slate-500 to-slate-600';
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  key={snap.id} 
                  className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-all duration-200"
                >
                  {/* Accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} rounded-t-xl`} />
                  
                  <div className="p-5 pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                          {snap.quarter} <span className="text-orange-500">{snap.year}</span>
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(snap.snapshot_date).toLocaleDateString('id-ID', { 
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
                        <Archive className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-400">
                        Diarsipkan oleh:{' '}
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {snap.created_by?.email || 'System'}
                        </span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.97, y: 16 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.97, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="modal-content w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Evaluasi Triwulan</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Pilih periode yang akan diarsipkan</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="form-label">Kuartal (Triwulan)</label>
                  <select 
                    value={formData.quarter} 
                    onChange={e => setFormData({...formData, quarter: e.target.value})} 
                    className="input-premium"
                  >
                    <option value="Q1">Q1 (Januari – Maret)</option>
                    <option value="Q2">Q2 (April – Juni)</option>
                    <option value="Q3">Q3 (Juli – September)</option>
                    <option value="Q4">Q4 (Oktober – Desember)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="form-label">Tahun Pelaksanaan</label>
                  <input 
                    type="number" 
                    value={formData.year} 
                    onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} 
                    className="input-premium" 
                    min="2020" 
                    max="2100" 
                  />
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/30 rounded-xl">
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    <strong>⚠ Penting:</strong> Proses ini akan merekam struktur Dosen & Tendik yang ada saat ini secara transaksional ke riwayat permanen dan tidak dapat diurungkan.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isArchiving} 
                    className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold disabled:opacity-65 transition-colors shadow-md shadow-orange-500/25"
                  >
                    {isArchiving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                    Eksekusi Snapshot
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
