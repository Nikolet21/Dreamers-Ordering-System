<script setup>
import router from '@/router';
import { defineAsyncComponent, ref } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCartShopping, faTrash, faUser } from '@fortawesome/free-solid-svg-icons'
import { useUserStore } from '@/stores/userStore'
import ProfileModal from '@/components/ProfileModal.vue'

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
const isProfileOpen = ref(false)
const isProfileModalOpen = ref(false);
const cartItems = ref([])
const showReceipt = ref(false)
const currentReceipt = ref(null)

const setView = (view) => (currentView.value = view)
const toggleMenu = () => (isMenuOpen.value = !isMenuOpen.value)
const closeMenu = () => (isMenuOpen.value = false)
const toggleCart = () => (isCartOpen.value = !isCartOpen.value)
const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value
}

const openProfileModal = () => {
  isProfileModalOpen.value = true;
  isProfileOpen.value = false;
};

const closeProfileModal = () => {
  isProfileModalOpen.value = false;
};

const addToCart = (item) => {
  const existingItemIndex = cartItems.value.findIndex(
    cartItem => cartItem.name === item.name && cartItem.size === item.size
  )

  if (existingItemIndex !== -1) {
    // If item exists, update quantity and total price
    const existingItem = cartItems.value[existingItemIndex]
    existingItem.quantity += item.quantity
    existingItem.totalPrice = existingItem.price * existingItem.quantity
  } else {
    // If item doesn't exist, add it to cart
    cartItems.value.push(item)
  }
}

const clearCart = () => {
  cartItems.value = []
  isCartOpen.value = false
}

const placeOrder = () => {
  const receipt = {
    orderDate: new Date().toLocaleString(),
    customerName: userStore.username || 'Guest',
    items: cartItems.value.map(item => ({
      ...item,
      subtotal: item.price * item.quantity
    })),
    total: getTotalPrice(),
    orderNumber: Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  }

  // Add to pending orders
  const order = {
    id: Date.now(),
    customerName: userStore.username || 'Guest',
    orderTime: new Date().toISOString(),
    status: 'Pending',
    products: cartItems.value.map(item => ({
      id: Date.now() + Math.floor(Math.random() * 1000),
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
      size: item.size,
      totalPrice: item.price * item.quantity
    }))
  }
  userStore.addPendingOrder(order)
  
  currentReceipt.value = receipt
  showReceipt.value = true
  clearCart()
}

const closeReceipt = () => {
  showReceipt.value = false
  currentReceipt.value = null
}

const removeFromCart = (index) => {
  cartItems.value.splice(index, 1)
}

const getTotalPrice = () => {
  return cartItems.value.reduce((total, item) => total + item.totalPrice, 0)
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
  isProfileOpen.value = false
}

const SignInView = () => {
  router.push('/signin')
}

const handleProfileUpdate = (profileData) => {
  isProfileModalOpen.value = false;
};
</script>

<template>
  <div class="app-container">
    <nav class="navbar">
      <div class="logo">
        <img src="../assets/coffeelogo.png" alt="Coffee Logo" class="logo-image" />
        <span style="color: white;">Dreamers</span>
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
            <font-awesome-icon :icon="['fas', 'cart-shopping']" style="color: white;" />
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
        <template v-if="userStore.isLoggedIn">
          <div class="profile-dropdown">
            <button class="profile-icon" @click="toggleProfile">
              <font-awesome-icon :icon="['fas', 'user']" />
            </button>
            <div v-show="isProfileOpen" class="dropdown-content">
              <span>{{ userStore.username }}</span>
              <button @click="openProfileModal" class="dropdown-item">Profile</button>
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
    <ProfileModal
      :is-open="isProfileModalOpen"
      @close="closeProfileModal"
      @update:profile="handleProfileUpdate"
    />
    <!-- Receipt Modal -->
    <div v-if="showReceipt" class="modal-overlay">
      <div class="receipt-modal">
        <div class="receipt-content">
          <h2>Order Receipt</h2>
          <p><strong>Order #:</strong> {{ currentReceipt.orderNumber }}</p>
          <p><strong>Date:</strong> {{ currentReceipt.orderDate }}</p>
          <p><strong>Customer:</strong> {{ currentReceipt.customerName }}</p>
          
          <div class="receipt-items">
            <div v-for="item in currentReceipt.items" :key="item.name" class="receipt-item">
              <div class="item-details">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-info">
                  <span>Size: {{ item.size }}</span>
                  <span>Qty: {{ item.quantity }}</span>
                </div>
                <div class="item-price">₱{{ item.subtotal.toFixed(2) }}</div>
              </div>
            </div>
          </div>
          
          <div class="receipt-total">
            <strong>Total Amount:</strong>
            <span>₱{{ currentReceipt.total.toFixed(2) }}</span>
          </div>

          <div class="pickup-notice">
            <p><strong>Note:</strong> This order is for <span class="pickup-text">PICKUP ONLY</span></p>
            <p>Please present this receipt when collecting your order.</p>
          </div>

          <button class="close-receipt" @click="closeReceipt">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  transition: margin-left 0.3s ease;
  background: #fdf8f5;
  min-height: 100vh;
  padding-top: 60px;
  font-family: 'Poppins', sans-serif;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px;
  background-color: #3E2723;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 90px;
  font-family: 'Poppins', sans-serif;
}

.logo {
  display: flex;
  align-items: center;
  font-weight: 600;
  z-index: 1001;
  font-family: 'Poppins', sans-serif;
  color: white;


}
.logo-image {
  height: 40px;
  margin-right: 30px;
  filter: brightness(0) invert(1);
}

.cart-icon {
  color: white;
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 80px;
  margin: 0;
  padding: 0;
  align-items: center;
  height: 100%;
  font-family: 'Poppins', sans-serif;
}

.nav-links li {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: white;
  font-weight: 500;
  font-size: 1.05rem;
  transition: color 0.3s ease;
  padding: 5px 0;
  position: relative;
  font-family: 'Poppins', sans-serif;
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
  font-family: 'Poppins', sans-serif;
}

.icon-button {
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s ease;
  font-family: 'Poppins', sans-serif;
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
  font-family: 'Poppins', sans-serif;
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
  background-color: #FFFFFF;
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

.profile-dropdown {
  position: relative;
  display: inline-block;
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
  font-family: 'Poppins', sans-serif;
}

.profile-icon:hover {
  background-color: #3E2723;
}

.dropdown-content {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: white;
  min-width: 160px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border-radius: 4px;
  padding: 8px 0;
  z-index: 1000;
  margin-top: 5px;
  font-family: 'Poppins', sans-serif;
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
  transition: all 0.2s ease;
  font-family: 'Poppins', sans-serif;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
  color: #3E2723;
}

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

.receipt-modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.receipt-content {
  font-family: 'Poppins', sans-serif;
}

.receipt-content h2 {
  text-align: center;
  color: #8b5e3c;
  margin-bottom: 20px;
}

.receipt-items {
  margin: 20px 0;
  border-top: 1px dashed #ccc;
  border-bottom: 1px dashed #ccc;
  padding: 10px 0;
}

.receipt-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-weight: 500;
  color: #333;
}

.item-info {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.item-price {
  font-weight: 500;
  color: #5D4037;
}

.receipt-total {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
  font-size: 1.2em;
  color: #8b5e3c;
}

.pickup-notice {
  background-color: #fff3e0;
  padding: 10px;
  border-radius: 4px;
  margin: 20px 0;
  text-align: center;
}

.pickup-notice p {
  margin: 5px 0;
  color: #8b5e3c;
}

.pickup-text {
  font-weight: 800;
  letter-spacing: 0.5px;
}

.close-receipt {
  display: block;
  width: 100%;
  padding: 10px;
  background-color: #8b5e3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
}

.close-receipt:hover {
  background-color: #6d4b2f;
}
</style>
