import { create } from 'zustand';
import apiClient from '@/lib/axios';

interface Tendik {
  id: string;
  nama_lengkap: string;
  nip_baru: string;
  nama_jabatan: string | null;
  golongan_pangkat: string | null;
  nama_pendidikan: string | null;
  tingkat_ijazah: string | null;
  tanggal_lahir: string | null;
  tmt_pensiun: string | null;
  tanggal_mulai_tugas_unit: string | null;
  tanggal_mulai_keseluruhan: string | null;
  tanggal_mulai_golongan: string | null;
  department?: { id: number; name: string };
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

interface TendikState {
  tendiks: Tendik[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  isExporting: boolean;
  isImporting: boolean;
  fetchTendiks: (page?: number, search?: string, deptId?: number) => Promise<void>;
  createTendik: (data: any) => Promise<void>;
  updateTendik: (id: string, data: any) => Promise<void>;
  deleteTendik: (id: string) => Promise<void>;
  exportExcel: () => Promise<void>;
  importExcel: (file: File) => Promise<void>;
}

export const useTendikStore = create<TendikState>((set, get) => ({
  tendiks: [],
  meta: null,
  isLoading: false,
  isExporting: false,
  isImporting: false,

  fetchTendiks: async (page = 1, search = '', deptId) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) params.append('search', search);
      if (deptId) params.append('department_id', deptId.toString());

      const response = await apiClient.get('/api/tendiks', { params });
      set({ 
        tendiks: response.data.data,
        meta: {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total
        }
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createTendik: async (data) => {
    set({ isLoading: true });
    try {
      await apiClient.post('/api/tendiks', data);
      await get().fetchTendiks();
    } finally {
      set({ isLoading: false });
    }
  },

  updateTendik: async (id: string, data) => {
    set({ isLoading: true });
    try {
      await apiClient.put(`/api/tendiks/${id}`, data);
      await get().fetchTendiks(get().meta?.current_page || 1);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTendik: async (id: string) => {
    set({ isLoading: true });
    try {
      await apiClient.delete(`/api/tendiks/${id}`);
      await get().fetchTendiks(get().meta?.current_page || 1);
    } finally {
      set({ isLoading: false });
    }
  },

  exportExcel: async () => {
    set({ isExporting: true });
    try {
      const response = await apiClient.get('/api/tendiks/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data-tendik-fkunand.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } finally {
      set({ isExporting: false });
    }
  },

  importExcel: async (file: File) => {
    set({ isImporting: true });
    try {
      const formData = new FormData();
      formData.append('file', file);
      await apiClient.post('/api/tendiks/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await get().fetchTendiks();
    } finally {
      set({ isImporting: false });
    }
  }
}));
