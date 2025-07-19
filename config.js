require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  LEETCODE_API_URL: process.env.LEETCODE_API_URL || 'https://leetcode.com/graphql',
  DATA_FOLDER: process.env.DATA_FOLDER || './data'
}; 