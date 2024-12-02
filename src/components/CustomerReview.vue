<script setup>
import { ref, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUserCircle, faCheck, faTrash, faCheckCircle } from '@fortawesome/free-solid-svg-icons'

library.add(faUserCircle, faCheck, faTrash, faCheckCircle)

// Filter options
const starRatings = [5, 4, 3, 2, 1]
const currentStarFilter = ref('')  // Set default to empty string
const currentProductFilter = ref('') // Set default to empty string
const currentReadFilter = ref('all') // Set default to 'all'

// Modal state
const showDeleteModal = ref(false)
const reviewToDelete = ref(null)

// Sample data - replace with actual data later
const reviews = ref([
  {
    id: 1,
    username: 'John Doe',
    rating: 5,
    productName: 'Milky Strawberry',
    description: 'Absolutely delicious! Perfect blend of flavors.',
    date: new Date('2024-02-20T10:30:00'),
    isRead: false
  },
  {
    id: 2,
    username: 'Jane Smith',
    rating: 4,
    productName: 'Dream Latte',
    description: 'Great coffee, very smooth and aromatic.',
    date: new Date('2024-02-19T15:45:00'),
    isRead: true
  },
  {
    id: 3,
    username: 'Mike Johnson',
    rating: 5,
    productName: 'Caramel Macchiato',
    description: 'Best caramel macchiato I\'ve ever had! Will definitely order again.',
    date: new Date('2024-02-18T09:15:00'),
    isRead: false
  },
  {
    id: 4,
    username: 'Sarah Wilson',
    rating: 3,
    productName: 'Dark Chocolate',
    description: 'Good but could be a bit sweeter.',
    date: new Date('2024-02-17T14:20:00'),
    isRead: true
  },
  {
    id: 5,
    username: 'David Brown',
    rating: 5,
    productName: 'Dreamy Yogurt',
    description: 'Fresh and creamy! Love the fruit toppings.',
    date: new Date('2024-02-16T11:30:00'),
    isRead: false
  },
  {
    id: 6,
    username: 'Emma Davis',
    rating: 4,
    productName: 'Hot Dark Chocolate',
    description: 'Perfect for cold days. Rich and warming.',
    date: new Date('2024-02-15T16:45:00'),
    isRead: true
  },
  {
    id: 7,
    username: 'Chris Lee',
    rating: 2,
    productName: 'Milky Strawberry',
    description: 'A bit too sweet for my taste.',
    date: new Date('2024-02-14T13:20:00'),
    isRead: false
  },
  {
    id: 8,
    username: 'Lisa Anderson',
    rating: 5,
    productName: 'Dream Latte',
    description: 'The perfect balance of coffee and milk. Amazing!',
    date: new Date('2024-02-13T10:15:00'),
    isRead: true
  },
  {
    id: 9,
    username: 'Tom Wilson',
    rating: 4,
    productName: 'Caramel Macchiato',
    description: 'Love the caramel flavor, not too sweet.',
    date: new Date('2024-02-12T15:30:00'),
    isRead: false
  },
  {
    id: 10,
    username: 'Amy Chen',
    rating: 5,
    productName: 'Dreamy Yogurt',
    description: 'So refreshing! The fruit is always fresh.',
    date: new Date('2024-02-11T12:45:00'),
    isRead: true
  },
  {
    id: 11,
    username: 'Mark Thompson',
    rating: 3,
    productName: 'Hot Dark Chocolate',
    description: 'Good but could be a bit richer.',
    date: new Date('2024-02-10T14:20:00'),
    isRead: false
  },
  {
    id: 12,
    username: 'Rachel Green',
    rating: 5,
    productName: 'Dark Chocolate',
    description: 'Perfect level of sweetness! My new favorite.',
    date: new Date('2024-02-09T11:30:00'),
    isRead: true
  }
])

// Available products (matching ReviewSection)
const products = [
  'Milky Strawberry',
  'Dream Latte',
  'Caramel Macchiato',
  'Dark Chocolate',
  'Dreamy Yogurt',
  'Hot Dark Chocolate'
]

// Read status options
const readStatuses = [
  { value: 'all', label: 'All Reviews' },
  { value: 'read', label: 'Read Reviews' },
  { value: 'unread', label: 'Unread Reviews' }
]

// Pagination
const itemsPerPage = 6
const currentPage = ref(1)

// Methods for review actions
const markAsRead = (review) => {
  review.isRead = true
  // Add API call here to update the review status in the backend
}

const deleteReview = (review) => {
  reviewToDelete.value = review
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  reviewToDelete.value = null
}

const confirmDelete = () => {
  const index = reviews.value.findIndex(r => r.id === reviewToDelete.value.id)
  if (index !== -1) {
    reviews.value.splice(index, 1)
  }
  showDeleteModal.value = false
  reviewToDelete.value = null
}

// Computed properties
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

const totalPages = computed(() => Math.ceil(filteredReviews.value.length / itemsPerPage))

const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredReviews.value.slice(start, end)
})

const displayedPageNumbers = computed(() => {
  if (totalPages.value <= 5) {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1)
  }

  let numbers = []
  const current = currentPage.value
  const total = totalPages.value

  // Always show first page
  numbers.push(1)

  if (current > 3) {
    numbers.push('...')
  }

  // Show pages around current page
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    numbers.push(i)
  }

  if (current < total - 2) {
    numbers.push('...')
  }

  // Always show last page
  if (total > 1) {
    numbers.push(total)
  }

  return numbers
})

const goToPage = (page) => {
  if (page !== '...') {
    currentPage.value = page
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const renderStars = (rating) => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}
</script>

<template>
  <div class="reviews-container">
    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-group">
        <h2>Filter by Rating</h2>
        <select v-model="currentStarFilter" class="rating-dropdown">
          <option value="">All Ratings</option>
          <option v-for="rating in starRatings" :key="rating" :value="rating">
            {{ rating }} Stars {{ renderStars(rating) }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <h2>Filter by Product</h2>
        <select v-model="currentProductFilter" class="product-dropdown">
          <option value="">All Products</option>
          <option v-for="product in products" :key="product" :value="product">
            {{ product }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <h2>Filter by Status</h2>
        <select v-model="currentReadFilter" class="status-dropdown">
          <option 
            v-for="status in readStatuses" 
            :key="status.value" 
            :value="status.value"
          >
            {{ status.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Reviews Grid -->
    <div class="reviews-grid">
      <div v-for="review in paginatedReviews" 
           :key="review.id" 
           class="review-card"
           :class="{ 'read': review.isRead }">
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
            <div class="action-buttons">
              <button 
                @click="markAsRead(review)" 
                class="action-btn read-btn"
                :class="{ 'read': review.isRead }"
                :disabled="review.isRead"
              >
                <font-awesome-icon :icon="review.isRead ? ['fas', 'check-circle'] : ['fas', 'check']" />
                {{ review.isRead ? 'Read' : 'Mark as Read' }}
              </button>
              <button @click="deleteReview(review)" class="action-btn delete-btn">
                <font-awesome-icon :icon="['fas', 'trash']" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content delete-modal">
        <h2>Confirm Delete</h2>
        <p class="delete-message">
          Are you sure you want to delete this review from <span class="user-highlight">{{ reviewToDelete?.username }}</span>?
          This action cannot be undone.
        </p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="cancelDelete">Cancel</button>
          <button class="delete-confirm-btn" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        class="page-btn"
        @click="prevPage"
        :disabled="currentPage === 1"
      >&lt;</button>
      <button
        v-for="pageNum in displayedPageNumbers"
        :key="pageNum"
        :class="['page-btn', { active: currentPage === pageNum }]"
        @click="goToPage(pageNum)"
      >
        {{ pageNum }}
      </button>
      <button
        class="page-btn"
        @click="nextPage"
        :disabled="currentPage === totalPages"
      >&gt;</button>
    </div>
  </div>
</template>

<style scoped>
.reviews-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
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
  gap: 20px;
  margin-bottom: 24px;
}

.review-card {
  background-color: #efebe9;
  border: 1px solid #d7ccc8;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.review-card.read {
  background-color: #f5f5f5;
  opacity: 0.8;
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
  gap: 12px;
}

.user-icon {
  font-size: 2rem;
  color: #8d6e63;
}

.stars {
  color: #8d6e63;
  font-size: 1.2em;
}

.review-content {
  color: #5d4037;
}

.product-name {
  margin-bottom: 0.8rem;
  color: #8d6e63;
  font-weight: 500;
}

.review-text {
  margin-bottom: 1rem;
  line-height: 1.5;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.review-date {
  color: #8d6e63;
  font-size: 0.9em;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #8D6E63;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 0.9rem;
}

.action-btn:hover:not(:disabled) {
  background-color: #5D4037;
}

.read-btn {
  background-color: #8D6E63;
}

.read-btn:hover:not(:disabled) {
  background-color: #5D4037;
}

.read-btn.read {
  background-color: #3E2723;
  opacity: 0.8;
  cursor: default;
}

.read-btn:disabled {
  opacity: 0.7;
  cursor: default;
  background-color: #D7CCC8;
}

.delete-btn {
  background-color: #8D6E63;
}

.delete-btn:hover {
  background-color: #5D4037;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #8d6e63;
  background-color: white;
  color: #5d4037;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 40px;
  border-radius: 4px;
}

.page-btn:hover:not(:disabled) {
  background-color: #8d6e63;
  color: white;
}

.page-btn.active {
  background-color: #5d4037;
  color: white;
  border-color: #5d4037;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #8D6E63;
  font-size: 1.5rem;
  font-weight: 600;
  border-bottom: 2px solid #8D6E63;
  padding-bottom: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #EFEBE9;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #EFEBE9;
  color: #5D4037;
}

.cancel-btn:hover {
  background-color: #D7CCC8;
}

/* Delete Modal Styles */
.delete-modal {
  max-width: 400px;
}

.delete-modal h2 {
  color: #8D6E63;
  border-bottom-color: #8D6E63;
}

.delete-message {
  color: #5D4037;
  line-height: 1.5;
  margin: 1rem 0 1.5rem;
  text-align: center;
  font-size: 0.95rem;
}

.user-highlight {
  color: #8D6E63;
  font-weight: 600;
}

.delete-confirm-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #8D6E63;
  color: white;
}

.delete-confirm-btn:hover {
  background-color: #6D4C41;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(109, 76, 65, 0.2);
}

.delete-confirm-btn:active {
  transform: translateY(0);
  box-shadow: none;
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

  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
