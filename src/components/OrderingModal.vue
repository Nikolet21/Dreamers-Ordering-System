<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'submit'])

const selectedSize = ref('small')
const quantity = ref(1)
const quantityError = ref('')

// Define size prices
const sizePrices = {
  small: 37.0,
  medium: 50.0,
  large: 65.0,
}

// Calculate total price
const totalPrice = computed(() => {
  return sizePrices[selectedSize.value] * quantity.value
})

const validateQuantity = () => {
  if (quantity.value < 1) {
    quantity.value = 1
    quantityError.value = 'Quantity cannot be less than 1'
  } else if (quantity.value > 10) {
    quantity.value = 10
    quantityError.value = 'Quantity cannot exceed 10'
  } else {
    quantityError.value = ''
  }
}

const closeModal = () => {
  emit('close')
  selectedSize.value = 'small'
  quantity.value = ''
}

const submitOrder = () => {
  if (!quantityError.value) {
    emit('submit', {
      size: selectedSize.value,
      quantity: quantity.value,
      totalPrice: totalPrice.value,
    })
  }
  selectedSize.value = ''
  quantity.value = ''
  totalPrice.value = ''
}

watch(quantity, validateQuantity)
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-container">
      <button class="close-button" @click="closeModal">×</button>

      <div class="modal-content">
        <!-- Left Side - Product Details -->
        <div class="product-details">
          <h2 class="product-name">{{ product.name }}</h2>

          <div class="form-group">
            <label for="size">Size:</label>
            <select id="size" v-model="selectedSize" class="size-select">
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div class="form-group">
            <label for="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              v-model.number="quantity"
              min="1"
              max="10"
              @input="validateQuantity"
              class="quantity-input"
            />
            <span v-if="quantityError" class="error-message">
              {{ quantityError }}
            </span>
          </div>

          <!-- Display Total Price -->
          <div class="form-group">
            <label>Total Price:</label>
            <span class="total-price">₱{{ totalPrice.toFixed(2) }}</span>
          </div>

          <div class="button-group">
            <button class="cancel-button" @click="closeModal">Cancel</button>
            <button class="submit-button" @click="submitOrder">Submit</button>
          </div>
        </div>

        <!-- Right Side - Product Image -->
        <div class="product-image">
          <img :src="product.image" :alt="product.name" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  position: relative;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #8b4513;
}

.modal-content {
  display: flex;
  gap: 20px;
}

.product-details {
  flex: 1;
  padding: 20px;
}

.product-name {
  color: #8b4513;
  margin-bottom: 20px;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-group label {
  flex: 0 0 80px;
  margin-bottom: 0;
  color: #8b4513;
  font-weight: bold;
}

.size-select,
.quantity-input {
  flex: 1;
  padding: 8px;
  border: 2px solid #8b4513;
  border-radius: 4px;
  font-size: 16px;
}

.size-select:focus,
.quantity-input:focus {
  outline: none;
  border-color: #a0522d;
}

.error-message {
  color: #d2691e;
  font-size: 14px;
  margin-top: 5px;
  display: block;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.cancel-button,
.submit-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  flex: 1;
}

.cancel-button {
  background-color: #d2b48c;
  color: #8b4513;
}

.submit-button {
  background-color: #8b4513;
  color: white;
}

.cancel-button:hover {
  background-color: #deb887;
}

.submit-button:hover {
  background-color: #a0522d;
}

.product-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
}

.total-price {
  font-weight: bold;
  color: #8b4513;
}

@media (max-width: 768px) {
  .modal-content {
    flex-direction: column-reverse;
  }

  .product-image img {
    max-height: 200px;
  }
}
</style>
