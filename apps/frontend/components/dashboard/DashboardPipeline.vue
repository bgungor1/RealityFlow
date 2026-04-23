<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-surface-900">Active Pipeline</h2>
      <div class="flex gap-1 items-center">
        <button class="p-2 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors" title="Options">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="flex gap-6 overflow-x-auto pb-4 hide-scrollbar w-full">
      <!-- Columns -->
      <div v-for="column in columns" :key="column.id" class="flex-1 min-w-[320px] flex flex-col">
        <!-- Column Header -->
        <div class="flex items-center justify-between mb-3 px-1">
          <div class="flex items-center gap-2">
            <!-- Agreement Icon -->
            <svg v-if="column.id === 'agreement'" class="w-5 h-5 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <!-- Earnest Money Icon -->
            <svg v-else-if="column.id === 'earnest_money'" class="w-5 h-5 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <!-- Title Deed Icon -->
            <svg v-else-if="column.id === 'title_deed'" class="w-5 h-5 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <!-- Completed Icon -->
            <svg v-else-if="column.id === 'completed'" class="w-5 h-5 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="font-medium text-surface-800">{{ column.title }}</h3>
          </div>
          <span class="bg-surface-200 text-surface-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-surface-300">
            {{ getTransactionsByStage(column.id).length }}
          </span>
        </div>

        <!-- Column Body (Kanban Area) -->
        <div class="flex-1 bg-surface-100/50 rounded-xl p-3 flex flex-col gap-3 min-h-[400px] border border-surface-200/50">
          <NuxtLink 
            v-for="trx in getTransactionsByStage(column.id)" 
            :key="trx._id"
            :to="`/transactions/${trx._id}`"
            class="bg-white rounded-lg p-4 shadow-sm border border-surface-200 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group"
          >
            <div class="flex justify-between items-start mb-2">
              <UiBaseBadge :color="getBadgeColor(trx.propertyType)">
                {{ trx.propertyType === 'sale' ? 'Sale' : 'Rental' }}
              </UiBaseBadge>
              <button 
                v-if="trx.stage !== 'completed'"
                @click.prevent="moveToNextStage(trx)" 
                class="text-primary-600 hover:text-primary-800 bg-primary-50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
              >
                Next
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            
            <h4 class="font-semibold text-surface-900 mb-1 truncate">{{ trx.propertyAddress }}</h4>
            <div class="text-sm font-bold text-primary-600 mb-4">{{ formatCurrency(trx.totalServiceFee) }}</div>

            <div class="space-y-2 text-xs text-surface-600">
              <div class="flex justify-between">
                <span>Listing:</span>
                <span class="font-medium text-surface-900">{{ trx.listingAgentId?.fullName || 'Unknown' }}</span>
              </div>
              <div class="flex justify-between">
                <span>Selling:</span>
                <span class="font-medium text-surface-900">{{ trx.sellingAgentId?.fullName || 'Unknown' }}</span>
              </div>
            </div>
          </NuxtLink>

          <!-- Empty State for Column -->
          <div v-if="getTransactionsByStage(column.id).length === 0" class="h-full flex items-center justify-center text-sm text-surface-400 border-2 border-dashed border-surface-200 rounded-lg py-8">
            No transactions
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTransactionStore } from '~/stores/transaction';
import { useDashboardStore } from '~/stores/dashboard';

const props = defineProps<{
  transactions: any[];
}>();

const transactionStore = useTransactionStore();
const dashboardStore = useDashboardStore();

const columns = [
  { id: 'agreement', title: 'Agreement' },
  { id: 'earnest_money', title: 'Earnest Money' },
  { id: 'title_deed', title: 'Title Deed' },
  { id: 'completed', title: 'Completed' },
];

const STAGES = ['agreement', 'earnest_money', 'title_deed', 'completed'];

const moveToNextStage = async (trx: any) => {
  const currentIndex = STAGES.indexOf(trx.stage);
  if (currentIndex < STAGES.length - 1) {
    const nextStage = STAGES[currentIndex + 1];
    await transactionStore.transitionStage(trx._id, nextStage);
    // Refresh dashboard to recalculate totals
    await dashboardStore.fetchDashboard();
  }
};

const getTransactionsByStage = (stageId: string) => {
  return props.transactions?.filter(t => t.stage === stageId) || [];
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

const getBadgeColor = (type: string) => {
  return type === 'sale' ? 'blue' : 'green';
};
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>