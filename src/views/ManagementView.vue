<script setup>
import { defineAsyncComponent, ref } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUsers, faClipboardList, faStar, faUser } from '@fortawesome/free-solid-svg-icons'

library.add(faUsers, faClipboardList, faStar, faUser)

const UserList = defineAsyncComponent(() => import('../components/UserList.vue'))
const PendingOrders = defineAsyncComponent(() => import('../components/PendingOrders.vue'))
const CustomerReview = defineAsyncComponent(() => import('../components/CustomerReview.vue'))

const isOpen = ref(false)
const currentComponent = ref('orders')

const toggleSidebar = () => {
  isOpen.value = !isOpen.value
}

const switchComponent = (component) => {
  currentComponent.value = component
}
</script>

<template>
  <div class="container">
    <!-- Header -->
    <header>
      <button class="menu-toggle" @click="toggleSidebar">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <h1>Coffee Management</h1>
      <div class="profile-icon">
        <font-awesome-icon :icon="['fas', 'user']" />
      </div>
    </header>

    <!-- Sidebar -->
    <aside :class="{ 'open': isOpen }">
      <nav>
        <ul>
          <li>
            <a href="#" @click.prevent="switchComponent('users')">
              <div class="icon-container">
                <font-awesome-icon :icon="['fas', 'users']" />
              </div>
              <div class="text-container">
                Users
              </div>
            </a>
          </li>
          <li>
            <a href="#" @click.prevent="switchComponent('orders')">
              <div class="icon-container">
                <font-awesome-icon :icon="['fas', 'clipboard-list']" />
              </div>
              <div class="text-container">
                Orders
              </div>
            </a>
          </li>
          <li>
            <a href="#" @click.prevent="switchComponent('reviews')">
              <div class="icon-container">
                <font-awesome-icon :icon="['fas', 'star']" />
              </div>
              <div class="text-container">
                Reviews
              </div>
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content -->
    <main>
      <template v-if="currentComponent === 'welcome'">
        <h2>Welcome to Coffee Management System</h2>
      </template>
      <UserList v-else-if="currentComponent === 'users'" />
      <PendingOrders v-else-if="currentComponent === 'orders'" />
      <CustomerReview v-else-if="currentComponent === 'reviews'" />
    </main>
  </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #D7CCC8;
}

/* Header Styles */
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: #5D4037;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
}

.menu-toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background-color: #FFFFFF;
  transition: all 0.3s ease;
}

.menu-toggle:hover span {
  background-color: #D7CCC8;
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
}

.profile-icon:hover {
  background-color: #3E2723;
}

.fa-icon {
  width: 20px;
  height: 20px;
  color: #FFFFFF;
}

/* Sidebar Styles */
aside {
  position: fixed;
  top: 64px;
  left: -250px;
  width: 250px;
  height: calc(100vh - 64px);
  background-color: #8D6E63;
  transition: transform 0.3s ease;
  z-index: 999;
}

aside.open {
  transform: translateX(250px);
}

nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

nav ul li {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

nav ul li:last-child {
  border-bottom: none;
}

nav ul li a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #FFFFFF;
  transition: background-color 0.3s ease;
}

nav ul li a:hover {
  background-color: #5D4037;
}

.icon-container {
  width: 50px;
  min-width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-container {
  flex: 1;
  padding: 15px 10px;
  font-size: 1rem;
  font-weight: 500;
}

/* Main Content Styles */
main {
  padding: 84px 20px 20px;
  margin-left: 0;
  transition: margin-left 0.3s ease;
}

main h2 {
  color: #3E2723;
  margin-bottom: 20px;
}

/* Responsive Design */
@media (min-width: 768px) {
  aside.open + main {
    margin-left: 250px;
  }
}

@media (max-width: 767px) {
  header h1 {
    font-size: 1.2rem;
  }
}
</style>
