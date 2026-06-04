"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Loader2, Download, Upload, ChevronDown, GraduationCap } from 'lucide-react';
import { useDosenStore } from '@/store/useDosenStore';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const ConfirmModal = dynamic(() => import('@/components/ConfirmModal'), { ssr: false });

const EMPTY_DOSEN_FORM = {
  // Identitas Pribadi
  nama_lengkap: '',
  jenis_kelamin: 'L',
  tempat_lahir: '',
  tanggal_lahir: '',
  // Kepegawaian & ID
  nip: '',
  nidn: '',
  nuptk: '',
  nidk: '',
  tmt_nidk_terbit: '',
  unit_kerja: '',
  tmt_cpns: '',
  tmt_pensiun: '',
  // Kepangkatan & Jabatan
  pangkat: '',
  golongan: '',
  tmt_pangkat: '',
  masa_kerja_pangkat: '',
  jabatan_fungsional: '',
  tmt_fungsional: '',
  masa_kerja_fungsional: '',
  masa_kerja_keseluruhan: '',
  // Akademik
  departemen_bagian: '',
  home_base: '',
  pendidikan_terakhir: '',
  bidang_keahlian: '',
  tahun_lulus: '',
  tingkat_pendidik: '',
  // Kategori
  kategori_dosen: 'Dosen NIDN',
};

type DosenForm = typeof EMPTY_DOSEN_FORM;

export default function DosenManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const urlSearch = searchParams.get('search') || '';

  const { 
    dosens, meta, isLoading, isExporting, isImporting, 
    fetchDosens, createDosen, updateDosen, deleteDosen, exportExcel, importExcel 
  } = useDosenStore();
  
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DosenForm>(EMPTY_DOSEN_FORM);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTemplateDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isFirstRender = useRef(true);

  useEffect(() => {
    fetchDosens(urlPage, urlSearch);
  }, [fetchDosens, urlPage, urlSearch]);

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

  const set = (field: keyof DosenForm, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Strip empty strings → undefined so backend treats them as nullable
    const payload: Record<string, string | null> = {};
    (Object.keys(formData) as (keyof DosenForm)[]).forEach(k => {
      payload[k] = formData[k] === '' ? null : formData[k];
    });
    try {
      if (editingId) {
        await updateDosen(editingId, payload);
        toast.success('Berhasil Diperbarui', { description: 'Perubahan pada data Dosen berhasil disimpan ke database.' });
      } else {
        await createDosen(payload);
        toast.success('Berhasil Ditambahkan', { description: 'Data Dosen baru telah sukses ditambahkan.' });
      }
      setIsModalOpen(false);
      setFormData(EMPTY_DOSEN_FORM);
      setEditingId(null);
    } catch (err) {
      toast.error('Gagal menyimpan data dosen. Silakan coba lagi.');
    }
  };

  const openEditModal = (dosen: any) => {
    const fmt = (v: string | null | undefined) => v ? v.split('T')[0] : '';
    setFormData({
      nama_lengkap:           dosen.nama_lengkap         ?? '',
      jenis_kelamin:          dosen.jenis_kelamin         ?? 'L',
      tempat_lahir:           dosen.tempat_lahir          ?? '',
      tanggal_lahir:          fmt(dosen.tanggal_lahir),
      nip:                    dosen.nip                   ?? '',
      nidn:                   dosen.nidn                  ?? '',
      nuptk:                  dosen.nuptk                 ?? '',
      nidk:                   dosen.nidk                  ?? '',
      tmt_nidk_terbit:        fmt(dosen.tmt_nidk_terbit),
      unit_kerja:             dosen.unit_kerja            ?? '',
      tmt_cpns:               fmt(dosen.tmt_cpns),
      tmt_pensiun:            fmt(dosen.tmt_pensiun),
      pangkat:                dosen.pangkat               ?? '',
      golongan:               dosen.golongan              ?? '',
      tmt_pangkat:            fmt(dosen.tmt_pangkat),
      masa_kerja_pangkat:     dosen.masa_kerja_pangkat    ?? '',
      jabatan_fungsional:     dosen.jabatan_fungsional    ?? '',
      tmt_fungsional:         fmt(dosen.tmt_fungsional),
      masa_kerja_fungsional:  dosen.masa_kerja_fungsional ?? '',
      masa_kerja_keseluruhan: dosen.masa_kerja_keseluruhan ?? '',
      departemen_bagian:      dosen.departemen_bagian     ?? '',
      home_base:              dosen.home_base             ?? '',
      pendidikan_terakhir:    dosen.pendidikan_terakhir   ?? '',
      bidang_keahlian:        dosen.bidang_keahlian       ?? '',
      tahun_lulus:            dosen.tahun_lulus != null ? String(dosen.tahun_lulus) : '',
      tingkat_pendidik:       dosen.tingkat_pendidik != null ? String(dosen.tingkat_pendidik) : '',
      kategori_dosen:         dosen.kategori_dosen        ?? 'Dosen NIDN',
    });
    setEditingId(dosen.id);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteDosen(deleteConfirmId);
      toast.success('Berhasil Dihapus', { description: 'Data Dosen telah dihapus dari sistem.' });
    } catch (err) {
      toast.error('Gagal menghapus data dosen!');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', newPage.toString());
    router.push(`${pathname}?${current.toString()}`);
  };

  // Reusable field components
  const inputCls = "input-premium";
  const labelCls = "form-label";
  const sectionCls = "form-section-divider";
  const sectionTitleCls = "form-section-title";

  return (
    <div className="pb-12 pt-1 relative">
      {/* Page Header */}
      <div className="mb-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="page-header-title">Manajemen Data Dosen</h1>
          <p className="page-header-subtitle">Kelola identitas dan kepangkatan Dosen Fakultas Kedokteran UNAND</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Template dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              Template Impor
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTemplateDropdown ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showTemplateDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 4, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 w-52 card-premium py-1.5 overflow-hidden"
                >
                  <a 
                    href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/templates/Template_Import_NIDN.xlsx`}
                    download
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    Template NIDN (.xlsx)
                  </a>
                  <a 
                    href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/templates/Template_Import_NIDK.xlsx`}
                    download
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    Template NIDK (.xlsx)
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            id="excel-upload" 
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                importExcel(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
          <label 
            htmlFor="excel-upload" 
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-500/25 hover:-translate-y-0.5 ${isImporting ? 'opacity-60 pointer-events-none' : ''}`}
          >
            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Impor
          </label>
          <button 
            onClick={exportExcel} 
            disabled={isExporting} 
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-slate-700/20 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Ekspor
          </button>
          <button 
            onClick={() => { setEditingId(null); setFormData(EMPTY_DOSEN_FORM); setIsModalOpen(true); }} 
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Tambah Dosen
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card-premium overflow-hidden">
        {/* Search */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau NIP/NIDN..." 
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
                <th>Nama Lengkap & Identitas</th>
                <th>Status</th>
                <th>Pangkat / Gol</th>
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
              ) : dosens.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <GraduationCap className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-400">Belum ada data Dosen yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : dosens.map((dosen) => (
                <tr key={dosen.id} className="group">
                  <td>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{dosen.nama_lengkap}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{dosen.nip || dosen.nidn || dosen.nidk || 'NIP/NIDN BELUM DIATUR'}</p>
                    {(dosen as any).jabatan_fungsional && (
                      <p className="text-xs text-indigo-500 mt-0.5 font-medium">{(dosen as any).jabatan_fungsional}</p>
                    )}
                    {(dosen as any).departemen_bagian && (
                      <p className="text-xs text-slate-400 mt-0.5">{(dosen as any).departemen_bagian}</p>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-blue">{dosen.kategori_dosen}</span>
                  </td>
                  <td className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {dosen.pangkat ? `${dosen.pangkat}${(dosen as any).golongan ? ` / ${(dosen as any).golongan}` : ''}` : '—'}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(dosen)} 
                        className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(dosen.id)} 
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
                    {editingId ? 'Edit Data Dosen' : 'Tambah Dosen Baru'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Isi selengkap mungkin. Data duplikat (NIP/NIDN/NIDK sama) akan otomatis diperbarui.
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

                {/* Kategori */}
                <div>
                  <label className={labelCls}>Kategori Dosen <span className="text-red-500">*</span></label>
                  <select value={formData.kategori_dosen} onChange={e => set('kategori_dosen', e.target.value)} className={inputCls} required>
                    <option value="Dosen NIDN">Dosen NIDN</option>
                    <option value="Dosen NIDK">Dosen NIDK</option>
                  </select>
                </div>

                {/* Bagian 1: Identitas Pribadi */}
                <div className={sectionCls}>
                  <p className={sectionTitleCls}>① Identitas Pribadi</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Nama Lengkap <span className="text-red-500">*</span></label>
                      <input required type="text" value={formData.nama_lengkap} onChange={e => set('nama_lengkap', e.target.value)} className={inputCls} placeholder="Prof. Dr. Budi Santoso, M.Sc." />
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

                {/* Bagian 2: Kepegawaian & ID */}
                <div className={sectionCls}>
                  <p className={sectionTitleCls}>② Kepegawaian & Nomor Identitas</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>NIP</label>
                      <input type="text" value={formData.nip} onChange={e => set('nip', e.target.value)} className={inputCls} placeholder="198001012006041001" />
                    </div>
                    <div>
                      <label className={labelCls}>NIDN</label>
                      <input type="text" value={formData.nidn} onChange={e => set('nidn', e.target.value)} className={inputCls} placeholder="0012345678" />
                    </div>
                    <div>
                      <label className={labelCls}>NIDK</label>
                      <input type="text" value={formData.nidk} onChange={e => set('nidk', e.target.value)} className={inputCls} placeholder="8812345678" />
                    </div>
                    <div>
                      <label className={labelCls}>NUPTK</label>
                      <input type="text" value={formData.nuptk} onChange={e => set('nuptk', e.target.value)} className={inputCls} placeholder="1234567890123456" />
                    </div>
                    <div>
                      <label className={labelCls}>TMT NIDK Terbit</label>
                      <input type="date" value={formData.tmt_nidk_terbit} onChange={e => set('tmt_nidk_terbit', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Unit Kerja</label>
                      <input type="text" value={formData.unit_kerja} onChange={e => set('unit_kerja', e.target.value)} className={inputCls} placeholder="Bagian Ilmu Bedah" />
                    </div>
                    <div>
                      <label className={labelCls}>TMT CPNS</label>
                      <input type="date" value={formData.tmt_cpns} onChange={e => set('tmt_cpns', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>TMT Pensiun</label>
                      <input type="date" value={formData.tmt_pensiun} onChange={e => set('tmt_pensiun', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Bagian 3: Kepangkatan & Jabatan */}
                <div className={sectionCls}>
                  <p className={sectionTitleCls}>③ Kepangkatan & Jabatan</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Pangkat</label>
                      <input type="text" value={formData.pangkat} onChange={e => set('pangkat', e.target.value)} className={inputCls} placeholder="Pembina Utama Muda" />
                    </div>
                    <div>
                      <label className={labelCls}>Golongan</label>
                      <input type="text" value={formData.golongan} onChange={e => set('golongan', e.target.value)} className={inputCls} placeholder="IV/c" />
                    </div>
                    <div>
                      <label className={labelCls}>TMT Pangkat</label>
                      <input type="date" value={formData.tmt_pangkat} onChange={e => set('tmt_pangkat', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Masa Kerja Pangkat</label>
                      <input type="text" value={formData.masa_kerja_pangkat} onChange={e => set('masa_kerja_pangkat', e.target.value)} className={inputCls} placeholder="02 Tahun 03 Bulan" />
                    </div>
                    <div>
                      <label className={labelCls}>Jabatan Fungsional</label>
                      <input type="text" value={formData.jabatan_fungsional} onChange={e => set('jabatan_fungsional', e.target.value)} className={inputCls} placeholder="Guru Besar" />
                    </div>
                    <div>
                      <label className={labelCls}>TMT Fungsional</label>
                      <input type="date" value={formData.tmt_fungsional} onChange={e => set('tmt_fungsional', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Masa Kerja Fungsional</label>
                      <input type="text" value={formData.masa_kerja_fungsional} onChange={e => set('masa_kerja_fungsional', e.target.value)} className={inputCls} placeholder="10 Tahun 02 Bulan" />
                    </div>
                    <div>
                      <label className={labelCls}>Masa Kerja Keseluruhan</label>
                      <input type="text" value={formData.masa_kerja_keseluruhan} onChange={e => set('masa_kerja_keseluruhan', e.target.value)} className={inputCls} placeholder="20 Tahun 05 Bulan" />
                    </div>
                  </div>
                </div>

                {/* Bagian 4: Data Akademik */}
                <div className={sectionCls}>
                  <p className={sectionTitleCls}>④ Data Akademik</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Departemen / Bagian</label>
                      <input type="text" value={formData.departemen_bagian} onChange={e => set('departemen_bagian', e.target.value)} className={inputCls} placeholder="Bagian Ilmu Bedah" />
                    </div>
                    <div>
                      <label className={labelCls}>Home Base</label>
                      <input type="text" value={formData.home_base} onChange={e => set('home_base', e.target.value)} className={inputCls} placeholder="Universitas Andalas" />
                    </div>
                    <div>
                      <label className={labelCls}>Pendidikan Terakhir</label>
                      <input type="text" value={formData.pendidikan_terakhir} onChange={e => set('pendidikan_terakhir', e.target.value)} className={inputCls} placeholder="S3 / Doktor" />
                    </div>
                    <div>
                      <label className={labelCls}>Bidang Keahlian</label>
                      <input type="text" value={formData.bidang_keahlian} onChange={e => set('bidang_keahlian', e.target.value)} className={inputCls} placeholder="Bedah Onkologi" />
                    </div>
                    <div>
                      <label className={labelCls}>Tahun Lulus</label>
                      <input type="number" value={formData.tahun_lulus} onChange={e => set('tahun_lulus', e.target.value)} className={inputCls} placeholder="2005" min="1950" max="2099" />
                    </div>
                    <div>
                      <label className={labelCls}>Tingkat Pendidik</label>
                      <input type="number" value={formData.tingkat_pendidik} onChange={e => set('tingkat_pendidik', e.target.value)} className={inputCls} placeholder="3" />
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
                    className="btn-primary"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Simpan Data Dosen
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Hapus Data Dosen?"
        message="Data yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan penghapusan ini?"
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmId(null)}
        isLoading={isLoading}
      />
    </div>
  );
}
