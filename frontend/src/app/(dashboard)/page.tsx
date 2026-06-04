"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Activity, GraduationCap, Briefcase, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const { metrics, distribusiPangkat, isLoading, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = [
    { 
      title: 'Total Dosen', 
      value: metrics?.total_dosen ?? '-', 
      icon: GraduationCap, 
      gradient: 'from-indigo-500 to-violet-600',
      glow: 'shadow-indigo-500/25',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      change: '+3%',
    },
    { 
      title: 'Total Tendik', 
      value: metrics?.total_tendik ?? '-', 
      icon: Briefcase, 
      gradient: 'from-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/25',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      change: '+1%',
    },
    { 
      title: 'Dosen Tersertifikasi', 
      value: metrics?.persentase_sertifikasi_dosen ?? '-', 
      icon: UserCheck, 
      gradient: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/25',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      change: '+5%',
    },
    { 
      title: 'Aktivitas Data', 
      value: metrics?.aktivitas_update ?? 'Memuat...', 
      icon: Activity, 
      gradient: 'from-pink-500 to-rose-500',
      glow: 'shadow-pink-500/25',
      bg: 'bg-pink-50 dark:bg-pink-900/20',
      iconColor: 'text-pink-600 dark:text-pink-400',
      change: 'Live',
    },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 26 } }
  };

  const SkeletonValue = () => (
    <div className="h-9 w-20 skeleton-shimmer rounded-lg mt-1" />
  );

  const totalPangkat = distribusiPangkat?.reduce((acc: number, curr: any) => acc + Number(curr.total), 0) || 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = totalPangkat > 0 ? ((data.total / totalPangkat) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xl">
          <p className="font-bold text-slate-800 dark:text-slate-100 text-xs mb-1">{data.pangkat}</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-0.5">
            Jumlah: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{data.total}</span> orang
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Persentase: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{percent}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central" className="text-[11px] font-bold" style={{ pointerEvents: 'none', textShadow: '0px 1px 3px rgba(0,0,0,0.6)' }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="pb-12 pt-1">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-1">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header-title"
        >
          Dashboard Kinerja
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="page-header-subtitle"
        >
          Ringkasan statistik data Dosen & Tendik Triwulan berjalan · Fakultas Kedokteran UNAND
        </motion.p>
      </div>

      {/* Stat Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="stat-card group cursor-default"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {stat.title}
            </p>
            {isLoading ? (
              <SkeletonValue />
            ) : (
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {stat.value}
              </h3>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Charts & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 card-premium p-6 min-h-[380px] flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Distribusi Kepangkatan Dosen
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Berdasarkan data kepangkatan aktif</p>
            </div>
            <span className="badge badge-blue">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5 animate-pulse" />
              Live
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-48 h-48 rounded-full skeleton-shimmer" />
              </div>
            ) : distribusiPangkat.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribusiPangkat}
                    dataKey="total"
                    nameKey="pangkat"
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={108}
                    paddingAngle={4}
                    strokeWidth={2}
                    stroke="transparent"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {distribusiPangkat.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '0.75rem', fontFamily: 'Inter, sans-serif' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm text-slate-400 font-medium">Data kepangkatan belum tersedia.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="card-premium p-6 flex flex-col gap-4"
        >
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Informasi Sistem</h3>
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300">Autentikasi Aman</h4>
              </div>
              <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 leading-relaxed">
                Sesi dilindungi token Sanctum & Cookie CSRF yang dienkripsi.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">Data Real-time</h4>
              </div>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 leading-relaxed">
                Semua tabel dirender langsung dari Database PostgreSQL.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300">Arsip Triwulanan</h4>
              </div>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 leading-relaxed">
                Data dapat diarsipkan per kuartal sebagai snapshot permanen.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
