const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'icgwb.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    db.run('PRAGMA foreign_keys = ON;');
  }
});

// Helper for promise-based queries
db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// Auto-initialize database tables and seed data if not present
db.serialize(() => {
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
    if (err) {
      console.error('Error checking database tables:', err.message);
    } else if (!row) {
      console.log('⚡ Database tables not found. Auto-seeding initial ICGWB dataset...');
      try {
        const seedDatabase = require('../seed');
        seedDatabase()
          .then(() => console.log('✅ Auto-seeding completed successfully!'))
          .catch(sErr => console.error('Auto-seeding failed:', sErr.message));
      } catch (sErr) {
        console.error('Auto-seeding import error:', sErr.message);
      }
    }
  });
});

module.exports = db;
