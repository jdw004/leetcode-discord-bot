const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('../../config');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = config.DATABASE_PATH;
  }

  async init() {
    // Ensure data directory exists
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          discord_id TEXT UNIQUE NOT NULL,
          discord_username TEXT NOT NULL,
          leetcode_username TEXT UNIQUE NOT NULL,
          registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createWeeklyStatsTable = `
        CREATE TABLE IF NOT EXISTS weekly_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          week_start DATE NOT NULL,
          problems_solved INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          UNIQUE(user_id, week_start)
        )
      `;

      this.db.run(createUsersTable, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
        } else {
          this.db.run(createWeeklyStatsTable, (err) => {
            if (err) {
              console.error('Error creating weekly_stats table:', err);
              reject(err);
            } else {
              console.log('Database tables created successfully');
              resolve();
            }
          });
        }
      });
    });
  }

  async registerUser(discordId, discordUsername, leetcodeUsername) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (discord_id, discord_username, leetcode_username, last_updated)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      this.db.run(query, [discordId, discordUsername, leetcodeUsername], function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            reject(new Error('This LeetCode username is already registered.'));
          } else {
            console.error('Error registering user:', err);
            reject(err);
          }
        } else {
          console.log(`User registered: ${discordUsername} -> ${leetcodeUsername}`);
          resolve({ id: this.lastID });
        }
      });
    });
  }

  async getUserByDiscordId(discordId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE discord_id = ?';
      
      this.db.get(query, [discordId], (err, row) => {
        if (err) {
          console.error('Error getting user:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getUserByLeetcodeUsername(leetcodeUsername) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE leetcode_username = ?';
      
      this.db.get(query, [leetcodeUsername], (err, row) => {
        if (err) {
          console.error('Error getting user by LeetCode username:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getAllActiveUsers() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users ORDER BY registered_at DESC';
      
      this.db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error getting all users:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async updateUserLastUpdated(discordId) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET last_updated = CURRENT_TIMESTAMP WHERE discord_id = ?';
      
      this.db.run(query, [discordId], function(err) {
        if (err) {
          console.error('Error updating user last_updated:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async saveWeeklyStats(userId, weekStart, problemsSolved) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT OR REPLACE INTO weekly_stats (user_id, week_start, problems_solved)
        VALUES (?, ?, ?)
      `;
      
      this.db.run(query, [userId, weekStart, problemsSolved], function(err) {
        if (err) {
          console.error('Error saving weekly stats:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getWeeklyStats(userId, weekStart) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM weekly_stats WHERE user_id = ? AND week_start = ?';
      
      this.db.get(query, [userId, weekStart], (err, row) => {
        if (err) {
          console.error('Error getting weekly stats:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async deleteUser(discordId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM users WHERE discord_id = ?';
      
      this.db.run(query, [discordId], function(err) {
        if (err) {
          console.error('Error deleting user:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = new Database(); 