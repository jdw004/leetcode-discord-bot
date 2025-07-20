require('dotenv').config();
const config = require('./config');

console.log('🔍 Environment Variables Check:');
console.log('================================');
console.log(`DISCORD_TOKEN: ${config.DISCORD_TOKEN ? 'SET' : 'NOT SET'}`);
console.log(`CLIENT_ID: ${config.CLIENT_ID}`);
console.log(`GUILD_ID: ${config.GUILD_ID}`);
console.log(`CHANNEL_ID: ${config.CHANNEL_ID}`);
console.log(`LEETCODE_API_URL: ${config.LEETCODE_API_URL}`);
console.log(`DATABASE_URL: ${config.DATABASE_URL ? 'SET' : 'NOT SET'}`);
console.log(`WEEKLY_UPDATE_CRON: ${config.WEEKLY_UPDATE_CRON}`);
console.log(`UPDATE_TIMEZONE: ${config.UPDATE_TIMEZONE}`);
console.log('================================');

// Check if .env file exists
const fs = require('fs');
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync('.env', 'utf8');
  console.log('📄 .env file contents:');
  console.log(envContent);
} else {
  console.log('❌ .env file does not exist');
}

console.log('================================');
console.log('Raw environment variables:');
console.log(`process.env.CHANNEL_ID: ${process.env.CHANNEL_ID}`);
console.log(`process.env.GUILD_ID: ${process.env.GUILD_ID}`); 