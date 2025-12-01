const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

console.log('Creating "防辐射" user...');

const dbPath = path.join(__dirname, 'dating_app.db');
const db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the SQLite database.');
});

// 创建防辐射用户
const radiationUser = {
    email: 'fangfushe@example.com',
    password_hash: await bcrypt.hash('password', 10), // 直接使用bcrypt生成密码哈希
    name: '防辐射',
    age: 25,
    avatar: 'https://picsum.photos/id/1005/300/300',
    gender: 'male',
    profession: '工程师',
    height: 178,
    zodiac: '双子座',
    hometown: '北京',
    relationship_status: 'single',
    bio: '程序员，喜欢科技和游戏，寻找志同道合的人。',
    looking_for: '稳定的恋爱关系',
    tags: JSON.stringify(['编程', '游戏', '科技', '电影']),
    photos: JSON.stringify(['https://picsum.photos/id/1005/600/800'])
};

// 等待密码哈希完成
Promise.all([bcrypt.hash('password', 10)]).then(([hashedPassword]) => {
    const finalUser = {
        ...radiationUser,
        password_hash: hashedPassword
    };

    console.log('Creating user with data:', {
        ...finalUser,
        password_hash: '[HIDDEN]'
    });

    db.run(`
        INSERT INTO users (
            email, password_hash, name, age, avatar, gender, profession, height, zodiac, hometown,
            relationship_status, bio, looking_for, tags, photos
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        finalUser.email,
        finalUser.password_hash,
        finalUser.name,
        finalUser.age,
        finalUser.avatar,
        finalUser.gender,
        finalUser.profession,
        finalUser.height,
        finalUser.zodiac,
        finalUser.hometown,
        finalUser.relationship_status,
        finalUser.bio,
        finalUser.looking_for,
        finalUser.tags,
        finalUser.photos
    ], function (err) {
        if (err) {
            console.error('Error creating 防辐射 user:', err);
        } else {
            const newUserId = this.lastID;
            console.log(`成功创建防辐射用户，ID: ${newUserId}`);
            console.log('登录信息：', {
                email: 'fangfushe@example.com',
                password: 'password',
                name: '防辐射'
            });
        }
        db.close();
    });
}).catch(console.error);
