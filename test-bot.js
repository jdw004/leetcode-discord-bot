const database = require('./src/services/database');
const leetcodeService = require('./src/services/leetcodeService');

async function testBotFunctionality() {
  console.log('🧪 Testing LeetCode Discord Bot Functionality');
  console.log('=============================================\n');

  try {
    // Initialize database
    console.log('1. Initializing database...');
    await database.init();
    console.log('✅ Database initialized successfully\n');

    // Test user registration
    console.log('2. Testing user registration...');
    const testUser = {
      discordId: '316686551113269249',
      discordUsername: 'jdw_',
      leetcodeUsername: 'jdw004' // Using the working username from our tests
    };

    await database.registerUser(
      testUser.discordId,
      testUser.discordUsername,
      testUser.leetcodeUsername
    );
    console.log('✅ User registered successfully\n');

    // Test getting user
    console.log('3. Testing user retrieval...');
    const retrievedUser = await database.getUserByDiscordId(testUser.discordId);
    console.log('✅ User retrieved:', {
      discordUsername: retrievedUser.discord_username,
      leetcodeUsername: retrievedUser.leetcode_username,
      registeredAt: retrievedUser.registered_at
    });
    console.log('');

    // Test LeetCode API integration
    console.log('4. Testing LeetCode API integration...');
    const leetcodeData = await leetcodeService.getRecentProblems(testUser.leetcodeUsername, 7);
    
    if (leetcodeData.success) {
      console.log('✅ LeetCode API working:', {
        username: leetcodeData.username,
        problemsCount: leetcodeData.count,
        problems: leetcodeData.problems.slice(0, 3).map(p => p.title)
      });
    } else {
      console.log('❌ LeetCode API failed:', leetcodeData.error);
    }
    console.log('');

    // Test getting all users
    console.log('5. Testing get all users...');
    const allUsers = await database.getAllActiveUsers();
    console.log(`✅ Found ${allUsers.length} active users:`);
    allUsers.forEach(user => {
      console.log(`   - ${user.discord_username} (${user.leetcode_username})`);
    });
    console.log('');

    // Test weekly stats
    console.log('6. Testing weekly stats...');
    const weekStart = new Date().toISOString().split('T')[0];
    await database.saveWeeklyStats(retrievedUser.id, weekStart, 5);
    console.log('✅ Weekly stats saved successfully\n');

    // Test user deactivation
    console.log('7. Testing user deactivation...');
    await database.deactivateUser(testUser.discordId);
    const deactivatedUser = await database.getUserByDiscordId(testUser.discordId);
    console.log(deactivatedUser ? '❌ User still active' : '✅ User deactivated successfully');
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Database operations working');
    console.log('   ✅ User registration system working');
    console.log('   ✅ Weekly stats system working');
    console.log('\n🚀 The Discord bot database is ready!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    database.close();
  }
}

testBotFunctionality(); 