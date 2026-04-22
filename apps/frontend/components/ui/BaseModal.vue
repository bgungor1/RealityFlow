<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-surface-900/50 backdrop-blur-sm" @click="close" />
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto z-10">
          <div class="flex items-center justify-between px-5 py-4 border-b border-surface-200">
            <h3 class="text-lg font-semibold text-surface-900">{{ title }}</h3>
            <button
              class="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
              @click="close"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-5">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-5 py-4 border-t border-surface-200 flex justify-end gap-3">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  title: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

function close() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
