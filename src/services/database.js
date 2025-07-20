const { Pool } = require('pg');
const config = require('../../config');

class Database {
  constructor() {
    this.pool = null;
  }

  async init() {
    try {
      // Determine if we're connecting to a remote database (like Heroku)
      const isRemoteDatabase = config.DATABASE_URL.includes('amazonaws.com') || 
                              config.DATABASE_URL.includes('heroku.com') ||
                              process.env.NODE_ENV === 'production';
      
      this.pool = new Pool({
        connectionString: config.DATABASE_URL,
        ssl: isRemoteDatabase ? { rejectUnauthorized: false } : false
      });

      // Test the connection
      const client = await this.pool.connect();
      console.log('Connected to PostgreSQL database');
      client.release();

      await this.createTables();
    } catch (err) {
      console.error('Error connecting to database:', err);
      throw err;
    }
  }

  async createTables() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        discord_id TEXT UNIQUE NOT NULL,
        discord_username TEXT NOT NULL,
        display_name TEXT NOT NULL,
        leetcode_username TEXT UNIQUE NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `;

    const createWeeklyStatsTable = `
      CREATE TABLE IF NOT EXISTS weekly_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        week_start DATE NOT NULL,
        problems_solved INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, week_start)
      )
    `;

    try {
      await this.pool.query(createUsersTable);
      await this.pool.query(createWeeklyStatsTable);
      console.log('Database tables created successfully');
    } catch (err) {
      console.error('Error creating tables:', err);
      throw err;
    }
  }

  async registerUser(discordId, discordUsername, displayName, leetcodeUsername) {
    try {
      const query = `
        INSERT INTO users (discord_id, discord_username, display_name, leetcode_username, last_updated)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      
      const result = await this.pool.query(query, [discordId, discordUsername, displayName, leetcodeUsername]);
      console.log(`User registered: ${displayName} (${leetcodeUsername})`);
      return { id: result.rows[0].id };
    } catch (err) {
      if (err.code === '23505') { // Unique constraint violation
        throw new Error('This LeetCode username is already registered.');
      }
      console.error('Error registering user:', err);
      throw err;
    }
  }

  async getUserByDiscordId(discordId) {
    try {
      const query = 'SELECT * FROM users WHERE discord_id = $1';
      const result = await this.pool.query(query, [discordId]);
      return result.rows[0] || null;
    } catch (err) {
      console.error('Error getting user:', err);
      throw err;
    }
  }

  async getUserByLeetcodeUsername(leetcodeUsername) {
    try {
      const query = 'SELECT * FROM users WHERE leetcode_username = $1';
      const result = await this.pool.query(query, [leetcodeUsername]);
      return result.rows[0] || null;
    } catch (err) {
      console.error('Error getting user by LeetCode username:', err);
      throw err;
    }
  }

  async getAllActiveUsers() {
    try {
      const query = 'SELECT * FROM users WHERE is_active = TRUE ORDER BY registered_at DESC';
      const result = await this.pool.query(query);
      return result.rows;
    } catch (err) {
      console.error('Error getting all users:', err);
      throw err;
    }
  }

  async updateUserLastUpdated(discordId) {
    try {
      const query = 'UPDATE users SET last_updated = CURRENT_TIMESTAMP WHERE discord_id = $1';
      await this.pool.query(query, [discordId]);
    } catch (err) {
      console.error('Error updating user last_updated:', err);
      throw err;
    }
  }

  async saveWeeklyStats(userId, weekStart, problemsSolved) {
    try {
      const query = `
        INSERT INTO weekly_stats (user_id, week_start, problems_solved)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, week_start) 
        DO UPDATE SET problems_solved = $3, created_at = CURRENT_TIMESTAMP
      `;
      
      await this.pool.query(query, [userId, weekStart, problemsSolved]);
    } catch (err) {
      console.error('Error saving weekly stats:', err);
      throw err;
    }
  }

  async getWeeklyStats(userId, weekStart) {
    try {
      const query = 'SELECT * FROM weekly_stats WHERE user_id = $1 AND week_start = $2';
      const result = await this.pool.query(query, [userId, weekStart]);
      return result.rows[0] || null;
    } catch (err) {
      console.error('Error getting weekly stats:', err);
      throw err;
    }
  }

  async deleteUser(discordId) {
    try {
      const query = 'DELETE FROM users WHERE discord_id = $1';
      await this.pool.query(query, [discordId]);
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('Database connection closed');
    }
  }
}

module.exports = new Database(); 