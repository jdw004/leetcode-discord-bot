const axios = require('axios');
const config = require('../../config');

class LeetCodeService {
  constructor() {
    this.apiUrl = config.LEETCODE_API_URL;
  }

  async getRecentProblems(username, days = 7) {
    try {
      console.log(`Fetching recent problems for ${username} (last ${days} days)`);
      
      const response = await axios.get(`${this.apiUrl}/user/${username}/recent-problems?days=${days}`);
      
      if (response.data.success) {
        return {
          success: true,
          problems: response.data.problems,
          count: response.data.problemsCount,
          username: response.data.username
        };
      } else {
        throw new Error(response.data.error || 'Failed to fetch problems');
      }
    } catch (error) {
      console.error('Error fetching LeetCode data:', error.message);
      return {
        success: false,
        error: error.message,
        problems: [],
        count: 0
      };
    }
  }

  async validateUser(username) {
    try {
      // Try to fetch recent problems to validate the user exists
      const result = await this.getRecentProblems(username, 1);
      return result.success;
    } catch (error) {
      return false;
    }
  }

  async getStoredData(username) {
    try {
      const response = await axios.get(`${this.apiUrl}/user/${username}/stored-data`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching stored data:', error.message);
      return null;
    }
  }
}

module.exports = new LeetCodeService(); 