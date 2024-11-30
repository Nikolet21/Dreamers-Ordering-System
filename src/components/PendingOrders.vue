<template>
  <div class="orders-container">
    <!-- Filter Section -->
    <div class="filter-section">
      <button
        v-for="status in orderStatuses"
        :key="status"
        :class="['filter-btn', { active: currentFilter === status }]"
        @click="setFilter(status)"
      >
        {{ status }}
      </button>
    </div>

    <!-- Orders Grid -->
    <div class="orders-grid">
      <div v-for="order in paginatedOrders" :key="order.id" class="order-card">
        <div class="order-header">
          <h3>Order #{{ order.id }}</h3>
          <span :class="['status', order.status.toLowerCase()]">{{ order.status }}</span>
        </div>
        <div class="customer-info">
          <h4>Customer: {{ order.customerName }}</h4>
          <p>Ordered at: {{ formatTime(order.orderTime) }}</p>
        </div>
        <div class="products-section">
          <h4>Ordered Items:</h4>
          <div class="products-list">
            <div v-for="product in order.products" :key="product.id" class="product-item">
              <img :src="product.image" :alt="product.name">
              <div class="product-details">
                <span>{{ product.name }}</span>
                <small>Qty: {{ product.quantity }}</small>
              </div>
            </div>
          </div>
        </div>
        <div class="action-buttons">
          <button class="edit-btn" @click="editOrder(order)">Edit</button>
          <button
            class="complete-btn"
            @click="completeOrder(order)"
            :disabled="order.status === 'Completed'"
          >
            Complete
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        class="page-btn"
        @click="prevPage"
        :disabled="currentPage === 1"
      >&lt;</button>
      <button
        v-for="page in totalPages"
        :key="page"
        :class="['page-btn', { active: currentPage === page }]"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
      <button
        class="page-btn"
        @click="nextPage"
        :disabled="currentPage === totalPages"
      >&gt;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Constants
const ITEMS_PER_PAGE = 8
const orderStatuses = ['All', 'Pending', 'Processing', 'Completed', 'Cancelled']

// State
const currentFilter = ref('All')
const currentPage = ref(1)

// Mock Data
const orders = ref([
  {
    id: '1001',
    customerName: 'John Doe',
    orderTime: new Date('2024-02-20T10:30:00'),
    status: 'Pending',
    products: [
      {
        id: 1,
        name: 'Cappuccino',
        quantity: 2,
        image: 'https://example.com/cappuccino.jpg'
      },
      {
        id: 2,
        name: 'Chocolate Croissant',
        quantity: 1,
        image: 'https://example.com/croissant.jpg'
      }
    ]
  },
  {
    id: '1002',
    customerName: 'Jane Smith',
    orderTime: new Date('2024-02-20T11:45:00'),
    status: 'Processing',
    products: [
      {
        id: 3,
        name: 'Latte',
        quantity: 1,
        image: 'https://example.com/latte.jpg'
      },
      {
        id: 4,
        name: 'Mocha',
        quantity: 2,
        image: 'https://example.com/mocha.jpg'
      }
    ]
  },
  {
    id: '1003',
    customerName: 'Michael Johnson',
    orderTime: new Date('2024-02-20T13:15:00'),
    status: 'Completed',
    products: [
      {
        id: 5,
        name: 'Espresso',
        quantity: 3,
        image: 'https://example.com/espresso.jpg'
      },
      {
        id: 6,
        name: 'Americano',
        quantity: 1,
        image: 'https://example.com/americano.jpg'
      }
    ]
  },
  {
    id: '1004',
    customerName: 'Emily Davis',
    orderTime: new Date('2024-02-20T15:30:00'),
    status: 'Cancelled',
    products: [
      {
        id: 7,
        name: 'Cafe au Lait',
        quantity: 2,
        image: 'https://example.com/cafeau.jpg'
      },
      {
        id: 8,
        name: 'Flat White',
        quantity: 1,
        image: 'https://example.com/flatwhite.jpg'
      }
    ]
  },
  {
    id: '1005',
    customerName: 'David Wilson',
    orderTime: new Date('2024-02-20T17:45:00'),
    status: 'Pending',
    products: [
      {
        id: 9,
        name: 'Macchiato',
        quantity: 1,
        image: 'https://example.com/macchiato.jpg'
      },
      {
        id: 10,
        name: 'Affogato',
        quantity: 2,
        image: 'https://example.com/affogato.jpg'
      }
    ]
  },
  {
    id: '1006',
    customerName: 'Sarah Anderson',
    orderTime: new Date('2024-02-20T19:00:00'),
    status: 'Processing',
    products: [
      {
        id: 11,
        name: 'Flat White',
        quantity: 2,
        image: 'https://example.com/flatwhite.jpg'
      },
      {
        id: 12,
        name: 'Cafe au Lait',
        quantity: 1,
        image: 'https://example.com/cafeau.jpg'
      }
    ]
  },
  {
    id: '1007',
    customerName: 'Robert Thompson',
    orderTime: new Date('2024-02-20T20:15:00'),
    status: 'Completed',
    products: [
      {
        id: 13,
        name: 'Espresso',
        quantity: 3,
        image: 'https://example.com/espresso.jpg'
      },
      {
        id: 14,
        name: 'Americano',
        quantity: 1,
        image: 'https://example.com/americano.jpg'
      }
    ]
  },
  {
    id: '1008',
    customerName: 'Laura Martinez',
    orderTime: new Date('2024-02-20T22:30:00'),
    status: 'Cancelled',
    products: [
      {
        id: 15,
        name: 'Cafe au Lait',
        quantity: 2,
        image: 'https://example.com/cafeau.jpg'
      },
      {
        id: 16,
        name: 'Flat White',
        quantity: 1,
        image: 'https://example.com/flatwhite.jpg'
      }
    ]
  },
  {
    id: '1009',
    customerName: 'Daniel Rodriguez',
    orderTime: new Date('2024-02-20T23:45:00'),
    status: 'Pending',
    products: [
      {
        id: 17,
        name: 'Macchiato',
        quantity: 1,
        image: 'https://example.com/macchiato.jpg'
      },
      {
        id: 18,
        name: 'Affogato',
        quantity: 2,
        image: 'https://example.com/affogato.jpg'
      }
    ]
  }
])

// Computed Properties
const filteredOrders = computed(() => {
  let result = orders.value
  if (currentFilter.value !== 'All') {
    result = result.filter(order => order.status === currentFilter.value)
  }
  // Sort by orderTime in descending order (latest first)
  return result.sort((a, b) => b.orderTime - a.orderTime)
})

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / ITEMS_PER_PAGE)
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  return filteredOrders.value.slice(start, end)
})

// Methods
const setFilter = (status) => {
  currentFilter.value = status
  currentPage.value = 1 // Reset to first page when filter changes
}

const goToPage = (page) => {
  currentPage.value = page
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const editOrder = (order) => {
  // Implement edit functionality
  console.log('Editing order:', order.id)
}

const completeOrder = (order) => {
  // Update order status to completed
  order.status = 'Completed'
}
</script>

<style scoped>
.orders-container {
  padding: 20px;
  background-color: #F5F5F5;
}

/* Filter Section Styles */
.filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 20px;
  border: none;
  background-color: #8D6E63;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.filter-btn:hover {
  background-color: #5D4037;
}

.filter-btn.active {
  background-color: #3E2723;
}

/* Orders Grid Styles */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.order-card {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.status {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9em;
}

.status.pending {
  background-color: #FFF3E0;
  color: #E65100;
}

.status.processing {
  background-color: #E3F2FD;
  color: #1565C0;
}

.status.completed {
  background-color: #E8F5E9;
  color: #2E7D32;
}

.status.cancelled {
  background-color: #FFEBEE;
  color: #C62828;
}

.customer-info {
  margin-bottom: 15px;
}

.customer-info h4 {
  color: #5D4037;
  margin-bottom: 5px;
}

.customer-info p {
  color: #757575;
  font-size: 0.9em;
}

.products-section {
  margin-bottom: 15px;
}

.products-section h4 {
  color: #5D4037;
  margin-bottom: 10px;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px;
  background-color: #F5F5F5;
  border-radius: 5px;
}

.product-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
}

.product-details {
  display: flex;
  flex-direction: column;
}

.product-details span {
  color: #5D4037;
  font-weight: 500;
}

.product-details small {
  color: #757575;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.edit-btn, .complete-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.edit-btn {
  background-color: #8D6E63;
  color: white;
}

.edit-btn:hover {
  background-color: #5D4037;
}

.complete-btn {
  background-color: #4CAF50;
  color: white;
}

.complete-btn:hover:not(:disabled) {
  background-color: #388E3C;
}

.complete-btn:disabled {
  background-color: #C8E6C9;
  cursor: not-allowed;
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.page-btn {
  width: 35px;
  height: 35px;
  border: none;
  background-color: #8D6E63;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #5D4037;
}

.page-btn.active {
  background-color: #3E2723;
}

.page-btn:disabled {
  background-color: #D7CCC8;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .filter-section {
    justify-content: center;
  }

  .orders-grid {
    grid-template-columns: 1fr;
  }

  .order-card {
    max-width: 100%;
  }
}
</style>
