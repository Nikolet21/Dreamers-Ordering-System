<script setup>
import router from '@/router';
import { defineAsyncComponent, ref } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCartShopping, faTrash, faUser } from '@fortawesome/free-solid-svg-icons'
import { useUserStore } from '@/stores/userStore'

library.add(faCartShopping, faTrash, faUser)

const userStore = useUserStore()

const Products = defineAsyncComponent(() => import('../components/ProductSection.vue'))
const Home = defineAsyncComponent(() => import('../components/HomeSection.vue'))
const About = defineAsyncComponent(() => import('../components/AboutSection.vue'))
const Facility = defineAsyncComponent(() => import('../components/FacilitySection.vue'))
const Review = defineAsyncComponent(() => import('../components/ReviewSection.vue'))
const currentView = ref('Home')
const isMenuOpen = ref(false)
const isCartOpen = ref(false)
const cartItems = ref([])

const setView = (view) => (currentView.value = view)
const toggleMenu = () => (isMenuOpen.value = !isMenuOpen.value)
const closeMenu = () => (isMenuOpen.value = false)
const toggleCart = () => (isCartOpen.value = !isCartOpen.value)

const addToCart = (item) => {
  cartItems.value.push(item)
}

const clearCart = () => {
  cartItems.value = []
  isCartOpen.value = false
}

const placeOrder = () => {
  // Here you would typically send the order to your backend
  console.log('Placing order:', cartItems.value)
  alert('Order placed successfully!')
  clearCart()
}

const removeFromCart = (index) => {
  cartItems.value.splice(index, 1)
}

const getTotalPrice = () => {
  return cartItems.value.reduce((total, item) => total + item.totalPrice, 0)
}

const handleProfileClick = () => {
  // Add profile page navigation here
  console.log('Profile clicked')
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}

const SignInView = () => {
  router.push('/signin')
}
</script>

<template>
  <div class="app-container">
    <nav class="navbar">
      <div class="logo">
        <img src="../assets/coffeelogo.png" alt="Coffee Logo" class="logo-image" />
        <span>Dreamers</span>
      </div>

      <!-- Navigation Links -->
      <ul class="nav-links" :class="{ 'active': isMenuOpen }">
        <li><a href="#" @click="setView('Home'); closeMenu()" :class="{ 'selected': currentView === 'Home' }">Home</a></li>
        <li><a href="#" @click="setView('About'); closeMenu()" :class="{ 'selected': currentView === 'About' }">About</a></li>
        <li><a href="#" @click="setView('Product'); closeMenu()" :class="{ 'selected': currentView === 'Product' }">Products</a></li>
        <li><a href="#" @click="setView('Facility'); closeMenu()" :class="{ 'selected': currentView === 'Facility' }">Facility</a></li>
        <li><a href="#" @click="setView('Review'); closeMenu()" :class="{ 'selected': currentView === 'Review' }">Review</a></li>
      </ul>

      <!-- Right Buttons -->
      <div class="right-buttons">
        <div class="cart-container">
          <button @click="toggleCart" class="icon-button">
            <font-awesome-icon :icon="['fas', 'cart-shopping']" />
            <span v-if="cartItems.length" class="cart-badge">{{ cartItems.length }}</span>
          </button>

          <!-- Cart Dropdown -->
          <div v-if="isCartOpen" class="cart-dropdown">
            <div v-if="cartItems.length === 0" class="empty-cart">
              Your cart is empty
            </div>
            <div v-else class="cart-items">
              <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
                <div class="item-details">
                  <h4>{{ item.name }}</h4>
                  <p>Size: {{ item.size }}, Qty: {{ item.quantity }}</p>
                  <p>₱{{ item.totalPrice.toFixed(2) }}</p>
                </div>
                <button @click="removeFromCart(index)" class="remove-item">
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
              </div>
              <div class="cart-total">
                <span>Total: ₱{{ getTotalPrice().toFixed(2) }}</span>
              </div>
              <div class="cart-actions">
                <button @click="clearCart" class="clear-cart">Clear Cart</button>
                <button @click="placeOrder" class="place-order">Place Order</button>
              </div>
            </div>
          </div>
        </div>
        <template v-if="userStore.isAuthenticated">
          <div class="profile-dropdown">
            <button class="profile-icon" @click="handleProfileClick">
              <font-awesome-icon :icon="['fas', 'user']" />
            </button>
            <div class="dropdown-content">
              <span>{{ userStore.currentUser?.username }}</span>
              <button @click="handleLogout" class="dropdown-item">Logout</button>
            </div>
          </div>
        </template>
        <template v-else>
          <button class="signin-button" @click="SignInView()">Sign in</button>
        </template>

        <!-- Responsive Hamburger Menu -->
        <div class="hamburger" @click="toggleMenu" :class="{ 'active': isMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>

    <div class="main-content" :class="{ 'menu-open': isMenuOpen }">
      <component 
        :is="currentView === 'Home' ? Home : 
            currentView === 'Product' ? Products :
            currentView === 'About' ? About :
            currentView === 'Facility' ? Facility :
            currentView === 'Review' ? Review : null"
        @showProducts="setView('Product')"
        @add-to-cart="addToCart"
      />
    </div>
  </div>
</template>

<style scoped>
.main-content {
  transition: margin-left 0.3s ease;
  background: #fdf8f5;
  min-height: 100vh;
  padding-top: 60px;
}

.navbar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 60px;
}

.logo {
  display: flex;
  align-items: center;
  font-weight: bold;
  z-index: 1001;
}

.logo-image {
  height: 40px;
  margin-right: 30px;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 80px;
  margin: 0;
  padding: 0;
  align-items: center;
  height: 100%;
}

.nav-links li {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 600;
  font-size: 1.05rem;
  transition: color 0.3s ease;
  padding: 5px 0;
  position: relative;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #8b5e3c;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.nav-links a:hover::after {
  transform: scaleX(1);
}

.nav-links a.selected {
  color: #8b5e3c;
}

.nav-links a.selected::after {
  transform: scaleX(1);
}

.right-buttons {
  display: flex;
  align-items: center;
  gap: 15px;
}

.icon-button {
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s ease;
}

.icon-button:hover {
  transform: scale(1.2);
}

.signin-button {
  background-color: #8b5e3c;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(139, 94, 60, 0.2);
}

.signin-button:hover {
  background-color: #6b4423;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(139, 94, 60, 0.3);
}

/* Hamburger Menu Styles */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  cursor: pointer;
  z-index: 1001;
  margin-left: 5px;
}

.hamburger span {
  display: block;
  width: 100%;
  height: 3px;
  background-color: #333;
  transition: all 0.3s ease;
}

/* Mobile Styles */
@media screen and (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .right-buttons {
    gap: 12px;
  }

  .nav-links {
    position: fixed;
    top: 60px;
    right: -100%;
    width: 100%;
    height: calc(100vh - 60px);
    background-color: #fff;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 2rem;
    gap: 2rem;
    transition: right 0.3s ease;
  }

  .nav-links li {
    width: 100%;
    text-align: center;
  }

  .nav-links a {
    display: block;
    font-size: 1.2rem;
    padding: 1rem;
    width: 100%;
  }

  .nav-links a::after {
    bottom: 0;
  }

  .nav-links.active {
    right: 0;
  }

  .nav-links a {
    font-size: 1.2rem;
    padding: 1rem;
    width: 100%;
    text-align: center;
  }

  .signin-button {
    padding: 0.4rem 1.2rem;
    font-size: 1rem;
  }

  .logo span {
    font-size: 1.2rem;
  }

  .logo-image {
    height: 35px;
    margin-right: 15px;
  }

  .hamburger.active span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }

  .hamburger.active span:nth-child(2) {
    opacity: 0;
  }

  .hamburger.active span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
  }
}

/* Additional responsive breakpoint for even smaller screens */
@media screen and (max-width: 480px) {
  .navbar {
    padding: 10px;
  }

  .right-buttons {
    gap: 10px;
  }

  .signin-button {
    padding: 0.3rem 1rem;
    font-size: 0.9rem;
  }

  .logo-image {
    height: 30px;
    margin-right: 10px;
  }
}

/* Handle landscape orientation */
@media screen and (max-height: 480px) and (orientation: landscape) {
  .nav-links {
    padding: 1rem 0;
    justify-content: flex-start;
    gap: 1rem;
  }

  .nav-links a {
    font-size: 1rem;
  }
}

.cart-container {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.8rem;
  font-weight: bold;
}

.cart-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  z-index: 1000;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .cart-dropdown {
    position: absolute;
    top: 40px;
    right: -20px;
    width: 280px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .cart-items {
    max-height: calc(80vh - 120px);
  }

  .cart-item {
    padding: 0.75rem;
  }

  .item-details h4 {
    font-size: 1rem;
  }

  .item-details p {
    font-size: 0.9rem;
  }

  .cart-actions {
    padding: 0.75rem;
    background-color: white;
    border-top: 1px solid #eee;
  }

  .cart-total {
    padding: 0.75rem;
    font-size: 1rem;
  }

  .clear-cart,
  .place-order {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .cart-dropdown {
    right: -90px;
    width: 260px;
  }

  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .remove-item {
    align-self: flex-end;
    margin-top: -2rem;
  }
}

.empty-cart {
  text-align: center;
  padding: 1rem;
  color: #666;
}

.cart-items {
  max-height: 400px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.item-details h4 {
  margin: 0;
  color: #333;
  font-size: 1rem;
}

.item-details p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.remove-item {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 0.5rem;
}

.remove-item:hover {
  color: #c0392b;
}

.cart-total {
  padding: 1rem;
  text-align: right;
  font-weight: bold;
  border-top: 2px solid #eee;
}

.cart-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
}

.clear-cart,
.place-order {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.clear-cart {
  background-color: #e74c3c;
  color: white;
}

.place-order {
  background-color: #8b5e3c;
  color: white;
}

.clear-cart:hover {
  background-color: #c0392b;
}

.place-order:hover {
  background-color: #6b4423;
}

.profile-icon {
  width: 40px;
  height: 40px;
  background-color: #8D6E63;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: none;
  color: #FFFFFF;
}

.profile-icon:hover {
  background-color: #3E2723;
}

.profile-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  right: 0;
  background-color: white;
  min-width: 160px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border-radius: 4px;
  padding: 8px 0;
  z-index: 1000;
  margin-top: 5px;
}

.profile-dropdown:hover .dropdown-content {
  display: block;
}

.dropdown-content span {
  display: block;
  padding: 8px 16px;
  color: #5d4037;
  font-weight: bold;
  border-bottom: 1px solid #eee;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  text-align: left;
  color: #8b5e3c;
  cursor: pointer;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
  color: #3E2723;
}
</style>
