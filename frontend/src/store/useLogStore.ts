import { create } from 'zustand';
import apiClient from '@/lib/axios';

export interface LogEntry {
  id: number;
  user_id: string | null;
  action: string;
  description: string;
  ip_address: string | null;
  created_at: string;
  user?: { id: string; email: string } | null;
}

interface LogPagination {
  current_page: number;
  last_page: number;
  total: number;
}

interface LogState {
  logs: LogEntry[];
  pagination: LogPagination;
  isLoading: boolean;
  fetchLogs: (page?: number, search?: string) => Promise<void>;
}

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  pagination: { current_page: 1, last_page: 1, total: 0 },
  isLoading: false,

  fetchLogs: async (page = 1, search = '') => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get(`/api/activity-logs?page=${page}&search=${encodeURIComponent(search)}`);
      set({
        logs: res.data.data,
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
}));
