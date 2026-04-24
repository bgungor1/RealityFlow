import { defineStore } from 'pinia';
import type { Transaction } from '~/types';

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
        const query = stage ? `?stage=${stage}` : '';
        const data = await useApiFetch<Transaction[]>(`/api/transactions${query}`);
        this.transactions = data;
        return data;
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to fetch transactions';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const data = await useApiFetch<Transaction>(`/api/transactions/${id}`);
        this.currentTransaction = data;
        return data;
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to fetch transaction';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async create(payload: CreateTransactionPayload) {
      this.loading = true;
      this.error = null;
      try {
        const data = await useApiFetch<Transaction>('/api/transactions', {
          method: 'POST',
          body: payload,
        });
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
        const data = await useApiFetch<Transaction>(`/api/transactions/${id}/transition`, {
          method: 'PATCH',
          body: { targetStage },
        });
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
