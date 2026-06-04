import { create } from 'zustand';
import apiClient from '@/lib/axios';

export interface User {
  id: string;
  email: string;
  role: { id: number, name: string };
  department?: { id: number, name: string } | null;
  is_active: boolean;
  role_id: number;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

interface UserState {
  users: User[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  fetchUsers: (page?: number, search?: string) => Promise<void>;
  createUser: (data: any) => Promise<void>;
  updateUserRole: (id: string, roleId: number, departmentId?: number | null) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  meta: null,
  isLoading: false,

  fetchUsers: async (page = 1, search = '') => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) params.append('search', search);

      const response = await apiClient.get('/api/users', { params });
      set({ 
        users: response.data.data,
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

  createUser: async (data) => {
    set({ isLoading: true });
    try {
      await apiClient.post('/api/users', data);
      await get().fetchUsers();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Gagal membuat user');
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserRole: async (id, roleId, departmentId) => {
    set({ isLoading: true });
    try {
      await apiClient.put(`/api/users/${id}/role`, { role_id: roleId, department_id: departmentId });
      await get().fetchUsers(get().meta?.current_page || 1);
    } catch (e: any) {
      alert('Gagal mengubah role');
    } finally {
      set({ isLoading: false });
    }
  },

  toggleActive: async (id) => {
    set({ isLoading: true });
    try {
      await apiClient.patch(`/api/users/${id}/toggle-active`);
      await get().fetchUsers(get().meta?.current_page || 1);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Gagal mengubah status');
    } finally {
      set({ isLoading: false });
    }
  }
}));
