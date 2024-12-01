<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const emit = defineEmits(['showProducts'])

const handleOrderClick = () => {
  if (userStore.isLoggedIn) {
    emit('showProducts')
  } else {
    router.push('/signin')
  }
}
</script>

<template>
  <section class="home-section">
    <div class="home-container">
      <!-- Left Side - Logo -->
      <div class="logo-section">
        <div class="logo-container">
          <img src="/src/assets/coffeelogo.png" alt="Coffee Shop Logo" class="coffee-logo" />
        </div>
      </div>

      <!-- Right Side - Content -->
      <div class="content-section">
        <h1 class="welcome-title">Welcome to Dreamers Coffee</h1>
        <p class="description">
          Discover the perfect blend of artisanal coffee and exceptional service. At Dreamers
          Coffee, we carefully select and roast the finest coffee beans to bring you an
          unforgettable coffee experience. Each cup is crafted with passion and precision, ensuring
          moments of pure coffee bliss.
        </p>
        <button class="order-button" @click="handleOrderClick">
          {{ userStore.isLoggedIn ? 'Order Now' : 'Sign In to Order' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-section {
  background-color: #fdf8f5;
  display: flex;
  align-items: center;
  padding: 2rem;
  margin-top: 3rem;
}

.home-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 4rem;
  padding: 2rem;
}

.logo-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-container {
  width: 100%;
  max-width: 350px;
  aspect-ratio: 1;
  padding: 2rem;
}

.coffee-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 10px 15px rgba(139, 94, 60, 0.2));
  transition: transform 0.3s ease;
}

.coffee-logo:hover {
  transform: scale(1.02);
}

.content-section {
  flex: 1;
  padding: 2rem;
}

.welcome-title {
  color: #4a3428;
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  position: relative;
}

.welcome-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 80px;
  height: 4px;
  background-color: #8b5e3c;
  border-radius: 2px;
}

.description {
  color: #6b5750;
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 2.5rem;
  max-width: 600px;
}

.order-button {
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

.order-button:hover {
  background-color: #6b4423;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(139, 94, 60, 0.3);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .home-container {
    gap: 2rem;
    padding: 1rem;
  }

  .welcome-title {
    font-size: 3rem;
  }

  .description {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .home-container {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }

  .logo-container {
    max-width: 300px;
    padding: 1rem;
  }

  .welcome-title {
    font-size: 2.5rem;
  }

  .welcome-title::after {
    left: 50%;
    transform: translateX(-50%);
  }

  .description {
    margin: 2rem auto;
  }

  .content-section {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .home-section {
    padding: 1rem;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .description {
    font-size: 0.9rem;
  }

  .order-button {
    padding: 0.8rem 2rem;
    font-size: 1rem;
  }
}
</style>
