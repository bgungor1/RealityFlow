<template>
  <div class="min-h-screen bg-surface-50">
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false" 
      class="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-30 lg:hidden transition-opacity"
      aria-hidden="true"
    ></div>

    <AppSidebar />
    
    <div class="lg:ml-64 transition-all duration-300">
      <AppHeader />
      <main class="p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '~/components/layout/AppSidebar.vue';
import AppHeader from '~/components/layout/AppHeader.vue';

const isSidebarOpen = useState('sidebarOpen', () => false);

const route = useRoute();
watch(() => route.path, () => {
  isSidebarOpen.value = false;
});
</script>
