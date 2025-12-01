const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库迁移脚本 - 添加认证字段
const dbPath = path.join(__dirname, 'dating_app.db');

console.log('Migrating database to add authentication fields...');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the SQLite database for migration.');
});

// 重新创建完整的数据库结构
const migrationSQL = `
-- 重新创建用户表，包含认证字段
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS interactions;
DROP TABLE IF EXISTS matches;

-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password_hash TEXT,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  avatar TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  profession TEXT,
  height INTEGER,
  zodiac TEXT,
  hometown TEXT,
  relationship_status TEXT DEFAULT 'single' CHECK (relationship_status IN ('single', 'divorced', 'complicated')),
  bio TEXT,
  looking_for TEXT,
  tags TEXT, -- JSON string for array
  photos TEXT, -- JSON string for array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Interactions table
CREATE TABLE interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user_id INTEGER NOT NULL,
  to_user_id INTEGER NOT NULL,
  type TEXT CHECK (type IN ('LIKE', 'DISLIKE', 'SUPER_LIKE')),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(from_user_id, to_user_id)
);

-- Matches table
CREATE TABLE matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_message TEXT,
  UNIQUE(user1_id, user2_id)
);
`;

db.exec(migrationSQL, (err) => {
    if (err) {
        console.error('Migration error:', err.message);
        db.close();
        return;
    }
    console.log('成功重新创建数据库结构。');

    // 迁移完成后关闭数据库
    db.close((err) => {
        if (err) {
            console.error('关闭数据库时出错:', err.message);
        } else {
            console.log('数据库迁移完成。新结构已就绪，可以运行种子脚本。');
        }
    });
});
