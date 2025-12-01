require('dotenv').config();
const { Pool } = require('pg');

// Connect to PostgreSQL (default to postgres database)
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5473,
    database: 'postgres', // Connect to default database first
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    ssl: false
});

async function createDatabase() {
    try {
        console.log('Connecting to PostgreSQL...');
        
        // Check if database exists
        const dbName = process.env.DB_NAME || 'dating_app';
        const res = await pool.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );
        
        if (res.rows.length === 0) {
            console.log(`Creating database ${dbName}...`);
            await pool.query(`CREATE DATABASE ${dbName}`);
            console.log(`Database ${dbName} created successfully.`);
        } else {
            console.log(`Database ${dbName} already exists.`);
        }
        
        // Close connection to default database
        await pool.end();
        
        // Connect to the dating_app database
        const appPool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5473,
            database: dbName,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'root',
            ssl: false
        });
        
        console.log('Creating tables...');
        
        // Create tables
        const createTablesQueries = [
            // Admins table
            `CREATE TABLE IF NOT EXISTS admins (
              id SERIAL PRIMARY KEY,
              username TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Users table
            `CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              email TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              name TEXT NOT NULL,
              age INTEGER NOT NULL,
              avatar TEXT,
              gender TEXT CHECK (gender IN ('male', 'female', 'other')),
              profession TEXT,
              height INTEGER,
              zodiac TEXT,
              hometown TEXT,
              bio TEXT,
              looking_for TEXT,
              tags JSONB DEFAULT '[]',
              photos JSONB DEFAULT '[]',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Interactions table
            `CREATE TABLE IF NOT EXISTS interactions (
              id SERIAL PRIMARY KEY,
              from_user_id INTEGER NOT NULL,
              to_user_id INTEGER NOT NULL,
              type TEXT CHECK (type IN ('LIKE', 'DISLIKE', 'SUPER_LIKE')),
              message TEXT,
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(from_user_id, to_user_id)
            )`,
            
            // Matches table
            `CREATE TABLE IF NOT EXISTS matches (
              id SERIAL PRIMARY KEY,
              user1_id INTEGER NOT NULL,
              user2_id INTEGER NOT NULL,
              status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              last_message TEXT,
              last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(user1_id, user2_id)
            )`,
            
            // Messages table for chat
            `CREATE TABLE IF NOT EXISTS messages (
              id SERIAL PRIMARY KEY,
              match_id INTEGER NOT NULL,
              sender_id INTEGER NOT NULL,
              content TEXT NOT NULL,
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              is_read BOOLEAN DEFAULT false
            )`
        ];
        
        // Execute all table creation queries
        for (const query of createTablesQueries) {
            await appPool.query(query);
        }
        
        console.log('Tables created successfully.');
        
        // Create initial admin user if not exists
        console.log('Creating initial admin user...');
        const bcrypt = require('bcryptjs');
        const saltRounds = 10;
        const adminUsername = 'admin';
        const adminPassword = 'admin123';
        
        const adminRes = await appPool.query(
            `SELECT * FROM admins WHERE username = $1`,
            [adminUsername]
        );
        
        if (adminRes.rows.length === 0) {
            const hash = await bcrypt.hash(adminPassword, saltRounds);
            await appPool.query(
                `INSERT INTO admins (username, password_hash) VALUES ($1, $2)`,
                [adminUsername, hash]
            );
            console.log(`Initial admin user created successfully.`);
            console.log(`Username: ${adminUsername}`);
            console.log(`Password: ${adminPassword}`);
        } else {
            console.log(`Admin user already exists.`);
        }
        
        // Close connection
        await appPool.end();
        
        console.log('Database setup completed successfully!');
        
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

createDatabase();
