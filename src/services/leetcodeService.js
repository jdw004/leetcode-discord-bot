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
    recentSubmissionList(username: $username, limit: 20) {
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
    this.apiUrl = 'https://leetcode.com/graphql';
  }

  async fetchUserProfile(username) {
    try {
      const response = await axios.post(this.apiUrl, {
        query: query,
        variables: { username: username }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com'
        }
      });

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error(`Error fetching LeetCode data for ${username}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getRecentProblems(username, days = 7) {
    const result = await this.fetchUserProfile(username);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        problems: [],
        count: 0
      };
    }

    const recentSubmissions = result.data.recentSubmissionList || [];
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);

    const recentProblems = recentSubmissions.filter(sub => 
      sub.timestamp > sevenDaysAgo && sub.statusDisplay === 'Accepted'
    );

    // Remove duplicates
    const uniqueProblems = [...new Map(recentProblems.map(item => [item['titleSlug'], item])).values()];

    return {
      success: true,
      problems: uniqueProblems,
      count: uniqueProblems.length,
      username: username
    };
  }

  async validateUser(username) {
    const result = await this.fetchUserProfile(username);
    return result.success && result.data.matchedUser !== null;
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