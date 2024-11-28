<script setup>
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faWifi, faCouch, faPlug, faUsers } from '@fortawesome/free-solid-svg-icons'
library.add(faWifi, faCouch, faPlug, faUsers)
</script>

<template>
  <section class="facility-section">
    <div class="facility-container">
      <h2 class="section-title">Our Facilities</h2>
      <div class="separator"></div>
      <div class="facility-grid">
        <!-- Comfortable Seating -->
        <div class="facility-card">
          <div class="facility-icon">
            <font-awesome-icon :icon="['fas', 'couch']" />
          </div>
          <h3>Comfortable Seating</h3>
          <p>Relax in our ergonomic chairs and cozy couches</p>
        </div>

        <!-- Free Wi-Fi -->
        <div class="facility-card">
          <div class="facility-icon">
            <font-awesome-icon :icon="['fas', 'wifi']" />
          </div>
          <h3>Free Wi-Fi</h3>
          <p>Stay connected with our high-speed internet</p>
        </div>

        <!-- Power Outlets -->
        <div class="facility-card">
          <div class="facility-icon">
            <font-awesome-icon :icon="['fas', 'plug']" />
          </div>
          <h3>Power Outlets</h3>
          <p>Multiple charging points at every seating area</p>
        </div>

        <!-- Meeting Rooms -->
        <div class="facility-card">
          <div class="facility-icon">
            <font-awesome-icon :icon="['fas', 'users']" />
          </div>
          <h3>Meeting Rooms</h3>
          <p>Private spaces for your business meetings</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.facility-section {
  padding: 4rem 2rem;
  background-color: #fdf8f5;
}

.facility-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  color: #5d4037;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: bold;
}

.separator {
  width: 80px;
  height: 4px;
  background-color: #8b5e3c;
  margin: 0 auto 2rem;
  border-radius: 2px;
}

.facility-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.facility-card {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.facility-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(93, 64, 55, 0.2);
}

.facility-icon {
  background-color: #8d6e63;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

svg {
  color: white;
  font-size: 2rem;
}

.facility-card h3 {
  color: #5d4037;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.facility-card p {
  color: #795548;
  font-size: 1rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .facility-section {
    padding: 3rem 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .facility-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }
}
</style>

<script setup></script>
