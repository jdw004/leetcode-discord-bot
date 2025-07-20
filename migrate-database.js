const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = './leetcodeBot.db';

async function migrateDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to database for migration');
    });

    // Start transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Create new users table with correct schema
      const createNewUsersTable = `
        CREATE TABLE users_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          discord_id TEXT UNIQUE NOT NULL,
          discord_username TEXT NOT NULL,
          leetcode_username TEXT UNIQUE NOT NULL,
          registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      db.run(createNewUsersTable, function(err) {
        if (err) {
          console.error('Error creating new users table:', err);
          db.run('ROLLBACK');
          db.close();
          reject(err);
          return;
        }
        console.log('Created new users table');

        // Copy data from old table to new table
        const copyData = `
          INSERT INTO users_new (discord_id, leetcode_username, registered_at, last_updated)
          SELECT discord_id, leetcode_username, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          FROM users
        `;

        db.run(copyData, function(err) {
          if (err) {
            console.error('Error copying data:', err);
            db.run('ROLLBACK');
            db.close();
            reject(err);
            return;
          }
          console.log('Copied data from old table');

          // Drop old table
          db.run('DROP TABLE users', function(err) {
            if (err) {
              console.error('Error dropping old table:', err);
              db.run('ROLLBACK');
              db.close();
              reject(err);
              return;
            }
            console.log('Dropped old users table');

            // Rename new table to users
            db.run('ALTER TABLE users_new RENAME TO users', function(err) {
              if (err) {
                console.error('Error renaming table:', err);
                db.run('ROLLBACK');
                db.close();
                reject(err);
                return;
              }
              console.log('Renamed new table to users');

              // Create weekly_stats table
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

              db.run(createWeeklyStatsTable, function(err) {
                if (err) {
                  console.error('Error creating weekly_stats table:', err);
                  db.run('ROLLBACK');
                  db.close();
                  reject(err);
                  return;
                }
                console.log('Created weekly_stats table');

                // Commit transaction
                db.run('COMMIT', function(err) {
                  if (err) {
                    console.error('Error committing transaction:', err);
                    db.close();
                    reject(err);
                  } else {
                    console.log('✅ Database migration completed successfully!');
                    db.close((closeErr) => {
                      if (closeErr) {
                        console.error('Error closing database:', closeErr);
                      } else {
                        console.log('Database connection closed');
                      }
                      resolve();
                    });
                  }
                });
              });
            });
          });
        });
      });
    });
  });
}

// Run migration
migrateDatabase()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 