<script setup>
import router from '@/router'
import { ref } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faEye, faEyeSlash)

const mockAccounts = [
  { email: 'test@gmail.com', password: 'Password123!' },
  { email: 'user@gmail.com', password: 'User@2024' },
]

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

const goBackToHome = () => {
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
  const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[A-Z]).{8,}$/

  if (!password.value) {
    passwordError.value = 'Password is required'
  } else if (!passwordRegex.test(password.value)) {
    passwordError.value =
      'Password must be at least 8 characters, include an uppercase letter, a number, and a special character'
  } else {
    passwordError.value = ''
  }
}

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password'
  } else if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'Passwords do not match'
  } else {
    confirmPasswordError.value = ''
  }
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
}

const handleSubmit = () => {
  validateEmail()
  if (!isLogin.value) {
    validateUsername()
    validateConfirmPassword()
  }
  validatePassword()

  if (!emailError.value && !passwordError.value && 
      (isLogin.value || (!usernameError.value && !confirmPasswordError.value))) {
    if (isLogin.value) {
      const account = mockAccounts.find(
        (acc) => acc.email === email.value && acc.password === password.value,
      )

      if (account) {
        console.log('Login successful:', account)
        router.push('/')
      } else {
        alert('Invalid email or password.')
      }
    } else {
      // Handle sign up logic here
      console.log('Sign up data:', {
        email: email.value,
        username: username.value,
        password: password.value
      })
      alert('Sign up successful!')
      router.push('/')
    }
  }
}
</script>

<template>
  <div class="signin-container">
    <button class="back-button" @click="goBackToHome">Back to Home</button>

    <div class="signin-content">
      <!-- Left Section -->
      <div class="left-section">
        <img src="../assets/coffeelogo.png" alt="Coffee Logo" class="large-logo" />
        <div class="description">
          <h2>Welcome to Dreamers Coffee</h2>
          <p>Join us in experiencing the finest coffee selections and exclusive member benefits.</p>
        </div>
      </div>

      <!-- Right Section -->
      <div class="right-section">
        <div class="form-container">
          <h2>{{ isLogin ? 'Log In' : 'Sign Up' }}</h2>

          <form @submit.prevent="handleSubmit" novalidate>
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
            <a href="#" class="forgot-password">Forgot Password?</a>

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
  </div>
</template>

<style scoped>
.signin-container {
  min-height: 100vh;
  background-color: #fdf8f5;
  position: relative;
  padding: 20px;
}

.back-button {
  background-color: #8b5e3c;
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(139, 94, 60, 0.2);
}

.back-button:hover {
  background-color: #6b4423;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(139, 94, 60, 0.3);
}

.signin-content {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  gap: 40px;
  min-height: calc(100vh - 100px);
  align-items: center;
}

.left-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
}

.large-logo {
  width: 200px;
  height: auto;
  margin-bottom: 30px;
}

.description {
  color: #5d4037;
}

.description h2 {
  margin-bottom: 15px;
  font-size: 1.8rem;
}

.description p {
  font-size: 1.1rem;
  line-height: 1.6;
}

.right-section {
  flex: 1;
  padding: 20px;
}

.form-container {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
}

.form-container h2 {
  color: #5d4037;
  margin-bottom: 30px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #5d4037;
  font-weight: 500;
}

input {
  width: 95%;
  padding: 12px;
  border: 1px solid #d7ccc8;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #8d6e63;
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
  color: #ef5350;
  font-size: 0.875rem;
  margin-top: 5px;
  display: block;
}

.forgot-password {
  display: block;
  text-align: right;
  color: #8d6e63;
  text-decoration: none;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #8d6e63;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #5d4037;
}

.toggle-form {
  text-align: center;
  margin-top: 20px;
  color: #5d4037;
}

.toggle-form a {
  color: #8d6e63;
  text-decoration: none;
  font-weight: 500;
}

.toggle-form a:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 968px) {
  .signin-content {
    flex-direction: column;
    padding-top: 80px;
  }

  .left-section {
    padding-bottom: 0;
  }

  .large-logo {
    width: 150px;
  }

  .description h2 {
    font-size: 1.5rem;
  }

  .description p {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .signin-container {
    padding: 10px;
  }

  .form-container {
    padding: 20px;
  }

  .back-button {
    top: 10px;
    right: 10px;
  }

  .description {
    padding: 0 20px;
  }
}
</style>
