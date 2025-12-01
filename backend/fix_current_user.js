const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('Fixing current user issue...');

const dbPath = path.join(__dirname, 'dating_app.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the SQLite database.');
});

// 创建一个默认的李嘉栋用户（模拟注册流程）
const lijiadongUser = {
    name: '李嘉栋',
    age: 28,
    avatar: 'https://picsum.photos/id/1012/300/300',
    gender: 'male',
    profession: '学生',
    height: 172,
    zodiac: '水瓶座',
    hometown: '上海',
    relationship_status: 'single',
    bio: '喜欢摄影和旅行，寻找灵魂伴侣。',
    looking_for: '稳定的恋爱关系',
    tags: JSON.stringify(['摄影', '咖啡', '猫奴']),
    photos: JSON.stringify(['https://picsum.photos/id/1012/600/800'])
};

db.run(`
    INSERT INTO users (
        name, age, avatar, gender, profession, height, zodiac, hometown,
        relationship_status, bio, looking_for, tags, photos
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
    lijiadongUser.name,
    lijiadongUser.age,
    lijiadongUser.avatar,
    lijiadongUser.gender,
    lijiadongUser.profession,
    lijiadongUser.height,
    lijiadongUser.zodiac,
    lijiadongUser.hometown,
    lijiadongUser.relationship_status,
    lijiadongUser.bio,
    lijiadongUser.looking_for,
    lijiadongUser.tags,
    lijiadongUser.photos
], function (err) {
    if (err) {
        console.error('Error creating 李嘉栋 user:', err);
    } else {
        const newUserId = this.lastID;
        console.log(`成功创建李嘉栋用户，ID: ${newUserId}`);

        // 为他创建邮箱和密码（如果要让用户登录）
        console.log('如需让李嘉栋能登录，请注册邮箱: li@example.com 或直接使用演示账号 alex@example.com');
    }
    db.close();
});

console.log('用户创建完成。');
