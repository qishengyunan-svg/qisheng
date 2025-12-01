const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT秘密密钥（生产环境中应该放在环境变量中）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// 用户认证相关函数
class AuthService {
    constructor(db) {
        this.db = db;
    }

    // 哈希密码
    async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    // 验证密码
    async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    // 生成JWT令牌
    generateToken(user) {
        return jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    // 验证JWT令牌
    verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    }

    // 用户注册
    async register(userData) {
        const {
            email,
            password,
            name,
            age,
            gender,
            avatar,
            profession,
            height,
            zodiac,
            hometown,
            relationship_status,
            bio,
            looking_for,
            tags,
            photos
        } = userData;

        // 检查邮箱是否已存在
        const existingUser = await this.getUserByEmail(email);
        if (existingUser) {
            throw new Error('邮箱已被注册');
        }

        // 创建新用户
        const hashedPassword = await this.hashPassword(password);

        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO users (email, password_hash, name, age, gender, avatar, profession, height, zodiac, hometown, bio, looking_for, tags, photos)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING id
            `;

        const values = [
            email, 
            hashedPassword, 
            name, 
            age, 
            gender,
            avatar || `https://picsum.photos/id/${Math.floor(Math.random() * 1000) + 100}/300/300`,
            profession || '待完善',
            height || 170,
            zodiac || '未知',
            hometown || '未知',
            bio || '新加入的灵魂伴侣，期待与你相遇！',
            looking_for || '稳定的恋爱关系',
            JSON.stringify(tags || ['新人', '正在完善资料']),
            JSON.stringify(photos || [`https://picsum.photos/id/${Math.floor(Math.random() * 1000) + 100}/600/800`])
        ];

            this.db.query(query, values, (err, result) => {
                if (err) {
                    console.error('Registration error:', err);
                    if (err.code === '23505') {
                        // 处理唯一约束冲突
                        if (err.detail && err.detail.includes('email')) {
                            reject(new Error('邮箱已被注册'));
                        } else {
                            reject(new Error('用户ID冲突，请稍后重试'));
                        }
                    } else {
                        reject(new Error('注册失败'));
                    }
                    return;
                }

                // 获取新创建的用户ID
                const userId = result.rows[0].id;
                resolve({ userId });
            });
        });
    }

    // 用户登录
    async login(email, password) {
        const user = await this.getUserByEmail(email);
        if (!user) {
            throw new Error('邮箱或密码错误');
        }

        const isValidPassword = await this.comparePassword(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('邮箱或密码错误');
        }

        // 生成令牌
        const token = this.generateToken({
            id: user.id,
            email: user.email
        });

        // 返回用户信息（不包含密码）
        const { password_hash, ...userInfo } = user;
        // Convert id to string to match frontend UserProfile type
        return {
            user: {
                ...userInfo,
                id: userInfo.id.toString()
            },
            token
        };
    }

    // 通过邮箱获取用户
    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT * FROM users WHERE email = $1', [email], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    }

    // 通过ID获取用户
    async getUserById(id) {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT id, email, name, age, gender, avatar, profession, height, zodiac, hometown, relationship_status, bio, looking_for, tags, photos, created_at FROM users WHERE id = $1', [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    }
}

module.exports = { AuthService, JWT_SECRET };
