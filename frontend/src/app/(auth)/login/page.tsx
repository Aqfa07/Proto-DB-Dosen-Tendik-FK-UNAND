"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ShieldAlert, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.');
    }
  };

  return (
    <div className="min-h-screen w-full flex-1 flex flex-col items-center justify-center p-4 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="card-premium w-full max-w-[420px] p-8 sm:p-10 !rounded-[2rem] border border-white/50 dark:border-slate-800/80 shadow-2xl shadow-indigo-500/10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-5 relative group">
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-white font-black text-2xl tracking-tighter">FK</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 text-center tracking-tight">
            Portal Admin
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 text-center font-medium leading-relaxed">
            Sistem Database Dosen & Tendik<br/>Fakultas Kedokteran UNAND
          </p>
        </div>

        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className="mb-5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm rounded-xl font-semibold flex items-start"
          >
            <ShieldAlert className="w-4 h-4 mr-2.5 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="form-label ml-1">Alamat Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@fk.unand.ac.id" 
                className="input-premium pl-11"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="form-label ml-1">Kata Sandi</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="input-premium pl-11 pr-11"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary w-full py-3.5 text-[15px]"
            >
              <span className="flex-1 text-center pr-3">
                {isLoading ? 'Memverifikasi...' : 'Masuk Sistem'}
              </span>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto absolute right-4" /> : <LogIn className="w-5 h-5 mx-auto absolute right-4" />}
            </button>
          </div>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Sesi Dilindungi Enkripsi AES-256</span>
        </div>
      </motion.div>
    </div>
  );
}
