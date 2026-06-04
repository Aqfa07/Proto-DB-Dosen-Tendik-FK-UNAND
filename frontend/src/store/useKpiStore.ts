import { create } from 'zustand';
import apiClient from '@/lib/axios';

export interface KpiDekan {
  id: number;
  tahun: number;
  indikator: string;
  target: number;
  realisasi_q1: number;
  realisasi_q2: number;
  realisasi_q3: number;
  realisasi_q4: number;
  total_realisasi: number;
  persentase_capaian: number;
}

interface KpiRingkasan {
  jumlah_indikator: number;
  total_target: number;
  total_realisasi: number;
  rata_rata_capaian: number;
}

interface KpiState {
  data: KpiDekan[];
  ringkasan: KpiRingkasan | null;
  tahun: number;
  isLoading: boolean;
  fetchKpi: (tahun?: number) => Promise<void>;
  createKpi: (payload: { tahun: number; indikator: string; target: number }) => Promise<void>;
  updateKpi: (id: number, payload: Partial<KpiDekan>) => Promise<void>;
  deleteKpi: (id: number) => Promise<void>;
}

export const useKpiStore = create<KpiState>((set, get) => ({
  data: [],
  ringkasan: null,
  tahun: new Date().getFullYear(),
  isLoading: false,

  fetchKpi: async (tahun?: number) => {
    const year = tahun ?? get().tahun;
    set({ isLoading: true, tahun: year });
    try {
      const res = await apiClient.get(`/api/kpi?tahun=${year}`);
      set({ data: res.data.data, ringkasan: res.data.ringkasan });
    } finally {
      set({ isLoading: false });
    }
  },

  createKpi: async (payload) => {
    await apiClient.post('/api/kpi', payload);
    await get().fetchKpi();
  },

  updateKpi: async (id, payload) => {
    await apiClient.put(`/api/kpi/${id}`, payload);
    await get().fetchKpi();
  },

  deleteKpi: async (id) => {
    await apiClient.delete(`/api/kpi/${id}`);
    await get().fetchKpi();
  },
}));
