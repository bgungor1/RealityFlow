<template>
  <div class="space-y-8">
    <!-- Loading State -->
    <div v-if="dashboardStore.loading" class="flex justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Error State -->
    <div v-else-if="dashboardStore.error" class="bg-danger-50 text-danger-600 p-4 rounded-lg">
      Error loading dashboard: {{ dashboardStore.error }}
    </div>

    <!-- Dashboard Content -->
    <div v-else class="space-y-8 animate-in fade-in duration-500">
      <section>
        <h2 class="text-surface-500 text-sm mb-4 italic">Overview of current portfolio performance.</h2>
        <DashboardMetrics :data="dashboardStore.data" />
      </section>

      <section>
        <DashboardPipeline :transactions="dashboardStore.data?.allTransactions || []" />
      </section>

      <section v-if="userStore.isAdmin">
        <DashboardTopPerformers :agents="dashboardStore.data?.topAgents || []" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file index.vue
 * @description Main dashboard page for RealityFlow. 
 * 
 * DESIGN DECISIONS:
 * 1. Data Fetching: Uses `useAsyncData` to ensure data is fetched on the server (SSR), 
 *    improving SEO and initial load performance.
 * 2. Hydration Stability: Template branches (v-if/v-else) are wrapped in stable <div> 
 *    elements instead of <template> fragments to prevent hydration mismatches.
 * 3. State Management: Relies on Pinia `dashboardStore` as the single source of truth.
 * 4. RBAC: "Top Performers" section is only visible to Admin users.
 */

import { useDashboardStore } from '~/stores/dashboard';
import { useUserStore } from '~/stores/user';
import DashboardMetrics from '~/components/dashboard/DashboardMetrics.vue';
import DashboardPipeline from '~/components/dashboard/DashboardPipeline.vue';
import DashboardTopPerformers from '~/components/dashboard/DashboardTopPerformers.vue';

const dashboardStore = useDashboardStore();
const userStore = useUserStore();

// SSR compatible data fetching
await useAsyncData('dashboard', async () => {
  return await dashboardStore.fetchDashboard();
});
</script>
