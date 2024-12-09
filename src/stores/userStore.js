import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  // State
  state: () => ({
    user: null,
    isAuthenticated: false,
    mockAccounts: [
      { id: 1, username: 'test', email: 'test@gmail.com', password: 'Password123!', role: 'user' },
      { id: 2, username: 'user', email: 'user@gmail.com', password: 'User@2024', role: 'user' },
      { id: 3, username: 'admin', email: 'admin@gmail.com', password: 'Admin@2024', role: 'admin' },
      { id: 4, username: 'staff', email: 'staff@gmail.com', password: 'Staff@2024', role: 'staff' },
      { id: 5, username: 'manager', email: 'manager@gmail.com', password: 'Manager@2024', role: 'manager' }
    ],
    nextId: 6,  // Track the next available ID
    pendingOrders: []
  }),

  // Getters
  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    username: (state) => state.user?.username || '',
    email: (state) => state.user?.email || '',
    accounts: (state) => state.mockAccounts,
    userRole: (state) => state.user?.role || '',
    hasManagementAccess: (state) => {
      const role = state.user?.role
      return role === 'admin' || role === 'manager' || role === 'staff'
    },
    getPendingOrders: (state) => state.pendingOrders
  },

  // Actions
  actions: {
    login(userData) {
      const account = this.mockAccounts.find(
        acc => acc.email === userData.email
      )
      this.user = {
        ...userData,
        role: account?.role || 'user'
      }
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
      localStorage.setItem('pendingOrders', JSON.stringify(this.pendingOrders))
    },

    clearPersistedData() {
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('pendingOrders')
      localStorage.setItem('isAuthenticated', 'false')
    },

    initializeFromStorage() {
      const storedUser = localStorage.getItem('user')
      const storedAccounts = localStorage.getItem('mockAccounts')
      const storedOrders = localStorage.getItem('pendingOrders')

      if (storedUser) {
        this.user = JSON.parse(storedUser)
        this.isAuthenticated = true
      }

      if (storedAccounts) {
        this.mockAccounts = JSON.parse(storedAccounts)
      }

      if (storedOrders) {
        this.pendingOrders = JSON.parse(storedOrders)
      }
    },

    addPendingOrder(order) {
      this.pendingOrders.unshift(order)
      this.persistUserData()
    },

    updateOrderStatus(orderId, newStatus) {
      const order = this.pendingOrders.find(o => o.id === orderId)
      if (order) {
        order.status = newStatus
      }
    },

    deleteAccount(accountId) {
      console.log('Deleting account with ID:', accountId)  // Debug log
      const index = this.mockAccounts.findIndex(account => account.id === accountId)
      console.log('Found at index:', index)  // Debug log
      if (index !== -1) {
        const deletedAccount = this.mockAccounts[index]
        console.log('Account to be deleted:', deletedAccount)  // Debug log
        this.mockAccounts.splice(index, 1)
        this.persistUserData()
        return true
      }
      return false
    },

    getNextId() {
      const nextId = this.nextId
      this.nextId++
      return nextId
    }
  }
})
