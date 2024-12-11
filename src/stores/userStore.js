import { defineStore } from 'pinia'
import { auth, db } from '@/firebase/firebaseconfig'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    pendingOrders: []
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    username: (state) => state.user?.displayName || '',
    email: (state) => state.user?.email || '',
    userRole: (state) => state.user?.role || 'user',
    hasManagementAccess: (state) => {
      const role = state.user?.role
      return role === 'admin' || role === 'manager' || role === 'staff'
    },
    getPendingOrders: (state) => state.pendingOrders
  },

  actions: {
    async registerUser({ email, password, username }) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        // Update user profile with username
        await updateFirebaseProfile(userCredential.user, {
          displayName: username
        })

        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          username,
          role: 'user',
          createdAt: new Date().toISOString()
        })

        // Set local user state
        this.user = {
          ...userCredential.user,
          role: 'user'
        }
        this.isAuthenticated = true
        return { success: true }
      } catch (error) {
        console.error('Registration error:', error)
        return { 
          success: false, 
          error: error.message 
        }
      }
    },

    async login({ email, password }) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
        const userData = userDoc.data()

        this.user = {
          ...userCredential.user,
          role: userData.role
        }
        this.isAuthenticated = true
        return { success: true }
      } catch (error) {
        console.error('Login error:', error)
        return { 
          success: false, 
          error: error.message 
        }
      }
    },

    async logout() {
      try {
        await signOut(auth)
        this.user = null
        this.isAuthenticated = false
        this.clearPersistedData()
        return { success: true }
      } catch (error) {
        console.error('Logout error:', error)
        return { 
          success: false, 
          error: error.message 
        }
      }
    },

    async updateProfile(profileData) {
      try {
        if (!this.user) throw new Error('No user logged in')

        // Update Firebase profile
        await updateFirebaseProfile(auth.currentUser, {
          displayName: profileData.username
        })

        // Update Firestore document
        await setDoc(doc(db, 'users', this.user.uid), {
          ...profileData,
          updatedAt: new Date().toISOString()
        }, { merge: true })

        // Update local state
        this.user = {
          ...this.user,
          ...profileData
        }
        return { success: true }
      } catch (error) {
        console.error('Profile update error:', error)
        return { 
          success: false, 
          error: error.message 
        }
      }
    },

    async resetPassword(email) {
      try {
        await sendPasswordResetEmail(auth, email)
        return { success: true }
      } catch (error) {
        console.error('Password reset error:', error)
        let errorMessage = 'Failed to send password reset email'
        
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address'
            break
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address'
            break
          case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Please try again later'
            break
        }
        
        return { 
          success: false, 
          error: errorMessage 
        }
      }
    },

    persistUserData() {
      localStorage.setItem('user', JSON.stringify(this.user))
      localStorage.setItem('isAuthenticated', JSON.stringify(this.isAuthenticated))
    },

    clearPersistedData() {
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
    },

    initializeFromStorage() {
      const storedUser = localStorage.getItem('user')
      const storedAuth = localStorage.getItem('isAuthenticated')
      
      if (storedUser && storedAuth) {
        this.user = JSON.parse(storedUser)
        this.isAuthenticated = JSON.parse(storedAuth)
      }
    },

    addPendingOrder(order) {
      this.pendingOrders.push(order)
    },

    updateOrderStatus(orderId, newStatus) {
      const order = this.pendingOrders.find(o => o.id === orderId)
      if (order) {
        order.status = newStatus
      }
    }
  }
})
