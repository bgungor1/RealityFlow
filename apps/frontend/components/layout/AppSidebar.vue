<template>
  <aside 
    class="fixed left-0 top-0 h-full w-64 bg-surface-50 border-r border-surface-200 flex flex-col z-40 transition-transform duration-300"
    :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <div class="px-6 py-8">
      <div class="flex items-center gap-3 mb-1">
        <div class="w-10 h-10 bg-surface-900 rounded-xl flex items-center justify-center text-white font-bold text-lg">
          S
        </div>
        <div>
          <h1 class="text-lg font-bold text-surface-900 leading-tight">Signature Realty</h1>
          <p class="text-xs text-surface-500">Senior Consultant</p>
        </div>
      </div>
    </div>

    <nav class="flex-1 px-4 py-4 space-y-1">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold transition-colors duration-200"
        :class="isActive(item.path)
          ? 'bg-white text-surface-900 shadow-sm border border-surface-100'
          : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900'"
      >
        <template v-if="item.iconId === 'dashboard'">
          <svg class="w-5 h-5 flex-shrink-0" :class="isActive(item.path) ? 'text-primary-600' : ''" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/></svg>
        </template>
        <template v-else-if="item.iconId === 'transactions'">
          <svg class="w-5 h-5 flex-shrink-0" :class="isActive(item.path) ? 'text-primary-600' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
        </template>
        <template v-else-if="item.iconId === 'clients'">
          <svg class="w-5 h-5 flex-shrink-0" :class="isActive(item.path) ? 'text-primary-600' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </template>
        <template v-else-if="item.iconId === 'reports'">
          <svg class="w-5 h-5 flex-shrink-0" :class="isActive(item.path) ? 'text-primary-600' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </template>
        <template v-else-if="item.iconId === 'settings'">
          <svg class="w-5 h-5 flex-shrink-0" :class="isActive(item.path) ? 'text-primary-600' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </template>
        {{ item.label }}
      </NuxtLink>
    </nav>

    <!-- New Transaction Button -->
    <div class="p-4 border-t border-surface-200">
      <NuxtLink 
        to="/transactions/new" 
        class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface-900 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-surface-800 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Transaction
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute();

const isSidebarOpen = useState('sidebarOpen');

const menuItems = [
  { path: '/', label: 'Dashboard', iconId: 'dashboard' },
  { path: '/transactions', label: 'Transactions', iconId: 'transactions' },
  { path: '/clients', label: 'Clients', iconId: 'clients' },
  { path: '/reports', label: 'Reports', iconId: 'reports' },
  { path: '/settings', label: 'Settings', iconId: 'settings' },
];

function isActive(path: string) {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
}
</script>
