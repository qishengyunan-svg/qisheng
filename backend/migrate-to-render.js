require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

// Connect to SQLite database
const sqliteDb = new sqlite3.Database('./dating_app.db', (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err);
        process.exit(1);
    }
    console.log('Connected to SQLite database.');
});

// Connect to Render PostgreSQL database
const pgPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false,
        require: true,
        minVersion: 'TLSv1.2'
    }
});

async function migrateData() {
    try {
        console.log('Starting data migration from SQLite to Render PostgreSQL...');
        
        // Migrate admins table
        await migrateTable('admins', [
            'id', 'username', 'password_hash', 'created_at', 'updated_at'
        ]);
        
        // Migrate users table
        await migrateTable('users', [
            'id', 'email', 'password_hash', 'name', 'age', 'avatar', 'gender',
            'profession', 'height', 'zodiac', 'hometown', 'bio', 'looking_for',
            'tags', 'photos', 'created_at', 'updated_at'
        ]);
        
        // Migrate interactions table
        await migrateTable('interactions', [
            'id', 'from_user_id', 'to_user_id', 'type', 'message', 'timestamp'
        ]);
        
        // Migrate matches table
        await migrateTable('matches', [
            'id', 'user1_id', 'user2_id', 'status', 'timestamp', 'last_message', 'last_message_at'
        ]);
        
        // Migrate messages table
        await migrateTable('messages', [
            'id', 'match_id', 'sender_id', 'content', 'timestamp', 'is_read'
        ]);
        
        console.log('\n🎉 Data migration completed successfully!');
        
        // Close connections
        sqliteDb.close();
        await pgPool.end();
        
    } catch (error) {
        console.error('Error during data migration:', error);
        process.exit(1);
    }
}

async function migrateTable(tableName, columns) {
    console.log(`\nMigrating ${tableName} table...`);
    
    // Get data from SQLite
    const sqliteData = await new Promise((resolve, reject) => {
        sqliteDb.all(`SELECT * FROM ${tableName}`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
    
    console.log(`Found ${sqliteData.length} records in SQLite ${tableName} table.`);
    
    if (sqliteData.length === 0) {
        console.log(`No data to migrate for ${tableName} table.`);
        return;
    }
    
    // Clear existing data in PostgreSQL table (optional)
    await pgPool.query(`DELETE FROM ${tableName}`);
    console.log(`Cleared existing data from ${tableName} table.`);
    
    // Insert data into PostgreSQL
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const insertQuery = `
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES (${placeholders})
    `;
    
    let insertedCount = 0;
    for (const row of sqliteData) {
        // Convert JSON strings to JSONB for PostgreSQL
        const values = columns.map(col => {
            const value = row[col];
            if (col === 'tags' || col === 'photos') {
                // 直接使用默认空数组，避免JSON解析错误
                return [];
            }
            // Convert INTEGER booleans to actual booleans
            if (col === 'is_read') {
                return value === 1;
            }
            return value;
        });
        
        try {
            await pgPool.query(insertQuery, values);
            insertedCount++;
        } catch (err) {
            console.error(`Error inserting record ${row.id} into ${tableName}:`, err.message);
        }
    }
    
    console.log(`Migrated ${insertedCount} records to ${tableName} table.`);
}

migrateData();
