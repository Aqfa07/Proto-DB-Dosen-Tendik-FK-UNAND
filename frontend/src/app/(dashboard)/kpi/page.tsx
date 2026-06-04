"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Plus, Pencil, Trash2, Loader2, X, BarChart3, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { useKpiStore, KpiDekan } from '@/store/useKpiStore';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';

export default function KpiPage() {
  const { data, ringkasan, tahun, isLoading, fetchKpi, createKpi, updateKpi, deleteKpi } = useKpiStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<KpiDekan | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<KpiDekan | null>(null);
  const [formData, setFormData] = useState({
    indikator: '',
    target: '',
    realisasi_q1: '',
    realisasi_q2: '',
    realisasi_q3: '',
    realisasi_q4: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchKpi();
  }, [fetchKpi]);

  const openCreate = () => {
    setEditItem(null);
    setFormData({ indikator: '', target: '', realisasi_q1: '', realisasi_q2: '', realisasi_q3: '', realisasi_q4: '' });
    setIsModalOpen(true);
  };

  const openEdit = (kpi: KpiDekan) => {
    setEditItem(kpi);
    setFormData({
      indikator: kpi.indikator,
      target: String(kpi.target),
      realisasi_q1: String(kpi.realisasi_q1),
      realisasi_q2: String(kpi.realisasi_q2),
      realisasi_q3: String(kpi.realisasi_q3),
      realisasi_q4: String(kpi.realisasi_q4),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editItem) {
        await updateKpi(editItem.id, {
          indikator: formData.indikator,
          target: parseFloat(formData.target) || 0,
          realisasi_q1: parseFloat(formData.realisasi_q1) || 0,
          realisasi_q2: parseFloat(formData.realisasi_q2) || 0,
          realisasi_q3: parseFloat(formData.realisasi_q3) || 0,
          realisasi_q4: parseFloat(formData.realisasi_q4) || 0,
        });
        toast.success('Berhasil Diperbarui', { description: `Indikator KPI berhasil disimpan ke database.` });
      } else {
        await createKpi({
          tahun,
          indikator: formData.indikator,
          target: parseFloat(formData.target) || 0,
        });
        toast.success('Berhasil Ditambahkan', { description: `Indikator KPI baru telah sukses ditambahkan.` });
      }
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (kpi: KpiDekan) => {
    setDeleteConfirmItem(kpi);
  };

  const executeDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      await deleteKpi(deleteConfirmItem.id);
      toast.success('Berhasil Dihapus', { description: 'Indikator KPI telah dihapus dari sistem.' });
    } catch (err) {
      toast.error('Gagal menghapus indikator KPI!');
    } finally {
      setDeleteConfirmItem(null);
    }
  };

  const getCapaianBadge = (persen: number) => {
    if (persen >= 100) return 'badge-green';
    if (persen >= 75) return 'badge-blue';
    if (persen >= 50) return 'badge-amber';
    return 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30';
  };

  const getBarColor = (persen: number) => {
    if (persen >= 100) return 'bg-emerald-500';
    if (persen >= 75) return 'bg-indigo-500';
    if (persen >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="pb-12 pt-1 relative">
      {/* Header */}
      <div className="mb-7 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="page-header-title">Capaian Kinerja Dekan</h1>
          <p className="page-header-subtitle">Pantau Indikator Kinerja Utama (IKU) per kuartal secara real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
            <button 
              onClick={() => fetchKpi(tahun - 1)} 
              className="px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
            <span className="px-5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-100 border-x border-slate-200 dark:border-slate-700/80 min-w-[80px] text-center bg-slate-50 dark:bg-slate-900/30">
              {tahun}
            </span>
            <button 
              onClick={() => fetchKpi(tahun + 1)} 
              className="px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" />
            Tambah Indikator
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {ringkasan && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Jumlah Indikator', value: ringkasan.jumlah_indikator, icon: Target, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' },
            { label: 'Total Target', value: ringkasan.total_target, icon: BarChart3, gradient: 'from-purple-500 to-fuchsia-600', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
            { label: 'Total Realisasi', value: ringkasan.total_realisasi, icon: TrendingUp, gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Rata-rata Capaian', value: `${ringkasan.rata_rata_capaian}%`, icon: Activity, gradient: 'from-orange-400 to-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' },
          ].map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 16 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }} 
              className="stat-card group cursor-default"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${s.bg}`}>
                  <s.icon className={`w-5 h-5 ${s.text}`} />
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{s.value}</h3>
            </motion.div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card-premium overflow-hidden min-h-[400px]">
        {isLoading && data.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
               <Target className="w-7 h-7 text-slate-300 dark:text-slate-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Belum ada indikator</p>
              <p className="text-sm text-slate-400 mt-1">Belum ada indikator kinerja untuk tahun {tahun}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-premium">
              <thead>
                <tr>
                  <th className="w-12 text-center">No</th>
                  <th>Indikator Kinerja Utama</th>
                  <th className="text-center">Target</th>
                  <th className="text-center text-slate-400">Q1</th>
                  <th className="text-center text-slate-400">Q2</th>
                  <th className="text-center text-slate-400">Q3</th>
                  <th className="text-center text-slate-400">Q4</th>
                  <th className="text-center text-indigo-600 dark:text-indigo-400">Total</th>
                  <th className="text-center">Capaian</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((kpi, idx) => (
                  <tr key={kpi.id} className="group">
                    <td className="text-center text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="font-medium text-slate-800 dark:text-slate-200 max-w-sm leading-relaxed">
                      {kpi.indikator}
                    </td>
                    <td className="text-center font-bold text-slate-700 dark:text-slate-300">{kpi.target}</td>
                    <td className="text-center text-slate-500 dark:text-slate-400">{kpi.realisasi_q1 || '—'}</td>
                    <td className="text-center text-slate-500 dark:text-slate-400">{kpi.realisasi_q2 || '—'}</td>
                    <td className="text-center text-slate-500 dark:text-slate-400">{kpi.realisasi_q3 || '—'}</td>
                    <td className="text-center text-slate-500 dark:text-slate-400">{kpi.realisasi_q4 || '—'}</td>
                    <td className="text-center font-bold text-indigo-600 dark:text-indigo-400">{kpi.total_realisasi}</td>
                    <td className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`badge ${getCapaianBadge(kpi.persentase_capaian)}`}>
                          {kpi.persentase_capaian}%
                        </span>
                        <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(kpi.persentase_capaian)}`} 
                            style={{ width: `${Math.min(kpi.persentase_capaian, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEdit(kpi)} 
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(kpi)} 
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              className="modal-content w-full max-w-lg overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {editItem ? 'Edit Indikator' : 'Tambah Indikator Baru'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Atur target dan realisasi kuartal</p>
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
                  <label className="form-label">Indikator Kinerja</label>
                  <input 
                    required 
                    value={formData.indikator} 
                    onChange={e => setFormData({...formData, indikator: e.target.value})} 
                    className="input-premium" 
                    placeholder="Misal: Jumlah Publikasi Internasional" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="form-label">Target (Numerik)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={formData.target} 
                    onChange={e => setFormData({...formData, target: e.target.value})} 
                    className="input-premium" 
                    placeholder="100" 
                  />
                </div>

                {editItem && (
                  <div className="form-section-divider">
                    <p className="form-section-title">Realisasi Kuartal (Q1 - Q4)</p>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      {(['realisasi_q1', 'realisasi_q2', 'realisasi_q3', 'realisasi_q4'] as const).map((q, idx) => (
                        <div key={q} className="space-y-1.5">
                          <label className="form-label text-slate-400">Kuartal {idx + 1}</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            value={formData[q]} 
                            onChange={e => setFormData({...formData, [q]: e.target.value})} 
                            className="input-premium" 
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="btn-primary"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editItem ? 'Simpan Perubahan' : 'Tambahkan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteConfirmItem !== null}
        title="Hapus Indikator KPI?"
        message={`Data target dan realisasi dari "${deleteConfirmItem?.indikator}" akan hilang dan tidak dapat dikembalikan. Lanjutkan?`}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmItem(null)}
        isLoading={submitting}
      />
    </div>
  );
}
