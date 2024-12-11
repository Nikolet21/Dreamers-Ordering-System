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
  }
};
