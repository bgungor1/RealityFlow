import { defineStore } from 'pinia';
import type { DashboardMetrics } from '~/types';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    data: null as DashboardMetrics | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchDashboard() {
      this.loading = true;
      this.error = null;
      try {
        const result = await useApiFetch<DashboardMetrics>('/dashboard');
        this.data = result;
        return result; // Restore for SSR
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to fetch dashboard data';
        throw err; // Restore for SSR
      } finally {
        this.loading = false;
      }
    },
  },
});
