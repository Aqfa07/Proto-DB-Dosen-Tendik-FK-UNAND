import { create } from 'zustand';
import apiClient from '@/lib/axios';

export interface ManagedUser {
  id: string;
  email: string;
  role_id: number;
  department_id: number | null;
  is_active: boolean;
  role?: { id: number; role_name: string };
  department?: { id: number; name: string };
  created_at: string;
}

interface UserPagination {
  current_page: number;
  last_page: number;
  total: number;
}

interface UserMgmtState {
  users: ManagedUser[];
  pagination: UserPagination;
  isLoading: boolean;
  fetchUsers: (page?: number, search?: string) => Promise<void>;
  createUser: (payload: { email: string; password: string; role_id: number; department_id?: number | null }) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  updateRole: (id: string, payload: { role_id: number; department_id?: number | null }) => Promise<void>;
}

export const useUserMgmtStore = create<UserMgmtState>((set, get) => ({
  users: [],
  pagination: { current_page: 1, last_page: 1, total: 0 },
  isLoading: false,

  fetchUsers: async (page = 1, search = '') => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get(`/api/users?page=${page}&search=${encodeURIComponent(search)}`);
      set({
        users: res.data.data,
        pagination: {
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          total: res.data.total,
        },
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createUser: async (payload) => {
    await apiClient.post('/api/users', payload);
    await get().fetchUsers(get().pagination.current_page);
  },

  toggleActive: async (id) => {
    await apiClient.patch(`/api/users/${id}/toggle-active`);
    await get().fetchUsers(get().pagination.current_page);
  },

  updateRole: async (id, payload) => {
    await apiClient.put(`/api/users/${id}/role`, payload);
    await get().fetchUsers(get().pagination.current_page);
  },
}));
