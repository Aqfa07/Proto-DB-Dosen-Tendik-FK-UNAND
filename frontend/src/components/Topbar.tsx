"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Bell, UserCircle, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = (user?.email || 'A').charAt(0).toUpperCase();

  return (
    <header className="topbar-premium mx-4 px-5 py-3 flex items-center justify-between mb-8 sticky top-4 z-40">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-200">Portal Admin</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-xs text-slate-500">Fakultas Kedokteran UNAND</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2" ref={dropdownRef}>

        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="w-[18px] h-[18px] text-slate-500 dark:text-slate-400" />
            <span className="absolute top-[7px] right-[7px] w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          {notifOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 card-premium p-4 z-50">
              <h4 className="text-xs font-800 text-slate-700 dark:text-slate-200 mb-1 font-bold">Notifikasi</h4>
              <p className="text-xs text-slate-400 text-center py-6">Tidak ada notifikasi baru saat ini.</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* User */}
        <button
          onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25 text-white font-bold text-sm">
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none">
              {user?.email?.split('@')[0] || 'Admin'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{user?.role?.role_name || 'Administrator'}</p>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden md:block ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute top-full right-4 mt-2 w-52 card-premium py-1.5 z-50">
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.email}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{user?.role?.role_name}</p>
            </div>
            <button
              onClick={() => { setDropdownOpen(false); router.push('/settings'); }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              Pengaturan
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Keluar Sistem
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
