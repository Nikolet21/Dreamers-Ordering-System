<script setup>
import { ref, computed, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUserCircle, faCheck, faTrash, faCheckCircle, faInbox } from '@fortawesome/free-solid-svg-icons'
import dataService from '@/services/dataService'

library.add(faUserCircle, faCheck, faTrash, faCheckCircle, faInbox)

// Filter options
const starRatings = [5, 4, 3, 2, 1]
const currentStarFilter = ref('')
const currentProductFilter = ref('')
const currentReadFilter = ref('all')

// Loading and error states
const isLoading = ref(false)
const error = ref(null)
const isDeleting = ref(false)
const isMarkingRead = ref(false)

// Reviews data
const reviews = ref([])
const products = ref([])

// Modal state
const showDeleteModal = ref(false)
const reviewToDelete = ref(null)

// Fetch reviews
const fetchReviews = async () => {
  try {
    isLoading.value = true
    error.value = null
    const reviewsData = await dataService.fetchReviews()
    reviews.value = reviewsData.map(review => ({
      ...review,
      date: new Date(review.date)
    }))
  } catch (error) {
    console.error('Error fetching reviews:', error)
    error.value = 'Failed to load reviews. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

// Fetch products
const fetchProducts = async () => {
  try {
    isLoading.value = true
    error.value = null
    products.value = await dataService.fetchMenuData()
  } catch (error) {
    console.error('Error fetching products:', error)
    error.value = 'Failed to load products. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

// Filter reviews
const filteredReviews = computed(() => {
  return reviews.value.filter(review => {
    const starMatch = !currentStarFilter.value || review.rating === parseInt(currentStarFilter.value)
    const productMatch = !currentProductFilter.value || review.productName === currentProductFilter.value
    const readMatch = currentReadFilter.value === 'all' ||
      (currentReadFilter.value === 'read' && review.isRead) ||
      (currentReadFilter.value === 'unread' && !review.isRead)

    return starMatch && productMatch && readMatch
  })
})

// Mark review as read
const markAsRead = async (review) => {
  try {
    isMarkingRead.value = true
    error.value = null
    await dataService.markReviewAsRead(review.id)
    review.isRead = true
  } catch (error) {
    console.error('Error marking review as read:', error)
    error.value = 'Failed to mark review as read. Please try again.'
  } finally {
    isMarkingRead.value = false
  }
}

// Delete review
const deleteReview = async (review) => {
  reviewToDelete.value = review
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  try {
    isDeleting.value = true
    error.value = null
    await dataService.deleteReview(reviewToDelete.value.id)
    reviews.value = reviews.value.filter(r => r.id !== reviewToDelete.value.id)
    showDeleteModal.value = false
    reviewToDelete.value = null
  } catch (error) {
    console.error('Error deleting review:', error)
    error.value = 'Failed to delete review. Please try again.'
  } finally {
    isDeleting.value = false
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  reviewToDelete.value = null
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating)

// Clear filters function
const clearFilters = () => {
  currentStarFilter.value = ''
  currentProductFilter.value = ''
  currentReadFilter.value = 'all'
}

// Initialize data
onMounted(() => {
  fetchProducts()
  fetchReviews()
})
</script>

<template>
  <div class="admin-reviews">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="fetchReviews" class="retry-btn">Retry</button>
    </div>

    <div class="reviews-container" :class="{ 'is-loading': isLoading }">
      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-group">
          <h2>Filter by Rating</h2>
          <select v-model="currentStarFilter" class="rating-dropdown" :disabled="isLoading">
            <option value="">All Ratings</option>
            <option v-for="rating in starRatings" :key="rating" :value="rating">
              {{ rating }} Stars {{ renderStars(rating) }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <h2>Filter by Product</h2>
          <select v-model="currentProductFilter" class="product-dropdown" :disabled="isLoading">
            <option value="">All Products</option>
            <option v-for="product in products" :key="product.id" :value="product.name">
              {{ product.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <h2>Filter by Status</h2>
          <select v-model="currentReadFilter" class="status-dropdown" :disabled="isLoading">
            <option value="all">All Reviews</option>
            <option value="read">Read Reviews</option>
            <option value="unread">Unread Reviews</option>
          </select>
        </div>
      </div>

      <!-- Reviews Grid -->
      <div class="reviews-section">
        <!-- Loading indicator -->
        <div v-if="isLoading" class="section-loading">
          <div class="loading-spinner"></div>
          <p>Loading reviews...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="!filteredReviews.length" class="empty-state">
          <font-awesome-icon :icon="['fas', 'inbox']" class="empty-icon" />
          <p v-if="currentStarFilter || currentProductFilter || currentReadFilter !== 'all'">
            No reviews match your current filters.
            <button class="clear-filters-btn" @click="clearFilters">Clear Filters</button>
          </p>
          <p v-else>No reviews available.</p>
        </div>

        <div v-else class="reviews-grid">
          <div v-for="review in filteredReviews"
               :key="review.id"
               class="review-card"
               :class="{ 'unread': !review.isRead }">
            <div class="review-header">
              <div class="user-info">
                <font-awesome-icon :icon="['fas', 'user-circle']" class="user-icon" />
                <h3>{{ review.username }}</h3>
              </div>
              <div class="rating">
                <span class="stars">{{ renderStars(review.rating) }}</span>
              </div>
            </div>

            <div class="review-content">
              <div class="product-name">
                <strong>Product:</strong> {{ review.productName }}
              </div>
              <p class="review-text">{{ review.description }}</p>
              <div class="review-footer">
                <div class="review-date">
                  {{ formatDate(review.date) }}
                </div>
                <div class="review-actions">
                  <button v-if="!review.isRead"
                          @click="markAsRead(review)"
                          class="action-btn read-btn"
                          :disabled="isMarkingRead"
                          title="Mark as Read">
                    <font-awesome-icon :icon="['fas', 'check']" />
                    {{ isMarkingRead ? '...' : '' }}
                  </button>
                  <button @click="deleteReview(review)"
                          class="action-btn delete-btn"
                          :disabled="isDeleting"
                          title="Delete Review">
                    <font-awesome-icon :icon="['fas', 'trash']" />
                    {{ isDeleting ? '...' : '' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal">
          <h3>Delete Review</h3>
          <p>Are you sure you want to delete this review?</p>
          <div class="modal-actions">
            <button 
              @click="confirmDelete" 
              class="delete-btn" 
              :disabled="isDeleting"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
            <button 
              @click="cancelDelete" 
              class="cancel-btn"
              :disabled="isDeleting"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reviews-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.filter-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.filter-group {
  background-color: #efebe9;
  padding: 2rem;
  border-radius: 8px;
}

h2 {
  color: #5d4037;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.rating-dropdown,
.product-dropdown,
.status-dropdown {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #8d6e63;
  border-radius: 4px;
  background-color: white;
  color: #5d4037;
  font-size: 1rem;
}

.rating-dropdown option,
.product-dropdown option,
.status-dropdown option {
  padding: 8px;
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.review-card {
  background: white;
  border: 1px solid #d7ccc8;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.review-card.unread {
  border-left: 4px solid #8d6e63;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #d7ccc8;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-icon {
  color: #8d6e63;
  font-size: 1.5rem;
}

.stars {
  color: #ffd700;
}

.review-content {
  color: #5d4037;
}

.product-name {
  margin-bottom: 0.5rem;
  color: #8d6e63;
}

.review-text {
  margin-bottom: 1rem;
  line-height: 1.5;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-date {
  color: #8d6e63;
  font-size: 0.9em;
}

.review-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.read-btn {
  background-color: #4CAF50;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #9e9e9e;
  color: white;
}

/* Loading Styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #8d6e63;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.is-loading {
  opacity: 0.7;
  pointer-events: none;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.retry-btn {
  background-color: #c62828;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #b71c1c;
}

/* Disabled state styles */
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 1rem 0;
}

.empty-state .empty-icon {
  font-size: 3rem;
  color: #bdbdbd;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #757575;
  font-size: 1.1rem;
  margin: 0;
}

.clear-filters-btn {
  background: none;
  border: none;
  color: #8d6e63;
  text-decoration: underline;
  cursor: pointer;
  padding: 0.5rem;
  margin-left: 0.5rem;
}

.clear-filters-btn:hover {
  color: #5d4037;
}

@media (max-width: 768px) {
  .filter-section {
    grid-template-columns: 1fr;
  }

  .reviews-grid {
    grid-template-columns: 1fr;
  }

  .review-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .review-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
