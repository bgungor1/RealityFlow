<template>
  <span :class="[baseClasses, colorClasses[color]]">
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
}>();

const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

const colorClasses: Record<string, string> = {
  blue: 'bg-primary-100 text-primary-800',
  green: 'bg-success-50 text-success-600',
  yellow: 'bg-warning-50 text-warning-600',
  red: 'bg-danger-50 text-danger-600',
  gray: 'bg-surface-100 text-surface-600',
};
</script>
