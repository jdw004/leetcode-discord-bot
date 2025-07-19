const express = require('express');
const cors = require('cors');
const config = require('../config');
const leetcodeService = require('./services/leetcodeService');
const dataService = require('./services/dataService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LeetCode Bot Backend is running' });
});

app.get('/api/user/:username/recent-problems', async (req, res) => {
  try {
    const { username } = req.params;
    const { days = 7 } = req.query;
    
    console.log(`Fetching recent problems for user: ${username} (last ${days} days)`);
    
    const problems = await leetcodeService.getRecentSolvedProblems(username, parseInt(days));
    
    // Store the data
    await dataService.storeUserProblems(username, problems);
    
    res.json({
      success: true,
      username,
      problemsCount: problems.length,
      problems,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching recent problems:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/user/:username/stored-data', async (req, res) => {
  try {
    const { username } = req.params;
    const data = await dataService.getStoredUserProblems(username);
    
    res.json({
      success: true,
      username,
      data
    });
  } catch (error) {
    console.error('Error retrieving stored data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Start server
app.listen(config.PORT, () => {
  console.log(`🚀 LeetCode Bot Backend running on port ${config.PORT}`);
  console.log(`📁 Data will be stored in: ${config.DATA_FOLDER}`);
  console.log(`🌐 Health check: http://localhost:${config.PORT}/api/health`);
}); 