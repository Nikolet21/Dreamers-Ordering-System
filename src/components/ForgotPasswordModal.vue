<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <button class="close-button" @click="$emit('close')">×</button>
      <h2>Reset Password</h2>
      
      <div v-if="!emailSent">
        <p class="modal-description">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <div class="form-group">
          <input 
            type="email" 
            v-model="email" 
            placeholder="Enter your email"
            :class="{ error: emailError }"
          />
          <span class="error-message" v-if="emailError">{{ emailError }}</span>
        </div>

        <div v-if="resetError" class="error-alert">
          {{ resetError }}
        </div>

        <button 
          class="submit-button" 
          @click="handleResetPassword"
          :disabled="loading"
        >
          {{ loading ? 'Sending...' : 'Reset Password' }}
        </button>
      </div>

      <div v-else class="success-message">
        <font-awesome-icon :icon="['fas', 'check-circle']" class="success-icon" />
        <h3>Email Sent!</h3>
        <p>Check your email for password reset instructions.</p>
        <button class="close-button-success" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faCheckCircle)

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

defineEmits(['close'])

const userStore = useUserStore()
const email = ref('')
const emailError = ref('')
const resetError = ref('')
const loading = ref(false)
const emailSent = ref(false)

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    emailError.value = 'Email is required'
    return false
  } else if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
    return false
  }
  emailError.value = ''
  return true
}

const handleResetPassword = async () => {
  if (!validateEmail()) return

  loading.value = true
  resetError.value = ''

  try {
    const result = await userStore.resetPassword(email.value)
    if (result.success) {
      emailSent.value = true
    } else {
      resetError.value = result.error
    }
  } catch (error) {
    resetError.value = 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

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
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.close-button:hover {
  color: #333;
}

h2 {
  color: #3E2723;
  margin-bottom: 1rem;
  text-align: center;
}

.modal-description {
  color: #666;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #8D6E63;
  border-radius: 4px;
  font-size: 1rem;
}

input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.error-alert {
  background-color: #f8d7da;
  color: #dc3545;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #3E2723;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.submit-button:hover:not(:disabled) {
  background-color: #8D6E63;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.success-message {
  text-align: center;
  color: #28a745;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-message h3 {
  color: #3E2723;
  margin-bottom: 0.5rem;
}

.success-message p {
  color: #666;
  margin-bottom: 1.5rem;
}

.close-button-success {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.close-button-success:hover {
  background-color: #218838;
}
</style>
