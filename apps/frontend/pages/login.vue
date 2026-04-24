<template>
  <div class="min-h-screen flex items-center justify-center bg-surface-50 px-4">
    <div class="max-w-md w-full">
      <!-- Logo/Brand -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-surface-900 rounded-2xl text-white font-bold text-2xl mb-4 shadow-xl">
          R
        </div>
        <h1 class="text-3xl font-extrabold text-surface-900 tracking-tight">RealityFlow</h1>
        <p class="mt-2 text-surface-500 font-medium">Internal Management System</p>
      </div>

      <div class="bg-white p-8 rounded-3xl shadow-xl border border-surface-100 animate-in fade-in zoom-in duration-500">
        <div class="mb-8">
          <h2 class="text-xl font-bold text-surface-900">Sign in to your account</h2>
          <p class="text-sm text-surface-500 mt-1">Enter your email to access the dashboard</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-bold text-surface-700 mb-2">Email Address</label>
            <input 
              id="email" 
              v-model="email" 
              type="email" 
              required
              placeholder="e.g. admin@realityflow.com"
              class="w-full px-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-surface-900"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-bold text-surface-700 mb-2">Password (Fake)</label>
            <input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-surface-900"
            />
          </div>

          <!-- Quick Access Hints -->
          <div class="space-y-3">
            <p class="text-xs font-bold text-surface-400 uppercase tracking-wider">Quick Login Hints</p>
            <div class="grid grid-cols-2 gap-2">
              <button 
                v-for="hint in ['admin@realityflow.com', 'ayse@realityflow.com', 'mehmet@realityflow.com', 'ali@realityflow.com']" 
                :key="hint"
                type="button"
                @click="email = hint"
                class="px-3 py-2 text-[11px] font-semibold bg-surface-50 text-surface-600 border border-surface-200 rounded-lg hover:bg-surface-100 hover:border-surface-300 transition-all text-left truncate"
              >
                {{ hint }}
              </button>
            </div>
            <p class="text-[10px] text-surface-400 italic mt-2">
              * Only <span class="text-primary-600 font-bold">admin</span> can view performance reports.
            </p>
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full py-4 bg-surface-900 text-white font-bold rounded-xl shadow-lg hover:bg-surface-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>
      </div>
      
      <p class="text-center mt-8 text-surface-400 text-sm">
        RealityFlow v1.0.0 &copy; 2026
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';

definePageMeta({
  layout: false
});

const userStore = useUserStore();
const email = ref('');
const loading = ref(false);

async function handleLogin() {
  if (!email.value) return;
  
  loading.value = true;
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  userStore.login(email.value);
  loading.value = false;
  
  navigateTo('/');
}
</script>
