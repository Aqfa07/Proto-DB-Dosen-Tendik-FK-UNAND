"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, UserSquare2, FileText, Settings, 
  LogOut, ChevronLeft, Menu, Target, UserCog, ScrollText,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: UserSquare2, label: 'Manajemen Dosen', path: '/dosen' },
    { icon: Users, label: 'Manajemen Tendik', path: '/tendik' },
    { icon: Target, label: 'Kinerja Dekan', path: '/kpi' },
    { icon: FileText, label: 'Arsip Triwulan', path: '/snapshots' },
    { icon: UserCog, label: 'Manajemen User', path: '/users' },
    { icon: ScrollText, label: 'Log Aktivitas', path: '/logs' },
    { icon: Settings, label: 'Pengaturan', path: '/settings' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 268 : 76 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="sidebar-premium sticky top-0 h-screen flex flex-col justify-between py-5 shrink-0 z-50 overflow-hidden"
    >
      {/* Top Section */}
      <div className="flex flex-col min-h-0">
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-4 mb-6">
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white leading-none">Database FK</h1>
                  <p className="text-[10px] text-slate-400 font-medium tracking-widest mt-0.5">UNAND</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isExpanded && (
            <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
          )}

          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-lg hover:bg-white/8 text-slate-500 hover:text-slate-300 transition-colors ml-auto"
              title="Perkecil menu"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {!isExpanded && (
          <div className="flex justify-center mb-5">
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-white transition-colors"
              title="Perluas menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Section Label */}
        {isExpanded && (
          <div className="px-4 mb-2">
            <span className="text-[10px] font-700 tracking-widest text-slate-600 uppercase">Menu Utama</span>
          </div>
        )}

        {/* Nav Items */}
        <nav className="px-3 space-y-0.5 flex-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={idx}
                href={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''} ${!isExpanded ? 'justify-center' : ''}`}
                title={!isExpanded ? item.label : undefined}
              >
                <item.icon className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} size={18} />
                <AnimatePresence mode="wait">
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip when collapsed */}
                {!isExpanded && (
                  <div className="absolute left-[68px] px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/8">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer — Logout */}
      <div className="px-3 mt-4 pt-4 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className={`sidebar-nav-item w-full hover:bg-red-500/12 hover:text-red-400 group ${!isExpanded ? 'justify-center' : ''}`}
          title={!isExpanded ? 'Keluar Sistem' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0 text-slate-500 group-hover:text-red-400 transition-colors" />
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Keluar Sistem
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
