"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Loader2, CheckCircle, XCircle, Mail, Key, ShieldCheck, ChevronDown } from 'lucide-react';
import { useUserStore, User } from '@/store/useUserStore';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

// Assuming roles are fixed (1 = Super Admin, 2 = Admin Pegawai, 3 = Staff)
const ROLES = [
  { id: 1, name: 'Pimpinan / Dekan' },
  { id: 2, name: 'Administrator Kepegawaian' },
  { id: 3, name: 'Staff Operator' }
];

export default function UserManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const urlSearch = searchParams.get('search') || '';

  const { users, meta, isLoading, fetchUsers, createUser, updateUserRole, toggleActive } = useUserStore();
  const { user: currentUser } = useAuthStore();
  
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '', password: '', role_id: 2
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    fetchUsers(urlPage, urlSearch);
  }, [fetchUsers, urlPage, urlSearch]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(formData);
      import('sonner').then(({ toast }) => {
        toast.success('Berhasil Dibuat', { description: `Akun baru ${formData.email} berhasil ditambahkan.` });
      });
      setIsModalOpen(false);
      setFormData({ email: '', password: '', role_id: 2 });
    } catch (err) {
      import('sonner').then(({ toast }) => toast.error('Gagal membuat user'));
    }
  };

  const handlePageChange = (newPage: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', newPage.toString());
    router.push(`${pathname}?${current.toString()}`);
  };

  return (
    <div className="pb-12 pt-1 relative">
      {/* Header */}
      <div className="mb-7 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="page-header-title">Manajemen User</h1>
          <p className="page-header-subtitle">Kelola akun admin, konfigurasi akses, dan status pengguna</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="btn-primary self-start shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" />
          User Baru
        </button>
      </div>

      <div className="card-premium overflow-hidden flex flex-col min-h-[500px] relative">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari email user..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="search-input" 
            />
          </div>
          {meta && (
            <p className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:block">
              {meta.total} user ditemukan
            </p>
          )}
        </div>

        {/* List / Table Content */}
        <div className="flex-1 relative">
          {isLoading && users.length === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left table-premium">
              <thead>
                <tr>
                  <th>Informasi Akun</th>
                  <th>Peran (Role) Akses</th>
                  <th>Status Akun</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-500 font-medium">
                       Belum ada user yang terdaftar dalam sistem.
                    </td>
                  </tr>
                ) : users.map((user: User) => (
                  <tr key={user.id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 font-bold text-sm">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                            {user.email}
                          </div>
                          {currentUser?.id === user.id && (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 mt-0.5 block">
                              Anda Sendiri
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="relative inline-block w-48">
                        <select 
                          className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
                          value={user.role?.id || user.role_id}
                          onChange={(e) => {
                            const conf = window.confirm(`Ubah role akses untuk ${user.email}?`);
                            if (conf) updateUserRole(user.id, parseInt(e.target.value));
                          }}
                          disabled={currentUser?.id === user.id}
                        >
                          {ROLES.map(r => (
                            <option key={r.id} value={r.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                              {r.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${user.is_active ? 'badge-green' : 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400'}`}>
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="text-right">
                      {currentUser?.id !== user.id ? (
                        <button 
                          onClick={() => toggleActive(user.id)} 
                          className={`p-2 rounded-lg font-medium transition-colors ${
                            user.is_active 
                              ? 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                          }`}
                          title={user.is_active ? "Nonaktifkan Akses" : "Aktifkan Akses"}
                        >
                          {user.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic pr-2">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex justify-between items-center px-5 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 mt-auto">
            <button 
              disabled={meta.current_page === 1} 
              onClick={() => handlePageChange(meta.current_page - 1)} 
              className="pagination-btn"
            >
              ← Prev
            </button>
            <span className="text-xs font-semibold text-slate-500">
              Hal {meta.current_page} / {meta.last_page}
            </span>
            <button 
              disabled={meta.current_page === meta.last_page} 
              onClick={() => handlePageChange(meta.current_page + 1)} 
              className="pagination-btn"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Modal Tambah User */}
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
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Tambah Akun Baru</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Kredensial login akan disimpan dengan enkripsi</p>
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
                  <label className="form-label">Email Akun</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required 
                      type="email" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      className="input-premium pl-10" 
                      placeholder="nama@fk.unand.ac.id" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Kata Sandi Awal</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required 
                      minLength={6} 
                      type="password" 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                      className="input-premium pl-10" 
                      placeholder="Minimal 6 karakter" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Hak Akses / Peran</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      value={formData.role_id} 
                      onChange={e => setFormData({...formData, role_id: parseInt(e.target.value)})} 
                      className="input-premium pl-10 appearance-none"
                    >
                      {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
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
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} 
                    Buat User
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
