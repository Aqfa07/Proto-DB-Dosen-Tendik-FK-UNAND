import { create } from 'zustand';
import apiClient from '@/lib/axios';

interface DashboardMetrics {
  total_dosen: number;
  total_tendik: number;
  persentase_sertifikasi_dosen: string;
  aktivitas_update: string;
}

interface DashboardState {
  metrics: DashboardMetrics | null;
  distribusiPangkat: any[];
  isLoading: boolean;
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: null,
  distribusiPangkat: [],
  isLoading: false,

  fetchDashboardData: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get('/api/dashboard/metrics');
      set({
        metrics: response.data.metrics,
        distribusiPangkat: response.data.charts.distribusi_pangkat_dosen,
      });
    } finally {
      set({ isLoading: false });
    }
  }
}));
