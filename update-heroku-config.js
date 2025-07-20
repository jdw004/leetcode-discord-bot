const { execSync } = require('child_process');

console.log('🔧 Heroku Environment Variables Update Script');
console.log('============================================');

// Get current config
console.log('📋 Current Heroku Config:');
try {
  const config = execSync('heroku config -a jdw-leetcode-discord-bot', { encoding: 'utf8' });
  console.log(config);
} catch (error) {
  console.error('❌ Error getting current config:', error.message);
}

console.log('\n🔧 To update your Heroku environment variables, run these commands:');
console.log('============================================');

console.log('\n1. Update Channel ID (replace with your new channel ID):');
console.log('heroku config:set CHANNEL_ID=your_new_channel_id -a jdw-leetcode-discord-bot');

console.log('\n2. Update Guild ID (replace with your new server ID):');
console.log('heroku config:set GUILD_ID=your_new_guild_id -a jdw-leetcode-discord-bot');

console.log('\n3. Update LeetCode API URL (replace with your deployed backend URL):');
console.log('heroku config:set LEETCODE_API_URL=your_deployed_backend_url -a jdw-leetcode-discord-bot');

console.log('\n4. Add the new admin-unregister command:');
console.log('heroku config:set ADMIN_UNREGISTER_COMMAND=true -a jdw-leetcode-discord-bot');

console.log('\n5. Set production environment:');
console.log('heroku config:set NODE_ENV=production -a jdw-leetcode-discord-bot');

console.log('\n📝 Instructions:');
console.log('- Get your new channel ID: Right-click channel → Copy Channel ID');
console.log('- Get your new guild ID: Right-click server → Copy Server ID');
console.log('- Update your LeetCode backend URL to your deployed version');

console.log('\n🚀 After updating config, deploy with:');
console.log('git add .');
console.log('git commit -m "Update for new Discord server"');
console.log('git push heroku main');
console.log('heroku ps:scale web=1'); 