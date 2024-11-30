<template>
  <div class="users-container">
    <!-- Filter Section -->
    <div class="filter-section">
      <div class="search-filters">
        <div class="search-input">
          <input
            type="text"
            v-model="nameFilter"
            placeholder="Search by name..."
            @input="filterUsers"
          />
        </div>
        <div class="search-input">
          <input
            type="text"
            v-model="emailFilter"
            placeholder="Search by email..."
            @input="filterUsers"
          />
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th @click="sortBy('name')" class="sortable">
              <div class="th-content">
                <span>Name</span>
                <span class="sort-icons">
                  <font-awesome-icon
                    v-if="sortField === 'name' && sortOrder === 'asc'"
                    :icon="['fas', 'sort-up']"
                  />
                  <font-awesome-icon
                    v-else-if="sortField === 'name' && sortOrder === 'desc'"
                    :icon="['fas', 'sort-down']"
                  />
                  <font-awesome-icon
                    v-else
                    :icon="['fas', 'sort']"
                  />
                </span>
              </div>
            </th>
            <th @click="sortBy('email')" class="sortable">
              <div class="th-content">
                <span>Email</span>
                <span class="sort-icons">
                  <font-awesome-icon
                    v-if="sortField === 'email' && sortOrder === 'asc'"
                    :icon="['fas', 'sort-up']"
                  />
                  <font-awesome-icon
                    v-else-if="sortField === 'email' && sortOrder === 'desc'"
                    :icon="['fas', 'sort-down']"
                  />
                  <font-awesome-icon
                    v-else
                    :icon="['fas', 'sort']"
                  />
                </span>
              </div>
            </th>
            <th @click="sortBy('role')" class="sortable">
              <div class="th-content">
                <span>Role</span>
                <span class="sort-icons">
                  <font-awesome-icon
                    v-if="sortField === 'role' && sortOrder === 'asc'"
                    :icon="['fas', 'sort-up']"
                  />
                  <font-awesome-icon
                    v-else-if="sortField === 'role' && sortOrder === 'desc'"
                    :icon="['fas', 'sort-down']"
                  />
                  <font-awesome-icon
                    v-else
                    :icon="['fas', 'sort']"
                  />
                </span>
              </div>
            </th>
            <th @click="sortBy('status')" class="sortable">
              <div class="th-content">
                <span>Status</span>
                <span class="sort-icons">
                  <font-awesome-icon
                    v-if="sortField === 'status' && sortOrder === 'asc'"
                    :icon="['fas', 'sort-up']"
                  />
                  <font-awesome-icon
                    v-else-if="sortField === 'status' && sortOrder === 'desc'"
                    :icon="['fas', 'sort-down']"
                  />
                  <font-awesome-icon
                    v-else
                    :icon="['fas', 'sort']"
                  />
                </span>
              </div>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedUsers.length === 0">
            <td colspan="5" class="no-users-message">No Users to be found</td>
          </tr>
          <tr v-else v-for="user in paginatedUsers" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <span :class="['status-badge', user.status.toLowerCase()]">
                {{ user.status }}
              </span>
            </td>
            <td class="action-buttons">
              <button class="edit-btn" @click="editUser(user)">
                <font-awesome-icon :icon="['fas', 'edit']" />
                Edit
              </button>
              <button class="delete-btn" @click="deleteUser(user)">
                <font-awesome-icon :icon="['fas', 'trash']" />
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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
    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Edit User</h2>
        <div class="form-group">
          <label>Name</label>
          <input
            type="text"
            v-model="editingUser.name"
            placeholder="Enter name"
            :class="{ 'error': errors.name }"
          />
          <span class="error-message" v-if="errors.name">{{ errors.name }}</span>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input
            type="email"
            v-model="editingUser.email"
            placeholder="Enter email"
            :class="{ 'error': errors.email }"
          />
          <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
        </div>
        <div class="form-group">
          <label>Role</label>
          <select 
            v-model="editingUser.role"
            :class="{ 'error': errors.role }"
          >
            <option value="">Select role</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Staff">Staff</option>
          </select>
          <span class="error-message" v-if="errors.role">{{ errors.role }}</span>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select 
            v-model="editingUser.status"
            :class="{ 'error': errors.status }"
          >
            <option value="">Select status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <span class="error-message" v-if="errors.status">{{ errors.status }}</span>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="cancelEdit">Cancel</button>
          <button class="confirm-btn" @click="confirmEdit">Confirm</button>
        </div>
      </div>
    </div>
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content delete-modal">
        <h2>Confirm Delete</h2>
        <p class="delete-message">
          Are you sure you want to delete user <span class="user-highlight">{{ userToDelete?.name }}</span>?
          This action cannot be undone.
        </p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="cancelDelete">Cancel</button>
          <button class="delete-confirm-btn" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faSort,
  faSortUp,
  faSortDown,
  faEdit,
  faTrash
} from '@fortawesome/free-solid-svg-icons'

// Add icons to the library
library.add(faSort, faSortUp, faSortDown, faEdit, faTrash)

// Constants
const ITEMS_PER_PAGE = 10

// State
const nameFilter = ref('')
const emailFilter = ref('')
const currentPage = ref(1)
const sortField = ref('')
const sortOrder = ref('asc')

const showEditModal = ref(false)
const editingUser = ref({
  id: null,
  name: '',
  email: '',
  role: '',
  status: ''
})

const errors = ref({
  name: '',
  email: '',
  role: '',
  status: ''
})

const showDeleteModal = ref(false)
const userToDelete = ref(null)

const editUser = (user) => {
  editingUser.value = { ...user }
  showEditModal.value = true
}

const cancelEdit = () => {
  showEditModal.value = false
  editingUser.value = {
    id: null,
    name: '',
    email: '',
    role: '',
    status: ''
  }
  errors.value = {
    name: '',
    email: '',
    role: '',
    status: ''
  }
}

const confirmEdit = () => {
  const isValid = validateForm()
  if (!isValid) return

  const index = users.value.findIndex(u => u.id === editingUser.value.id)
  if (index !== -1) {
    users.value[index] = { ...editingUser.value }
  }
  showEditModal.value = false
  errors.value = {
    name: '',
    email: '',
    role: '',
    status: ''
  }
}

const validateForm = () => {
  let isValid = true

  if (!editingUser.value.name) {
    errors.value.name = 'Name is required'
    isValid = false
  } else {
    errors.value.name = ''
  }

  if (!editingUser.value.email) {
    errors.value.email = 'Email is required'
    isValid = false
  } else {
    errors.value.email = ''
  }

  if (!editingUser.value.role) {
    errors.value.role = 'Role is required'
    isValid = false
  } else {
    errors.value.role = ''
  }

  if (!editingUser.value.status) {
    errors.value.status = 'Status is required'
    isValid = false
  } else {
    errors.value.status = ''
  }

  return isValid
}

const deleteUser = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

const confirmDelete = () => {
  const index = users.value.findIndex(u => u.id === userToDelete.value.id)
  if (index !== -1) {
    users.value.splice(index, 1)
  }
  showDeleteModal.value = false
  userToDelete.value = null
}

// Mock Data (Replace with actual API calls)
const users = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Staff',
    status: 'Active'
  },
])

// Computed Properties
const filteredUsers = computed(() => {
  let result = users.value.filter(user => {
    const nameMatch = user.name.toLowerCase().includes(nameFilter.value.toLowerCase())
    const emailMatch = user.email.toLowerCase().includes(emailFilter.value.toLowerCase())
    return nameMatch && emailMatch
  })

  // Apply sorting if a sort field is selected
  if (sortField.value) {
    result.sort((a, b) => {
      let aValue = a[sortField.value].toLowerCase()
      let bValue = b[sortField.value].toLowerCase()

      if (sortOrder.value === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })
  }

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / ITEMS_PER_PAGE)
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  return filteredUsers.value.slice(start, end)
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

// Methods
const filterUsers = () => {
  currentPage.value = 1
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

const sortBy = (field) => {
  if (sortField.value === field) {
    // If clicking the same field, toggle the sort order
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    // If clicking a new field, set it as the sort field and default to ascending
    sortField.value = field
    sortOrder.value = 'asc'
  }
}
</script>

<style scoped>
.users-container {
  padding: 20px 40px;
  width: 95%;
  margin: 0 auto;
  background-color: #F5F5F5;
}

.filter-section {
  margin-bottom: 25px;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-filters {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 300px;
}

.search-input input {
  width: 100%;
  padding: 12px 20px;
  border: 1px solid #D7CCC8;
  border-radius: 5px;
  font-size: 15px;
  transition: border-color 0.3s ease;
}

.search-input input:focus {
  outline: none;
  border-color: #8D6E63;
  box-shadow: 0 0 0 2px rgba(141, 110, 99, 0.1);
  background-color: white;
}

.table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  margin-bottom: 25px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 15px 20px;
  text-align: left;
  border-bottom: 1px solid #EFEBE9;
}

.users-table th {
  background-color: #8D6E63;
  color: white;
  font-weight: 500;
  font-size: 15px;
  white-space: nowrap;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
}

.users-table tr:hover {
  background-color: #EFEBE9;
}

.users-table td {
  font-size: 14px;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #E8F5E9;
  color: #2E7D32;
}

.status-badge.inactive {
  background-color: #FFEBEE;
  color: #C62828;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background-color 0.3s ease;
}

.edit-btn {
  background-color: #8D6E63;
  color: white;
}

.delete-btn {
  background-color: #D32F2F;
  color: white;
}

.edit-btn:hover {
  background-color: #5D4037;
}

.delete-btn:hover {
  background-color: #B71C1C;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 15px;
  border: 1px solid #D7CCC8;
  background-color: white;
  color: #5D4037;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.page-btn.active {
  background-color: #8D6E63;
  color: white;
  border-color: #8D6E63;
}

.page-btn:hover:not(:disabled) {
  background-color: #8D6E63;
  color: white;
  border-color: #8D6E63;
}

.page-btn:disabled {
  background-color: #F5F5F5;
  color: #9E9E9E;
  cursor: not-allowed;
}

.no-users-message {
  text-align: center;
  padding: 20px;
  font-size: 16px;
  font-weight: 500;
  color: #9E9E9E;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
  padding: 12px 16px !important;
}

.sortable:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.th-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
}

.sort-icons {
  display: flex;
  align-items: center;
  color: #ffffff;
  width: 16px;
  justify-content: center;
  opacity: 0.7;
}

.sortable:hover .sort-icons {
  opacity: 1;
}

.fa-sort-up, .fa-sort-down {
  color: #ffffff;
}

.fa-sort {
  opacity: 0.7;
  color: #ffffff;
}

.sortable:hover .fa-sort {
  opacity: 1;
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
  max-width: 500px;
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

.form-group input,
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

.form-group input:focus,
.form-group select:focus {
  border-color: #8D6E63;
  outline: none;
  box-shadow: 0 0 0 3px rgba(141, 110, 99, 0.1);
  background-color: white;
}

.form-group input::placeholder {
  color: #BCAAA4;
}

.form-group input.error,
.form-group select.error {
  border-color: #D32F2F;
  background-color: #FFF8F8;
}

.form-group input.error:focus,
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

.form-group input.error::placeholder {
  color: #FFCDD2;
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

/* Delete Modal Styles */
.delete-modal {
  max-width: 400px;
}

.delete-modal h2 {
  color: #8D6E63;
  border-bottom-color: #8D6E63;
}

.delete-message {
  color: #5D4037;
  line-height: 1.5;
  margin: 1rem 0 1.5rem;
  text-align: center;
  font-size: 0.95rem;
}

.user-highlight {
  color: #8D6E63;
  font-weight: 600;
}

.delete-confirm-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #8D6E63;
  color: white;
}

.delete-confirm-btn:hover {
  background-color: #6D4C41;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(109, 76, 65, 0.2);
}

.delete-confirm-btn:active {
  transform: translateY(0);
  box-shadow: none;
}
</style>
