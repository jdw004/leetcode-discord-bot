const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testBackend() {
  try {
    console.log('🧪 Testing LeetCode Bot Backend...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    console.log('');

    // Test with a sample LeetCode username
    const testUsername = 'jdw004'; // You can change this to any valid LeetCode username
    
    console.log(`2. Testing recent problems for user: ${testUsername}`);
    console.log('   (This may take a moment as it calls LeetCode API)...');
    
    const problemsResponse = await axios.get(`${BASE_URL}/user/${testUsername}/recent-problems?days=7`);
    
    if (problemsResponse.data.success) {
      console.log('✅ Successfully fetched problems!');
      console.log(`   Problems found: ${problemsResponse.data.problemsCount}`);
      console.log(`   Username: ${problemsResponse.data.username}`);
      console.log(`   Timestamp: ${problemsResponse.data.timestamp}`);
      
      if (problemsResponse.data.problems.length > 0) {
        console.log('\n   Sample problem:');
        const sampleProblem = problemsResponse.data.problems[0];
        console.log(`   - Title: ${sampleProblem.title}`);
        console.log(`   - Difficulty: ${sampleProblem.difficulty}`);
        console.log(`   - Category: ${sampleProblem.categoryTitle}`);
        console.log(`   - Status: ${sampleProblem.status}`);
        console.log(`   - Time ago: ${sampleProblem.timeAgo}`);
      }
    } else {
      console.log('❌ Failed to fetch problems:', problemsResponse.data.error);
    }
    console.log('');

    // Test stored data endpoint
    console.log('3. Testing stored data retrieval...');
    const storedDataResponse = await axios.get(`${BASE_URL}/user/${testUsername}/stored-data`);
    
    if (storedDataResponse.data.success) {
      console.log('✅ Successfully retrieved stored data!');
      console.log(`   Source: ${storedDataResponse.data.source}`);
      console.log(`   Problems count: ${storedDataResponse.data.data.problemsCount}`);
    } else {
      console.log('❌ No stored data found:', storedDataResponse.data.message);
    }

    console.log('\n🎉 Backend test completed!');
    console.log('\n📁 Check the ./data folder to see the stored files.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testBackend(); 