<template>
  <div class="orders-container">
    <!-- Filter Section -->
    <div class="filter-section">
      <div class="status-filters">
        <button
          v-for="status in orderStatuses"
          :key="status"
          :class="['filter-btn', { active: currentFilter === status }]"
          @click="setFilter(status)"
        >
          {{ status }}
        </button>
      </div>
      <div class="search-container">
        <div class="search-bar">
          <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search customer name..."
            class="search-input"
          >
        </div>
      </div>
    </div>

    <!-- Orders Grid -->
    <div v-if="paginatedOrders.length" class="orders-grid">
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
            <div v-for="product in displayedProducts(order)" :key="product.id" class="product-item">
              <img :src="product.image" :alt="product.name">
              <div class="product-details">
                <span>{{ product.name }}</span>
                <div class="product-info">
                  <small>Size: {{ product.size }}</small>
                  <small>Qty: {{ product.quantity }}</small>
                  <small>₱{{ product.totalPrice.toFixed(2) }}</small>
                </div>
              </div>
            </div>
            <div v-if="order.products.length > 2" class="more-items" @click="viewReceipt(order)">
              + {{ order.products.length - 2 }} more items...
            </div>
          </div>
        </div>
        <div class="action-buttons">
          <button class="view-btn" @click="viewReceipt(order)">
            <font-awesome-icon :icon="['fas', 'eye']" />
            View
          </button>
          <button class="edit-btn" @click="editStatus(order)">
            <font-awesome-icon :icon="['fas', 'edit']" />
            Edit
          </button>
          <button
            class="complete-btn"
            @click="completeOrder(order)"
            :disabled="order.status === 'Completed' || order.status === 'Cancelled'"
          >
            <font-awesome-icon :icon="['fas', 'check']" />
            Done
          </button>
        </div>
      </div>
    </div>
    <div v-else class="no-results">
      <font-awesome-icon :icon="['fas', 'user-slash']" class="no-results-icon" />
      <p>No Customer Found</p>
      <small v-if="searchQuery">Try a different search term</small>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        class="page-btn"
        @click="prevPage"
        :disabled="currentPage === 1"
      >&lt;</button>
      <button
        v-for="pageNum in displayedPageNumbers"
        :key="pageNum"
        :class="['page-btn', { active: currentPage === pageNum }]"
        @click="goToPage(pageNum)"
      >
        {{ pageNum }}
      </button>
      <button
        class="page-btn"
        @click="nextPage"
        :disabled="currentPage === totalPages"
      >&gt;</button>
    </div>

    <!-- Edit Status Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Edit Order Status</h2>
        <div class="form-group">
          <label>Status</label>
          <select
            v-model="editingOrder.status"
            :class="{ 'error': errors.status }"
          >
            <option value="">Select status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <span class="error-message" v-if="errors.status">{{ errors.status }}</span>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="cancelEdit">Cancel</button>
          <button class="confirm-btn" @click="confirmEdit">Confirm</button>
        </div>
      </div>
    </div>

    <!-- Receipt Modal -->
    <div v-if="showReceipt" class="modal-overlay">
      <div class="receipt-modal">
        <div class="receipt-content">
          <h2>Order Receipt</h2>
          <p><strong>Order #:</strong> {{ currentReceipt.id }}</p>
          <p><strong>Date:</strong> {{ formatTime(currentReceipt.orderTime) }}</p>
          <p><strong>Customer:</strong> {{ currentReceipt.customerName }}</p>

          <div class="receipt-items">
            <h3>Order Details</h3>
            <div v-for="product in currentReceipt.products" :key="product.id" class="receipt-item">
              <div class="item-details">
                <div class="item-name">{{ product.name }}</div>
                <div class="item-info">
                  <span>Size: {{ product.size }}</span>
                  <span>Qty: {{ product.quantity }}</span>
                </div>
                <div class="item-price">₱{{ (product.price * product.quantity).toFixed(2) }}</div>
              </div>
            </div>
          </div>

          <div class="receipt-total">
            <strong>Total Amount:</strong>
            <span>₱{{ calculateTotal(currentReceipt.products).toFixed(2) }}</span>
          </div>

          <p class="thank-you">Thank you for choosing Dreamers!</p>

          <button class="close-receipt" @click="closeReceipt">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEye, faEdit, faCheck, faTrash, faSearch, faUserSlash } from '@fortawesome/free-solid-svg-icons'
import { useUserStore } from '@/stores/userStore'

library.add(faEye, faEdit, faCheck, faTrash, faSearch, faUserSlash)

const userStore = useUserStore()

// Constants
const ITEMS_PER_PAGE = 8
const orderStatuses = ['All', 'Pending', 'Processing', 'Completed', 'Cancelled']

// State
const currentFilter = ref('All')
const currentPage = ref(1)
const searchQuery = ref('')
const showEditModal = ref(false)
const editingOrder = ref({
  id: null,
  status: ''
})
const errors = ref({
  status: ''
})
const showReceipt = ref(false)
const currentReceipt = ref({
  id: null,
  orderTime: null,
  customerName: '',
  products: []
})

// Computed Properties
const filteredOrders = computed(() => {
  let filtered = userStore.getPendingOrders

  // Filter by status
  if (currentFilter.value !== 'All') {
    filtered = filtered.filter(order => order.status === currentFilter.value)
  }

  // Filter by customer name
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(order =>
      order.customerName.toLowerCase().includes(query)
    )
  }

  // Sort by date (newest first)
  return filtered.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime))
})

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / ITEMS_PER_PAGE)
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  return filteredOrders.value.slice(start, end)
})

const displayedPageNumbers = computed(() => {
  if (totalPages.value <= 5) {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1)
  }

  let pages = []
  // Always show first page
  pages.push(1)

  // Calculate middle pages
  let middleStart = Math.max(2, currentPage.value - 1)
  let middleEnd = Math.min(totalPages.value - 1, currentPage.value + 1)

  // Adjust if at the start
  if (currentPage.value <= 3) {
    middleStart = 2
    middleEnd = 4
  }
  // Adjust if at the end
  else if (currentPage.value >= totalPages.value - 2) {
    middleStart = totalPages.value - 3
    middleEnd = totalPages.value - 1
  }

  // Add middle pages
  for (let i = middleStart; i <= middleEnd; i++) {
    pages.push(i)
  }

  // Always show last page
  pages.push(totalPages.value)

  return pages
})

const displayedProducts = (order) => {
  return order.products.slice(0, 2)
}

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

const editStatus = (order) => {
  editingOrder.value = { ...order }
  showEditModal.value = true
}

const cancelEdit = () => {
  showEditModal.value = false
  editingOrder.value = {
    id: null,
    status: ''
  }
  errors.value.status = ''
}

const confirmEdit = () => {
  if (!editingOrder.value.status) {
    errors.value.status = 'Status is required'
    return
  }

  const index = userStore.getPendingOrders.findIndex(o => o.id === editingOrder.value.id)
  if (index !== -1) {
    userStore.getPendingOrders[index] = { ...userStore.getPendingOrders[index], status: editingOrder.value.status }
  }
  showEditModal.value = false
  editingOrder.value = {
    id: null,
    status: ''
  }
  errors.value.status = ''
}

const completeOrder = (order) => {
  // Update order status to completed
  order.status = 'Completed'
}

const viewReceipt = (order) => {
  currentReceipt.value = { ...order }
  showReceipt.value = true
}

const closeReceipt = () => {
  showReceipt.value = false
  currentReceipt.value = {
    id: null,
    orderTime: null,
    customerName: '',
    products: []
  }
}

const calculateTotal = (products) => {
  return products.reduce((total, product) => total + (product.price * product.quantity), 0)
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.status-filters {
  display: flex;
  gap: 10px;
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

.search-container {
  min-width: 250px;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #8D6E63;
  font-size: 0.9rem;
}

.search-input {
  width: 100%;
  padding: 8px 10px 8px 35px;
  border: 1px solid #D7CCC8;
  border-radius: 5px;
  font-size: 0.9rem;
  color: #5D4037;
  background-color: white;
  transition: border-color 0.3s ease;
}

.search-input::placeholder {
  color: #BCAAA4;
}

.search-input:focus {
  outline: none;
  border-color: #8D6E63;
}

/* Orders Grid Styles */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.order-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  min-height: 350px;
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
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 50px;
}

.products-section h4 {
  color: #5D4037;
  margin-bottom: 10px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 4px;
  background-color: #f5f5f5;
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
  flex-grow: 1;
}

.product-details span {
  color: #5D4037;
  font-weight: 500;
}

.product-info {
  display: flex;
  gap: 10px;
  font-size: 0.8rem;
  color: #666;
}

.action-buttons {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
  background: white;
  padding-top: 8px;
  border-top: 1px solid #eee;
}

.view-btn, .edit-btn, .complete-btn {
  flex: 1;
  padding: 6px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.85rem;
  transition: background-color 0.3s ease;
}

.view-btn svg, .edit-btn svg, .complete-btn svg {
  font-size: 0.9rem;
}

.view-btn {
  background-color: #8D6E63;
  color: white;
}

.view-btn:hover {
  background-color: #6D4C41;
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
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
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

/* Modal Styles */
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

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #8D6E63;
  font-size: 1.5rem;
  font-weight: 600;
  border-bottom: 2px solid #8D6E63;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #5D4037;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #D7CCC8;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #FAFAFA;
  color: #5D4037;
}

.form-group select:focus {
  border-color: #8D6E63;
  outline: none;
  box-shadow: 0 0 0 3px rgba(141, 110, 99, 0.1);
  background-color: white;
}

.form-group select.error {
  border-color: #D32F2F;
  background-color: #FFF8F8;
}

.form-group select.error:focus {
  border-color: #D32F2F;
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
}

.error-message {
  color: #D32F2F;
  font-size: 0.85rem;
  margin-top: 0.4rem;
  display: block;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #EFEBE9;
}

.cancel-btn,
.confirm-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: #EFEBE9;
  color: #5D4037;
}

.cancel-btn:hover {
  background-color: #D7CCC8;
}

.confirm-btn {
  background-color: #8D6E63;
  color: white;
}

.confirm-btn:hover {
  background-color: #6D4C41;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(109, 76, 65, 0.2);
}

.confirm-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.receipt-modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.receipt-content {
  font-family: 'Poppins', sans-serif;
}

.receipt-content h2 {
  text-align: center;
  color: #8b5e3c;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
  border-bottom: 2px solid #8b5e3c;
  padding-bottom: 0.5rem;
}

.receipt-content p {
  margin: 10px 0;
  color: #5d4037;
}

.receipt-items {
  margin: 20px 0;
  border-top: 1px dashed #ccc;
  border-bottom: 1px dashed #ccc;
  padding: 15px 0;
}

.receipt-items h3 {
  color: #8b5e3c;
  margin-bottom: 15px;
  font-size: 1.2rem;
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
  padding: 15px 0;
  border-top: 2px solid #8b5e3c;
  color: #5d4037;
  font-size: 1.2rem;
}

.thank-you {
  text-align: center;
  color: #8b5e3c;
  margin: 20px 0;
  font-style: italic;
}

.close-receipt {
  display: block;
  width: 100%;
  padding: 12px;
  background-color: #8b5e3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
  font-size: 1rem;
  transition: background-color 0.2s ease;
}

.close-receipt:hover {
  background-color: #6d4c41;
}

.no-results {
  margin: 40px auto;
  text-align: center;
  padding: 40px;
  background-color: #FFF;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.no-results-icon {
  font-size: 3rem;
  color: #BCAAA4;
  margin-bottom: 15px;
}

.no-results p {
  color: #5D4037;
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 5px;
}

.no-results small {
  color: #8D6E63;
  font-size: 0.9rem;
}

.more-items {
  color: #8b5e3c;
  font-size: 0.9rem;
  margin-top: 8px;
  cursor: pointer;
  transition: color 0.2s ease;
  text-align: right;
  font-style: italic;
}

.more-items:hover {
  color: #6d4c41;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .receipt-modal {
    width: 95%;
    padding: 15px;
  }

  .receipt-content {
    padding: 10px;
  }

  .receipt-content h2 {
    font-size: 1.3rem;
  }

  .item-info {
    flex-direction: column;
    gap: 3px;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .status-filters {
    overflow-x: auto;
    padding-bottom: 5px;
  }

  .search-container {
    min-width: 100%;
  }

  .orders-grid {
    grid-template-columns: 1fr;
  }

  .order-card {
    max-width: 100%;
  }
}
</style>
