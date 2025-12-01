const { Pool } = require('pg');

// PostgreSQL database connection
const pool = new Pool({
    host: 'localhost',
    port: 5473,
    database: 'dating_app',
    user: 'postgres',
    password: 'root',
});

async function checkAlexUser() {
    try {
        console.log('Checking for Alex user in database...');
        
        // 查询所有用户
        const result = await pool.query('SELECT * FROM users');
        
        console.log('All users in database:');
        console.table(result.rows);
        
        // 查找包含 alex 的用户
        const alexUsers = result.rows.filter(user => 
            user.email.toLowerCase().includes('alex') || 
            user.name.toLowerCase().includes('alex')
        );
        
        console.log('\nUsers with "alex" in email or name:');
        console.table(alexUsers);
        
        if (alexUsers.length === 0) {
            console.log('\nNo Alex user found in database.');
        }
        
    } catch (error) {
        console.error('Error checking user:', error);
    } finally {
        await pool.end();
    }
}

checkAlexUser();