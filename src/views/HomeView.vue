<script setup>
import router from '@/router';
import { defineAsyncComponent, ref } from 'vue'
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
</script>

<template>
  <nav class="navbar">
    <div class="logo">
      <img src="../assets/coffeelogo.png" alt="Coffee Logo" class="logo-image" />
      <span>Dreamers</span>
    </div>

    <!-- Hamburger Menu Button -->
    <div class="hamburger" @click="toggleMenu" :class="{ 'active': isMenuOpen }">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <!-- Navigation Links -->
    <ul class="nav-links" :class="{ 'active': isMenuOpen }">
      <a href="#" @click="setView('Home'); closeMenu()">Home</a>
      <a href="#" @click="setView('About'); closeMenu()">About</a>
      <a href="#" @click="setView('Product'); closeMenu()">Products</a>
      <a href="#" @click="setView('Facility'); closeMenu()">Facility</a>
      <a href="#" @click="setView('Review'); closeMenu()">Review</a>
    </ul>
    <button class="signin-button" @click="SignInView()">Sign in</button>
  </nav>

  <main class="main-content" :class="{ 'menu-open': isMenuOpen }">
    <component :is="currentView === 'Home' ? Home : null" />
    <component :is="currentView === 'About' ? About : null" />
    <component :is="currentView === 'Product' ? Products : null" />
    <component :is="currentView === 'Facility' ? Facility : null" />
    <component :is="currentView === 'Review' ? Review : null" />
  </main>
</template>

<style scoped>
.main-content {
  transition: margin-left 0.3s ease;
  background: #fdf8f5;
  min-height: 100vh;
  padding-top: 60px; /* Height of navbar */
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
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-links a:hover {
  color: #c9a67c;
}

.signin-button {
  background-color: #c9a67c;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1001;
  transition: background-color 0.3s ease;
}

.signin-button:hover {
  background-color: #b08d63;
}

/* Hamburger Menu Styles */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  cursor: pointer;
  z-index: 1001;
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

  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    width: 100%;
    height: 100vh;
    background-color: #fff;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    transition: right 0.3s ease;
    z-index: 1000;
  }

  .nav-links.active {
    right: 0;
  }

  .signin-button {
    position: fixed;
    top: 15px;
    right: 70px;
  }

  /* Hamburger Animation */
  .hamburger.active span:nth-child(1) {
    transform: translateY(9px) rotate(45deg);
  }

  .hamburger.active span:nth-child(2) {
    opacity: 0;
  }

  .hamburger.active span:nth-child(3) {
    transform: translateY(-9px) rotate(-45deg);
  }
}

/* Small Mobile Screens */
@media screen and (max-width: 480px) {
  .logo-image {
    height: 30px;
    margin-right: 10px;
  }

  .signin-button {
    padding: 6px 12px;
    font-size: 0.9rem;
    right: 60px;
  }

  .nav-links a {
    font-size: 1.2rem;
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
