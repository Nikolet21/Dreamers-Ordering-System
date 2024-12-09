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
  quantity.value = 1
}

const submitOrder = () => {
  if (!quantityError.value) {
    const orderDetails = {
      name: props.product.name,
      size: selectedSize.value,
      quantity: quantity.value,
      price: sizePrices[selectedSize.value],
      totalPrice: totalPrice.value,
      image: props.product.image,
    }
    emit('submit', orderDetails)
    closeModal()
  }
}

watch(quantity, validateQuantity)
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <div class="modal-content">
        <h2>Order Details</h2>
        <div class="modal-layout">
          <!-- Left Section - Product Info -->
          <div class="product-section">
            <div class="product-info">
              <img :src="product.image" :alt="product.name" class="product-image" />
              <h3>{{ product.name }}</h3>
              <p>{{ product.description }}</p>
            </div>
          </div>

          <!-- Right Section - Order Form -->
          <div class="order-section">
            <div class="form-group">
              <h4>Select Size:</h4>
              <div class="size-options">
                <label class="radio-label">
                  <input type="radio" v-model="selectedSize" value="small" name="size" checked />
                  <span class="radio-text">Small (₱37.00)</span>
                </label>
                <p class="coming-soon">More sizes coming soon!</p>
              </div>
            </div>

            <div class="form-group">
              <h4>Quantity:</h4>
              <div class="quantity-input">
                <button class="quantity-btn" @click="quantity--" :disabled="quantity <= 1">
                  -
                </button>
                <input
                  type="number"
                  v-model.number="quantity"
                  min="1"
                  max="10"
                  class="quantity-field"
                />
                <button class="quantity-btn" @click="quantity++" :disabled="quantity >= 10">
                  +
                </button>
              </div>
              <p v-if="quantityError" class="error-message">{{ quantityError }}</p>
            </div>

            <div class="total-price">
              <h4>Total Price:</h4>
              <p class="price">₱{{ totalPrice.toFixed(2) }}</p>
            </div>

            <div class="button-group">
              <button class="cancel-button" @click="closeModal">Cancel</button>
              <button class="submit-button" @click="submitOrder">Add to Cart</button>
            </div>
          </div>
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
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: linear-gradient(135deg, #ffffff, #f8f8f8);
  border-radius: 20px;
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transform: translateY(0);
  transition: all 0.3s ease;
  border: 1px solid rgba(139, 69, 19, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #8b4513;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #6b3410;
}

.modal-content h2 {
  text-align: center;
  color: #3e2723;
  margin-bottom: 1.5rem;
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.modal-layout {
  display: flex;
  gap: 2rem;
  align-items: stretch;
}

.product-section {
  flex: 0.8;
  min-width: 300px;
  display: flex;
  flex-direction: column;
}

.order-section {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1rem;
  border-left: 2px solid rgba(139, 69, 19, 0.1);
}

.product-info {
  background: linear-gradient(135deg, #fff, #f9f9f9);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.product-info h3 {
  color: #3e2723;
  font-weight: 600;
  font-size: 1.3rem;
  margin: 0;
}

.product-info p {
  color: #5d4037;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
  opacity: 0.9;
}

.product-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(139, 69, 19, 0.15);
  transition: transform 0.3s ease;
  border: 4px solid #fff;
}

.product-image:hover {
  transform: scale(1.03);
}

.form-group {
  background: linear-gradient(135deg, #fff, #f9f9f9);
  padding: 1.25rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.form-group h4 {
  color: #3e2723;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.3px;
}

.size-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  transition: all 0.2s ease;
  font-size: 1rem;
  border: 2px solid #efebe9;
  background: #fff;
}

.radio-label:hover {
  background: linear-gradient(135deg, #fff8e1, #fafafa);
  border-color: #8b4513;
}

.radio-label input[type='radio'] {
  margin-right: 1rem;
  width: 1.2rem;
  height: 1.2rem;
  accent-color: #8b4513;
}

.radio-text {
  color: #5d4037;
  font-weight: 500;
}

.quantity-input {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #8b4513, #6b3410);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.2);
}

.quantity-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
}

.quantity-btn:disabled {
  background: #d7ccc8;
  cursor: not-allowed;
  box-shadow: none;
}

.quantity-field {
  width: 60px;
  height: 36px;
  text-align: center;
  border: 2px solid #bcaaa4;
  border-radius: 10px;
  font-size: 1.1rem;
  color: #3e2723;
  font-weight: 600;
  background: #fff;
}

.quantity-field:focus {
  outline: none;
  border-color: #8b4513;
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.error-message {
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
  font-weight: 500;
}

.total-price {
  background: linear-gradient(135deg, #8b4513, #6b3410);
  padding: 1.25rem;
  border-radius: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.2);
}

.total-price h4 {
  margin: 0;
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  opacity: 0.9;
}

.price {
  color: #fff;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-button,
.submit-button {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cancel-button {
  background: #efebe9;
  color: #5d4037;
  border: 2px solid #d7ccc8;
}

.cancel-button:hover {
  background: #d7ccc8;
  transform: translateY(-2px);
}

.submit-button {
  background: linear-gradient(135deg, #8b4513, #6b3410);
  color: white;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.2);
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.3);
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
    align-items: flex-start;
  }

  .modal {
    width: 100%;
    max-width: 400px;
    margin: 1rem auto;
    max-height: calc(100vh - 2rem);
    overflow: hidden;
  }

  .modal-content {
    padding: 1rem;
    height: calc(100vh - 3rem);
    overflow-y: auto;
    padding-bottom: 200px;
  }

  .order-section h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    position: sticky;
    top: 0;
    background: linear-gradient(135deg, #ffffff, #f8f8f8);
    padding: 0.5rem 0;
    z-index: 1;
  }

  .modal-layout {
    flex-direction: column;
    gap: 1.25rem;
  }

  .product-section {
    min-width: unset;
  }

  .product-info {
    padding: 1rem;
    gap: 0.75rem;
  }

  .product-info h3 {
    font-size: 1.1rem;
  }

  .product-info p {
    font-size: 0.9rem;
  }

  .product-image {
    width: 120px;
    height: 120px;
  }

  .order-section {
    padding: 0;
    border-left: none;
    border-top: 2px solid rgba(139, 69, 19, 0.1);
    padding-top: 1.25rem;
  }

  .form-group {
    padding: 0.875rem;
    margin-bottom: 0.75rem;
    background: #ffffff;
  }

  .form-group h4 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .radio-label {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }

  .quantity-input {
    gap: 0.75rem;
    position: relative;
    z-index: 1;
  }

  .quantity-btn {
    width: 30px;
    height: 30px;
    font-size: 1rem;
  }

  .quantity-field {
    width: 45px;
    height: 30px;
    font-size: 0.95rem;
  }

  .total-price {
    position: fixed;
    bottom: 140px;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #8b4513, #6b3410);
    padding: 0.875rem;
    margin: 0;
    border-radius: 0;
    z-index: 11;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  }

  .total-price h4 {
    font-size: 0.95rem;
    margin: 0;
    color: #ffffff;
  }

  .price {
    font-size: 1.1rem;
    margin: 0;
    color: #ffffff;
  }

  .button-group {
    flex-direction: column;
    gap: 0.625rem;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #ffffff, #f8f8f8);
    padding: 0.75rem;
    margin: 0;
    border-top: 1px solid rgba(139, 69, 19, 0.1);
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
    height: 140px;
    display: flex;
    justify-content: flex-end;
  }

  .cancel-button,
  .submit-button {
    padding: 0.625rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.25rem;
  }

  .modal {
    margin: 0.5rem auto;
    max-height: calc(100vh - 1rem);
  }

  .modal-content {
    padding: 0.875rem;
    padding-bottom: 180px;
  }

  .order-section h3 {
    font-size: 1.1rem;
    padding: 0.375rem 0;
  }

  .product-info {
    padding: 0.875rem;
  }

  .product-image {
    width: 100px;
    height: 100px;
  }

  .form-group {
    padding: 0.75rem;
  }

  .radio-label {
    padding: 0.5rem 0.625rem;
    font-size: 0.875rem;
  }

  .quantity-btn {
    width: 28px;
    height: 28px;
  }

  .quantity-field {
    width: 40px;
    height: 28px;
    font-size: 0.9rem;
  }

  .total-price {
    padding: 0.75rem;
    bottom: 120px;
  }

  .button-group {
    padding: 0.625rem;
    height: 120px;
  }

  .cancel-button,
  .submit-button {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .modal {
    max-width: 700px;
    max-height: 85vh;
  }

  .modal-content {
    padding: 1.25rem;
  }

  .product-section {
    flex: 0.9;
  }

  .order-section {
    flex: 1.1;
  }

  .product-image {
    width: 140px;
    height: 140px;
  }

  .form-group {
    padding: 1rem;
  }

  .radio-label {
    padding: 0.625rem 0.875rem;
  }

  .total-price {
    margin-top: auto;
  }

  .button-group {
    gap: 0.75rem;
    margin-top: 0.75rem;
  }
}

@media (hover: none) {
  .product-image:hover,
  .quantity-btn:hover:not(:disabled),
  .cancel-button:hover,
  .submit-button:hover {
    transform: none;
    box-shadow: none;
  }
}
</style>
