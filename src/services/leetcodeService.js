const axios = require('axios');
const config = require('../../config');

const query = `
  query getUserProfile($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      contributions {
        points
      }
      profile {
        reputation
        ranking
      }
      submissionCalendar
      submitStats {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
    recentSubmissionList(username: $username, limit: 100) {
      title
      titleSlug
      timestamp
      statusDisplay
      lang
      __typename
    }
    matchedUserStats: matchedUser(username: $username) {
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
          __typename
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
          __typename
        }
        __typename
      }
    }
  }
`;

class LeetCodeService {
  constructor() {
    this.apiUrl = config.LEETCODE_API_URL || 'http://localhost:3000/api';
  }

  async fetchUserProfile(username) {
    try {
      const response = await axios.get(`${this.apiUrl}/user/${username}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.profile
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Failed to fetch user profile'
        };
      }
    } catch (error) {
      console.error(`Error fetching LeetCode data for ${username}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getRecentProblems(username, days = 7) {
    try {
      console.log(`📊 Service: Fetching recent problems for ${username} (${days} days)`);
      const response = await axios.get(`${this.apiUrl}/recent-problems/${username}?days=${days}`);
      
      if (response.data.success) {
        return {
          success: true,
          problems: response.data.problems,
          count: response.data.count,
          username: username,
          totalSolved: response.data.totalSolved,
          calendarSubmissions: response.data.calendarSubmissions,
          recentSubmissionsCount: response.data.recentSubmissionsCount
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Failed to fetch recent problems',
          problems: [],
          count: 0
        };
      }
    } catch (error) {
      console.error(`Error fetching recent problems for ${username}:`, error.message);
      return {
        success: false,
        error: error.message,
        problems: [],
        count: 0
      };
    }
  }

  async validateUser(username) {
    const result = await this.fetchUserProfile(username);
    return result.success && result.data && result.data.username === username;
  }

  formatData(data) {
    return {
      totalSolved: data.matchedUser.submitStats.acSubmissionNum[0].count,
      totalSubmissions: data.matchedUser.submitStats.totalSubmissionNum,
      totalQuestions: data.allQuestionsCount[0].count,
      easySolved: data.matchedUser.submitStats.acSubmissionNum[1].count,
      totalEasy: data.allQuestionsCount[1].count,
      mediumSolved: data.matchedUser.submitStats.acSubmissionNum[2].count,
      totalMedium: data.allQuestionsCount[2].count,
      hardSolved: data.matchedUser.submitStats.acSubmissionNum[3].count,
      totalHard: data.allQuestionsCount[3].count,
      ranking: data.matchedUser.profile.ranking,
      contributionPoint: data.matchedUser.contributions.points,
      reputation: data.matchedUser.profile.reputation,
      submissionCalendar: JSON.parse(data.matchedUser.submissionCalendar),
      recentSubmissions: data.recentSubmissionList,
      matchedUserStats: data.matchedUser.submitStats
    };
  }
}

module.exports = new LeetCodeService();