const axios = require('axios');
const moment = require('moment');
const config = require('../../config');

class LeetCodeService {
  constructor() {
    this.apiUrl = config.LEETCODE_API_URL;
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; LeetCodeBot/1.0)'
      }
    });
  }

  async getRecentSolvedProblems(username, days = 7) {
    try {
      console.log(`Fetching recent solved problems for ${username} (last ${days} days)`);
      
      // First, try to get recent AC submissions
      const recentProblems = await this.getRecentAcSubmissions(username, 50);
      
      if (recentProblems.length > 0) {
        // Filter by the specified number of days
        const cutoffDate = moment().subtract(days, 'days');
        const filteredProblems = recentProblems.filter(problem => {
          const problemDate = moment.unix(problem.timestamp);
          return problemDate.isAfter(cutoffDate);
        });

        console.log(`Found ${filteredProblems.length} problems in the last ${days} days`);
        
        // Enhance the problems with additional metadata
        const enhancedProblems = filteredProblems.map(problem => ({
          ...problem,
          fetchedAt: new Date().toISOString(),
          dateRange: {
            start: moment().subtract(days, 'days').format('YYYY-MM-DD'),
            end: moment().format('YYYY-MM-DD')
          }
        }));

        return enhancedProblems;
      }

      // If no recent submissions, try to get user profile data
      console.log('No recent submissions found, trying user profile...');
      return await this.getUserProfileData(username);
      
    } catch (error) {
      console.error('Error fetching LeetCode data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  async getRecentAcSubmissions(username, limit = 50) {
    try {
      console.log(`Fetching recent AC submissions for ${username} (limit: ${limit})`);
      
      const query = `
        query recentAcSubmissions($username: String!, $limit: Int!) {
          recentAcSubmissionList(username: $username, limit: $limit) {
            id
            title
            titleSlug
            timestamp
          }
        }
      `;

      const variables = {
        username,
        limit
      };

      console.log('Sending GraphQL request:', {
        query: query.trim(),
        variables
      });

      const response = await this.client.post('', {
        query,
        variables
      });

      console.log('GraphQL response status:', response.status);
      console.log('GraphQL response data:', JSON.stringify(response.data, null, 2));

      if (response.data.errors) {
        console.error('GraphQL errors:', response.data.errors);
        throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
      }

      const data = response.data.data;
      
      if (!data || !data.recentAcSubmissionList) {
        console.log('No recent submissions data found');
        return [];
      }

      const problems = data.recentAcSubmissionList || [];
      console.log(`Found ${problems.length} recent AC submissions`);
      
      // Add additional metadata to each problem
      return problems.map(problem => ({
        ...problem,
        difficulty: 'Unknown', // We'll need to fetch this separately
        categoryTitle: 'Unknown',
        status: 'accepted',
        timeAgo: moment.unix(problem.timestamp).fromNow()
      }));

    } catch (error) {
      console.error('Error fetching recent AC submissions:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  async getUserProfileData(username) {
    try {
      console.log(`Fetching user profile data for ${username}`);
      
      // Get user profile and submission calendar
      const query = `
        query userProfileCalendar($username: String!) {
          matchedUser(username: $username) {
            userCalendar {
              submissionCalendar
              totalActiveDays
              streak
            }
          }
        }
      `;

      const response = await this.client.post('', {
        query,
        variables: { username }
      });

      if (response.data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
      }

      const data = response.data.data;
      
      if (!data || !data.matchedUser) {
        throw new Error('User not found or profile is private');
      }

      // Extract submission calendar data
      const submissionCalendar = data.matchedUser.userCalendar?.submissionCalendar;
      const recentSubmissions = this.parseSubmissionCalendar(submissionCalendar);
      
      return recentSubmissions.map(submission => ({
        id: submission.timestamp,
        title: `Problem solved on ${submission.date}`,
        titleSlug: `problem-${submission.timestamp}`,
        difficulty: 'Unknown',
        categoryTitle: 'Unknown',
        status: 'accepted',
        timestamp: submission.timestamp,
        timeAgo: submission.timeAgo,
        fetchedAt: new Date().toISOString(),
        dateRange: {
          start: moment().subtract(7, 'days').format('YYYY-MM-DD'),
          end: moment().format('YYYY-MM-DD')
        }
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error(`Failed to fetch data for user ${username}: ${error.message}`);
    }
  }

  async getUserProblemsSolved(username) {
    try {
      const query = `
        query userProblemsSolved($username: String!) {
          allQuestionsCount {
            difficulty
            count
          }
          matchedUser(username: $username) {
            problemsSolvedBeatsStats {
              difficulty
              percentage
            }
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `;

      const response = await this.client.post('', {
        query,
        variables: { username }
      });

      if (response.data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching user problems solved:', error);
      throw error;
    }
  }

  parseSubmissionCalendar(calendarData) {
    if (!calendarData) return [];
    
    const submissions = [];
    const endDate = moment();
    const startDate = moment().subtract(7, 'days');
    
    try {
      // Parse the submission calendar string
      const calendar = JSON.parse(calendarData);
      
      for (const [timestamp, count] of Object.entries(calendar)) {
        const date = moment.unix(parseInt(timestamp));
        
        if (date.isBetween(startDate, endDate, 'day', '[]') && count > 0) {
          submissions.push({
            timestamp: parseInt(timestamp),
            date: date.format('YYYY-MM-DD'),
            count: count,
            timeAgo: date.fromNow()
          });
        }
      }
    } catch (error) {
      console.error('Error parsing submission calendar:', error);
    }
    
    return submissions.sort((a, b) => b.timestamp - a.timestamp);
  }

  async getProblemDetails(titleSlug) {
    try {
      // This would require a separate query to get problem details
      // For now, we'll return basic info
      return {
        difficulty: 'Unknown',
        categoryTitle: 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching problem details:', error);
      return {
        difficulty: 'Unknown',
        categoryTitle: 'Unknown'
      };
    }
  }
}

module.exports = new LeetCodeService(); 