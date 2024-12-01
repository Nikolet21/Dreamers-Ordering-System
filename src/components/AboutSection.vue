<script setup>
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faPhoneVolume, faDoorOpen, faClock } from '@fortawesome/free-solid-svg-icons'
library.add(faPhoneVolume, faDoorOpen, faClock)
</script>

<template>
  <section class="about-section">
    <div class="about-container">
      <!-- Main About Content -->
      <div class="about-header">
        <h2 class="about-title">About Dreamers Coffee</h2>
        <div class="separator"></div>
        <p class="about-description">
          Welcome to Dreamers Coffee, where passion meets perfection in every cup. Since 2023, we've
          been crafting exceptional coffee experiences using carefully selected beans from
          sustainable sources worldwide. Our skilled baristas are dedicated to serving you the
          perfect brew, complemented by our warm and inviting atmosphere.
        </p>
      </div>

      <!-- Information Cards -->
      <div class="info-cards">
        <!-- Location Card -->
        <div class="info-card">
          <div class="card-icon">
            <font-awesome-icon :icon="['fas', 'door-open']" />
          </div>
          <h3 class="card-title">Visit Us</h3>
          <div class="card-content">
            <p>Vel Ouano Center M. C.</p>
            <p>Briones Street</p>
            <p>Mandaue City, Philippines</p>
          </div>
        </div>

        <!-- Contact Card -->
        <div class="info-card">
          <div class="card-icon">
            <font-awesome-icon :icon="['fas', 'phone-volume']" />
          </div>
          <h3 class="card-title">Contact Us</h3>
          <div class="card-content">
            <p>Phone: (+63) 968 201 8381</p>
            <p>Email: coffeebusinesscontact@gmail.com</p>
            <p>Facebook: Dreamers Coffee</p>
          </div>
        </div>

        <!-- Hours Card -->
        <div class="info-card">
          <div class="card-icon">
            <font-awesome-icon :icon="['fas', 'clock']" />
          </div>
          <h3 class="card-title">Opening Hours</h3>
          <div class="card-content">
            <p>Monday - Friday: 7AM - 8PM</p>
            <p>Saturday: 8AM - 9PM</p>
            <p>Sunday: 8AM - 6PM</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  background-color: #fdf8f5;
  padding: 5rem 2rem;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
}

.about-header {
  text-align: center;
  margin-bottom: 4rem;
}

.about-title {
  color: #4a3428;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.separator {
  width: 80px;
  height: 4px;
  background-color: #8b5e3c;
  margin: 0 auto 2rem;
  border-radius: 2px;
}

.about-description {
  color: #6b5750;
  font-size: 1.1rem;
  line-height: 1.8;
  max-width: 800px;
  margin: 0 auto;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  padding: 2rem 0;
}

.info-card {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 60px;
  height: 60px;
  background-color: #8b5e3c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.card-icon i {
  color: white;
  font-size: 1.5rem;
}

.card-title {
  color: #4a3428;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.card-content {
  color: #6b5750;
}

.card-content p {
  margin: 0.5rem 0;
  line-height: 1.6;
}

svg {
  color: white;
  font-size: 2rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .about-section {
    padding: 4rem 1.5rem;
  }

  .about-title {
    font-size: 2.2rem;
  }

  .about-description {
    font-size: 1rem;
    padding: 0 1rem;
  }
}

@media (max-width: 768px) {
  .about-section {
    padding: 3rem 1rem;
  }

  .info-cards {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .about-title {
    font-size: 2rem;
  }

  .info-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .about-section {
    padding: 2rem 1rem;
  }

  .about-title {
    font-size: 1.8rem;
  }

  .about-description {
    font-size: 0.9rem;
  }

  .card-title {
    font-size: 1.3rem;
  }

  .card-content {
    font-size: 0.9rem;
  }
}
</style>
