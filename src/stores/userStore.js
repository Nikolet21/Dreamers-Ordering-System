import { defineStore } from 'pinia'
import { auth, db } from '@/firebase/firebaseconfig'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore'
import { useRouter } from 'vue-router'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    pendingOrders: [],
    ordersUnsubscribe: null,
    users: [],
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
        // Hardcoded management accounts
        const managementAccounts = {
          'admin@dreamers.com': {
            password: 'Admin@2024',
            role: 'admin',
            displayName: 'Admin User'
          },
          'manager@dreamers.com': {
            password: 'Manager@2024',
            role: 'manager',
            displayName: 'Manager User'
          },
          'staff@dreamers.com': {
            password: 'Staff@2024',
            role: 'staff',
            displayName: 'Staff User'
          }
        };

        // Check if it's a hardcoded management account
        if (managementAccounts[email]) {
          if (managementAccounts[email].password === password) {
            this.user = {
              email,
              displayName: managementAccounts[email].displayName,
              role: managementAccounts[email].role,
              uid: email // Using email as uid for hardcoded accounts
            };
            this.isAuthenticated = true;
            this.persistUserData(); // Add persistence for hardcoded accounts
            await this.loadPendingOrders(); // Load pending orders
            return {
              success: true,
              redirect: '/management'
            };
          }
          return {
            success: false,
            error: 'Invalid credentials'
          };
        }

        // Regular user login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        const userData = userDoc.data();

        this.user = {
          ...userCredential.user,
          role: userData?.role || 'user'
        };
        this.isAuthenticated = true;
        this.persistUserData();
        await this.loadPendingOrders(); // Load pending orders
        return { success: true };
      } catch (error) {
        console.error('Login error:', error);
        return {
          success: false,
          error: error.message
        };
      }
    },

    async logout() {
      try {
        await signOut(auth)
        this.user = null
        this.isAuthenticated = false
        if (this.ordersUnsubscribe) {
          this.ordersUnsubscribe()
          this.ordersUnsubscribe = null
        }
        this.pendingOrders = []
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

    async addPendingOrder(order) {
      try {
        // Add order to Firestore
        const orderRef = doc(db, 'orders', order.id.toString());
        await setDoc(orderRef, {
          ...order,
          userId: this.user?.uid || 'guest',
          createdAt: new Date().toISOString()
        });

        // Add to local state
        this.pendingOrders.push(order);
        return { success: true };
      } catch (error) {
        console.error('Error adding order:', error);
        return { success: false, error: error.message };
      }
    },

    async updateOrderStatus(orderId, newStatus) {
      try {
        // Update in Firestore
        const orderRef = doc(db, 'orders', orderId.toString());
        await setDoc(orderRef, { status: newStatus }, { merge: true });

        // Update in local state
        const order = this.pendingOrders.find(o => o.id === orderId);
        if (order) {
          order.status = newStatus;
        }
        return { success: true };
      } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
      }
    },

    async loadPendingOrders() {
      try {
        const ordersCollection = collection(db, 'orders');
        // Simplified query that doesn't require a composite index
        const q = query(ordersCollection, orderBy('createdAt', 'desc'));

        if (this.ordersUnsubscribe) {
          this.ordersUnsubscribe();
        }

        this.ordersUnsubscribe = onSnapshot(q, (querySnapshot) => {
          // Filter orders in memory instead of in query
          const allOrders = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          }));

          // Filter for current user's orders
          this.pendingOrders = allOrders.filter(order =>
            order.userId === (this.user?.uid || 'guest')
          );
        });

        return { success: true };
      } catch (error) {
        console.error('Error loading pending orders:', error);
        return { success: false, error: error.message };
      }
    },

    persistUserData() {
      localStorage.setItem('user', JSON.stringify(this.user))
      localStorage.setItem('isAuthenticated', JSON.stringify(this.isAuthenticated))
      localStorage.setItem('pendingOrders', JSON.stringify(this.pendingOrders))
    },

    clearPersistedData() {
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('pendingOrders')
    },

    initializeFromStorage() {
      const storedUser = localStorage.getItem('user')
      const storedAuth = localStorage.getItem('isAuthenticated')
      const storedPendingOrders = localStorage.getItem('pendingOrders')

      if (storedUser && storedAuth) {
        this.user = JSON.parse(storedUser)
        this.isAuthenticated = JSON.parse(storedAuth)
        this.pendingOrders = JSON.parse(storedPendingOrders)
      }
    },

    async getAllUsers() {
      try {
        const usersRef = collection(db, 'users')
        const querySnapshot = await getDocs(usersRef)
        const users = []
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() })
        })
        this.users = users // Update the state
        return users
      } catch (error) {
        console.error('Error getting users:', error)
        throw error
      }
    },

    async createNewUser({ email, password, username, role }) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await updateFirebaseProfile(userCredential.user, {
          displayName: username
        })

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          username,
          role: role || 'user',
          createdAt: new Date().toISOString()
        })

        return { id: userCredential.user.uid, email, username, role }
      } catch (error) {
        console.error('Error creating user:', error)
        throw error
      }
    },

    async updateUser(userId, userData) {
      try {
        const userRef = doc(db, 'users', userId)
        await setDoc(userRef, userData, { merge: true })
        return { id: userId, ...userData }
      } catch (error) {
        console.error('Error updating user:', error)
        throw error
      }
    },

    async deleteUser(userId) {
      try {
        const userRef = doc(db, 'users', userId)
        await deleteDoc(userRef)
        return userId
      } catch (error) {
        console.error('Error deleting user:', error)
        throw error
      }
    }
  }
})
