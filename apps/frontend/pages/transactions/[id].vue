<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- Loading State -->
    <div v-if="transactionStore.loading && !transaction" class="flex justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Error State -->
    <div v-else-if="transactionStore.error" class="bg-danger-50 text-danger-600 p-6 rounded-xl border border-danger-200">
      <h3 class="font-bold text-lg mb-2">Error Loading Transaction</h3>
      <p>{{ transactionStore.error }}</p>
      <NuxtLink to="/" class="mt-4 inline-block text-primary-600 font-medium hover:underline">Return to Dashboard</NuxtLink>
    </div>

    <!-- Content -->
    <template v-else-if="transaction">
      <!-- Breadcrumb / Back Navigation -->
      <div class="flex items-center gap-2 text-sm text-surface-500 mb-2">
        <NuxtLink to="/" class="hover:text-surface-900 flex items-center gap-1 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Transactions
        </NuxtLink>
        <span>/</span>
        <span class="text-surface-900 font-medium">TRX-{{ transaction._id.substring(18).toUpperCase() }}</span>
      </div>

      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <UiBaseBadge color="blue" class="mb-4">
            {{ transaction.stage === 'completed' ? 'Completed Transaction' : 'Active Transaction' }}
          </UiBaseBadge>
          <h1 class="text-3xl md:text-4xl font-bold text-surface-900 mb-2">{{ transaction.propertyAddress }}</h1>
          <div class="flex items-center gap-2 text-surface-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            RealityFlow Internal System
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-surface-200 min-w-[280px]">
          <div class="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-1">Total Service Fee</div>
          <div class="text-4xl font-black text-surface-900">{{ formatCurrency(transaction.totalServiceFee) }}</div>
        </div>
      </div>

      <!-- Transaction Progress Stepper -->
      <TransactionProgress 
        :currentStage="transaction.stage" 
        :stageHistory="transaction.stageHistory"
        :createdAt="transaction.createdAt"
        class="mb-6"
      />

      <!-- Grid Layout for Bottom Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Commission Distribution (Takes 2 columns) -->
        <div class="lg:col-span-2">
          <CommissionDistribution :transaction="transaction" />
        </div>
        
        <!-- Property Snapshot (Takes 1 column) -->
        <div class="lg:col-span-1">
          <PropertySnapshot 
            :address="transaction.propertyAddress"
            :type="transaction.propertyType"
            :stage="transaction.stage"
            :createdAt="transaction.createdAt"
          />
        </div>
      </div>
      
      <!-- Actions / Development Only (To test transitions) -->
      <div v-if="transaction.stage !== 'completed'" class="flex justify-end gap-3 pt-6">
        <button 
          @click="moveToNextStage" 
          :disabled="transactionStore.loading"
          class="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          Move to Next Stage
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useTransactionStore } from '~/stores/transaction';
import TransactionProgress from '~/components/transaction/TransactionProgress.vue';
import CommissionDistribution from '~/components/transaction/CommissionDistribution.vue';
import PropertySnapshot from '~/components/transaction/PropertySnapshot.vue';

const route = useRoute();
const transactionStore = useTransactionStore();

const transaction = computed(() => transactionStore.currentTransaction);

onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    await transactionStore.fetchById(id);
  }
});

const STAGES = ['agreement', 'earnest_money', 'title_deed', 'completed'];

const moveToNextStage = async () => {
  if (!transaction.value) return;
  const currentIndex = STAGES.indexOf(transaction.value.stage);
  if (currentIndex < STAGES.length - 1) {
    const nextStage = STAGES[currentIndex + 1];
    await transactionStore.transitionStage(transaction.value._id, nextStage);
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};
</script>
