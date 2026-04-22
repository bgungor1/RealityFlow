import { defineStore } from 'pinia';

interface AgentShare {
  agentId: string;
  agentName: string;
  role: 'listing' | 'selling' | 'both';
  amount: number;
  percentage: number;
}

interface Commission {
  totalPool: number;
  agencyAmount: number;
  agencyPercentage: number;
  agentShares: AgentShare[];
  calculatedAt: string;
}

interface Agent {
  _id: string;
  fullName: string;
  email: string;
}

interface Transaction {
  _id: string;
  propertyAddress: string;
  propertyType: 'sale' | 'rental';
  totalServiceFee: number;
  stage: string;
  listingAgentId: Agent;
  sellingAgentId: Agent;
  commission: Commission | null;
  stageHistory: { from: string; to: string; changedAt: string }[];
  createdAt: string;
  updatedAt: string;
}

interface CreateTransactionPayload {
  propertyAddress: string;
  propertyType: string;
  totalServiceFee: number;
  listingAgentId: string;
  sellingAgentId: string;
}

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    transactions: [] as Transaction[],
    currentTransaction: null as Transaction | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchAll(stage?: string) {
      this.loading = true;
      this.error = null;
      try {
        const config = useRuntimeConfig();
        const query = stage ? `?stage=${stage}` : '';
        const data = await $fetch<Transaction[]>(
          `/api/transactions${query}`,
          { baseURL: config.public.apiBase as string },
        );
        this.transactions = data;
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to fetch transactions';
      } finally {
        this.loading = false;
      }
    },

    async fetchById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const config = useRuntimeConfig();
        const data = await $fetch<Transaction>(
          `/api/transactions/${id}`,
          { baseURL: config.public.apiBase as string },
        );
        this.currentTransaction = data;
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to fetch transaction';
      } finally {
        this.loading = false;
      }
    },

    async create(payload: CreateTransactionPayload) {
      this.loading = true;
      this.error = null;
      try {
        const config = useRuntimeConfig();
        const data = await $fetch<Transaction>(
          '/api/transactions',
          {
            baseURL: config.public.apiBase as string,
            method: 'POST',
            body: payload,
          },
        );
        this.transactions.unshift(data);
        return data;
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to create transaction';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async transitionStage(id: string, targetStage: string) {
      this.loading = true;
      this.error = null;
      try {
        const config = useRuntimeConfig();
        const data = await $fetch<Transaction>(
          `/api/transactions/${id}/transition`,
          {
            baseURL: config.public.apiBase as string,
            method: 'PATCH',
            body: { targetStage },
          },
        );
        this.currentTransaction = data;
        const idx = this.transactions.findIndex(t => t._id === id);
        if (idx !== -1) this.transactions[idx] = data;
        return data;
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to transition stage';
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
