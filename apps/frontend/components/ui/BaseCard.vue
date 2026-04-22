<template>
  <div class="card">
    <div v-if="title" class="px-5 py-4 border-b border-surface-200">
      <h3 class="text-base font-semibold text-surface-900">{{ title }}</h3>
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>
