import { defineStore } from 'pinia'
import { auth } from '@/config/firebase'

const API_URL = 'http://localhost:5000/api'

export const useReviewStore = defineStore('review', {
  state: () => ({
    reviews: [],
    userReviews: [],
    loading: false,
    error: null
  }),

  getters: {
    getAllReviews: (state) => state.reviews,
    getUserReviews: (state) => state.userReviews,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getAverageRating: (state) => {
      if (state.reviews.length === 0) return 0
      const sum = state.reviews.reduce((acc, review) => acc + review.rating, 0)
      return (sum / state.reviews.length).toFixed(1)
    }
  },

  actions: {
    async fetchReviews() {
      this.loading = true
      try {
        const response = await fetch(`${API_URL}/reviews`)
        if (!response.ok) throw new Error('Failed to fetch reviews')
        const data = await response.json()
        this.reviews = data
      } catch (error) {
        this.error = error.message
        console.error('Error fetching reviews:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchUserReviews(userId) {
      this.loading = true
      try {
        const token = await auth.currentUser?.getIdToken()
        if (!token) throw new Error('User not authenticated')

        const response = await fetch(`${API_URL}/reviews/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch user reviews')
        const data = await response.json()
        this.userReviews = data
      } catch (error) {
        this.error = error.message
        console.error('Error fetching user reviews:', error)
      } finally {
        this.loading = false
      }
    },

    async createReview(reviewData) {
      this.loading = true
      try {
        const token = await auth.currentUser?.getIdToken()
        if (!token) throw new Error('User not authenticated')

        const response = await fetch(`${API_URL}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(reviewData)
        })

        if (!response.ok) throw new Error('Failed to create review')
        const data = await response.json()
        this.reviews.unshift(data) // Add to beginning of array
        if (this.userReviews.length > 0) {
          this.userReviews.unshift(data)
        }
        return data
      } catch (error) {
        this.error = error.message
        console.error('Error creating review:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateReview(reviewId, reviewData) {
      this.loading = true
      try {
        const token = await auth.currentUser?.getIdToken()
        if (!token) throw new Error('User not authenticated')

        const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(reviewData)
        })

        if (!response.ok) throw new Error('Failed to update review')
        
        // Update local state
        const updateReview = (reviewArray) => {
          const index = reviewArray.findIndex(r => r.id === reviewId)
          if (index !== -1) {
            reviewArray[index] = { ...reviewArray[index], ...reviewData }
          }
        }
        
        updateReview(this.reviews)
        updateReview(this.userReviews)
        
        return { message: 'Review updated successfully' }
      } catch (error) {
        this.error = error.message
        console.error('Error updating review:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteReview(reviewId) {
      this.loading = true
      try {
        const token = await auth.currentUser?.getIdToken()
        if (!token) throw new Error('User not authenticated')

        const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) throw new Error('Failed to delete review')
        
        // Update local state
        this.reviews = this.reviews.filter(r => r.id !== reviewId)
        this.userReviews = this.userReviews.filter(r => r.id !== reviewId)
        
        return { message: 'Review deleted successfully' }
      } catch (error) {
        this.error = error.message
        console.error('Error deleting review:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
