const database = require('./src/services/database');

async function testUnregister() {
  try {
    console.log('Testing unregister functionality...');
    
    // Initialize database
    await database.init();
    console.log('✅ Database initialized');
    
    // Register a test user
    const testUser = await database.registerUser('123456789', 'testuser', 'Test User', 'testleetcode');
    console.log('✅ User registered for testing');
    
    // Get the user to verify registration
    const user = await database.getUserByDiscordId('123456789');
    console.log('✅ User retrieved:', user.display_name);
    
    // Test unregister (delete user)
    await database.deleteUser('123456789');
    console.log('✅ User deleted successfully');
    
    // Verify user is gone
    const deletedUser = await database.getUserByDiscordId('123456789');
    if (deletedUser === null) {
      console.log('✅ User successfully removed from database');
    } else {
      console.log('❌ User still exists in database');
    }
    
    console.log('🎉 Unregister test completed successfully!');
    
  } catch (error) {
    console.error('❌ Unregister test failed:', error);
  } finally {
    await database.close();
    process.exit(0);
  }
}

testUnregister(); 