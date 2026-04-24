<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-surface-900">Top Performers</h2>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-surface-600">
          <thead class="bg-surface-50 text-xs uppercase text-surface-500 border-b border-surface-200">
            <tr>
              <th scope="col" class="px-6 py-4 font-medium">Agent Name</th>
              <th scope="col" class="px-6 py-4 font-medium text-right">Total Deals Closed</th>
              <th scope="col" class="px-6 py-4 font-medium text-right">Total Commission Earned</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-200">
            <tr v-for="(agent, index) in agents" :key="agent.agentId" class="hover:bg-surface-50 transition-colors">
              <td class="px-6 py-4 flex items-center gap-3">
                <div class="relative">
                  <div class="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                    {{ agent.agentName.charAt(0) }}
                  </div>
                  <!-- Top 1 Badge -->
                  <div v-if="index === 0" class="absolute -top-1 -right-1 w-4 h-4 bg-warning-400 rounded-full border-2 border-white flex items-center justify-center text-[10px]">
                    ⭐
                  </div>
                </div>
                <span class="font-medium text-surface-900">{{ agent.agentName }}</span>
              </td>
              <td class="px-6 py-4 text-right font-medium text-surface-900">
                {{ agent.transactionCount }}
              </td>
              <td class="px-6 py-4 text-right font-bold text-surface-900">
                {{ formatCurrency(agent.totalEarnings) }}
              </td>
            </tr>
            <tr v-if="!agents?.length">
              <td colspan="3" class="px-6 py-8 text-center text-surface-500">
                No performance data available yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  agents: any[];
}>();

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};
</script>
