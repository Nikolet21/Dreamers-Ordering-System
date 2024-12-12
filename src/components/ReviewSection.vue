<script setup>
import { ref, computed, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useUserStore } from '@/stores/userStore'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import dataService from '@/services/dataService'

library.add(faUserCircle)

const userStore = useUserStore()

// Loading and error states
const isLoading = ref(false)
const error = ref(null)
const isSubmitting = ref(false)
const validationErrors = ref([])

// Form data
const selectedProduct = ref('')
const productRating = ref(0)
const productFeedback = ref('')
const showSuccessMessage = ref(false)
const successTimeout = ref(null)

// Reviews pagination
const currentPage = ref(1)
const itemsPerPage = 4
const customerReviews = ref([])

// Products data
const products = ref([])

// Computed properties for pagination
const totalPages = computed(() => Math.ceil(customerReviews.value.length / itemsPerPage))
const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return customerReviews.value.slice(start, end)
})

// Fetch products for the dropdown
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

// Fetch reviews
const fetchReviews = async () => {
  try {
    isLoading.value = true
    error.value = null
    const reviewsData = await dataService.fetchReviews()
    customerReviews.value = reviewsData.map(review => ({
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

// Submit review
const submitProductReview = async () => {
  try {
    validationErrors.value = []
    error.value = null

    // Get user information from store
    const currentUser = userStore.currentUser;
    const username = currentUser?.displayName || 'Anonymous';
    const userId = currentUser?.uid || null;

    const reviewData = {
      username: username,
      productName: selectedProduct.value,
      rating: parseInt(productRating.value),
      description: productFeedback.value.trim(),
      userId: userId,
      isAuthenticated: !!currentUser
    }

    if (!validateForm()) {
      return
    }

    isSubmitting.value = true

    const response = await dataService.submitReview(reviewData)
    console.log('Review submitted successfully:', response)

    // Reset form
    selectedProduct.value = ''
    productRating.value = 0
    productFeedback.value = ''

    // Show success message
    showSuccessMessage.value = true
    if (successTimeout.value) {
      clearTimeout(successTimeout.value)
    }
    successTimeout.value = setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)

    // Refresh reviews
    await fetchReviews()
  } catch (err) {
    console.error('Error submitting review:', err)
    error.value = 'Failed to submit review. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// Form validation
const validateForm = () => {
  if (!selectedProduct.value.trim()) {
    validationErrors.value.push('Product selection is required')
    return false
  }
  if (!productRating.value || productRating.value < 1 || productRating.value > 5) {
    validationErrors.value.push('Rating is required (1-5 stars)')
    return false
  }
  if (!productFeedback.value.trim()) {
    validationErrors.value.push('Review description is required')
    return false
  }
  return true
}

// Pagination methods
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

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Render stars
const renderStars = (rating) => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([
    fetchProducts(),
    fetchReviews()
  ])
})
</script>

<template>
  <div class="review-container">
    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="fetchReviews" class="retry-btn">Retry</button>
    </div>

    <div class="review-layout">
      <!-- Fixed Left Section - Write Review -->
      <div class="left-section">
        <div class="product-review-section">
          <h2>Write a Review</h2>
          <form @submit.prevent="submitProductReview" class="review-form">
            <div class="form-group">
              <label for="product">Select Product</label>
              <select
                id="product"
                v-model="selectedProduct"
                :class="{ 'error': validationErrors.includes('Product selection is required') }"
              >
                <option value="">Select a product</option>
                <option
                  v-for="product in products"
                  :key="product.id"
                  :value="product.name"
                >
                  {{ product.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Rating</label>
              <div class="star-rating">
                <div class="stars">
                  <input
                    type="radio"
                    id="star5"
                    name="rating"
                    value="5"
                    v-model="productRating"
                    :class="{ 'error': validationErrors.includes('Rating is required') }"
                  />
                  <label for="star5" title="5 stars">★</label>

                  <input
                    type="radio"
                    id="star4"
                    name="rating"
                    value="4"
                    v-model="productRating"
                  />
                  <label for="star4" title="4 stars">★</label>

                  <input
                    type="radio"
                    id="star3"
                    name="rating"
                    value="3"
                    v-model="productRating"
                  />
                  <label for="star3" title="3 stars">★</label>

                  <input
                    type="radio"
                    id="star2"
                    name="rating"
                    value="2"
                    v-model="productRating"
                  />
                  <label for="star2" title="2 stars">★</label>

                  <input
                    type="radio"
                    id="star1"
                    name="rating"
                    value="1"
                    v-model="productRating"
                  />
                  <label for="star1" title="1 star">★</label>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="feedback">Your Review</label>
              <textarea
                id="feedback"
                v-model="productFeedback"
                rows="4"
                :class="{ 'error': validationErrors.includes('Review description is required') }"
                placeholder="Share your experience with this product..."
              ></textarea>
            </div>

            <div v-if="validationErrors.length > 0" class="validation-errors">
              <p v-for="(error, index) in validationErrors" :key="index">{{ error }}</p>
            </div>

            <button
              type="submit"
              class="submit-btn"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
            </button>

            <div v-if="showSuccessMessage" class="success-message">
              Review submitted successfully!
            </div>
          </form>
        </div>
      </div>

      <!-- Right Section - Review Grid -->
      <div class="right-section">
        <h2>Customer Reviews</h2>
        <div class="reviews-grid">
          <div v-if="isLoading" class="loading-spinner">
            Loading reviews...
          </div>
          <template v-else>
            <div v-for="review in paginatedReviews"
                :key="review.id"
                class="review-card">
              <div class="review-header">
                <div class="user-info">
                  <font-awesome-icon icon="user" class="user-icon" />
                  <span class="username">{{ review.username }}</span>
                </div>
                <div class="rating">
                  {{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}
                </div>
              </div>
              <div class="review-content">
                <div class="product-name">{{ review.productName }}</div>
                <p class="review-text">{{ review.description }}</p>
                <div class="review-date">{{ formatDate(review.date) }}</div>
              </div>
            </div>
          </template>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <button
            class="page-btn"
            @click="prevPage"
            :disabled="currentPage === 1">
            Previous
          </button>
          <span class="page-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            class="page-btn"
            @click="nextPage"
            :disabled="currentPage === totalPages">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-container {
  max-width: 100%;
  min-height: calc(100vh - 4rem);
  background-color: #EFEBE9; /* Add margin for the header */
  position: relative;
  overflow-x: hidden;
}

.review-layout {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  position: relative;
  min-height: calc(100vh - 80px); /* Adjust for the top margin */
}

.left-section {
  position: fixed;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 400px;
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 40px; /* Add margin to account for header */
  max-height: calc(100vh - 160px); /* Adjust max height to account for margins */
  overflow-y: auto;
}

.right-section {
  margin-left: calc(400px + 4rem);
  flex: 1;
  padding: 0 2rem;
  margin-top: 40px; /* Add matching margin */
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.review-card {
  background: white;
  border: 1px solid #D7CCC8;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.review-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Responsive Design */
@media (max-width: 1400px) {
  .reviews-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 1200px) {
  .review-layout {
    flex-direction: column;
    min-height: auto;
  }

  .left-section {
    position: relative;
    left: 0;
    top: 0;
    transform: none;
    width: 100%;
    max-width: none;
    margin-bottom: 2rem;
    max-height: none;
    margin-top: 0;
  }

  .right-section {
    margin-left: 0;
    padding: 0;
    margin-top: 0;
  }
}

@media (max-width: 768px) {
  .reviews-grid {
    grid-template-columns: 1fr;
  }

  .review-layout {
    padding: 1rem;
  }

  .pagination {
    flex-wrap: wrap;
  }
}

/* Keep existing styles */
.review-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #3E2723;
  font-weight: 500;
}

select,
input[type="number"],
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #8D6E63;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.3s ease;
  color: #3E2723;
}

select:focus,
input:focus,
textarea:focus {
  outline: none;
  border-color: #3E2723;
  box-shadow: 0 0 0 2px rgba(62, 39, 35, 0.1);
}

select:hover,
input:hover,
textarea:hover {
  border-color: #3E2723;
}

.star-rating {
  display: flex;
  justify-content: flex-start;
  margin: 0.5rem 0;
  width: 100%;
}

.stars {
  display: flex;
  flex-direction: row-reverse;
  gap: 0.25rem;
}

.stars input[type="radio"] {
  display: none;
}

.stars label {
  font-size: 2rem;
  color: #D7CCC8;
  cursor: pointer;
  transition: color 0.3s ease;
}

.stars label:hover,
.stars label:hover ~ label,
.stars input[type="radio"]:checked ~ label {
  color: #FF9800;
}

.stars input[type="radio"]:checked + label {
  color: #FF9800;
}

.form-group:has(.star-rating) {
  margin: 1.5rem 0;
}

.submit-btn {
  background-color: #3E2723;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submit-btn:hover {
  background-color: #5D4037;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background-color: #D7CCC8;
  cursor: not-allowed;
  transform: none;
}

.error {
  border-color: #ef5350;
}

.validation-errors {
  color: #ef5350;
  font-size: 0.9rem;
  background-color: #ffebee;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 4px solid #ef5350;
}

.success-message {
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.review-card {
  background: white;
  border: 1px solid #D7CCC8;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.review-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #EFEBE9;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-icon {
  color: #3E2723;
  font-size: 1.2rem;
}

.username {
  font-weight: 600;
  color: #3E2723;
}

.rating {
  color: #FF9800;
  letter-spacing: 2px;
  font-size: 1.1rem;
}

.review-content {
  color: #5D4037;
}

.product-name {
  font-weight: 600;
  color: #3E2723;
  margin-bottom: 0.75rem;
}

.review-text {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.review-date {
  color: #8D6E63;
  font-size: 0.9rem;
  font-style: italic;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  background-color: #3E2723;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.page-btn:hover:not(:disabled) {
  background-color: #5D4037;
  transform: translateY(-1px);
}

.page-btn:disabled {
  background-color: #D7CCC8;
  cursor: not-allowed;
  transform: none;
}

.page-info {
  color: #3E2723;
  font-weight: 500;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #3E2723;
  font-weight: 500;
}

@media (max-width: 768px) {
  .review-sections {
    grid-template-columns: 1fr;
  }

  .review-container {
    padding: 1rem;
  }

  h2 {
    font-size: 1.5rem;
  }
}
</style>
