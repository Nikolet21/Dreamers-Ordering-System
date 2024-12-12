<script setup>
import router from '@/router'
import { ref } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEye, faEyeSlash, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useUserStore } from '@/stores/userStore'
import ForgotPasswordModal from '@/components/ForgotPasswordModal.vue'

library.add(faEye, faEyeSlash, faExclamationCircle)

const userStore = useUserStore()

const isLogin = ref(false)
const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const emailError = ref('')
const usernameError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const loginError = ref('')
const showForgotPasswordModal = ref(false)

const goBack = () => {
  router.push('/')
}

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    emailError.value = 'Email is required'
  } else if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
  } else {
    emailError.value = ''
  }
}

const validateUsername = () => {
  if (!username.value) {
    usernameError.value = 'Username is required'
  } else if (username.value.length < 3) {
    usernameError.value = 'Username must be at least 3 characters long'
  } else {
    usernameError.value = ''
  }
}

const validatePassword = () => {
  passwordError.value = ''
  if (!password.value) {
    passwordError.value = 'Password is required'
    return false
  }
  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters long'
    return false
  }
  if (password.value.includes(' ')) {
    passwordError.value = 'Password cannot contain spaces'
    return false
  }
  return true
}

const validateConfirmPassword = () => {
  confirmPasswordError.value = ''
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password'
    return false
  }
  if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'Passwords do not match'
    return false
  }
  if (confirmPassword.value.includes(' ')) {
    confirmPasswordError.value = 'Password cannot contain spaces'
    return false
  }
  return true
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const toggleForm = () => {
  isLogin.value = !isLogin.value
  email.value = ''
  username.value = ''
  password.value = ''
  confirmPassword.value = ''
  emailError.value = ''
  usernameError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  loginError.value = ''
}

const handleSubmit = async () => {
  // Reset errors
  emailError.value = ''
  usernameError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  let isValid = true

  if (isLogin.value) {
    // Login validation
    if (!validateEmail()) isValid = false
    if (!validatePassword()) isValid = false
  } else {
    // Sign up validation
    if (!validateEmail()) isValid = false
    if (!validateUsername()) isValid = false
    if (!validatePassword()) isValid = false
    if (!validateConfirmPassword()) isValid = false
  }

  if (!isValid) {
    return
  }

  try {
    if (isLogin.value) {
      // Login
      const result = await userStore.login({
        email: email.value,
        password: password.value
      })

      if (result.success) {
        // Use the redirect path from the login result
        router.push(result.redirect)
      } else {
        loginError.value = result.error || 'Login failed. Please check your credentials.'
      }
    } else {
      // Register (always as regular user)
      const result = await userStore.registerUser({
        email: email.value,
        password: password.value,
        username: username.value
      })

      if (result.success) {
        router.push('/')
      } else {
        loginError.value = result.error || 'Registration failed. Please try again.'
      }
    }
  } catch (error) {
    console.error('Authentication error:', error)
    loginError.value = error.message || 'An error occurred. Please try again.'
  }
}
</script>

<template>
  <div class="signin-container">
    <button class="back-button" @click="goBack">
      <font-awesome-icon :icon="['fas', 'arrow-left']" /> Back to Home
    </button>

    <div class="content-wrapper">
      <!-- Left Section -->
      <div class="left-section">
        <img src="../assets/coffeelogo.png" alt="Coffee Logo" class="large-logo" />
        <div class="description">
          <h2>Welcome to Dreamers</h2>
          <p>Experience the perfect blend of artisanal coffee and exceptional service.</p>
        </div>
      </div>

      <!-- Right Section -->
      <div class="right-section">
        <div class="form-container">
          <h2>{{ isLogin ? 'Log In' : 'Sign Up' }}</h2>

          <form @submit.prevent="handleSubmit" novalidate>
            <!-- Login Error Message -->
            <div v-if="loginError" class="error-message">
              <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
              {{ loginError }}
            </div>

            <!-- Email Field -->
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                v-model="email"
                @input="validateEmail"
                :class="{ error: emailError }"
              />
              <span class="error-message" v-if="emailError">{{ emailError }}</span>
            </div>

            <!-- Username Field (Sign Up only) -->
            <div class="form-group" v-if="!isLogin">
              <label for="username">Username</label>
              <input
                type="text"
                id="username"
                v-model="username"
                @input="validateUsername"
                :class="{ error: usernameError }"
              />
              <span class="error-message" v-if="usernameError">{{ usernameError }}</span>
            </div>

            <!-- Password Field -->
            <div class="form-group">
              <label for="password">Password</label>
              <div class="password-input">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="password"
                  @input="validatePassword"
                  :class="{ error: passwordError }"
                />
                <button type="button" class="visibility-toggle" @click="togglePasswordVisibility">
                  <font-awesome-icon :icon="showPassword ? 'eye-slash' : 'eye'" />
                </button>
              </div>
              <span class="error-message" v-if="passwordError">{{ passwordError }}</span>
            </div>

            <!-- Confirm Password Field (Sign Up only) -->
            <div class="form-group" v-if="!isLogin">
              <label for="confirmPassword">Confirm Password</label>
              <div class="password-input">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  v-model="confirmPassword"
                  @input="validateConfirmPassword"
                  :class="{ error: confirmPasswordError }"
                />
                <button type="button" class="visibility-toggle" @click="toggleConfirmPasswordVisibility">
                  <font-awesome-icon :icon="showConfirmPassword ? 'eye-slash' : 'eye'" />
                </button>
              </div>
              <span class="error-message" v-if="confirmPasswordError">{{ confirmPasswordError }}</span>
            </div>

            <!-- Forgot Password Link -->
            <a href="#" class="forgot-password" @click.prevent="showForgotPasswordModal = true">
              Forgot Password?
            </a>

            <!-- Submit Button -->
            <button type="submit" class="submit-button">
              {{ isLogin ? 'Log In' : 'Sign Up' }}
            </button>

            <!-- Toggle Form Type -->
            <p class="toggle-form">
              {{ isLogin ? 'Not registered yet?' : 'Already registered?' }}
              <a href="#" @click.prevent="toggleForm">
                {{ isLogin ? 'Sign In Here' : 'Log In Here' }}
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
    <!-- Forgot Password Modal -->
    <ForgotPasswordModal
      :is-open="showForgotPasswordModal"
      @close="showForgotPasswordModal = false"
    />
  </div>
</template>

<style scoped>
.signin-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #3E2723;
  position: relative;
  padding: 2rem;
}

.back-button {
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: white;
  border: none;
  border-radius: 4px;
  color: #3E2723;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.back-button:hover {
  background-color: #f5f5f5;
  transform: translateY(-2px);
}

.content-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6rem;
  margin-top: 4rem;
  padding: 0 2rem;
  min-height: calc(100vh - 8rem);
}

.left-section {
  flex: 1;
  max-width: 500px;
  padding: 2rem;
  position: fixed;
  left: 8rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.large-logo {
  width: 200px;
  height: auto;
  margin-bottom: 2rem;
  filter: brightness(0) invert(1);
}

.description {
  color: white;
  max-width: 400px;
}

.description h2 {
  color: white;
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  font-weight: 600;
}

.description p {
  color: white;
  line-height: 1.8;
  font-size: 1.2rem;
  font-weight: 400;
}

.right-section {
  flex: 1;
  max-width: 500px;
  display: flex;
  justify-content: flex-end;
  margin-left: calc(500px + 6rem);
}

.form-container {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-container h2 {
  text-align: center;
  color: #3E2723;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #3E2723;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #8D6E63;
  border-radius: 4px;
  font-weight: 400;
}

input.error {
  border-color: #ef5350;
}

.password-input {
  position: relative;
}

.visibility-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #8d6e63;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.visibility-toggle:hover {
  color: #5d4037;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.forgot-password {
  display: block;
  text-align: right;
  color: #8d6e63;
  text-decoration: none;
  margin-bottom: 20px;
  font-size: 0.9rem;
  font-weight: 400;
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

.submit-button:hover {
  background-color: #8D6E63;
}

.toggle-form {
  text-align: center;
  margin-top: 1rem;
  font-weight: 400;
}

.toggle-form a {
  color: #3E2723;
  text-decoration: none;
  font-weight: 500;
}

.toggle-form a:hover {
  text-decoration: underline;
}

.login-error-container {
  margin: 0.5rem 0 1.5rem 0;
}

.login-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #fff5f5;
  border: 1px solid #fc8181;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(252, 129, 129, 0.2);
  animation: shake 0.5s ease-in-out;
}

.error-icon {
  font-size: 1.25rem;
  color: #fc8181;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Shake animation */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .left-section {
    position: static;
    align-items: center;
    text-align: center;
  }

  .right-section {
    margin-left: 0;
    justify-content: center;
  }

  .content-wrapper {
    flex-direction: column;
    gap: 3rem;
  }
}

@media (max-width: 768px) {
  .left-section, .right-section {
    max-width: 100%;
  }

  .large-logo {
    width: 150px;
  }

  .description {
    text-align: center;
    margin: 0 auto;
  }

  .description h2 {
    font-size: 2rem;
  }

  .description p {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .signin-container {
    padding: 1rem;
  }

  .back-button {
    top: 1rem;
    left: 1rem;
    padding: 0.5rem 1rem;
  }

  .content-wrapper {
    margin-top: 5rem;
    padding: 0 1rem;
  }

  .form-container {
    padding: 2rem;
  }

  .large-logo {
    width: 120px;
  }

  .description h2 {
    font-size: 1.8rem;
  }

  .description p {
    font-size: 1rem;
  }
}
</style>
