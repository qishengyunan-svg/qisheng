const { Pool } = require('pg');
require('dotenv').config();

// 创建连接池
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function modifyDatabase() {
    try {
        console.log('正在修改数据库表结构...');
        
        // 移除users表中的relationship_status字段
        const query = 'ALTER TABLE users DROP COLUMN IF EXISTS relationship_status;';
        await pool.query(query);
        console.log('成功移除relationship_status字段！');
        
        // 关闭连接
        await pool.end();
        console.log('连接已关闭。');
        
    } catch (error) {
        console.error('错误:', error.message);
        await pool.end();
    }
}

modifyDatabase();