<script setup lang="ts">
import { useUserStore } from '~/stores/user';
const userStore = useUserStore();
userStore.initializeAuth();
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
