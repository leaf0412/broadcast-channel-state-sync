import { defineStore } from 'pinia';

export interface User {
  id: string;
  name: string;
  theme: 'light' | 'dark';
}

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: {
      id: 'user1',
      name: 'Default User',
      theme: 'light' as 'light' | 'dark',
    },
  }),

  actions: {
    setTheme(theme: 'light' | 'dark') {
      this.currentUser.theme = theme;
    },

    setName(name: string) {
      this.currentUser.name = name;
    },
  },
});
