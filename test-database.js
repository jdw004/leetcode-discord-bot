const database = require('./src/services/database');

async function testDatabase() {
  try {
    console.log('Testing PostgreSQL connection...');
    
    // Initialize database
    await database.init();
    console.log('✅ Database initialized successfully');
    
    // Test user registration
    const testUser = await database.registerUser('123456789', 'testuser', 'Test User', 'testleetcode');
    console.log('✅ User registration test passed');
    
    // Test getting user
    const user = await database.getUserByDiscordId('123456789');
    console.log('✅ User retrieval test passed');
    
    // Test weekly stats
    await database.saveWeeklyStats(testUser.id, '2024-01-01', 5);
    console.log('✅ Weekly stats test passed');
    
    // Clean up test data
    await database.deleteUser('123456789');
    console.log('✅ Cleanup test passed');
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await database.close();
    process.exit(0);
  }
}

testDatabase(); 