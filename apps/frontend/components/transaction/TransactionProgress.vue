<template>
  <div class="card p-8">
    <h3 class="text-lg font-bold text-surface-900 mb-8">Transaction Progress</h3>
    
    <div class="relative">
      <!-- Progress Line Background -->
      <div class="absolute top-6 left-0 w-full h-1 bg-surface-200 rounded-full" aria-hidden="true"></div>
      
      <!-- Progress Line Active -->
      <div 
        class="absolute top-6 left-0 h-1 bg-surface-900 rounded-full transition-all duration-500 ease-in-out"
        :style="{ width: `${progressPercentage}%` }"
        aria-hidden="true"
      ></div>

      <div class="relative flex justify-between">
        <!-- Steps -->
        <div 
          v-for="(step, index) in steps" 
          :key="step.id"
          class="flex flex-col items-center relative z-10 w-32"
        >
          <!-- Icon Circle -->
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 mb-3 shadow-sm border-2"
            :class="[
              isStepCompleted(step.id) || currentStage === step.id
                ? 'bg-surface-900 border-surface-900 text-white' 
                : 'bg-white border-surface-200 text-surface-400'
            ]"
          >
            <!-- Check Icon for completed -->
            <svg v-if="isStepCompleted(step.id) && (currentStage !== step.id || step.id === TransactionStage.COMPLETED)" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <!-- Custom Icon for current or pending -->
            <template v-else>
              <svg v-if="step.id === TransactionStage.AGREEMENT" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <svg v-else-if="step.id === TransactionStage.EARNEST_MONEY" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else-if="step.id === TransactionStage.TITLE_DEED" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <svg v-else-if="step.id === TransactionStage.COMPLETED" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </template>
          </div>
          
          <!-- Label & Date -->
          <div class="text-center">
            <div class="font-semibold" :class="isStepCompleted(step.id) || currentStage === step.id ? 'text-surface-900' : 'text-surface-500'">
              {{ step.label }}
            </div>
            <div v-if="getStepDate(step.id)" class="text-xs text-surface-500 mt-1">
              {{ getStepDate(step.id) }}
            </div>
            <div v-else-if="currentStage === step.id" class="mt-1">
              <span class="bg-primary-100 text-primary-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">In Progress</span>
            </div>
            <div v-else class="text-xs text-surface-400 mt-1">
              Pending
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TransactionStage, STAGE_ORDER } from '~/constants/transaction';
import { formatDate } from '~/utils/format';
import type { StageHistoryEntry } from '~/types';

const props = defineProps<{
  currentStage: string;
  stageHistory: StageHistoryEntry[];
  createdAt: string;
}>();

const steps = [
  { id: TransactionStage.AGREEMENT, label: 'Agreement' },
  { id: TransactionStage.EARNEST_MONEY, label: 'Earnest Money' },
  { id: TransactionStage.TITLE_DEED, label: 'Title Deed' },
  { id: TransactionStage.COMPLETED, label: 'Completed' }
];

const currentIndex = computed(() => STAGE_ORDER.indexOf(props.currentStage as TransactionStage));

const progressPercentage = computed(() => {
  if (currentIndex.value === -1) return 0;
  if (currentIndex.value === STAGE_ORDER.length - 1) return 100;
  // Calculate width based on number of steps to place the line exactly in the middle of icons
  return (currentIndex.value / (STAGE_ORDER.length - 1)) * 100;
});

const isStepCompleted = (stepId: string) => {
  const stepIndex = STAGE_ORDER.indexOf(stepId as TransactionStage);
  return stepIndex <= currentIndex.value;
};

const getStepDate = (stepId: string) => {
  if (stepId === TransactionStage.AGREEMENT) {
    return formatDate(props.createdAt);
  }
  
  // Find the entry where 'to' matches the stepId
  const historyEntry = props.stageHistory?.find(h => h.to === stepId);
  if (historyEntry) {
    return formatDate(historyEntry.changedAt);
  }
  return null;
};
</script>
