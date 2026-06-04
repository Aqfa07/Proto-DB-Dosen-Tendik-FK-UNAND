"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Loader2, Download, Upload, Users } from 'lucide-react';
import { useTendikStore } from '@/store/useTendikStore';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const ConfirmModal = dynamic(() => import('@/components/ConfirmModal'), { ssr: false });

const EMPTY_TENDIK_FORM = {
  // Identitas Pribadi
  nama_lengkap:              '',
  jenis_kelamin:             'L',
  tempat_lahir:              '',
  tanggal_lahir:             '',
  // Kepegawaian
  nip_baru:                  '',
  // Kepangkatan
  golongan_cpns:             '',
  tmt_cpns:                  '',
  golongan_pangkat:          '',
  tmt_pangkat:               '',
  // Jabatan
  nama_jabatan:              '',
  tmt_jabatan:               '',
  // Masa Kerja
  tanggal_mulai_tugas_unit:  '',
  tanggal_mulai_keseluruhan: '',
  tanggal_mulai_golongan:    '',
  // Pendidikan
  nama_pendidikan:           '',
  tahun_lulus:               '',
  tingkat_ijazah:            '',
  // Pensiun
  tmt_pensiun:               '',
  tahun_pensiun:             '',
  batas_usia_pensiun:        '',
};

type TendikForm = typeof EMPTY_TENDIK_FORM;

export default function TendikManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const urlSearch = searchParams.get('search') || '';

  const { 
    tendiks, meta, isLoading, isExporting, isImporting, 
    fetchTendiks, createTendik, updateTendik, deleteTendik, exportExcel, importExcel 
  } = useTendikStore();
  
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TendikForm>(EMPTY_TENDIK_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isFirstRender = useRef(true);

  useEffect(() => {
    fetchTendiks(urlPage, urlSearch);
  }, [fetchTendiks, urlPage, urlSearch]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (searchTerm !== urlSearch) {
        if (searchTerm) {
          current.set('search', searchTerm);
        } else {
          current.delete('search');
        }
        current.set('page', '1');
        const search = current.toString();
        router.push(`${pathname}${search ? `?${search}` : ""}`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, pathname, router, urlSearch]);

  const set = (field: keyof TendikForm, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Strip empty strings → null so backend treats them as nullable
    const payload: Record<string, string | number | null> = {};
    (Object.keys(formData) as (keyof TendikForm)[]).forEach(k => {
      const v = formData[k];
      if (v === '') {
        payload[k] = null;
      } else if (k === 'tahun_lulus' || k === 'tahun_pensiun' || k === 'batas_usia_pensiun') {
        payload[k] = Number(v);
      } else {
        payload[k] = v;
      }
    });
    try {
      if (editingId) {
        await updateTendik(editingId, payload);
        toast.success('Berhasil Diperbarui', { description: 'Perubahan pada data Tendik berhasil disimpan ke database.' });
      } else {
        await createTendik(payload);
        toast.success('Berhasil Ditambahkan', { description: 'Data Tendik baru telah sukses ditambahkan.' });
      }
      setIsModalOpen(false);
      setFormData(EMPTY_TENDIK_FORM);
      setEditingId(null);
    } catch (err) {
      toast.error('Gagal menyimpan data tendik. Silakan coba lagi.');
    }
  };

  const openEditModal = (tendik: any) => {
    const fmt = (v: string | null | undefined) => v ? v.split('T')[0] : '';
    setFormData({
      nama_lengkap:              tendik.nama_lengkap              ?? '',
      jenis_kelamin:             tendik.jenis_kelamin             ?? 'L',
      tempat_lahir:              tendik.tempat_lahir              ?? '',
      tanggal_lahir:             fmt(tendik.tanggal_lahir),
      nip_baru:                  tendik.nip_baru                  ?? '',
      golongan_cpns:             tendik.golongan_cpns             ?? '',
      tmt_cpns:                  fmt(tendik.tmt_cpns),
      golongan_pangkat:          tendik.golongan_pangkat          ?? '',
      tmt_pangkat:               fmt(tendik.tmt_pangkat),
      nama_jabatan:              tendik.nama_jabatan              ?? '',
      tmt_jabatan:               fmt(tendik.tmt_jabatan),
      tanggal_mulai_tugas_unit:  fmt(tendik.tanggal_mulai_tugas_unit),
      tanggal_mulai_keseluruhan: fmt(tendik.tanggal_mulai_keseluruhan),
      tanggal_mulai_golongan:    fmt(tendik.tanggal_mulai_golongan),
      nama_pendidikan:           tendik.nama_pendidikan           ?? '',
      tahun_lulus:               tendik.tahun_lulus != null ? String(tendik.tahun_lulus) : '',
      tingkat_ijazah:            tendik.tingkat_ijazah            ?? '',
      tmt_pensiun:               fmt(tendik.tmt_pensiun),
      tahun_pensiun:             tendik.tahun_pensiun != null ? String(tendik.tahun_pensiun) : '',
      batas_usia_pensiun:        tendik.batas_usia_pensiun != null ? String(tendik.batas_usia_pensiun) : '',
    });
    setEditingId(tendik.id);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteTendik(deleteConfirmId);
      toast.success('Berhasil Dihapus', { description: 'Data Tendik telah dihapus dari sistem.' });
    } catch (err) {
      toast.error('Gagal menghapus data tendik!');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', newPage.toString());
    router.push(`${pathname}?${current.toString()}`);
  };

  const inputCls = "input-premium";
  const labelCls = "form-label";
  const sectionCls = "form-section-divider";
  const sectionTitleCls = "form-section-title";

  return (
    <div className="pb-12 pt-1 relative">
      {/* Page Header */}
      <div className="mb-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="page-header-title">Manajemen Data Tendik</h1>
          <p className="page-header-subtitle">Kelola identitas Tenaga Kependidikan Fakultas Kedokteran UNAND</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download Template */}
          <a 
            href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/templates/Template_Import_Tendik.xlsx`}
            download
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5"
          >
            <Download className="w-4 h-4" />
            Template Impor
          </a>

          {/* Import */}
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            id="excel-upload-tendik" 
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                importExcel(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
          <label 
            htmlFor="excel-upload-tendik" 
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 ${isImporting ? 'opacity-60 pointer-events-none' : ''}`}
          >
            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Impor Excel
          </label>

          {/* Export */}
          <button 
            onClick={exportExcel} 
            disabled={isExporting} 
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 dark:bg-slate-700/80 dark:hover:bg-slate-600/80 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-slate-700/20 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Ekspor Excel
          </button>

          {/* Add */}
          <button 
            onClick={() => { setEditingId(null); setFormData(EMPTY_TENDIK_FORM); setIsModalOpen(true); }} 
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Tambah Tendik
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card-premium overflow-hidden">
        {/* Search Bar */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau NIP..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="search-input"
            />
          </div>
          {meta && (
            <p className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:block">
              {meta.total} data ditemukan
            </p>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left table-premium">
            <thead>
              <tr>
                <th>Nama Lengkap & NIP</th>
                <th>Jabatan / Golongan</th>
                <th>Pendidikan</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td>
                      <div className="skeleton-shimmer h-4 w-44 mb-2" />
                      <div className="skeleton-shimmer h-3 w-28" />
                    </td>
                    <td><div className="skeleton-shimmer h-6 w-24 rounded-full" /></td>
                    <td><div className="skeleton-shimmer h-4 w-20" /></td>
                    <td className="text-right"><div className="skeleton-shimmer h-8 w-16 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : tendiks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Users className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-400">Belum ada data Tendik yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : tendiks.map((tendik) => (
                <tr key={tendik.id} className="group">
                  <td>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{tendik.nama_lengkap}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{tendik.nip_baru || 'NIP BELUM DIATUR'}</p>
                  </td>
                  <td>
                    <span className="badge badge-amber">
                      {(tendik as any).nama_jabatan || 'STAF'}
                    </span>
                    {(tendik as any).golongan_pangkat && (
                      <p className="text-xs text-slate-400 mt-1">{(tendik as any).golongan_pangkat}</p>
                    )}
                  </td>
                  <td className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {(tendik as any).tingkat_ijazah || (tendik as any).nama_pendidikan || '—'}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(tendik)} 
                        className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(tendik.id)} 
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Hapus"
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

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800/80 gap-3">
            <button
              disabled={meta.current_page === 1}
              onClick={() => handlePageChange(meta.current_page - 1)}
              className="pagination-btn"
            >
              ← Sebelumnya
            </button>
            <span className="text-xs text-slate-400 font-medium">
              Halaman <span className="font-bold text-slate-700 dark:text-slate-200">{meta.current_page}</span> dari{' '}
              <span className="font-bold text-slate-700 dark:text-slate-200">{meta.last_page}</span>
              {' '}· Total <span className="font-bold text-slate-700 dark:text-slate-200">{meta.total}</span> entri
            </span>
            <button
              disabled={meta.current_page === meta.last_page}
              onClick={() => handlePageChange(meta.current_page + 1)}
              className="pagination-btn"
            >
              Selanjutnya →
            </button>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="modal-content w-full max-w-3xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {editingId ? 'Edit Data Tendik' : 'Tambah Tendik Baru'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Isi selengkap mungkin. Data duplikat (NIP sama) akan otomatis diperbarui.
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-1">

                {/* Bagian 1: Identitas Pribadi */}
                <div>
                  <p className={sectionTitleCls}>① Identitas Pribadi</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Nama Lengkap <span className="text-red-500">*</span></label>
                      <input required type="text" value={formData.nama_lengkap} onChange={e => set('nama_lengkap', e.target.value)} className={inputCls} placeholder="Budi Santoso, S.Kom" />
                    </div>
                    <div>
                      <label className={labelCls}>NIP Baru <span className="text-red-500">*</span></label>
                      <input required type="text" value={formData.nip_baru} onChange={e => set('nip_baru', e.target.value)} className={inputCls} placeholder="198001012006041001" />
                    </div>
                    <div>
                      <label className={labelCls}>Jenis Kelamin <span className="text-red-500">*</span></label>
                      <select required value={formData.jenis_kelamin} onChange={e => set('jenis_kelamin', e.target.value)} className={inputCls}>
                        <option value="L">Laki-laki (L)</option>
                        <option value="P">Perempuan (P)</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Tempat Lahir <span className="text-red-500">*</span></label>
                      <input required type="text" value={formData.tempat_lahir} onChange={e => set('tempat_lahir', e.target.value)} className={inputCls} placeholder="Padang" />
                    </div>
                    <div>
                      <label className={labelCls}>Tanggal Lahir <span className="text-red-500">*</span></label>
                      <input required type="date" value={formData.tanggal_lahir} onChange={e => set('tanggal_lahir', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Bagian 2: Kepangkatan */}
                <div className={sectionCls}>
                  <p className={sectionTitleCls}>② Kepangkatan</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Golongan CPNS</label>
                      <input type="text" value={formData.golongan_cpns} onChange={e => set('golongan_cpns', e.target.value)} className={inputCls} placeholder="II/a" />
                    </div>
                    <div>
                      <label className={labelCls}>TMT CPNS</label>
                      <input type="date" value={formData.tmt_cpns} onChange={e => set('tmt_cpns', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Golongan Pangkat</label>
                      <input type="text" value={formData.golongan_pangkat} onChange={e => set('golongan_pangkat', e.target.value)} className={inputCls} placeholder="III/b" />
                    </div>
                    <div>
                      <label className={labelCls}>TMT Pangkat</label>
                      <input type="date" value={formData.tmt_pangkat} onChange={e => set('tmt_pangkat', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Bagian 3: Jabatan */}
                <div className={sectionCls}>
                  <p className={sectionTitleCls}>③ Jabatan</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Nama Jabatan</label>
                      <input type="text" value={formData.nama_jabatan} onChange={e => set('nama_jabatan', e.target.value)} className={inputCls} placeholder="Pranata Komputer" />
                    </div>
                    <div>
                      <label className={labelCls}>TMT Jabatan</label>
                      <input type="date" value={formData.tmt_jabatan} onChange={e => set('tmt_jabatan', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Bagian 4: Masa Kerja */}
                <div className={sectionCls}>
                  <p className={sectionTitleCls}>④ Masa Kerja</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Tgl Mulai Tugas di Unit</label>
                      <input type="date" value={formData.tanggal_mulai_tugas_unit} onChange={e => set('tanggal_mulai_tugas_unit', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Tgl Mulai Keseluruhan</label>
                      <input type="date" value={formData.tanggal_mulai_keseluruhan} onChange={e => set('tanggal_mulai_keseluruhan', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Tgl Mulai Golongan</label>
                      <input type="date" value={formData.tanggal_mulai_golongan} onChange={e => set('tanggal_mulai_golongan', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Bagian 5: Pendidikan */}
                <div className={sectionCls}>
                  <p className={sectionTitleCls}>⑤ Pendidikan</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Nama Pendidikan</label>
                      <input type="text" value={formData.nama_pendidikan} onChange={e => set('nama_pendidikan', e.target.value)} className={inputCls} placeholder="Teknik Informatika" />
                    </div>
                    <div>
                      <label className={labelCls}>Tingkat Ijazah</label>
                      <input type="text" value={formData.tingkat_ijazah} onChange={e => set('tingkat_ijazah', e.target.value)} className={inputCls} placeholder="S1 / D3 / SMA" />
                    </div>
                    <div>
                      <label className={labelCls}>Tahun Lulus</label>
                      <input type="number" value={formData.tahun_lulus} onChange={e => set('tahun_lulus', e.target.value)} className={inputCls} placeholder="2005" min="1950" max="2099" />
                    </div>
                  </div>
                </div>

                {/* Bagian 6: Pensiun */}
                <div className={sectionCls}>
                  <p className={sectionTitleCls}>⑥ Data Pensiun</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>TMT Pensiun</label>
                      <input type="date" value={formData.tmt_pensiun} onChange={e => set('tmt_pensiun', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Tahun Pensiun</label>
                      <input type="number" value={formData.tahun_pensiun} onChange={e => set('tahun_pensiun', e.target.value)} className={inputCls} placeholder="2030" min="2000" max="2099" />
                    </div>
                    <div>
                      <label className={labelCls}>Batas Usia Pensiun</label>
                      <input type="number" value={formData.batas_usia_pensiun} onChange={e => set('batas_usia_pensiun', e.target.value)} className={inputCls} placeholder="58" min="50" max="70" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 pb-1 border-t border-slate-100 dark:border-slate-800 mt-5">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold disabled:opacity-65 transition-colors shadow-md shadow-amber-500/25"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Simpan Data Tendik
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Konfirmasi Hapus */}
      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Hapus Data Tendik?"
        message="Data yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan penghapusan ini?"
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmId(null)}
        isLoading={isLoading}
      />
    </div>
  );
}
