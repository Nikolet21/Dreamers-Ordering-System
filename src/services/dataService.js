import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default {
  async fetchMenuData() {
    try {
      const response = await axios.get(`${API_URL}/menu`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu data:', error);
      throw error;
    }
  },

  // Reviews API methods
  async fetchReviews() {
    try {
      const response = await axios.get(`${API_URL}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  async submitReview(reviewData) {
    try {
      console.log('Submitting review:', reviewData); // Debug log
      const response = await axios.post(`${API_URL}/reviews`, {
        ...reviewData,
        isRead: false, // Default to unread for new reviews
        date: new Date().toISOString()
      });
      console.log('Review submission response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error submitting review:', error.response || error);
      throw error;
    }
  },

  async markReviewAsRead(reviewId) {
    try {
      const response = await axios.patch(`${API_URL}/reviews/${reviewId}`, {
        isRead: true
      });
      return response.data;
    } catch (error) {
      console.error('Error marking review as read:', error);
      throw error;
    }
  },

  async deleteReview(reviewId) {
    try {
      await axios.delete(`${API_URL}/reviews/${reviewId}`);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  // Validation method for reviews
  validateReview(reviewData) {
    const errors = [];

    // Ensure username is either a non-empty string or explicitly set to 'Anonymous'
    if (!reviewData.username) {
      reviewData.username = 'Anonymous';
    }

    if (!reviewData.productName) {
      errors.push('Product selection is required');
    }

    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      errors.push('Rating must be between 1 and 5 stars');
    }

    if (!reviewData.description || reviewData.description.trim().length < 10) {
      errors.push('Review must be at least 10 characters long');
    }

    return errors;
  }
};
