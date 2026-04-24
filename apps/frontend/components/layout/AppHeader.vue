<template>
  <header class="sticky top-0 z-30 bg-white border-b border-surface-200">
    <div class="flex items-center justify-between h-16 lg:h-20 px-4 lg:px-8">
      
      <!-- Mobile Hamburger Button -->
      <button 
        @click="isSidebarOpen = true"
        class="lg:hidden p-2 -ml-2 mr-2 text-surface-500 hover:bg-surface-100 rounded-lg transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Search Input -->
      <div class="flex-1 max-w-4xl w-full">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search properties, clients, or transactions..." 
            class="w-full pl-11 pr-4 py-3 bg-surface-100 border-transparent rounded-lg text-sm text-surface-900 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all placeholder-surface-400"
          >
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-4 lg:gap-6 ml-4 lg:ml-8">
        <button class="text-surface-400 hover:text-surface-700 transition-colors relative">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        
        <button class="text-surface-400 hover:text-surface-700 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <div class="flex items-center gap-3 pl-6 border-l border-surface-200">
          <div class="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
            {{ userInitials }}
          </div>
          <span class="hidden sm:inline font-semibold text-surface-700 text-sm">
            {{ userStore.currentUser?.fullName?.split(' ')[0] || 'Profile' }}
          </span>
        </div>
      </div>
      
    </div>
  </header>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';

const isSidebarOpen = useState('sidebarOpen');
const userStore = useUserStore();

const userInitials = computed(() => {
  const name = userStore.currentUser?.fullName || 'John Doe';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
});
</script>
