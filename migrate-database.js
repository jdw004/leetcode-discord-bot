const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
require('dotenv').config();

// SQLite connection
const sqliteDb = new sqlite3.Database('./data/users.db');

// PostgreSQL connection
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/leetcode_bot',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateData() {
  try {
    console.log('Starting migration from SQLite to PostgreSQL...');

    // Get all users from SQLite
    const users = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`Found ${users.length} users to migrate`);

    // Get all weekly stats from SQLite
    const weeklyStats = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM weekly_stats', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`Found ${weeklyStats.length} weekly stats to migrate`);

    // Migrate users
    for (const user of users) {
      const query = `
        INSERT INTO users (discord_id, discord_username, display_name, leetcode_username, registered_at, last_updated, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (discord_id) DO NOTHING
      `;
      
      await pgPool.query(query, [
        user.discord_id,
        user.discord_username,
        user.display_name || user.discord_username, // Use discord_username as fallback for display_name
        user.leetcode_username,
        user.registered_at,
        user.last_updated,
        user.is_active || true
      ]);
    }

    console.log('Users migrated successfully');

    // Migrate weekly stats
    for (const stat of weeklyStats) {
      const query = `
        INSERT INTO weekly_stats (user_id, week_start, problems_solved, created_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, week_start) DO NOTHING
      `;
      
      await pgPool.query(query, [
        stat.user_id,
        stat.week_start,
        stat.problems_solved,
        stat.created_at
      ]);
    }

    console.log('Weekly stats migrated successfully');
    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    sqliteDb.close();
    await pgPool.end();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData }; 