const express = require('express');
const cors = require('cors');

function createAPI() {
  const api = express();
  
  // Middleware
  api.use(cors());
  api.use(express.json());

  // Health check endpoint
  api.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'LeetCode Backend API is running!' });
  });

  // Get recent problems for a user
  api.get('/api/recent-problems/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const days = req.query.days || 7;
      
      console.log(`📊 API: Fetching recent problems for ${username} (${days} days)`);
      
      // Simulate LeetCode API call
      // In a real implementation, you would call the actual LeetCode API
      const mockProblems = [
        { id: 1, title: "Two Sum", difficulty: "Easy", solvedAt: new Date().toISOString() },
        { id: 2, title: "Add Two Numbers", difficulty: "Medium", solvedAt: new Date().toISOString() },
        { id: 3, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", solvedAt: new Date().toISOString() },
        { id: 4, title: "Median of Two Sorted Arrays", difficulty: "Hard", solvedAt: new Date().toISOString() }
      ];
      
      // Filter problems from the last N days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentProblems = mockProblems.filter(problem => 
        new Date(problem.solvedAt) >= cutoffDate
      );
      
      res.json({
        success: true,
        username: username,
        count: recentProblems.length,
        problems: recentProblems,
        period: `${days} days`
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

  // Get user profile
  api.get('/api/user/:username', async (req, res) => {
    try {
      const { username } = req.params;
      
      console.log(`👤 API: Fetching profile for ${username}`);
      
      // Mock user profile data
      const userProfile = {
        username: username,
        totalSolved: 150,
        easySolved: 80,
        mediumSolved: 50,
        hardSolved: 20,
        ranking: 1250,
        joinDate: "2023-01-15"
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
      
      // Mock statistics data
      const stats = {
        username: username,
        period: period,
        problemsSolved: 12,
        streak: 5,
        averageTime: "25 minutes",
        topDifficulty: "Medium"
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