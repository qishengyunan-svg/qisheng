const sqlite3 = require('sqlite3').verbose();
const { AuthService } = require('./auth');

// 创建数据库连接
const db = new sqlite3.Database('./dating_app.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

// 创建AuthService实例
const authService = new AuthService(db);

// 测试账号数据
const testUsers = [
    { email: 'test1@example.com', password: 'password', name: '测试用户1', age: 22, gender: 'male' },
    { email: 'test2@example.com', password: 'password', name: '测试用户2', age: 25, gender: 'female' },
    { email: 'test3@example.com', password: 'password', name: '测试用户3', age: 28, gender: 'male' },
    { email: 'test4@example.com', password: 'password', name: '测试用户4', age: 24, gender: 'female' },
    { email: 'test5@example.com', password: 'password', name: '测试用户5', age: 26, gender: 'male' }
];

// 创建测试账号
async function createTestUsers() {
    try {
        console.log('开始创建测试账号...');
        
        for (const user of testUsers) {
            try {
                const result = await authService.register(user);
                console.log(`成功创建账号: ${user.email}, 用户ID: ${result.userId}`);
            } catch (error) {
                console.error(`创建账号失败 ${user.email}:`, error.message);
            }
        }
        
        console.log('所有测试账号创建完成！');
    } catch (error) {
        console.error('创建测试账号时发生错误:', error.message);
    } finally {
        // 关闭数据库连接
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            }
            console.log('Database connection closed.');
            process.exit(0);
        });
    }
}

// 执行创建测试账号函数
createTestUsers();
