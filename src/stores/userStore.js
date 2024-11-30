import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  // State
  state: () => ({
    user: null,
    isAuthenticated: false,
    mockAccounts: [
      { username: 'test', email: 'test@gmail.com', password: 'Password123!' },
      { username: 'user', email: 'user@gmail.com', password: 'User@2024' },
    ]
  }),

  // Getters
  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    username: (state) => state.user?.username || '',
    email: (state) => state.user?.email || '',
    accounts: (state) => state.mockAccounts
  },

  // Actions
  actions: {
    login(userData) {
      this.user = userData
      this.isAuthenticated = true
      this.persistUserData()
    },

    logout() {
      this.user = null
      this.isAuthenticated = false
      this.clearPersistedData()
    },

    updateProfile(profileData) {
      if (!this.user) return false;

      // Update user profile
      this.user = {
        ...this.user,
        username: profileData.username,
        email: profileData.email
      };

      // Update in mock accounts if exists
      const accountIndex = this.mockAccounts.findIndex(
        acc => acc.email === this.user.email || acc.username === this.user.username
      );

      if (accountIndex !== -1) {
        this.mockAccounts[accountIndex] = {
          ...this.mockAccounts[accountIndex],
          username: profileData.username,
          email: profileData.email
        };
      }

      this.persistUserData();
      return true;
    },

    persistUserData() {
      localStorage.setItem('user', JSON.stringify(this.user))
      localStorage.setItem('mockAccounts', JSON.stringify(this.mockAccounts))
    },

    clearPersistedData() {
      localStorage.removeItem('user')
    },

    initializeFromStorage() {
      const storedUser = localStorage.getItem('user')
      const storedAccounts = localStorage.getItem('mockAccounts')

      if (storedUser) {
        this.user = JSON.parse(storedUser)
        this.isAuthenticated = true
      }

      if (storedAccounts) {
        this.mockAccounts = JSON.parse(storedAccounts)
      }
    }
  }
})
