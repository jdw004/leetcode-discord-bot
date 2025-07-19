const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Example usernames to test (replace with actual LeetCode usernames)
const testUsers = [
  'jdw004',        // Working username from our test
  'user8162l',     // From your GraphQL examples
  'neetcode'        // Popular LeetCode content creator
];

async function fetchUserProblems(username, days = 7) {
  try {
    console.log(`\n🔍 Fetching problems for ${username} (last ${days} days)...`);
    
    const response = await axios.get(`${BASE_URL}/user/${username}/recent-problems?days=${days}`);
    
    if (response.data.success) {
      console.log(`✅ Success! Found ${response.data.problemsCount} problems`);
      
      // Display some statistics
      const problems = response.data.problems;
      if (problems.length > 0) {
        const difficulties = {};
        const categories = {};
        
        problems.forEach(problem => {
          difficulties[problem.difficulty] = (difficulties[problem.difficulty] || 0) + 1;
          categories[problem.categoryTitle] = (categories[problem.categoryTitle] || 0) + 1;
        });
        
        console.log('\n📊 Statistics:');
        console.log('   Difficulties:', difficulties);
        console.log('   Categories:', categories);
        
        console.log('\n📝 Recent problems:');
        problems.slice(0, 5).forEach((problem, index) => {
          console.log(`   ${index + 1}. ${problem.title} (${problem.difficulty}) - ${problem.timeAgo}`);
        });
      }
    } else {
      console.log(`❌ Failed: ${response.data.error}`);
    }
  } catch (error) {
    console.log(`❌ Error for ${username}: ${error.message}`);
  }
}

async function getStoredData(username) {
  try {
    console.log(`\n💾 Retrieving stored data for ${username}...`);
    
    const response = await axios.get(`${BASE_URL}/user/${username}/stored-data`);
    
    if (response.data.success) {
      console.log(`✅ Found stored data (${response.data.source})`);
      console.log(`   Problems: ${response.data.data.problemsCount}`);
      console.log(`   Last updated: ${response.data.data.fetchedAt}`);
    } else {
      console.log(`❌ No stored data: ${response.data.message}`);
    }
  } catch (error) {
    console.log(`❌ Error retrieving stored data for ${username}: ${error.message}`);
  }
}

async function runExamples() {
  console.log('🚀 LeetCode Bot Backend Examples');
  console.log('================================\n');
  
  // Test with different users
  for (const username of testUsers) {
    await fetchUserProblems(username, 7);
    await getStoredData(username);
  }
  
  // Test with different time ranges
  console.log('\n🕒 Testing different time ranges...');
  await fetchUserProblems('jdw004', 3);  // Last 3 days
  await fetchUserProblems('jdw004', 14); // Last 2 weeks
  
  console.log('\n✅ All examples completed!');
  console.log('📁 Check the ./data folder to see all stored files.');
}

// Run examples
runExamples(); 