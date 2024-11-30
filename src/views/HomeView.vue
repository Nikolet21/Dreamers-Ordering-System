<script setup>
import router from '@/router';
import { defineAsyncComponent, ref } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faCartShopping} from '@fortawesome/free-solid-svg-icons'
library.add(faCartShopping)
const Products = defineAsyncComponent(() => import('../components/ProductSection.vue'))
const Home = defineAsyncComponent(() => import('../components/HomeSection.vue'))
const About = defineAsyncComponent(() => import('../components/AboutSection.vue'))
const Facility = defineAsyncComponent(() => import('../components/FacilitySection.vue'))
const Review = defineAsyncComponent(() => import('../components/ReviewSection.vue'))
const currentView = ref('Home')
const isMenuOpen = ref(false)

const setView = (view) => (currentView.value = view)
const toggleMenu = () => (isMenuOpen.value = !isMenuOpen.value)
const closeMenu = () => (isMenuOpen.value = false)

const SignInView = () => {
  router.push('/signin')
}

const addToCart = () => {
  console.log('add to cart')
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
        <button @click="addToCart()" class="icon-button">
          <font-awesome-icon :icon="['fas', 'cart-shopping']" />
        </button>
        <button class="signin-button" @click="SignInView()">Sign in</button>
        <div class="hamburger" @click="toggleMenu" :class="{ 'active': isMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>

    <main class="main-content" :class="{ 'menu-open': isMenuOpen }">
      <component :is="currentView === 'Home' ? Home : null" />
      <component :is="currentView === 'About' ? About : null" />
      <component :is="currentView === 'Product' ? Products : null" />
      <component :is="currentView === 'Facility' ? Facility : null" />
      <component :is="currentView === 'Review' ? Review : null" />
    </main>
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
</style>
