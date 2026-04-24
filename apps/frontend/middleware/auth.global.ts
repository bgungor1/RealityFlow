import { useUserStore } from "~/stores/user";

export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore();

  // Initialize auth if not already done (handles page refreshes)
  if (!userStore.isAuthenticated) {
    userStore.initializeAuth();
  }

  // If not authenticated and not going to login, redirect to login
  if (!userStore.isAuthenticated && to.path !== '/login') {
    return navigateTo('/login');
  }

  // If authenticated and going to login, redirect to dashboard
  if (userStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/');
  }
});
