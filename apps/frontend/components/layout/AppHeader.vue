<template>
  <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-surface-200">
    <div class="flex items-center justify-between h-16 px-6">
      <div>
        <h1 class="text-lg font-semibold text-surface-900">{{ pageTitle }}</h1>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-sm text-surface-500">
          <div class="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-xs">
            A
          </div>
          <span class="hidden sm:inline font-medium text-surface-700">Admin</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const route = useRoute();

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/transactions/new': 'New Transaction',
};

const pageTitle = computed(() => {
  if (route.path.match(/^\/transactions\/[a-f0-9]+$/i)) {
    return 'Transaction Detail';
  }
  return pageTitles[route.path] || 'RealityFlow';
});
</script>
