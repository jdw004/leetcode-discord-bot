const database = require('./src/services/database');

async function addUserToDatabase() {
  console.log('👤 Adding user to database...');
  console.log('================================\n');

  try {
    // Initialize database
    console.log('1. Initializing database...');
    await database.init();
    console.log('✅ Database initialized successfully\n');

    // User information
    const user = {
      discordId: '316686551113269249',
      discordUsername: 'jdw_',
      leetcodeUsername: 'jdw004'
    };

    console.log('2. Adding user to database...');
    console.log(`   Discord ID: ${user.discordId}`);
    console.log(`   Discord Username: ${user.discordUsername}`);
    console.log(`   LeetCode Username: ${user.leetcodeUsername}\n`);

    // Check if user already exists
    const existingUser = await database.getUserByDiscordId(user.discordId);
    if (existingUser) {
      console.log('⚠️  User already exists in database:');
      console.log(`   - Discord: ${existingUser.discord_username}`);
      console.log(`   - LeetCode: ${existingUser.leetcode_username}`);
      console.log(`   - Registered: ${existingUser.registered_at}`);
      console.log('\n✅ User is already registered!');
    } else {
      // Register the user
      await database.registerUser(
        user.discordId,
        user.discordUsername,
        user.leetcodeUsername
      );
      console.log('✅ User registered successfully!\n');
    }

    // Show all users in database
    console.log('3. Current users in database:');
    const allUsers = await database.getAllActiveUsers();
    if (allUsers.length === 0) {
      console.log('   No users found');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.discord_username} (${user.leetcode_username})`);
        console.log(`      Discord ID: ${user.discord_id}`);
        console.log(`      Registered: ${user.registered_at}`);
        console.log('');
      });
    }

    console.log('🎉 Database operation completed successfully!');

  } catch (error) {
    console.error('❌ Error adding user to database:', error);
  } finally {
    database.close();
  }
}

addUserToDatabase(); 