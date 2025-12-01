const { Pool } = require('pg');
require('dotenv').config();

// 创建连接池
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres' // 连接到默认数据库
});

async function testConnection() {
    try {
        console.log('正在测试PostgreSQL连接...');
        
        // 测试连接
        const client = await pool.connect();
        console.log('成功连接到PostgreSQL！');
        
        // 断开所有连接到dating_app的会话
        console.log('正在断开所有连接到dating_app的会话...');
        await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'dating_app' AND pid <> pg_backend_pid();
        `);
        
        // 删除dating_app数据库（如果存在）
        console.log('正在删除dating_app数据库...');
        await client.query('DROP DATABASE IF EXISTS dating_app');
        console.log('dating_app数据库删除成功！');
        
        // 创建dating_app数据库
        console.log('正在创建dating_app数据库...');
        await client.query('CREATE DATABASE dating_app WITH ENCODING = \'UTF8\'');
        console.log('dating_app数据库创建成功！');
        
        // 关闭连接
        client.release();
        await pool.end();
        console.log('连接已关闭。');
        
    } catch (error) {
        console.error('错误:', error.message);
        await pool.end();
    }
}

testConnection();