const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/leetcode_bot',
  ssl: process.env.DATABASE_URL.includes('amazonaws.com') || 
       process.env.DATABASE_URL.includes('heroku.com') ||
       process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addDisplayNameColumn() {
  try {
    console.log('Adding display_name column to users table...');

    // Check if the column already exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'display_name'
    `;
    
    const checkResult = await pgPool.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('display_name column already exists');
      return;
    }

    // Add the display_name column
    const alterQuery = `
      ALTER TABLE users 
      ADD COLUMN display_name TEXT NOT NULL DEFAULT ''
    `;
    
    await pgPool.query(alterQuery);
    console.log('✅ display_name column added successfully');

    // Update existing records to use discord_username as display_name
    const updateQuery = `
      UPDATE users 
      SET display_name = discord_username 
      WHERE display_name = ''
    `;
    
    const updateResult = await pgPool.query(updateQuery);
    console.log(`✅ Updated ${updateResult.rowCount} existing records`);

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pgPool.end();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  addDisplayNameColumn();
}

module.exports = { addDisplayNameColumn }; 