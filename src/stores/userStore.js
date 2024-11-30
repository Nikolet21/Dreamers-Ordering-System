import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const isAuthenticated = ref(false)

  function login(userData) {
    currentUser.value = userData
    isAuthenticated.value = true
    // You might want to store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function logout() {
    currentUser.value = null
    isAuthenticated.value = false
    localStorage.removeItem('user')
  }

  // Initialize from localStorage if available
  const initializeFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      currentUser.value = JSON.parse(storedUser)
      isAuthenticated.value = true
    }
  }

  // Call initialization
  initializeFromStorage()

  return {
    currentUser,
    isAuthenticated,
    login,
    logout
  }
})
