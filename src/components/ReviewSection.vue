<script setup>
import { ref } from 'vue'

const businessRating = ref(0)
const selectedProduct = ref('')
const productFeedback = ref('')
const businessFeedback = ref('')
const contactForm = ref({
  name: '',
  email: '',
  message: '',
})

const submitBusinessRating = () => {
  console.log('Business Rating:', {
    rating: businessRating.value,
    feedback: businessFeedback.value,
  })
  businessRating.value = ''
  businessFeedback.value = ''
}

const submitProductReview = () => {
  console.log('Product Review:', {
    product: selectedProduct.value,
    feedback: productFeedback.value,
  })
  selectedProduct.value = ''
  productFeedback.value = ''
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
      <!-- Left Side - Rating Section -->
      <div class="rating-section">
        <h2>Rate Our Business</h2>
        <div class="star-rating">
          <div class="stars">
            <input type="radio" id="star5" name="rating" value="5" v-model="businessRating" />
            <label for="star5">★</label>
            <input type="radio" id="star4" name="rating" value="4" v-model="businessRating" />
            <label for="star4">★</label>
            <input type="radio" id="star3" name="rating" value="3" v-model="businessRating" />
            <label for="star3">★</label>
            <input type="radio" id="star2" name="rating" value="2" v-model="businessRating" />
            <label for="star2">★</label>
            <input type="radio" id="star1" name="rating" value="1" v-model="businessRating" />
            <label for="star1">★</label>
          </div>
        </div>
        <textarea
          v-model="businessFeedback"
          placeholder="Share your experience with the business..."
          class="feedback-textarea"
        ></textarea>
        <button class="submit-btn" @click="submitBusinessRating">Submit Rating</button>
      </div>

      <!-- Right Side - Product Review Section -->
      <div class="product-review-section">
        <h2>Product Review</h2>
        <select v-model="selectedProduct" class="product-dropdown">
          <option value="">Select a product</option>
          <option value="milky strawberry">Milky Strawberry</option>
          <option value="dream latte">Dream Latte</option>
          <option value="caramel macchiato">Caramel Macchiato</option>
          <option value="dark chocolate">Dark Chocolate</option>
          <option value="dreamy yogurt">Dreamy Yogurt</option>
          <option value="hot dark chocolate">Hot Dark Chocolate</option>
        </select>
        <textarea
          v-model="productFeedback"
          placeholder="Share your thoughts about this product..."
          class="feedback-textarea"
        ></textarea>
        <button class="submit-btn" @click="submitProductReview">Submit Review</button>
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
</template>

<style scoped>
.review-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.review-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

h2 {
  color: #5d4037;
  margin-bottom: 1.5rem;
}

/* Rating Section Styles */
.rating-section {
  background-color: #efebe9;
  padding: 2rem;
  border-radius: 8px;
}

.star-rating {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
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
  width: 95%;
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
}

.form-group {
  margin-bottom: 1rem;
}

.form-group input,
.form-group textarea {
  width: 97%;
  padding: 0.8rem;
  border: 1px solid #8d6e63;
  border-radius: 4px;
  background-color: white;
}

.form-group textarea {
  height: 150px;
  resize: vertical;
}

/* Button Styles */
.submit-btn {
  background-color: #795548;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #5d4037;
}

/* Responsive Design */
@media (max-width: 768px) {
  .review-sections {
    grid-template-columns: 1fr;
  }
}
</style>
