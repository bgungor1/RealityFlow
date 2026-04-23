<template>
  <div class="space-y-8">
    <div v-if="dashboardStore.loading || transactionStore.loading" class="flex justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <div v-else-if="dashboardStore.error" class="bg-danger-50 text-danger-600 p-4 rounded-lg">
      Error loading dashboard: {{ dashboardStore.error }}
    </div>

    <template v-else>
      <section>
        <h2 class="text-surface-500 text-sm mb-4">Overview of current portfolio performance.</h2>
        <DashboardMetrics :data="dashboardStore.data" />
      </section>

      <section>
        <DashboardPipeline :transactions="transactionStore.transactions" />
      </section>

      <section>
        <DashboardTopPerformers :agents="dashboardStore.data?.topAgents || []" />
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '~/stores/dashboard';
import { useTransactionStore } from '~/stores/transaction';

const dashboardStore = useDashboardStore();
const transactionStore = useTransactionStore();

// Fetch data on mount
onMounted(async () => {
  await Promise.all([
    dashboardStore.fetchDashboard(),
    transactionStore.fetchAll()
  ]);
});
</script>
