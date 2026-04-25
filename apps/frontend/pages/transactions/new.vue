<template>
  <div class="max-w-3xl mx-auto pb-12">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-surface-500 mb-6">
      <NuxtLink to="/" class="hover:text-surface-900 flex items-center gap-1 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </NuxtLink>
      <span>/</span>
      <span class="text-surface-900 font-medium">New Transaction</span>
    </div>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-surface-900">Create New Transaction</h1>
      <p class="text-surface-500 mt-2">Enter property and agent details to initialize a new transaction pipeline.</p>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
      <form @submit.prevent="handleSubmit" class="p-8 space-y-8">
        
        <!-- Error Alert -->
        <div v-if="errorMsg" class="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p class="text-sm font-medium">{{ errorMsg }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Property Address -->
          <div class="md:col-span-2 space-y-2">
            <label class="block text-sm font-semibold text-surface-900">Property Address</label>
            <input 
              v-model="form.propertyAddress" 
              type="text" 
              required
              placeholder="e.g. 1428 Elmwood Estates, Beverly Hills, CA 90210"
              class="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-lg focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            >
          </div>

          <!-- Property Type -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-surface-900">Property Type</label>
            <select 
              v-model="form.propertyType" 
              required
              class="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-lg focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all appearance-none"
            >
              <option value="" disabled>Select type</option>
              <option :value="PropertyType.SALE">Sale</option>
              <option :value="PropertyType.RENTAL">Rental</option>
            </select>
          </div>

          <!-- Total Service Fee -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-surface-900">Total Service Fee ($)</label>
            <input 
              v-model.number="form.totalServiceFee" 
              type="number" 
              min="0"
              required
              placeholder="0.00"
              class="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-lg focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            >
          </div>

          <!-- Listing Agent -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-surface-900">Listing Agent</label>
            <div class="relative">
              <select 
                v-model="form.listingAgentId" 
                required
                :disabled="loadingAgents"
                class="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-lg focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all appearance-none"
              >
                <option value="" disabled>{{ loadingAgents ? 'Loading agents...' : 'Select listing agent' }}</option>
                <option v-for="agent in agents" :key="agent._id" :value="agent._id">
                  {{ agent.fullName }} ({{ agent.email }})
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-surface-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <!-- Selling Agent -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-surface-900">Selling Agent</label>
            <div class="relative">
              <select 
                v-model="form.sellingAgentId" 
                required
                :disabled="loadingAgents"
                class="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-lg focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all appearance-none"
              >
                <option value="" disabled>{{ loadingAgents ? 'Loading agents...' : 'Select selling agent' }}</option>
                <option v-for="agent in agents" :key="agent._id" :value="agent._id">
                  {{ agent.fullName }} ({{ agent.email }})
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-surface-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            <p class="text-xs text-surface-500 mt-1">Can be the same as listing agent.</p>
          </div>
        </div>

        <div class="pt-6 border-t border-surface-100 flex items-center justify-end gap-4">
          <NuxtLink 
            to="/" 
            class="px-6 py-3 text-sm font-semibold text-surface-600 hover:text-surface-900 transition-colors"
          >
            Cancel
          </NuxtLink>
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="px-8 py-3 bg-primary-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-primary-700 focus:ring-4 focus:ring-primary-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? 'Creating...' : 'Create Transaction' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTransactionStore } from '~/stores/transaction';
import { PropertyType } from '~/constants/transaction';

const config = useRuntimeConfig();
const transactionStore = useTransactionStore();
const router = useRouter();

const agents = ref<any[]>([]);
const loadingAgents = ref(true);
const isSubmitting = ref(false);
const errorMsg = ref('');

const form = reactive({
  propertyAddress: '',
  propertyType: '',
  totalServiceFee: null as number | null,
  listingAgentId: '',
  sellingAgentId: ''
});

// Fetch agents on mount
onMounted(async () => {
  try {
    const data = await $fetch<any[]>('/users', {
      baseURL: config.public.apiBase as string,
    });
    // Filter out admins if necessary, but for now just use all users since case said 2 roles
    agents.value = data;
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    errorMsg.value = 'Failed to load agent list. Please try refreshing the page.';
  } finally {
    loadingAgents.value = false;
  }
});

const handleSubmit = async () => {
  errorMsg.value = '';
  
  if (!form.totalServiceFee || form.totalServiceFee <= 0) {
    errorMsg.value = 'Total Service Fee must be greater than 0.';
    return;
  }

  isSubmitting.value = true;
  
  try {
    const newTx = await transactionStore.create({
      propertyAddress: form.propertyAddress,
      propertyType: form.propertyType,
      totalServiceFee: form.totalServiceFee,
      listingAgentId: form.listingAgentId,
      sellingAgentId: form.sellingAgentId
    });
    
    // Redirect to detail page on success
    router.push(`/transactions/${newTx._id}`);
  } catch (error: any) {
    errorMsg.value = transactionStore.error || 'An unexpected error occurred while creating the transaction.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>
