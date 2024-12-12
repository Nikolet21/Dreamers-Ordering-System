<script setup>
import { ref, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faEdit, faSave, faTimes);

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'update:profile']);

const userStore = useUserStore();
const isEditing = ref(false);
const editedProfile = ref({
  username: userStore.username
});
const errorMessage = ref('');

// Watch for changes in userStore data
watch(() => userStore.username, (newUsername) => {
  editedProfile.value.username = newUsername;
});

// Watch for modal open state to reset form
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    editedProfile.value.username = userStore.username;
    isEditing.value = false;
    errorMessage.value = '';
  }
});

const closeModal = () => {
  isEditing.value = false;
  errorMessage.value = '';
  editedProfile.value.username = userStore.username;
  emit('close');
};

const toggleEdit = () => {
  isEditing.value = true;
  editedProfile.value.username = userStore.username;
  errorMessage.value = '';
};

const validateForm = () => {
  if (!editedProfile.value.username.trim()) {
    errorMessage.value = 'Username cannot be empty';
    return false;
  }
  return true;
};

const saveChanges = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    const result = await userStore.updateProfile({
      username: editedProfile.value.username.trim()
    });

    if (result.success) {
      isEditing.value = false;
      errorMessage.value = '';
      // Force a refresh of the profile data
      editedProfile.value.username = userStore.username;
      emit('update:profile', { username: editedProfile.value.username });
      closeModal();
    } else {
      errorMessage.value = result.error || 'Failed to update profile. Please try again.';
    }
  } catch (error) {
    errorMessage.value = 'An error occurred while updating profile.';
    console.error('Profile update error:', error);
  }
};

const cancelEdit = () => {
  isEditing.value = false;
  editedProfile.value.username = userStore.username;
  errorMessage.value = '';
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Account Information</h2>
        <button class="close-button" @click="closeModal">
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>

      <div class="modal-body">
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="!isEditing" class="profile-info">
          <div class="info-item">
            <label>Username:</label>
            <span>{{ userStore.username }}</span>
          </div>
          <div class="info-item">
            <label>Email:</label>
            <span class="readonly-email">{{ userStore.email }}</span>
          </div>
          <button class="edit-button" @click="toggleEdit">
            <font-awesome-icon :icon="['fas', 'edit']" /> Edit Username
          </button>
        </div>

        <div v-else class="profile-edit">
          <div class="info-item">
            <label>Username:</label>
            <input
              v-model.trim="editedProfile.username"
              type="text"
              :placeholder="userStore.username"
              @keyup.enter="saveChanges"
            >
          </div>
          <div class="info-item">
            <label>Email:</label>
            <span class="readonly-email">{{ userStore.email }}</span>
          </div>
          <div class="button-group">
            <button class="save-button" @click="saveChanges">
              <font-awesome-icon :icon="['fas', 'save']" /> Save
            </button>
            <button class="cancel-button" @click="cancelEdit">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(62, 39, 35, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  padding: 20px;
}

.modal-content {
  background: #fff;
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(62, 39, 35, 0.2);
  border: 2px solid #8D6E63;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

/* Mobile styles */
@media screen and (max-width: 480px) {
  .modal-content {
    padding: 20px;
    width: 95%;
    margin: 10px;
  }

  .modal-header h2 {
    font-size: 20px;
  }

  .close-button {
    font-size: 20px;
    width: 35px;
    height: 35px;
  }

  .info-item {
    padding: 12px;
  }

  .info-item label {
    font-size: 12px;
  }

  .info-item span,
  .info-item input {
    font-size: 14px;
    padding: 10px;
  }

  .edit-button,
  .save-button,
  .cancel-button {
    padding: 10px 16px;
    font-size: 14px;
  }

  .button-group {
    flex-direction: column;
    gap: 10px;
  }
}

/* Tablet styles */
@media screen and (min-width: 481px) and (max-width: 768px) {
  .modal-content {
    padding: 25px;
    width: 85%;
  }

  .modal-header h2 {
    font-size: 22px;
  }

  .info-item {
    padding: 13px;
  }

  .info-item label {
    font-size: 13px;
  }

  .info-item span,
  .info-item input {
    font-size: 15px;
  }
}

/* Landscape orientation for mobile */
@media screen and (max-height: 480px) and (orientation: landscape) {
  .modal-content {
    max-height: 85vh;
    padding: 15px;
  }

  .modal-header {
    margin-bottom: 15px;
    padding-bottom: 10px;
  }

  .info-item {
    margin-bottom: 15px;
    padding: 10px;
  }

  .button-group {
    margin-top: 15px;
  }
}

/* Add smooth scrollbar for overflow content */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: #EFEBE9;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #8D6E63;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #6D4C41;
}

/* Ensure modal content is centered on very large screens */
@media screen and (min-width: 1200px) {
  .modal-content {
    max-width: 600px;
  }
}

/* Add fade transition for modal opening/closing */
.modal-overlay {
  transition: opacity 0.3s ease;
}

.modal-content {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

@keyframes modalFade {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-content {
  animation: modalFade 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #EFEBE9;
}

.modal-header h2 {
  margin: 0;
  color: #3E2723;
  font-size: 24px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #8D6E63;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: #EFEBE9;
  color: #3E2723;
}

.info-item {
  margin-bottom: 25px;
  background-color: #EFEBE9;
  padding: 15px;
  border-radius: 10px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.info-item:hover {
  background-color: #D7CCC8;
}

.info-item label {
  display: block;
  color: #5D4037;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  color: #3E2723;
  font-size: 16px;
  display: block;
  padding: 5px 0;
}

.info-item input {
  width: calc(100% - 5px);
  padding: 12px;
  border: 2px solid #D7CCC8;
  border-radius: 8px;
  font-size: 16px;
  background-color: #fff;
  color: #3E2723;
  transition: all 0.3s ease;
  margin: 0;
  box-sizing: border-box;
}

.info-item input:focus {
  outline: none;
  border-color: #8D6E63;
  box-shadow: 0 0 0 3px rgba(141, 110, 99, 0.2);
}

.profile-edit .info-item {
  padding: 15px;
  margin-bottom: 15px;
}

.edit-button, .save-button, .cancel-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
  transition: all 0.3s ease;
  font-size: 16px;
}

.edit-button {
  background-color: #8D6E63;
  color: white;
  width: 100%;
  justify-content: center;
}

.edit-button:hover {
  background-color: #6D4C41;
  transform: translateY(-1px);
}

.button-group {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.save-button {
  background-color: #8D6E63;
  color: white;
  flex: 1;
  justify-content: center;
}

.save-button:hover {
  background-color: #6D4C41;
  transform: translateY(-1px);
}

.cancel-button {
  background-color: #EFEBE9;
  color: #3E2723;
  flex: 1;
  justify-content: center;
  border: 2px solid #D7CCC8;
}

.cancel-button:hover {
  background-color: #D7CCC8;
  transform: translateY(-1px);
}

.profile-info, .profile-edit {
  padding: 10px;
}

.error-message {
  background-color: #FFEBEE;
  color: #C62828;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
  border: 1px solid #FFCDD2;
}

@media screen and (max-width: 480px) {
  .error-message {
    padding: 10px;
    font-size: 13px;
  }
}

.readonly-email {
  color: #666;
  padding: 8px 0;
  display: inline-block;
}

.info-item {
  margin-bottom: 1rem;
}

.info-item label {
  display: block;
  margin-bottom: 0.5rem;
  color: #5D4037;
  font-weight: 500;
}

.info-item span {
  font-size: 1rem;
  color: #333;
}
</style>
