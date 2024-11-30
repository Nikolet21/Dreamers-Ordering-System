<script setup>
import { ref, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const selectedProduct = ref('')
const productRating = ref(0)
const productFeedback = ref('')
const contactForm = ref({
  name: '',
  email: '',
  message: '',
})
const showSuccessMessage = ref(false)
const successTimeout = ref(null)

const ITEMS_PER_PAGE = 4
const currentPage = ref(1)

const customerReviews = ref([
  {
    id: 1,
    username: 'John Doe',
    rating: 5,
    productName: 'Milky Strawberry',
    description: 'Absolutely delicious! Perfect blend of flavors.',
    date: new Date('2024-02-20T10:30:00')
  },
  {
    id: 2,
    username: 'Jane Smith',
    rating: 4,
    productName: 'Dream Latte',
    description: 'Great coffee, very smooth and aromatic.',
    date: new Date('2024-02-19T15:45:00')
  },
  {
    id: 3,
    username: 'Mike Johnson',
    rating: 5,
    productName: 'Caramel Macchiato',
    description: 'Best caramel macchiato I\'ve ever had! Will definitely order again.',
    date: new Date('2024-02-18T09:15:00')
  },
  {
    id: 4,
    username: 'Sarah Wilson',
    rating: 3,
    productName: 'Dark Chocolate',
    description: 'Good but could be a bit sweeter.',
    date: new Date('2024-02-17T14:20:00')
  },
  {
    id: 5,
    username: 'David Brown',
    rating: 5,
    productName: 'Dreamy Yogurt',
    description: 'Fresh and creamy! Love the fruit toppings.',
    date: new Date('2024-02-16T11:30:00')
  },
  {
    id: 6,
    username: 'Emma Davis',
    rating: 4,
    productName: 'Hot Dark Chocolate',
    description: 'Perfect for cold days. Rich and warming.',
    date: new Date('2024-02-15T16:45:00')
  }
])

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(customerReviews.value.length / ITEMS_PER_PAGE)
})

const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  return customerReviews.value.slice(start, end)
})

const displayedPageNumbers = computed(() => {
  if (totalPages.value <= 5) {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1)
  }

  let pages = []
  // Always show first page
  pages.push(1)

  // Calculate middle pages
  let middleStart = Math.max(2, currentPage.value - 1)
  let middleEnd = Math.min(totalPages.value - 1, currentPage.value + 1)

  // Adjust if at the start
  if (currentPage.value <= 3) {
    middleStart = 2
    middleEnd = 4
  }
  // Adjust if at the end
  else if (currentPage.value >= totalPages.value - 2) {
    middleStart = totalPages.value - 3
    middleEnd = totalPages.value - 1
  }

  // Add middle pages
  for (let i = middleStart; i <= middleEnd; i++) {
    pages.push(i)
  }

  // Always show last page
  pages.push(totalPages.value)

  return pages
})

// Pagination methods
const goToPage = (page) => {
  currentPage.value = page
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
    month: 'long',
    day: 'numeric'
  })
}

const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating)

const generateId = () => {
  return Math.max(0, ...customerReviews.value.map(r => r.id)) + 1
}

const submitProductReview = () => {
  // Validate inputs
  if (!selectedProduct.value || !productRating.value || !productFeedback.value) {
    alert('Please fill in all fields')
    return
  }

  // Create new review object
  const newReview = {
    id: generateId(),
    username: userStore.username,
    rating: productRating.value,
    productName: selectedProduct.value,
    description: productFeedback.value,
    date: new Date()
  }

  // Add to beginning of reviews array to show newest first
  customerReviews.value.unshift(newReview)

  // Reset form
  selectedProduct.value = ''
  productRating.value = 0
  productFeedback.value = ''

  // Show success message
  showSuccessMessage.value = true

  // Clear success message after 3 seconds
  if (successTimeout.value) {
    clearTimeout(successTimeout.value)
  }
  successTimeout.value = setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)

  // Go to first page to show the new review
  currentPage.value = 1
}

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
    <div class="review-sections">
      <!-- Left Side - Product Review and Contact Form -->
      <div class="left-section">
        <!-- Product Review Section -->
        <div class="product-review-section">
          <h2>Product Review</h2>
          <select v-model="selectedProduct" class="product-dropdown" required>
            <option value="">Select a product</option>
            <option value="Milky Strawberry">Milky Strawberry</option>
            <option value="Dream Latte">Dream Latte</option>
            <option value="Caramel Macchiato">Caramel Macchiato</option>
            <option value="Dark Chocolate">Dark Chocolate</option>
            <option value="Dreamy Yogurt">Dreamy Yogurt</option>
            <option value="Hot Dark Chocolate">Hot Dark Chocolate</option>
          </select>
          <div class="star-rating">
            <div class="stars">
              <input type="radio" id="star5" name="rating" value="5" v-model="productRating" required />
              <label for="star5">★</label>
              <input type="radio" id="star4" name="rating" value="4" v-model="productRating" />
              <label for="star4">★</label>
              <input type="radio" id="star3" name="rating" value="3" v-model="productRating" />
              <label for="star3">★</label>
              <input type="radio" id="star2" name="rating" value="2" v-model="productRating" />
              <label for="star2">★</label>
              <input type="radio" id="star1" name="rating" value="1" v-model="productRating" />
              <label for="star1">★</label>
            </div>
          </div>
          <textarea
            v-model="productFeedback"
            placeholder="Share your thoughts about this product..."
            class="feedback-textarea"
            required
          ></textarea>
          <div class="success-message" v-if="showSuccessMessage">
            Review submitted successfully!
          </div>
          <button class="submit-btn" @click="submitProductReview">Submit Review</button>
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

      <!-- Right Side - Customer Reviews Display -->
      <div class="customer-reviews">
        <h2>Customer Reviews</h2>
        <div class="reviews-grid">
          <div v-for="review in paginatedReviews" 
               :key="review.id" 
               class="review-card">
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

@media (max-width: 768px) {
  .review-sections {
    grid-template-columns: 1fr;
  }
}
</style>
