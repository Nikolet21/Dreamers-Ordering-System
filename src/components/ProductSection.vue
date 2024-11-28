<script setup>
import { ref, defineAsyncComponent } from 'vue'
const OrderingModal = defineAsyncComponent(() => import('../components/OrderingModal.vue'))

const isOrderingModalOpen = ref(false)
const selectedProduct = ref(null)

const openOrderingModal = (product) => {
  selectedProduct.value = product
  isOrderingModalOpen.value = true
}

const closeOrderingModal = () => {
  isOrderingModalOpen.value = false
  selectedProduct.value = null
}

const coffees = [
  {
    id: 1,
    name: 'Milky Strawberry',
    description: 'Sweet and creamy strawberry milk with a hint of richness.',
    price: 37.0,
    image: 'src/assets/milkstrawberry.jpg',
  },
  {
    id: 2,
    name: 'Dream Latte',
    description: 'A smooth and velvety latte with a dreamy touch of caramel.',
    price: 37.0,
    image: 'src/assets/vanillalatte.jpg',
  },
  {
    id: 3,
    name: 'Caramel Macchiato',
    description: 'Espresso layered with steamed milk and drizzled caramel.',
    price: 37.0,
    image: 'src/assets/caramel.jpg',
  },
  {
    id: 4,
    name: 'Dark Chocolate',
    description: 'Rich and bold hot chocolate made with premium dark cocoa.',
    price: 37.0,
    image: 'src/assets/darkchoco.jpg',
  },
  {
    id: 5,
    name: 'Dreamy Yogurt',
    description: 'Incredibly refreshing yogurt drink with a creamy, tangy finish.',
    price: 37.0,
    image: 'src/assets/yogurt.jpg',
  },
  {
    id: 6,
    name: 'Hot Dark Chocolate',
    description: 'Indulgent hot cocoa with a deep, intense chocolate flavor.',
    price: 37.0,
    image: 'src/assets/hotchoco.jpg',
  },
]
</script>

<template>
  <div class="product-section">
    <section class="category-section">
      <h2 class="section-title">Our Signature Coffees</h2>
      <div class="product-grid">
        <div v-for="coffee in coffees" :key="coffee.id" class="product-card">
          <img :src="coffee.image" :alt="coffee.name" class="product-image" />
          <div class="product-info">
            <h3 class="product-name">{{ coffee.name }}</h3>
            <p class="product-description">{{ coffee.description }}</p>
            <div class="product-footer">
              <span class="price">₱{{ coffee.price.toFixed(2) }}</span>
              <button class="order-btn" @click="openOrderingModal(coffee)">Order Now</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <OrderingModal
      :isOpen="isOrderingModalOpen"
      :product="selectedProduct"
      @close="closeOrderingModal"
    />
  </div>
</template>

<style scoped>
.product-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #fdf8f5;
}

.category-section {
  margin-bottom: 4rem;
}

.section-title {
  color: #4a3428;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 700;
  position: relative;
  padding-bottom: 1rem;
  margin-top: 5%;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: #8b5e3c;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.product-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.product-info {
  padding: 1.5rem;
}

.product-name {
  color: #4a3428;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.product-description {
  color: #6b5750;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.price {
  color: #8b5e3c;
  font-size: 1.25rem;
  font-weight: 600;
}

.order-btn {
  background-color: #8b5e3c;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.order-btn:hover {
  background-color: #6b4423;
}

@media (max-width: 768px) {
  .product-section {
    padding: 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
}
</style>
