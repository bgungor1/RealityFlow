<template>
  <div class="card p-8 flex flex-col h-full">
    <div class="flex items-start justify-between mb-8">
      <div>
        <h3 class="text-xl font-bold text-surface-900">Commission Distribution</h3>
        <p class="text-surface-500 text-sm mt-1">Total Gross Commission</p>
      </div>
      <div class="text-right">
        <div class="text-3xl font-bold text-primary-600">{{ formatCurrency(totalPool) }}</div>
        <p class="text-surface-500 text-xs font-bold uppercase tracking-wider mt-1">TOTAL POOL</p>
      </div>
    </div>

    <!-- Distribution Bar -->
    <div v-if="commission" class="mb-8">
      <div class="flex h-8 w-full rounded-md overflow-hidden text-xs font-bold text-white mb-2">
        <!-- Agency -->
        <div 
          class="bg-surface-900 flex items-center justify-center transition-all duration-500" 
          :style="{ width: `${commission.agencyPercentage}%` }"
        >
          <span v-if="commission.agencyPercentage > 10">Agency ({{ commission.agencyPercentage }}%)</span>
        </div>
        
        <!-- Listing Agent -->
        <div 
          v-if="listingShare"
          class="bg-primary-800 flex items-center justify-center border-l border-white/20 transition-all duration-500" 
          :style="{ width: `${listingShare.percentage}%` }"
        >
          <span v-if="listingShare.percentage > 10">Listing ({{ listingShare.percentage }}%)</span>
        </div>

        <!-- Selling Agent -->
        <div 
          v-if="sellingShare && !isSameAgent"
          class="bg-primary-500 flex items-center justify-center border-l border-white/20 transition-all duration-500" 
          :style="{ width: `${sellingShare.percentage}%` }"
        >
          <span v-if="sellingShare.percentage > 10">Selling ({{ sellingShare.percentage }}%)</span>
        </div>
      </div>
    </div>

    <!-- Info Notice -->
    <div class="bg-surface-100 border border-surface-200 rounded-lg p-4 flex gap-3 mb-8">
      <div class="w-5 h-5 rounded-full bg-surface-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <p class="text-sm text-surface-700">
        <span class="font-semibold">Notice:</span> When the same agent serves as both Listing and Selling agent, they receive the full 100% of the agent commission share.
      </p>
    </div>

    <!-- Agent Cards -->
    <div v-if="commission" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
      
      <!-- Brokerage Firm -->
      <div class="bg-surface-50 rounded-lg p-5 border-l-4 border-surface-900">
        <h4 class="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Brokerage Firm</h4>
        <div class="text-2xl font-bold text-surface-900 mb-4">{{ formatCurrency(commission.agencyAmount) }}</div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm text-surface-700 font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Signature Realty
          </div>
          <span class="bg-surface-200 text-surface-700 text-xs font-bold px-2 py-1 rounded">{{ commission.agencyPercentage }}%</span>
        </div>
      </div>

      <!-- Listing Agent -->
      <div v-if="listingShare" class="bg-surface-50 rounded-lg p-5 border-l-4 border-primary-800">
        <h4 class="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Listing Agent</h4>
        <div class="text-2xl font-bold text-surface-900 mb-4">{{ formatCurrency(listingShare.amount) }}</div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm text-surface-900 font-medium">
            <div class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
              {{ listingShare.agentName.charAt(0) }}
            </div>
            {{ listingShare.agentName }}
          </div>
          <span class="bg-surface-200 text-surface-700 text-xs font-bold px-2 py-1 rounded">{{ listingShare.percentage }}%</span>
        </div>
      </div>

      <!-- Selling Agent (Only if different) -->
      <div v-if="sellingShare && !isSameAgent" class="bg-surface-50 rounded-lg p-5 border-l-4 border-primary-500">
        <h4 class="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Selling Agent</h4>
        <div class="text-2xl font-bold text-surface-900 mb-4">{{ formatCurrency(sellingShare.amount) }}</div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm text-surface-900 font-medium">
            <div class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
              {{ sellingShare.agentName.charAt(0) }}
            </div>
            {{ sellingShare.agentName }}
          </div>
          <span class="bg-surface-200 text-surface-700 text-xs font-bold px-2 py-1 rounded">{{ sellingShare.percentage }}%</span>
        </div>
      </div>

    </div>
    
    <!-- Empty State / Pending Commission -->
    <div v-else class="flex-1 flex flex-col items-center justify-center text-surface-400 py-8 border-2 border-dashed border-surface-200 rounded-xl bg-surface-50/50">
      <svg class="w-12 h-12 mb-3 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <p class="font-medium text-surface-500">Commission is pending.</p>
      <p class="text-xs text-surface-400 mt-1">Move transaction to Completed to view distribution.</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '~/types';

const props = defineProps<{
  transaction: Transaction;
}>();

const commission = computed(() => props.transaction?.commission);
const totalPool = computed(() => props.transaction?.totalServiceFee || 0);

const listingShare = computed(() => {
  return commission.value?.agentShares?.find((s: any) => s.role === 'listing' || s.role === 'both');
});

const sellingShare = computed(() => {
  return commission.value?.agentShares?.find((s: any) => s.role === 'selling' || s.role === 'both');
});

const isSameAgent = computed(() => {
  // Virtual property üzerinden karşılaştırma (ID'ler string olarak geliyor)
  return props.transaction?.listingAgentId === props.transaction?.sellingAgentId;
});
</script>
