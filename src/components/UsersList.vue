<script setup>
import { ref, computed } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPen, faTrash, faSort, faSortUp, faSortDown, faPlus, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useUserStore } from '@/stores/userStore'

library.add(faPen, faTrash, faSort, faSortUp, faSortDown, faPlus, faEye, faEyeSlash)

const userStore = useUserStore()
const nameFilter = ref('')
const emailFilter = ref('')
const roleFilter = ref('')
const sortField = ref('username')
const sortOrder = ref('asc')
const currentPage = ref(1)
const itemsPerPage = 5

// Get accounts from store
const accounts = computed(() => userStore.accounts)

// Filtered and sorted users
const filteredUsers = computed(() => {
  let filtered = accounts.value.filter(user => {
    const matchName = user.username.toLowerCase().includes(nameFilter.value.toLowerCase())
    const matchEmail = user.email.toLowerCase().includes(emailFilter.value.toLowerCase())
    const matchRole = !roleFilter.value || user.role === roleFilter.value
    return matchName && matchEmail && matchRole
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let fieldA = a[sortField.value]?.toLowerCase() ?? ''
    let fieldB = b[sortField.value]?.toLowerCase() ?? ''

    if (sortOrder.value === 'asc') {
      return fieldA.localeCompare(fieldB)
    } else {
      return fieldB.localeCompare(fieldA)
    }
  })

  return filtered
})

// Paginated users
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredUsers.value.slice(start, end)
})

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage)
})

const showEditModal = ref(false)
const editingUser = ref({
  id: null,
  username: '',
  email: '',
  role: ''
})

const errors = ref({
  username: '',
  email: '',
  role: '',
  password: ''
})

const showDeleteModal = ref(false)
const userToDelete = ref(null)

const showCreateModal = ref(false)
const newUser = ref({
  username: '',
  email: '',
  password: '',
  role: ''
})

const showPassword = ref(false)

const editUser = (user) => {
  editingUser.value = { ...user }
  showEditModal.value = true
}

const cancelEdit = () => {
  showEditModal.value = false
  editingUser.value = {
    id: null,
    username: '',
    email: '',
    role: ''
  }
  errors.value = {
    username: '',
    email: '',
    role: ''
  }
}

const confirmEdit = () => {
  const isValid = validateForm()
  if (!isValid) return

  const index = accounts.value.findIndex(u => u.id === editingUser.value.id)
  if (index !== -1) {
    accounts.value[index] = { ...editingUser.value }
  }
  showEditModal.value = false
  errors.value = {
    username: '',
    email: '',
    role: ''
  }
}

const validateForm = () => {
  let isValid = true

  if (!editingUser.value.username) {
    errors.value.username = 'Username is required'
    isValid = false
  } else {
    errors.value.username = ''
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
  const index = accounts.value.findIndex(u => u.id === userToDelete.value.id)
  if (index !== -1) {
    accounts.value.splice(index, 1)
  }
  showDeleteModal.value = false
  userToDelete.value = null
}

const handleSubmit = (e) => {
  e.preventDefault()

  // Validate all fields
  validateField('username')
  validateField('email')
  validateField('password')
  validateField('role')

  // Check if there are any errors
  const hasErrors = Object.values(errors.value).some(error => error !== '')
  if (hasErrors) return

  createUser()
}

const validateField = (field) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[A-Z]).{8,}$/

  switch (field) {
    case 'username':
      if (!newUser.value.username.trim()) {
        errors.value.username = 'Username is required'
      } else if (newUser.value.username.trim().length < 2) {
        errors.value.username = 'Username must be at least 2 characters'
      } else {
        errors.value.username = ''
      }
      break

    case 'email':
      if (!newUser.value.email.trim()) {
        errors.value.email = 'Email is required'
      } else if (!emailRegex.test(newUser.value.email)) {
        errors.value.email = 'Please enter a valid email address'
      } else {
        errors.value.email = ''
      }
      break

    case 'password':
      if (!newUser.value.password) {
        errors.value.password = 'Password is required'
      } else if (!passwordRegex.test(newUser.value.password)) {
        errors.value.password = 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character'
      } else {
        errors.value.password = ''
      }
      break

    case 'role':
      if (!newUser.value.role) {
        errors.value.role = 'Role is required'
      } else {
        errors.value.role = ''
      }
      break
  }
}

const createUser = async () => {
  try {
    // Add your API call here to create the user
    const createdUser = {
      id: accounts.value.length + 1,
      ...newUser.value,
    }
    accounts.value.push(createdUser)
    showCreateModal.value = false
    resetCreateForm()
  } catch (error) {
    console.error('Error creating user:', error)
  }
}

const cancelCreate = () => {
  showCreateModal.value = false
  resetCreateForm()
}

const resetCreateForm = () => {
  newUser.value = {
    username: '',
    email: '',
    password: '',
    role: ''
  }
  errors.value = {}
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

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

<template>
  <div class="users-container">
    <!-- Filter Section -->
    <div class="filter-section">
      <div class="search-filters">
        <div class="search-input">
          <input
            type="text"
            v-model="nameFilter"
            placeholder="Search by username..."
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
        <div class="role-filter">
          <select
            v-model="roleFilter"
            @change="filterUsers"
            class="role-select"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Create Button Section -->
    <div class="action-section">
      <button class="create-btn" @click="showCreateModal = true">
        <font-awesome-icon :icon="['fas', 'plus']" class="create-icon" />
        Create User
      </button>
    </div>

    <!-- Users Table -->
    <div class="table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th @click="sortBy('username')" class="sortable" :class="{ 'sorted-asc': sortField === 'username' && sortOrder === 'asc', 'sorted-desc': sortField === 'username' && sortOrder === 'desc' }">
              <div class="th-content">
                <span>Username</span>
                <span class="sort-icons">
                  <font-awesome-icon
                    v-if="sortField === 'username' && sortOrder === 'asc'"
                    :icon="['fas', 'sort-up']"
                  />
                  <font-awesome-icon
                    v-else-if="sortField === 'username' && sortOrder === 'desc'"
                    :icon="['fas', 'sort-down']"
                  />
                  <font-awesome-icon v-else :icon="['fas', 'sort']" />
                </span>
              </div>
            </th>
            <th @click="sortBy('email')" class="sortable" :class="{ 'sorted-asc': sortField === 'email' && sortOrder === 'asc', 'sorted-desc': sortField === 'email' && sortOrder === 'desc' }">
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
                  <font-awesome-icon v-else :icon="['fas', 'sort']" />
                </span>
              </div>
            </th>
            <th @click="sortBy('role')" class="sortable" :class="{ 'sorted-asc': sortField === 'role' && sortOrder === 'asc', 'sorted-desc': sortField === 'role' && sortOrder === 'desc' }">
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
                  <font-awesome-icon v-else :icon="['fas', 'sort']" />
                </span>
              </div>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.email">
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['role-badge', user.role]">{{ user.role }}</span>
            </td>
            <td class="actions">
              <button class="action-btn edit" @click="editUser(user)" title="Edit User">
                <font-awesome-icon :icon="['fas', 'pen']" />
              </button>
              <button class="action-btn delete" @click="deleteUser(user)" title="Delete User">
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </td>
          </tr>
          <tr v-if="paginatedUsers.length === 0">
            <td colspan="4" class="no-data">No users found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        class="page-btn prev"
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
        class="page-btn next"
        @click="nextPage"
        :disabled="currentPage === totalPages"
      >&gt;</button>
    </div>
    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Edit User</h2>
        <div class="form-group">
          <label>Username</label>
          <input
            type="text"
            v-model="editingUser.username"
            placeholder="Enter username"
            :class="{ 'error': errors.username }"
          />
          <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
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
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
          <span class="error-message" v-if="errors.role">{{ errors.role }}</span>
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
          Are you sure you want to delete user <span class="user-highlight">{{ userToDelete?.username }}</span>?
          This action cannot be undone.
        </p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="cancelDelete">Cancel</button>
          <button class="delete-confirm-btn" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>
    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Create New User</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Username</label>
            <input
              type="text"
              v-model="newUser.username"
              placeholder="Enter username"
              :class="{ 'error': errors.username }"
              @input="validateField('username')"
            />
            <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              v-model="newUser.email"
              placeholder="Enter email"
              :class="{ 'error': errors.email }"
              @input="validateField('email')"
            />
            <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="password-input">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="newUser.password"
                placeholder="Enter password"
                :class="{ 'error': errors.password }"
                @input="validateField('password')"
              />
              <button 
                type="button"
                class="visibility-toggle"
                @click="togglePasswordVisibility"
                :title="showPassword ? 'Hide password' : 'Show password'"
              >
                <font-awesome-icon
                  :icon="['fas', showPassword ? 'eye-slash' : 'eye']"
                  class="visibility-icon"
                />
              </button>
            </div>
            <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
          </div>
          <div class="form-group">
            <label>Role</label>
            <select
              v-model="newUser.role"
              :class="{ 'error': errors.role }"
              @change="validateField('role')"
            >
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
            <span class="error-message" v-if="errors.role">{{ errors.role }}</span>
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="cancelCreate">Cancel</button>
            <button type="submit" class="confirm-btn">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users-container {
  padding: 20px 40px;
  width: 95%;
  margin: 0 auto;
  background-color: #F5F5F5;
}

.filter-section {
  margin-bottom: 20px;
}

.search-filters {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.search-input input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #8D6E63;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-input input:focus {
  outline: none;
  border-color: #5D4037;
  box-shadow: 0 0 0 2px rgba(141, 110, 99, 0.2);
}

.role-filter {
  min-width: 150px;
}

.role-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #8D6E63;
  border-radius: 4px;
  font-size: 0.95rem;
  background-color: white;
  cursor: pointer;
  color: #5D4037;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238D6E63' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  padding-right: 32px;
}

.role-select:focus {
  outline: none;
  border-color: #5D4037;
  box-shadow: 0 0 0 2px rgba(141, 110, 99, 0.2);
}

.role-select option {
  color: #5D4037;
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
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #5D4037;
  border-bottom: 2px solid #8D6E63;
  background-color: #FFF8F6;
  transition: all 0.2s ease;
}

.users-table th.sortable {
  cursor: pointer;
}

.users-table th.sortable:hover {
  background-color: #F3E5DC;
  color: #3E2723;
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
  color: #8D6E63;
  opacity: 0.8;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.users-table th.sortable:hover .sort-icons {
  opacity: 1;
  color: #5D4037;
}

.users-table tbody tr:hover {
  background-color: #FFF8F6;
}

.users-table tr:hover {
  background-color: #EFEBE9;
}

.users-table td {
  font-size: 14px;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.role-badge.admin {
  background-color: #EF5350;
  color: white;
}

.role-badge.manager {
  background-color: #42A5F5;
  color: white;
}

.role-badge.staff {
  background-color: #66BB6A;
  color: white;
}

.role-badge.user {
  background-color: #78909C;
  color: white;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  background: none;
  border: 1px solid #8D6E63;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #8D6E63;
  transition: all 0.2s ease;
  padding: 0;
}

.action-btn:hover {
  background-color: #8D6E63;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(141, 110, 99, 0.2);
}

.action-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.action-btn.edit:hover {
  background-color: #8D6E63;
  border-color: #8D6E63;
}

.action-btn.delete {
  border-color: #8D6E63;
  color: #8D6E63;
}

.action-btn.delete:hover {
  background-color: #D32F2F;
  border-color: #D32F2F;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}

.page-btn {
  background: none;
  border: 1px solid #8D6E63;
  color: #8D6E63;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #8D6E63;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(141, 110, 99, 0.2);
}

.page-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.page-btn.active {
  background-color: #8D6E63;
  color: white;
  border-color: #8D6E63;
}

.page-btn:disabled {
  border-color: #D7CCC8;
  color: #D7CCC8;
  cursor: not-allowed;
}

.page-btn.prev,
.page-btn.next {
  font-weight: bold;
  padding: 8px 16px;
}

.users-table th[class*="sorted-"] .sort-icons {
  color: #5D4037;
  opacity: 1;
}

.fa-sort-up, .fa-sort-down {
  color: #8D6E63;
}

.fa-sort {
  opacity: 0.8;
  color: #8D6E63;
}

.users-table th.sortable:hover .fa-sort {
  opacity: 1;
  color: #5D4037;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 0 0 2px rgba(141, 110, 99, 0.1);
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
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.1);
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

.action-section {
  margin: 20px 0;
  display: flex;
  justify-content: flex-end;
}

.create-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: transparent;
  color: #8D6E63;
  border: 2px solid #8D6E63;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.create-btn:hover {
  background-color: #8D6E63;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(141, 110, 99, 0.2);
}

.create-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.create-icon {
  font-size: 0.9em;
  transition: transform 0.3s ease;
}

.create-btn:hover .create-icon {
  transform: rotate(90deg);
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  width: 100%;
  padding: 8px 12px;
  padding-right: 40px;
  border: 1px solid #8D6E63;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  color: #5D4037;
}

.password-input input:focus {
  outline: none;
  border-color: #5D4037;
  box-shadow: 0 0 0 2px rgba(141, 110, 99, 0.1);
}

.visibility-toggle {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #8D6E63;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.visibility-toggle:hover {
  color: #5D4037;
  background-color: rgba(141, 110, 99, 0.1);
}

.visibility-toggle:active {
  transform: scale(0.95);
}

.visibility-icon {
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.visibility-toggle:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(141, 110, 99, 0.1);
}

.visibility-toggle:focus:not(:focus-visible) {
  box-shadow: none;
}
</style>
