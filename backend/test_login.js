const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// PostgreSQL database connection
const pool = new Pool({
    host: 'localhost',
    port: 5473,
    database: 'dating_app',
    user: 'postgres',
    password: 'root',
});

async function testAlexLogin() {
    try {
        console.log('Testing Alex login...');
        
        // 获取 alex 用户
        const result = await pool.query('SELECT * FROM users WHERE email = $1', ['alex@example.com']);
        const alexUser = result.rows[0];
        
        if (!alexUser) {
            console.log('Alex user not found.');
            return;
        }
        
        console.log('Found Alex user:', {
            id: alexUser.id,
            email: alexUser.email,
            name: alexUser.name
        });
        
        // 测试密码验证
        const testPasswords = ['password', '123456', 'alex123'];
        
        for (const password of testPasswords) {
            const isValid = await bcrypt.compare(password, alexUser.password_hash);
            console.log(`Password '${password}' is ${isValid ? 'valid' : 'invalid'}`);
        }
        
        // 查看密码哈希
        console.log('Password hash:', alexUser.password_hash);
        
    } catch (error) {
        console.error('Error testing login:', error);
    } finally {
        await pool.end();
    }
}

testAlexLogin();