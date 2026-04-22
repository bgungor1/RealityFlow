import { defineStore } from 'pinia';

interface TopAgent {
  agentId: string;
  agentName: string;
  totalEarnings: number;
  transactionCount: number;
}

interface DashboardData {
  totalTransactions: number;
  byStage: Record<string, number>;
  totalRevenue: number;
  agencyRevenue: number;
  recentTransactions: any[];
  topAgents: TopAgent[];
}

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    data: null as DashboardData | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchDashboard() {
      this.loading = true;
      this.error = null;
      try {
        const config = useRuntimeConfig();
        const result = await $fetch<DashboardData>(
          '/api/dashboard',
          { baseURL: config.public.apiBase as string },
        );
        this.data = result;
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to fetch dashboard data';
      } finally {
        this.loading = false;
      }
    },
  },
});
