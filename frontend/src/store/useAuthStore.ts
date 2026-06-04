import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/lib/axios';

export interface User {
  id: string;
  email: string;
  role_id: number;
  department_id: number | null;
  role?: { id: number; role_name: string };
  department?: { id: number; name: string };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post('/api/auth/login', { email, password });
          const { user, token } = response.data;
          
          localStorage.setItem('auth_token', token);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.',
            isLoading: false,
            isAuthenticated: false
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await apiClient.post('/api/auth/logout');
        } finally {
          localStorage.removeItem('auth_token');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }
          const response = await apiClient.get('/api/auth/me');
          set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
          localStorage.removeItem('auth_token');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
