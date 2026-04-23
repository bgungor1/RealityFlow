<template>
  <div class="card p-8 h-full">
    <h3 class="text-lg font-bold text-surface-900 mb-6">Property Snapshot</h3>
    
    <div class="space-y-4">
      <div class="flex justify-between items-center py-3 border-b border-surface-100">
        <span class="text-sm text-surface-500">Property Address</span>
        <span class="text-sm font-semibold text-surface-900 text-right truncate max-w-[200px]" :title="address">
          {{ address }}
        </span>
      </div>
      
      <div class="flex justify-between items-center py-3 border-b border-surface-100">
        <span class="text-sm text-surface-500">Property Type</span>
        <span class="text-sm font-semibold text-surface-900">{{ type === 'sale' ? 'Sale' : 'Rental' }}</span>
      </div>

      <div class="flex justify-between items-center py-3 border-b border-surface-100">
        <span class="text-sm text-surface-500">Current Stage</span>
        <span class="text-sm font-semibold text-surface-900 capitalize">{{ stage.replace('_', ' ') }}</span>
      </div>
      
      <div class="flex justify-between items-center py-3 border-b border-surface-100">
        <span class="text-sm text-surface-500">Listed On</span>
        <span class="text-sm font-semibold text-surface-900">{{ formatDate(createdAt) }}</span>
      </div>
    </div>

    <div class="mt-8 pt-4 border-t border-surface-200">
      <button class="w-full flex items-center justify-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
        View Full Listing Docs
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  address: string;
  type: string;
  stage: string;
  createdAt: string;
}>();

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
};
</script>
