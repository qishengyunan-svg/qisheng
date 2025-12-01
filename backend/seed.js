const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'dating_app.db');

console.log('Seeding database with initial users...');

// Open the database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the SQLite database.');
});

// Seed data with authentication
const users = [
    {
        email: 'alex@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        name: 'Alex',
        age: 28,
        avatar: 'https://picsum.photos/id/1012/300/300',
        gender: 'male',
        profession: 'UI 设计师',
        height: 180,
        zodiac: '天秤座',
        hometown: '上海',
        relationship_status: 'single',
        bio: '喜欢摄影和旅行，寻找灵魂伴侣。',
        looking_for: '稳定的恋爱关系',
        tags: JSON.stringify(['摄影', '咖啡', '猫奴']),
        photos: JSON.stringify(['https://picsum.photos/id/1012/600/800'])
    },
    {
        email: 'lrx@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        name: '林若溪',
        age: 24,
        avatar: 'https://picsum.photos/id/338/300/300',
        gender: 'female',
        profession: '插画师',
        height: 165,
        zodiac: '双鱼座',
        hometown: '杭州',
        relationship_status: 'single',
        bio: '平时喜欢宅在家里画画，偶尔去美术馆。希望找个懂艺术的男生。',
        looking_for: '结婚对象',
        tags: JSON.stringify(['绘画', '二次元', '美食']),
        photos: JSON.stringify(['https://picsum.photos/id/338/600/800', 'https://picsum.photos/id/342/600/800'])
    },
    {
        email: 'cyh@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        name: '陈宇航',
        age: 29,
        avatar: 'https://picsum.photos/id/91/300/300',
        gender: 'male',
        profession: '金融分析师',
        height: 183,
        zodiac: '摩羯座',
        hometown: '北京',
        relationship_status: 'single',
        bio: '工作狂，但也懂得享受生活。喜欢健身和滑雪。',
        looking_for: '短期约会',
        tags: JSON.stringify(['健身', '投资', '滑雪']),
        photos: JSON.stringify(['https://picsum.photos/id/91/600/800'])
    },
    {
        email: 'sarah@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        name: 'Sarah',
        age: 26,
        avatar: 'https://picsum.photos/id/64/300/300',
        gender: 'female',
        profession: '市场营销',
        height: 170,
        zodiac: '狮子座',
        hometown: '成都',
        relationship_status: 'single',
        bio: '性格开朗，喜欢尝试新鲜事物。周末通常在探店或者Hiking。',
        looking_for: '朋友关系',
        tags: JSON.stringify(['探店', '徒步', '音乐节']),
        photos: JSON.stringify(['https://picsum.photos/id/64/600/800'])
    },
    {
        email: 'kevin@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        name: 'Kevin',
        age: 27,
        avatar: 'https://picsum.photos/id/177/300/300',
        gender: 'male',
        profession: '程序员',
        height: 175,
        zodiac: '水瓶座',
        hometown: '深圳',
        relationship_status: 'single',
        bio: '代码是工作，生活是诗。喜欢科幻电影和精酿啤酒。',
        looking_for: '稳定的恋爱关系',
        tags: JSON.stringify(['编程', '科幻', '啤酒']),
        photos: JSON.stringify(['https://picsum.photos/id/177/600/800'])
    }
];

// Insert all users
const insertStmt = db.prepare(`
    INSERT INTO users
    (email, password_hash, name, age, avatar, gender, profession, height, zodiac, hometown,
     relationship_status, bio, looking_for, tags, photos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

users.forEach(user => {
    insertStmt.run([
        user.email,
        user.password_hash,
        user.name,
        user.age,
        user.avatar,
        user.gender,
        user.profession,
        user.height,
        user.zodiac,
        user.hometown,
        user.relationship_status,
        user.bio,
        user.looking_for,
        user.tags,
        user.photos
    ]);
});

insertStmt.finalize();

console.log(`Seeded database with ${users.length} users.`);

// Close the database
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database seeded successfully.');
        console.log('Database seeded successfully.');
    }
});
