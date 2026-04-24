<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Transactions</h1>
        <p class="text-surface-500 text-sm mt-1">Manage and track all real estate transactions.</p>
      </div>
      <NuxtLink 
        to="/transactions/new" 
        class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-primary-700 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        New Transaction
      </NuxtLink>
    </div>

    <!-- Main Content -->
    <div class="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
      <!-- Controls -->
      <div class="p-4 border-b border-surface-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-50">
        <div class="relative w-full sm:w-72">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Search transactions..." 
            class="w-full pl-9 pr-4 py-2.5 bg-white border border-surface-200 rounded-lg text-sm text-surface-900 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none"
          >
        </div>
        
        <div class="flex gap-2">
          <select v-model="stageFilter" class="px-3 py-2.5 bg-white border border-surface-200 rounded-lg text-sm text-surface-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none cursor-pointer">
            <option value="">All Stages</option>
            <option v-for="stage in STAGE_ORDER" :key="stage" :value="stage">
              {{ stage.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }}
            </option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="transactionStore.loading" class="flex justify-center items-center p-12">
        <svg class="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-surface-600">
          <thead class="bg-surface-50 text-xs uppercase text-surface-500 border-b border-surface-200">
            <tr>
              <th scope="col" class="px-6 py-4 font-semibold">Property Address</th>
              <th scope="col" class="px-6 py-4 font-semibold">Type</th>
              <th scope="col" class="px-6 py-4 font-semibold">Stage</th>
              <th scope="col" class="px-6 py-4 font-semibold text-right">Service Fee</th>
              <th scope="col" class="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-200">
            <tr v-for="trx in filteredTransactions" :key="trx._id" class="hover:bg-surface-50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-medium text-surface-900 truncate max-w-xs">{{ trx.propertyAddress }}</div>
                <div class="text-xs text-surface-400 mt-0.5">ID: {{ trx._id.substring(0, 8).toUpperCase() }}</div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize"
                  :class="trx.propertyType === 'sale' ? 'bg-primary-50 text-primary-700' : 'bg-success-50 text-success-700'"
                >
                  {{ trx.propertyType }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :class="getStageDotColor(trx.stage)"></div>
                  <span class="font-medium text-surface-700 capitalize">{{ trx.stage.replace('_', ' ') }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right font-semibold text-surface-900">
                {{ formatCurrency(trx.totalServiceFee) }}
              </td>
              <td class="px-6 py-4 text-right">
                <NuxtLink 
                  :to="`/transactions/${trx._id}`" 
                  class="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium text-sm transition-colors"
                >
                  View Details
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </NuxtLink>
              </td>
            </tr>
            <tr v-if="!filteredTransactions.length">
              <td colspan="5" class="px-6 py-12 text-center">
                <div class="text-surface-400 mb-2">
                  <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p class="text-surface-600 font-medium">No transactions found</p>
                <p class="text-surface-500 text-sm mt-1">Try adjusting your filters or create a new transaction.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTransactionStore } from '~/stores/transaction';
import { TransactionStage, STAGE_ORDER } from '~/constants/transaction';

const transactionStore = useTransactionStore();

const searchQuery = ref('');
const stageFilter = ref('');

// Fetch all transactions on mount
onMounted(async () => {
  await transactionStore.fetchAll();
});

const filteredTransactions = computed(() => {
  let result = transactionStore.transactions || [];

  if (stageFilter.value) {
    result = result.filter(t => t.stage === stageFilter.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(t => 
      t.propertyAddress.toLowerCase().includes(query) || 
      t._id.toLowerCase().includes(query)
    );
  }

  return result;
});

const formatCurrency = (value: number) => {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

const getStageDotColor = (stage: string) => {
  switch (stage) {
    case TransactionStage.AGREEMENT: return 'bg-surface-400';
    case TransactionStage.EARNEST_MONEY: return 'bg-warning-400';
    case TransactionStage.TITLE_DEED: return 'bg-primary-400';
    case TransactionStage.COMPLETED: return 'bg-success-400';
    default: return 'bg-surface-300';
  }
};
</script>
