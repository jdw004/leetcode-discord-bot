const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 LeetCode Backend Deployment Script');
console.log('=====================================');

// Check if we're in the right directory
const backendPath = path.join(__dirname, '../leetcode-backend');
if (!fs.existsSync(backendPath)) {
  console.log('📁 Creating leetcode-backend directory...');
  fs.mkdirSync(backendPath, { recursive: true });
}

console.log('📋 Backend files created in ../leetcode-backend/');
console.log('');

console.log('🔧 Next steps to deploy your LeetCode backend:');
console.log('==============================================');

console.log('\n1. Navigate to the backend directory:');
console.log('cd ../leetcode-backend');

console.log('\n2. Install dependencies:');
console.log('npm install');

console.log('\n3. Test locally:');
console.log('npm run dev');

console.log('\n4. Create a new Heroku app for the backend:');
console.log('heroku create your-leetcode-backend-name');

console.log('\n5. Deploy to Heroku:');
console.log('git init');
console.log('git add .');
console.log('git commit -m "Initial backend deployment"');
console.log('git push heroku main');

console.log('\n6. Get your backend URL:');
console.log('heroku info -s | grep web_url');

console.log('\n7. Update your Discord bot config:');
console.log('heroku config:set LEETCODE_API_URL=https://your-backend-url.herokuapp.com/api -a jdw-leetcode-discord-bot');

console.log('\n📝 Example backend app name: leetcode-api-jdw');
console.log('📝 Example backend URL: https://leetcode-api-jdw.herokuapp.com/api');

console.log('\n🎯 After deployment, your Discord bot will use the deployed backend instead of localhost!'); 