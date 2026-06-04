import { create } from 'zustand';
import apiClient from '@/lib/axios';

interface SnapshotHistory {
  id: number;
  quarter: string;
  year: number;
  snapshot_date: string;
  created_by?: { id: number; email: string };
}

interface SnapshotState {
  history: SnapshotHistory[];
  isLoading: boolean;
  isArchiving: boolean;
  fetchHistory: () => Promise<void>;
  createSnapshot: (quarter: string, year: number) => Promise<void>;
}

export const useSnapshotStore = create<SnapshotState>((set, get) => ({
  history: [],
  isLoading: false,
  isArchiving: false,

  fetchHistory: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get('/api/snapshots');
      set({ history: response.data });
    } finally {
      set({ isLoading: false });
    }
  },

  createSnapshot: async (quarter: string, year: number) => {
    set({ isArchiving: true });
    try {
      await apiClient.post('/api/snapshots/finalize', { quarter, year });
      await get().fetchHistory();
    } finally {
      set({ isArchiving: false });
    }
  }
}));
