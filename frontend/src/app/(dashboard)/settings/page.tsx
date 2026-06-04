"use client";
import React, { useState } from 'react';
import { Key, Lock, ShieldCheck, User as UserIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import apiClient from '@/lib/axios';

export default function SettingsProfile() {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.new_password !== formData.new_password_confirmation) {
      setMessage({ text: 'Konfirmasi password baru tidak cocok!', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await apiClient.post('/api/auth/password', formData);
      setMessage({ text: response.data.message || 'Password berhasil diperbarui!', type: 'success' });
      setFormData({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || 'Gagal memperbarui password', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const initials = (user?.email || 'A').charAt(0).toUpperCase();

  return (
    <div className="pb-12 pt-1 relative">
      <div className="mb-7">
        <h1 className="page-header-title">Pengaturan Akun</h1>
        <p className="page-header-subtitle">Kelola profil dan keamanan akun Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="col-span-1">
          <div className="card-premium p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-4 text-white text-3xl font-bold shadow-lg shadow-indigo-500/25">
              {initials}
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {user?.role?.role_name === 'Dekan' ? 'Pimpinan / Dekan' : 'Administrator Sistem'}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>

            <div className="w-full mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4 text-left">
              <div>
                <p className="text-[10px] font-700 text-slate-400 uppercase tracking-widest font-bold mb-0.5">Role</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {user?.role?.role_name || 'Tidak ada role'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-700 text-slate-400 uppercase tracking-widest font-bold mb-0.5">Departemen</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {user?.department?.name || 'Fakultas Akses Induk'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-700 text-slate-400 uppercase tracking-widest font-bold mb-0.5">Status</p>
                <span className="badge badge-green">● Aktif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Form */}
        <div className="col-span-1 md:col-span-2">
          <div className="card-premium p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Ubah Password</h2>
                <p className="text-xs text-slate-400">Gunakan password yang kuat dan unik</p>
              </div>
            </div>

            {message.text && (
              <div className={`p-3.5 rounded-xl mb-5 text-sm font-medium ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40' 
                  : 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
              <div className="space-y-1.5">
                <label className="form-label">Password Saat Ini</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required 
                    type={showCurrent ? "text" : "password"}
                    value={formData.current_password} 
                    onChange={e => setFormData({...formData, current_password: e.target.value})} 
                    className="input-premium pl-10 pr-10"
                    placeholder="••••••••" 
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="form-label">Password Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required 
                    minLength={6}
                    type={showNew ? "text" : "password"}
                    value={formData.new_password} 
                    onChange={e => setFormData({...formData, new_password: e.target.value})} 
                    className="input-premium pl-10 pr-10"
                    placeholder="Minimal 6 karakter" 
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="form-label">Konfirmasi Password Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required 
                    minLength={6}
                    type={showConfirm ? "text" : "password"}
                    value={formData.new_password_confirmation} 
                    onChange={e => setFormData({...formData, new_password_confirmation: e.target.value})} 
                    className="input-premium pl-10 pr-10"
                    placeholder="Ulangi password baru" 
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="btn-primary"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
