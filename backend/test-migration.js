require('dotenv').config();
const { Pool } = require('pg');

// Connect to PostgreSQL database
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5473,
    database: process.env.DB_NAME || 'dating_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    ssl: false
});

async function testMigration() {
    try {
        console.log('Testing data migration...');
        
        // Test admins table
        console.log('\n1. Testing admins table:');
        const adminsResult = await pool.query('SELECT * FROM admins');
        console.log(`Found ${adminsResult.rows.length} admin(s):`);
        adminsResult.rows.forEach(admin => {
            console.log(`   - ID: ${admin.id}, Username: ${admin.username}`);
        });
        
        // Test users table
        console.log('\n2. Testing users table:');
        const usersResult = await pool.query('SELECT * FROM users');
        console.log(`Found ${usersResult.rows.length} user(s):`);
        usersResult.rows.forEach(user => {
            console.log(`   - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
        });
        
        // Test interactions table
        console.log('\n3. Testing interactions table:');
        const interactionsResult = await pool.query('SELECT * FROM interactions');
        console.log(`Found ${interactionsResult.rows.length} interaction(s):`);
        interactionsResult.rows.forEach(interaction => {
            console.log(`   - ID: ${interaction.id}, From: ${interaction.from_user_id}, To: ${interaction.to_user_id}, Type: ${interaction.type}`);
        });
        
        // Test matches table
        console.log('\n4. Testing matches table:');
        const matchesResult = await pool.query('SELECT * FROM matches');
        console.log(`Found ${matchesResult.rows.length} match(es):`);
        matchesResult.rows.forEach(match => {
            console.log(`   - ID: ${match.id}, User1: ${match.user1_id}, User2: ${match.user2_id}, Status: ${match.status}`);
        });
        
        // Test messages table
        console.log('\n5. Testing messages table:');
        const messagesResult = await pool.query('SELECT * FROM messages');
        console.log(`Found ${messagesResult.rows.length} message(s):`);
        messagesResult.rows.forEach(message => {
            console.log(`   - ID: ${message.id}, Match: ${message.match_id}, Sender: ${message.sender_id}, Content: ${message.content.substring(0, 20)}...`);
        });
        
        console.log('\n✅ Data migration test completed successfully!');
        
        // Close connection
        await pool.end();
        
    } catch (error) {
        console.error('Error during migration test:', error.message);
        process.exit(1);
    }
}

testMigration();
