const express = require('express');
const cors = require('cors');

// LeetCode GraphQL query
const LEETCODE_QUERY = `
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
    recentSubmissionList(username: $username, limit: 150) {
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

// Format LeetCode data
const formatLeetCodeData = (data) => {
  if (!data.matchedUser) {
    return null;
  }
  
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
};

// Fetch data from LeetCode GraphQL API
const fetchLeetCodeData = async (username) => {
  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      },
      body: JSON.stringify({
        query: LEETCODE_QUERY,
        variables: { username: username }
      })
    });

    const data = await response.json();
    
    if (data.errors) {
      console.error('❌ LeetCode GraphQL errors:', data.errors);
      return null;
    }
    
    return formatLeetCodeData(data.data);
  } catch (error) {
    console.error('❌ Error fetching LeetCode data:', error);
    return null;
  }
};

function createAPI() {
  console.log('🔧 Creating API routes...');
  const api = express();
  
  // Middleware
  api.use(cors());
  api.use(express.json());

  // Health check endpoint
  api.get('/health', (req, res) => {
    console.log('🏥 Health check requested');
    res.json({ status: 'OK', message: 'LeetCode Backend API is running!' });
  });

  // Get recent problems for a user
  api.get('/api/recent-problems/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const days = req.query.days || 7;
      
      console.log(`📊 API: Fetching recent problems for ${username} (${days} days)`);
      
      // Fetch real data from LeetCode GraphQL API
      const leetcodeData = await fetchLeetCodeData(username);
      
      if (!leetcodeData) {
        return res.status(404).json({
          success: false,
          error: 'User not found or error fetching data',
          message: 'Could not fetch user data from LeetCode'
        });
      }
      
      // Filter recent submissions from the last N days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      cutoffDate.setHours(0, 0, 0, 0);
      
      console.log(`📅 API: Cutoff date for ${username}: ${cutoffDate.toISOString()} (${days} days back from ${new Date().toISOString()})`);
      
      // Get unique problems (not submissions) from the last N days
      const uniqueProblems = new Map();
      
      // Process recent submissions
      leetcodeData.recentSubmissions
        .filter(submission => {
          const submissionDate = new Date(submission.timestamp * 1000);
          const isAccepted = submission.statusDisplay === 'Accepted';
          const isRecent = submissionDate >= cutoffDate;
          
          if (isAccepted && isRecent) {
            console.log(`✅ API: Including submission for ${username}: ${submission.title} at ${submissionDate.toISOString()}`);
          }
          
          return isRecent && isAccepted;
        })
        .forEach(submission => {
          // Use titleSlug as unique key to avoid duplicates
          if (!uniqueProblems.has(submission.titleSlug)) {
            uniqueProblems.set(submission.titleSlug, {
              id: submission.titleSlug,
              title: submission.title,
              difficulty: submission.difficulty || 'Unknown',
              solvedAt: new Date(submission.timestamp * 1000).toISOString(),
              language: submission.lang
            });
          }
        });
      
      const recentProblems = Array.from(uniqueProblems.values());
      
      // Also check submission calendar for validation
      let calendarTotal = 0;
      if (leetcodeData.submissionCalendar) {
        const calendar = leetcodeData.submissionCalendar;
        const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);
        
        // Sum up submissions from the calendar for the date range
        Object.entries(calendar).forEach(([timestamp, count]) => {
          if (parseInt(timestamp) >= cutoffTimestamp) {
            calendarTotal += count;
          }
        });
        
        console.log(`📊 API: Submission calendar shows ${calendarTotal} total submissions for ${username} in the last ${days} days`);
      }
      
      console.log(`📊 API: Found ${recentProblems.length} unique problems for ${username} in the last ${days} days`);
      console.log(`📊 API: Recent submissions count: ${leetcodeData.recentSubmissions.length}`);
      
      // If we have significantly fewer problems than submissions, log a warning
      if (recentProblems.length < Math.min(leetcodeData.recentSubmissions.length, 20) * 0.8) {
        console.log(`⚠️ API: Warning - Found ${recentProblems.length} problems but ${leetcodeData.recentSubmissions.length} recent submissions for ${username}`);
        console.log(`⚠️ API: This might indicate missing data due to the 100 submission limit`);
      }
      
      res.json({
        success: true,
        username: username,
        count: recentProblems.length,
        problems: recentProblems,
        period: `${days} days`,
        totalSolved: leetcodeData.totalSolved,
        calendarSubmissions: calendarTotal,
        recentSubmissionsCount: leetcodeData.recentSubmissions.length
      });
      
    } catch (error) {
      console.error('❌ API Error fetching recent problems:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recent problems',
        message: error.message
      });
    }
  });

  // Get recent problems count using submission calendar (alternative method)
  api.get('/api/recent-problems-calendar/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const days = req.query.days || 7;
      
      console.log(`📊 API: Fetching recent problems count via calendar for ${username} (${days} days)`);
      
      // Fetch real data from LeetCode GraphQL API
      const leetcodeData = await fetchLeetCodeData(username);
      
      if (!leetcodeData) {
        return res.status(404).json({
          success: false,
          error: 'User not found or error fetching data',
          message: 'Could not fetch user data from LeetCode'
        });
      }
      
      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      cutoffDate.setHours(0, 0, 0, 0);
      const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);
      
      console.log(`📅 API: Calendar cutoff timestamp for ${username}: ${cutoffTimestamp} (${cutoffDate.toISOString()})`);
      
      // Sum up submissions from the calendar for the date range
      let totalSubmissions = 0;
      let dailyBreakdown = [];
      
      if (leetcodeData.submissionCalendar) {
        Object.entries(leetcodeData.submissionCalendar).forEach(([timestamp, count]) => {
          if (parseInt(timestamp) >= cutoffTimestamp) {
            totalSubmissions += count;
            const date = new Date(parseInt(timestamp) * 1000);
            dailyBreakdown.push({
              date: date.toISOString().split('T')[0],
              submissions: count,
              timestamp: parseInt(timestamp)
            });
          }
        });
        
        // Sort by date
        dailyBreakdown.sort((a, b) => a.timestamp - b.timestamp);
      }
      
      console.log(`📊 API: Calendar shows ${totalSubmissions} total submissions for ${username} in the last ${days} days`);
      
      res.json({
        success: true,
        username: username,
        totalSubmissions: totalSubmissions,
        dailyBreakdown: dailyBreakdown,
        period: `${days} days`,
        totalSolved: leetcodeData.totalSolved,
        method: 'submission_calendar'
      });
      
    } catch (error) {
      console.error('❌ API Error fetching recent problems via calendar:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recent problems via calendar',
        message: error.message
      });
    }
  });

  // Get user profile
  api.get('/api/user/:username', async (req, res) => {
    try {
      const { username } = req.params;
      
      console.log(`👤 API: Fetching profile for ${username}`);
      
      // Fetch real data from LeetCode GraphQL API
      const leetcodeData = await fetchLeetCodeData(username);
      
      if (!leetcodeData) {
        return res.status(404).json({
          success: false,
          error: 'User not found or error fetching data',
          message: 'Could not fetch user data from LeetCode'
        });
      }
      
      const userProfile = {
        username: username,
        totalSolved: leetcodeData.totalSolved,
        easySolved: leetcodeData.easySolved,
        mediumSolved: leetcodeData.mediumSolved,
        hardSolved: leetcodeData.hardSolved,
        totalEasy: leetcodeData.totalEasy,
        totalMedium: leetcodeData.totalMedium,
        totalHard: leetcodeData.totalHard,
        ranking: leetcodeData.ranking,
        reputation: leetcodeData.reputation,
        contributionPoints: leetcodeData.contributionPoint,
        submissionCalendar: leetcodeData.submissionCalendar,
        recentSubmissions: leetcodeData.recentSubmissions.slice(0, 10) // Last 10 submissions
      };
      
      res.json({
        success: true,
        profile: userProfile
      });
      
    } catch (error) {
      console.error('❌ API Error fetching user profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile',
        message: error.message
      });
    }
  });

  // Get user statistics
  api.get('/api/stats/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const period = req.query.period || 'week';
      
      console.log(`📈 API: Fetching stats for ${username} (${period})`);
      
      // Fetch real data from LeetCode GraphQL API
      const leetcodeData = await fetchLeetCodeData(username);
      
      if (!leetcodeData) {
        return res.status(404).json({
          success: false,
          error: 'User not found or error fetching data',
          message: 'Could not fetch user data from LeetCode'
        });
      }
      
      // Calculate streak from submission calendar
      const calendar = leetcodeData.submissionCalendar;
      const today = new Date();
      const todayKey = Math.floor(today.getTime() / 1000000);
      
      let streak = 0;
      let currentDate = new Date();
      
      while (calendar[currentDate.getTime() / 1000000]) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      // Calculate recent activity (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoKey = Math.floor(weekAgo.getTime() / 1000000);
      
      let recentProblems = 0;
      for (let i = 0; i < 7; i++) {
        const dateKey = Math.floor((weekAgo.getTime() + i * 24 * 60 * 60 * 1000) / 1000000);
        if (calendar[dateKey]) {
          recentProblems += calendar[dateKey];
        }
      }
      
      const stats = {
        username: username,
        period: period,
        totalSolved: leetcodeData.totalSolved,
        easySolved: leetcodeData.easySolved,
        mediumSolved: leetcodeData.mediumSolved,
        hardSolved: leetcodeData.hardSolved,
        ranking: leetcodeData.ranking,
        reputation: leetcodeData.reputation,
        streak: streak,
        recentProblems: recentProblems,
        submissionCalendar: calendar,
        recentSubmissions: leetcodeData.recentSubmissions.slice(0, 5) // Last 5 submissions
      };
      
      res.json({
        success: true,
        stats: stats
      });
      
    } catch (error) {
      console.error('❌ API Error fetching user stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user statistics',
        message: error.message
      });
    }
  });

  // Root endpoint
  api.get('/', (req, res) => {
    res.json({
      message: 'LeetCode Backend API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        recentProblems: '/api/recent-problems/:username',
        userProfile: '/api/user/:username',
        userStats: '/api/stats/:username'
      }
    });
  });

  return api;
}

module.exports = { createAPI }; 