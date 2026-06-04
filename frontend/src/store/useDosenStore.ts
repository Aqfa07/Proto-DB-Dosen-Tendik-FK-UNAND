import { create } from 'zustand';
import apiClient from '@/lib/axios';

interface Dosen {
  id: string;
  nama_lengkap: string;
  nip: string | null;
  nidn: string | null;
  nidk: string | null;
  kategori_dosen: string;
  pangkat: string | null;
  golongan: string | null;
  jabatan_fungsional: string | null;
  departemen_bagian: string | null;
  tanggal_lahir: string | null;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

interface DosenState {
  dosens: Dosen[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  isExporting: boolean;
  isImporting: boolean;
  fetchDosens: (page?: number, search?: string, deptId?: number) => Promise<void>;
  createDosen: (data: any) => Promise<void>;
  updateDosen: (id: string, data: any) => Promise<void>;
  deleteDosen: (id: string) => Promise<void>;
  exportExcel: () => Promise<void>;
  importExcel: (file: File) => Promise<void>;
}

export const useDosenStore = create<DosenState>((set, get) => ({
  dosens: [],
  meta: null,
  isLoading: false,
  isExporting: false,
  isImporting: false,

  fetchDosens: async (page = 1, search = '', deptId) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) params.append('search', search);
      if (deptId) params.append('department_id', deptId.toString());

      const response = await apiClient.get('/api/dosens', { params });
      set({ 
        dosens: response.data.data,
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

  createDosen: async (data) => {
    set({ isLoading: true });
    try {
      await apiClient.post('/api/dosens', data);
      await get().fetchDosens(); 
    } finally {
      set({ isLoading: false });
    }
  },

  updateDosen: async (id, data) => {
    set({ isLoading: true });
    try {
      await apiClient.put(`/api/dosens/${id}`, data);
      await get().fetchDosens(get().meta?.current_page || 1);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDosen: async (id) => {
    set({ isLoading: true });
    try {
      await apiClient.delete(`/api/dosens/${id}`);
      await get().fetchDosens(get().meta?.current_page || 1);
    } finally {
      set({ isLoading: false });
    }
  },

  exportExcel: async () => {
    set({ isExporting: true });
    try {
      const response = await apiClient.get('/api/dosens/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data-dosen-fkunand.xlsx');
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
      await apiClient.post('/api/dosens/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await get().fetchDosens();
    } finally {
      set({ isImporting: false });
    }
  }
}));
