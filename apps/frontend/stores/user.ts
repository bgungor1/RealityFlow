import { defineStore } from 'pinia';
import type { Agent } from '~/types';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as Agent[],
    currentUser: null as Agent | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    agents: (state) => state.users.filter(u => u.role === 'agent' || !u.role),
    isAuthenticated: (state) => !!state.currentUser,
    isAdmin: (state) => state.currentUser?.role === 'admin',
  },

  actions: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        const data = await useApiFetch<Agent[]>('/users');
        this.users = data;
        return data; // SSR serialization fix
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to fetch users';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    login(email: string) {
      // Fake Auth Logic
      const cleanEmail = email.toLowerCase();
      const isAdmin = cleanEmail === 'admin@realityflow.com';
      
      let fullName = 'Standard Agent';
      if (isAdmin) fullName = 'Admin User';
      else if (cleanEmail.includes('ayse')) fullName = 'Ayşe Yılmaz';
      else if (cleanEmail.includes('mehmet')) fullName = 'Mehmet Demir';
      else if (cleanEmail.includes('ali')) fullName = 'Ali Kaya';

      const user = {
        _id: isAdmin ? 'admin-id' : `user-${Date.now()}`,
        fullName,
        email: email,
        role: isAdmin ? 'admin' : 'agent'
      } as Agent;

      this.currentUser = user;

      // Sync with Cookie for SSR support
      const authCookie = useCookie<Agent | null>('auth_user', {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        watch: true
      });
      authCookie.value = user;
    },

    logout() {
      this.currentUser = null;
      const authCookie = useCookie('auth_user');
      authCookie.value = null;
      return navigateTo('/login');
    },

    initializeAuth() {
      // useCookie works on both Server and Client automatically
      const authCookie = useCookie<Agent | null>('auth_user');
      if (authCookie.value) {
        this.currentUser = authCookie.value;
      }
    }
  },
});
