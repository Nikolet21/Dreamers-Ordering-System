import { defineStore } from 'pinia'
import { auth } from '@/config/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth'

const API_URL = 'http://localhost:5000/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    users: []
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isStaff: (state) => ['admin', 'staff'].includes(state.user?.role),
    getAllUsers: (state) => state.users
  },

  actions: {
    async registerUser(userData) {
      this.loading = true
      this.error = null
      try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        )

        // Update profile with username
        await updateProfile(userCredential.user, {
          displayName: userData.username
        })

        // Create user in backend
        const token = await userCredential.user.getIdToken()
        await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            email: userData.email,
            username: userData.username,
            role: userData.role || 'user'
          })
        })

        this.user = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          username: userData.username,
          role: userData.role || 'user'
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async loginUser(email, password) {
      this.loading = true
      this.error = null
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const token = await userCredential.user.getIdToken()
        
        // Get user data from backend
        const response = await fetch(`${API_URL}/users/${userCredential.user.uid}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const userData = await response.json()

        this.user = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          username: userData.username,
          role: userData.role
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async logoutUser() {
      try {
        await signOut(auth)
        this.user = null
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async fetchUsers() {
      if (!this.isAdmin) return
      
      this.loading = true
      try {
        const token = await auth.currentUser?.getIdToken()
        const response = await fetch(`${API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()
        this.users = data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateUser(userId, userData) {
      this.loading = true
      try {
        const token = await auth.currentUser?.getIdToken()
        const response = await fetch(`${API_URL}/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(userData)
        })
        
        if (!response.ok) throw new Error('Failed to update user')
        
        // Update local state if updating current user
        if (userId === this.user?.uid) {
          this.user = { ...this.user, ...userData }
        }
        
        // Update users list if it exists
        const userIndex = this.users.findIndex(u => u.id === userId)
        if (userIndex !== -1) {
          this.users[userIndex] = { ...this.users[userIndex], ...userData }
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteUser(userId) {
      if (!this.isAdmin) return
      
      this.loading = true
      try {
        const token = await auth.currentUser?.getIdToken()
        const response = await fetch(`${API_URL}/users/${userId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (!response.ok) throw new Error('Failed to delete user')
        
        // Update users list
        this.users = this.users.filter(u => u.id !== userId)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
