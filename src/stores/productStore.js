import { defineStore } from 'pinia'
import { auth } from '@/config/firebase'

const API_URL = 'http://localhost:5000/api'

export const useProductStore = defineStore('product', {
  state: () => ({
    menuItems: [],
    orders: [],
    loading: false,
    error: null
  }),

  getters: {
    getMenuItems: (state) => state.menuItems,
    getOrders: (state) => state.orders,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  },

  actions: {
    async fetchMenuItems() {
      this.loading = true
      try {
        const response = await fetch(`${API_URL}/menu`)
        if (!response.ok) throw new Error('Failed to fetch menu items')
        const data = await response.json()
        this.menuItems = data
      } catch (error) {
        this.error = error.message
        console.error('Error fetching menu:', error)
      } finally {
        this.loading = false
      }
    },

    async createOrder(orderData) {
      this.loading = true
      try {
        const token = await auth.currentUser?.getIdToken()
        if (!token) throw new Error('User not authenticated')

        const response = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        })

        if (!response.ok) throw new Error('Failed to create order')
        const data = await response.json()
        this.orders.push(data)
        return data
      } catch (error) {
        this.error = error.message
        console.error('Error creating order:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUserOrders() {
      this.loading = true
      try {
        const token = await auth.currentUser?.getIdToken()
        if (!token) throw new Error('User not authenticated')

        const response = await fetch(`${API_URL}/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) throw new Error('Failed to fetch orders')
        const data = await response.json()
        this.orders = data
      } catch (error) {
        this.error = error.message
        console.error('Error fetching orders:', error)
      } finally {
        this.loading = false
      }
    },

    async updateOrderStatus(orderId, status) {
      this.loading = true
      try {
        const token = await auth.currentUser?.getIdToken()
        if (!token) throw new Error('User not authenticated')

        const response = await fetch(`${API_URL}/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        })

        if (!response.ok) throw new Error('Failed to update order status')
        const updatedOrder = await response.json()
        
        // Update local state
        const index = this.orders.findIndex(order => order.id === orderId)
        if (index !== -1) {
          this.orders[index] = { ...this.orders[index], status }
        }
        
        return updatedOrder
      } catch (error) {
        this.error = error.message
        console.error('Error updating order:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
