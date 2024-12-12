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
const itemsPerPage = 5
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

    const reviewData = {
      username: userStore.user ? userStore.user.username : 'Anonymous',
      productName: selectedProduct.value,
      rating: parseInt(productRating.value),
      description: productFeedback.value.trim(),
      userId: userStore.user ? userStore.user.id : null
    }

    console.log('Preparing to submit review:', reviewData); // Debug log

    // Validate review data
    const errors = dataService.validateReview(reviewData)
    if (errors.length > 0) {
      validationErrors.value = errors
      console.log('Validation errors:', errors); // Debug log
      return
    }

    isSubmitting.value = true

    const response = await dataService.submitReview(reviewData)
    console.log('Review submitted successfully:', response); // Debug log

    // Reset form
    selectedProduct.value = ''
    productRating.value = 0
    productFeedback.value = ''

    // Show success message
    showSuccessMessage.value = true
    if (successTimeout.value) clearTimeout(successTimeout.value)
    successTimeout.value = setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)

    // Refresh reviews
    await fetchReviews()
  } catch (err) {
    console.error('Error in submitProductReview:', err);
    error.value = err.response?.data?.error || 'Failed to submit review. Please try again.'
  } finally {
    isSubmitting.value = false
  }
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

const goToPage = (page) => {
  currentPage.value = page
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

const contactForm = ref({
  name: '',
  email: '',
  message: '',
})

const submitContact = () => {
  console.log('Contact Form:', contactForm.value)
  contactForm.value = {
    name: '',
    email: '',
    message: '',
  }
}
</script>

<template>
  <div class="review-container">
    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="fetchReviews" class="retry-btn">Retry</button>
    </div>

    <div class="review-sections" :class="{ 'is-loading': isLoading }">
      <!-- Left Side - Product Review and Contact Form -->
      <div class="left-section">
        <!-- Product Review Section -->
        <div class="product-review-section">
          <h2>Product Review</h2>

          <!-- Validation Errors -->
          <div v-if="validationErrors.length > 0" class="validation-errors">
            <ul>
              <li v-for="(error, index) in validationErrors" :key="index">
                {{ error }}
              </li>
            </ul>
          </div>

          <!-- Loading indicator -->
          <div v-if="isLoading" class="section-loading">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
          </div>

          <div v-else>
            <select
              v-model="selectedProduct"
              class="product-dropdown"
              required
              :disabled="isSubmitting"
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

            <div class="star-rating">
              <div class="stars">
                <input
                  type="radio"
                  id="star5"
                  name="rating"
                  value="5"
                  v-model="productRating"
                  required
                  :disabled="isSubmitting"
                />
                <label for="star5">★</label>
                <input
                  type="radio"
                  id="star4"
                  name="rating"
                  value="4"
                  v-model="productRating"
                  :disabled="isSubmitting"
                />
                <label for="star4">★</label>
                <input
                  type="radio"
                  id="star3"
                  name="rating"
                  value="3"
                  v-model="productRating"
                  :disabled="isSubmitting"
                />
                <label for="star3">★</label>
                <input
                  type="radio"
                  id="star2"
                  name="rating"
                  value="2"
                  v-model="productRating"
                  :disabled="isSubmitting"
                />
                <label for="star2">★</label>
                <input
                  type="radio"
                  id="star1"
                  name="rating"
                  value="1"
                  v-model="productRating"
                  :disabled="isSubmitting"
                />
                <label for="star1">★</label>
              </div>
            </div>

            <textarea
              v-model="productFeedback"
              placeholder="Share your thoughts about this product... (minimum 10 characters)"
              class="feedback-textarea"
              required
              :disabled="isSubmitting"
            ></textarea>

            <div class="success-message" v-if="showSuccessMessage">
              Review submitted successfully!
            </div>

            <button
              class="submit-btn"
              @click="submitProductReview"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
            </button>
          </div>
        </div>

        <!-- Contact Form Section -->
        <div class="contact-form">
          <h2>Contact Us</h2>
          <form @submit.prevent="submitContact">
            <div class="form-group">
              <input type="text" v-model="contactForm.name" placeholder="Your Name" required />
            </div>
            <div class="form-group">
              <input type="email" v-model="contactForm.email" placeholder="Your Email" required />
            </div>
            <div class="form-group">
              <textarea v-model="contactForm.message" placeholder="Your Message" required></textarea>
            </div>
            <button type="submit" class="submit-btn">Send Message</button>
          </form>
        </div>
      </div>

      <!-- Right Side - Customer Reviews -->
      <div class="right-section">
        <div class="customer-reviews">
          <h2>Customer Reviews</h2>

          <!-- Loading indicator -->
          <div v-if="isLoading" class="section-loading">
            <div class="loading-spinner"></div>
            <p>Loading reviews...</p>
          </div>

          <div v-else class="reviews-grid">
            <div v-for="review in paginatedReviews"
                 :key="review.id"
                 class="review-card">
              <div class="review-header">
                <div class="user-info">
                  <font-awesome-icon :icon="['fas', 'user-circle']" class="user-icon" />
                  <h3>{{ review.username || 'Anonymous' }}</h3>
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
                </div>
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
  margin-top: 2rem;
}

.review-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  min-height: 800px;
}

.left-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: 800px;
}

h2 {
  color: #5d4037;
  margin-bottom: 1.5rem;
}

/* Star Rating Styles */
.star-rating {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.stars {
  display: flex;
  flex-direction: row-reverse;
  gap: 0.5rem;
}

.stars input[type='radio'] {
  display: none;
}

.stars label {
  font-size: 2rem;
  color: #d7ccc8;
  cursor: pointer;
  transition: color 0.2s;
}

.stars label:hover,
.stars label:hover ~ label,
.stars input[type='radio']:checked ~ label {
  color: #8d6e63;
}

/* Product Review Section Styles */
.product-review-section {
  background-color: #efebe9;
  padding: 2rem;
  border-radius: 8px;
  flex: 1;
  overflow-y: auto;
}

.product-dropdown {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #8d6e63;
  border-radius: 4px;
  background-color: white;
  color: #5d4037;
}

.feedback-textarea {
  width: 100%;
  height: 150px;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #8d6e63;
  border-radius: 4px;
  resize: vertical;
}

/* Contact Form Styles */
.contact-form {
  background-color: #efebe9;
  padding: 2rem;
  border-radius: 8px;
  flex: 1;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #8d6e63;
  border-radius: 4px;
}

.form-group textarea {
  height: 120px;
  resize: vertical;
}

/* Customer Reviews Styles */
.customer-reviews {
  background-color: #efebe9;
  padding: 2rem;
  border-radius: 8px;
  height: 800px;
  display: flex;
  flex-direction: column;
}

.reviews-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  padding-right: 10px;
}

.review-card {
  background-color: #efebe9;
  border: 1px solid #d7ccc8;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
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

.submit-btn {
  width: 100%;
  padding: 0.8rem;
  background-color: #8d6e63;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #6d4c41;
}

/* Pagination Styles */
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

/* Scrollbar Styles */
.reviews-grid::-webkit-scrollbar,
.product-review-section::-webkit-scrollbar,
.contact-form::-webkit-scrollbar {
  width: 8px;
}

.reviews-grid::-webkit-scrollbar-track,
.product-review-section::-webkit-scrollbar-track,
.contact-form::-webkit-scrollbar-track {
  background: #d7ccc8;
  border-radius: 4px;
}

.reviews-grid::-webkit-scrollbar-thumb,
.product-review-section::-webkit-scrollbar-thumb,
.contact-form::-webkit-scrollbar-thumb {
  background: #8d6e63;
  border-radius: 4px;
}

.reviews-grid::-webkit-scrollbar-thumb:hover,
.product-review-section::-webkit-scrollbar-thumb:hover,
.contact-form::-webkit-scrollbar-thumb:hover {
  background: #6d4c41;
}

/* Form Input Styles */
.name-input {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #8d6e63;
  border-radius: 4px;
  background-color: white;
  color: #5d4037;
}

.success-message {
  background-color: #4CAF50;
  color: white;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 1rem;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* Loading Styles */
.section-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  margin: 1rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #8d6e63;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
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

.validation-errors {
  background-color: #fff3e0;
  color: #e65100;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  border-left: 4px solid #e65100;
}

.validation-errors ul {
  margin: 0;
  padding-left: 1.5rem;
}

.validation-errors li {
  margin-bottom: 0.5rem;
}

.validation-errors li:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .review-sections {
    grid-template-columns: 1fr;
  }
}
</style>
