require('dotenv').config();

module.exports = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID,
  CHANNEL_ID: process.env.CHANNEL_ID,
  LEETCODE_API_URL: process.env.LEETCODE_API_URL || 'http://localhost:3000/api',
  DATABASE_PATH: process.env.DATABASE_PATH || './data/users.db',
  WEEKLY_UPDATE_CRON: process.env.WEEKLY_UPDATE_CRON || '0 9 * * 1', // Every Monday at 9 AM
  UPDATE_TIMEZONE: process.env.UPDATE_TIMEZONE || 'America/New_York'
}; 