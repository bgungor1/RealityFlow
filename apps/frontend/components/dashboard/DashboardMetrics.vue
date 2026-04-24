<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Total Commission -->
    <div class="card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold tracking-wider text-surface-500 uppercase">Total Commission</h3>
        <div class="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div>
        <div class="text-3xl font-bold text-surface-900">{{ formatCurrency(data?.totalRevenue || 0) }}</div>
        <div class="mt-2 flex items-center text-sm">
          <svg class="w-4 h-4 text-success-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span class="text-success-600 font-medium">Agency Share: {{ formatCurrency(data?.agencyRevenue || 0) }}</span>
        </div>
      </div>
    </div>

    <!-- Completed Transactions -->
    <div class="card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold tracking-wider text-surface-500 uppercase">Completed Transactions</h3>
        <div class="w-10 h-10 rounded-full bg-success-50 text-success-600 flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div>
        <div class="text-3xl font-bold text-surface-900">{{ data?.byStage?.[TransactionStage.COMPLETED] || 0 }}</div>
        <div class="mt-2 text-sm text-surface-500">
          Total recorded in the system
        </div>
      </div>
    </div>

    <!-- Pending Title Deeds -->
    <div class="card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold tracking-wider text-surface-500 uppercase">Pending Title Deeds</h3>
        <div class="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
      <div>
        <div class="text-3xl font-bold text-surface-900">{{ data?.byStage?.[TransactionStage.TITLE_DEED] || 0 }}</div>
        <div class="mt-2 flex items-center text-sm">
          <svg class="w-4 h-4 text-danger-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-danger-600 font-medium">Action Required</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { TransactionStage } from '~/constants/transaction';

defineProps<{
  data: any;
}>();

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};
</script>
