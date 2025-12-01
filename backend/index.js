require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { AuthService, JWT_SECRET } = require('./auth');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// PostgreSQL database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432, // 使用默认PostgreSQL端口
    database: process.env.DB_NAME || 'dating_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    family: 4, // 使用IPv4连接
    connectionTimeoutMillis: 15000, // 增加连接超时时间
    // 根据环境自动配置SSL
    ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1' ? {
        rejectUnauthorized: false, // 开发环境可以使用false，生产环境建议使用true
        require: true, // 强制使用SSL
        minVersion: 'TLSv1.2' // 使用兼容的TLS版本
    } : false
});

// Test database connection
pool.connect((err) => {
    if (err) {
        console.error('Error connecting to PostgreSQL database:');
        console.error('Error details:', err);
        console.error('Connection parameters:');
        console.error('  Host:', process.env.DB_HOST || 'localhost');
        console.error('  Port:', process.env.DB_PORT || 5432);
        console.error('  Database:', process.env.DB_NAME || 'dating_app');
        console.error('  User:', process.env.DB_USER || 'postgres');
        console.error('Database connection failed. Server will continue running but some features may be limited.');
        // 不退出进程，继续运行服务器
    } else {
        console.log('Connected to the PostgreSQL database.');
        initializeDatabase();
    }
});

// Initialize tables
async function initializeDatabase() {
    try {
        console.log('Initializing database tables...');
        
        // Create tables using PostgreSQL syntax
        const statements = [
            // Admins table
            `CREATE TABLE IF NOT EXISTS admins (
              id SERIAL PRIMARY KEY,
              username TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Users table
            `CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              email TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              name TEXT NOT NULL,
              age INTEGER NOT NULL,
              avatar TEXT,
              gender TEXT CHECK (gender IN ('male', 'female', 'other')),
              profession TEXT,
              height INTEGER,
              zodiac TEXT,
              hometown TEXT,
              bio TEXT,
              looking_for TEXT,
              tags JSONB DEFAULT '[]',
              photos JSONB DEFAULT '[]',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Interactions table
            `CREATE TABLE IF NOT EXISTS interactions (
              id SERIAL PRIMARY KEY,
              from_user_id INTEGER NOT NULL,
              to_user_id INTEGER NOT NULL,
              type TEXT CHECK (type IN ('LIKE', 'DISLIKE', 'SUPER_LIKE')),
              message TEXT,
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(from_user_id, to_user_id)
            )`,
            
            // Matches table
            `CREATE TABLE IF NOT EXISTS matches (
              id SERIAL PRIMARY KEY,
              user1_id INTEGER NOT NULL,
              user2_id INTEGER NOT NULL,
              status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              last_message TEXT,
              last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(user1_id, user2_id)
            )`,
            
            // Messages table for chat
            `CREATE TABLE IF NOT EXISTS messages (
              id SERIAL PRIMARY KEY,
              match_id INTEGER NOT NULL,
              sender_id INTEGER NOT NULL,
              content TEXT NOT NULL,
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              is_read BOOLEAN DEFAULT false
            )`
        ];

        // Execute each statement sequentially
        for (const statement of statements) {
            await pool.query(statement);
        }
        
        console.log('Database tables initialized.');
        
        // Create initial admin user if not exists
        await createInitialAdmin();
        
    } catch (error) {
        console.error('Error initializing database:', error.message);
    }
}

// Create initial admin user if not exists
async function createInitialAdmin() {
    try {
        const bcrypt = require('bcryptjs');
        const saltRounds = 10;
        const adminUsername = 'admin';
        const adminPassword = 'admin123';
        
        // Check if admin user already exists
        const checkResult = await pool.query(
            'SELECT * FROM admins WHERE username = $1',
            [adminUsername]
        );
        
        if (checkResult.rows.length === 0) {
            // Hash password and create admin user
            const hash = await bcrypt.hash(adminPassword, saltRounds);
            
            await pool.query(
                'INSERT INTO admins (username, password_hash) VALUES ($1, $2)',
                [adminUsername, hash]
            );
            
            console.log('Initial admin user created successfully.');
            console.log(`Username: ${adminUsername}`);
            console.log(`Password: ${adminPassword}`);
        } else {
            console.log('Admin user already exists.');
        }
    } catch (error) {
        console.error('Error creating admin user:', error.message);
    }
}

const app = express();
const PORT = 3001;

// Initialize auth service
const authService = new AuthService(pool);

// Middleware
app.use(cors());
// Increase request body size limit to 20MB for file uploads
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Middleware to verify JWT token for users
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: '需要身份验证令牌' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Convert userId to number for database comparisons
        const userId = parseInt(decoded.userId);
        if (isNaN(userId)) {
            return res.status(401).json({ error: '无效的身份验证令牌' });
        }
        req.userId = userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: '无效的身份验证令牌' });
    }
};

// Middleware to verify JWT token for admins
const verifyAdminToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: '需要管理员身份验证令牌' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Check if token is for admin
        if (!decoded.adminId) {
            return res.status(403).json({ error: '没有管理员权限' });
        }
        req.adminId = decoded.adminId;
        req.username = decoded.username;
        next();
    } catch (error) {
        return res.status(401).json({ error: '无效的管理员身份验证令牌' });
    }
};

// File upload middleware
const uploadFile = (req, res, next) => {
    // Simple file upload handling for demo purposes
    // In production, you would use a proper middleware like multer
    if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
        // For demo, we'll just return a mock URL
        // In a real app, you would parse the multipart form data here
        next();
    } else {
        next();
    }
};

// --- Auth API --- //

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('Register request body:', req.body);
        const { email, password, name, age, gender } = req.body;

        if (!email || !password || !name || !age || !gender) {
            return res.status(400).json({ error: '所有字段都是必填的' });
        }

        // 注册用户并创建一个带有完整资料的用户记录
        const result = await authService.register({
            email,
            password,
            name,
            age,
            gender,
            avatar: `https://picsum.photos/id/${Math.floor(Math.random() * 1000) + 100}/300/300`,
            profession: '待完善',
            height: 170,
            zodiac: '未知',
            hometown: '未知',
            relationship_status: 'single',
            bio: '新加入的灵魂伴侣，期待与你相遇！',
            looking_for: '稳定的恋爱关系',
            tags: ['新人', '正在完善资料'],
            photos: [`https://picsum.photos/id/${Math.floor(Math.random() * 1000) + 100}/600/800`]
        });

        res.status(201).json({
            userId: result.userId,
            message: '注册成功！欢迎来到 SoulMatch AI！您的个人资料已自动生成，请在设置中完善详细信息。'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: error.message });
    }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: '邮箱和密码都是必填的' });
        }

        const result = await authService.login(email, password);
        res.json(result);
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ error: error.message });
    }
});

// Admin Routes

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码都是必填的' });
        }
        
        const bcrypt = require('bcryptjs');
        
        // Find admin by username
        pool.query('SELECT * FROM admins WHERE username = $1', [username], (err, result) => {
            if (err) {
                console.error('Error finding admin:', err);
                return res.status(500).json({ error: '服务器错误' });
            }
            
            const admin = result.rows[0];
            if (!admin) {
                return res.status(401).json({ error: '用户名或密码错误' });
            }
            
            // Compare passwords
            bcrypt.compare(password, admin.password_hash, (err, result) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).json({ error: '服务器错误' });
                }
                
                if (!result) {
                    return res.status(401).json({ error: '用户名或密码错误' });
                }
                
                // Generate JWT token
                const jwt = require('jsonwebtoken');
                const token = jwt.sign(
                    { adminId: admin.id, username: admin.username },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );
                
                res.json({
                    token,
                    admin: {
                        id: admin.id,
                        username: admin.username
                    }
                });
            });
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// Routes

// GET /api/users/recommendations?currentUserId=xxx
app.get('/api/users/recommendations', (req, res) => {
    const { currentUserId } = req.query;
    if (!currentUserId) {
        return res.status(400).json({ error: 'currentUserId is required' });
    }

    try {
        // Get all users except current user and users already interacted with
        const query = `
      SELECT u.* FROM users u
      WHERE u.id != $1
      AND u.id NOT IN (
        SELECT DISTINCT
          CASE
            WHEN i.from_user_id = $1 THEN i.to_user_id
            WHEN i.to_user_id = $1 THEN i.from_user_id
          END
        FROM interactions i
        WHERE i.from_user_id = $1 OR i.to_user_id = $1
      )
      ORDER BY RANDOM()
      LIMIT 10
    `;

        pool.query(query, [currentUserId], (err, result) => {
            if (err) {
                console.error('Error fetching recommendations:', err);
                return res.status(500).json({ error: 'Failed to fetch recommendations' });
            }

            const users = result.rows.map(user => {
                // Parse JSONB fields from strings to JavaScript arrays
                const tags = typeof user.tags === 'string' ? JSON.parse(user.tags) : user.tags;
                const photos = typeof user.photos === 'string' ? JSON.parse(user.photos) : user.photos;
                
                return {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.name,
                    age: user.age,
                    avatar: user.avatar,
                    gender: user.gender,
                    profession: user.profession,
                    height: user.height,
                    zodiac: user.zodiac,
                    hometown: user.hometown,
                    bio: user.bio,
                    looking_for: user.looking_for,
                    tags: tags || [],
                    photos: photos || [],
                    createdAt: user.created_at,
                    updatedAt: user.updated_at
                };
            });

            res.json(users);
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// POST /api/interactions - Record user interaction with optional message
app.post('/api/interactions', verifyToken, async (req, res) => {
    const { toUserId, type, message } = req.body;
    const fromUserId = req.userId; // Use authenticated user ID

    if (!toUserId) {
        return res.status(400).json({ error: '目标用户ID是必需的' });
    }

    if (!type) {
        return res.status(400).json({ error: '交互类型是必需的' });
    }

    try {
        // Convert IDs to numbers for SQL queries
        const fromIdNum = parseInt(fromUserId);
        const toIdNum = parseInt(toUserId);

        // Check if IDs are valid numbers
        if (isNaN(fromIdNum)) {
            return res.status(400).json({ error: '无效的发送者ID' });
        }
        
        if (isNaN(toIdNum)) {
            return res.status(400).json({ error: '无效的目标用户ID' });
        }

        // Validate interaction type
        const validTypes = ['LIKE', 'DISLIKE', 'SUPER_LIKE'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: '无效的交互类型，必须是LIKE、DISLIKE或SUPER_LIKE' });
        }

        // Insert or update the interaction
        const interactionQuery = `
      INSERT INTO interactions (from_user_id, to_user_id, type, message, timestamp) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (from_user_id, to_user_id) DO UPDATE SET
        type = EXCLUDED.type,
        message = EXCLUDED.message,
        timestamp = CURRENT_TIMESTAMP
      RETURNING *
    `;

        const interactionResult = await pool.query(interactionQuery, [fromIdNum, toIdNum, type, message]);
        const interaction = interactionResult.rows[0];

        let isMatch = false;

        // Check for match: if the other person liked us
        if (type === 'LIKE' || type === 'SUPER_LIKE') {
            const matchCheckQuery = `
            SELECT 1 FROM interactions
            WHERE from_user_id = $1 AND to_user_id = $2 AND type IN ('LIKE', 'SUPER_LIKE')
          `;

            const matchCheckResult = await pool.query(matchCheckQuery, [toIdNum, fromIdNum]);
            
            const minId = Math.min(fromIdNum, toIdNum);
            const maxId = Math.max(fromIdNum, toIdNum);
            
            if (matchCheckResult.rows.length > 0) {
                // It's a match! Update match status to accepted
                isMatch = true;
                const matchInsertQuery = `
                  INSERT INTO matches (user1_id, user2_id, status, last_message) VALUES ($1, $2, 'accepted', 'It''s a match! Say hello.')
                  ON CONFLICT (user1_id, user2_id) DO UPDATE SET
                    status = 'accepted',
                    last_message = 'It''s a match! Say hello.',
                    timestamp = CURRENT_TIMESTAMP
                `;
                await pool.query(matchInsertQuery, [minId, maxId]);
            } else {
                // Create a pending match request
                const matchInsertQuery = `
                  INSERT INTO matches (user1_id, user2_id, status, last_message) VALUES ($1, $2, 'pending', $3)
                  ON CONFLICT (user1_id, user2_id) DO UPDATE SET
                    status = 'pending',
                    last_message = $3,
                    timestamp = CURRENT_TIMESTAMP
                `;
                await pool.query(matchInsertQuery, [minId, maxId, message || 'Someone liked you!']);
            }
        }

        res.json({ isMatch, interaction });
    } catch (error) {
        console.error('Error recording interaction:', error);
        // Return more detailed error message in development mode
        if (process.env.NODE_ENV === 'development') {
            return res.status(500).json({ 
                error: '记录交互失败',
                details: error.message 
            });
        }
        return res.status(500).json({ error: '记录交互失败' });
    }
});

// PUT /api/interactions/:interactionId/message - Update interaction message
app.put('/api/interactions/:interactionId/message', verifyToken, async (req, res) => {
    const { interactionId } = req.params;
    const { message } = req.body;
    const userId = req.userId;
    
    if (!message) {
        return res.status(400).json({ error: 'Message content is required' });
    }
    
    try {
        // Convert interactionId to number
        const numericInteractionId = parseInt(interactionId);
        if (isNaN(numericInteractionId)) {
            return res.status(400).json({ error: 'Invalid interaction ID' });
        }
        
        // Check if interaction exists and belongs to the user
        const checkQuery = `
      SELECT * FROM interactions WHERE id = $1 AND from_user_id = $2
    `;
        const checkResult = await pool.query(checkQuery, [numericInteractionId, userId]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Interaction not found or user not authorized' });
        }
        
        // Update the message
        const updateQuery = `
      UPDATE interactions SET message = $1, timestamp = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *
    `;
        const updateResult = await pool.query(updateQuery, [message, numericInteractionId]);
        
        res.json({ interaction: updateResult.rows[0] });
    } catch (error) {
        console.error('Error updating interaction message:', error);
        res.status(500).json({ error: 'Failed to update interaction message' });
    }
});

// DELETE /api/interactions/:interactionId - Delete interaction
app.delete('/api/interactions/:interactionId', verifyToken, async (req, res) => {
    const { interactionId } = req.params;
    const userId = req.userId;
    
    try {
        // Convert interactionId to number
        const numericInteractionId = parseInt(interactionId);
        if (isNaN(numericInteractionId)) {
            return res.status(400).json({ error: 'Invalid interaction ID' });
        }
        
        // Check if interaction exists and belongs to the user
        const checkQuery = `
      SELECT * FROM interactions WHERE id = $1 AND from_user_id = $2
    `;
        const checkResult = await pool.query(checkQuery, [numericInteractionId, userId]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Interaction not found or user not authorized' });
        }
        
        // Delete the interaction
        const deleteQuery = `
      DELETE FROM interactions WHERE id = $1 RETURNING *
    `;
        const deleteResult = await pool.query(deleteQuery, [numericInteractionId]);
        
        res.json({ interaction: deleteResult.rows[0] });
    } catch (error) {
        console.error('Error deleting interaction:', error);
        res.status(500).json({ error: 'Failed to delete interaction' });
    }
});

// GET /api/matches?currentUserId=xxx
app.get('/api/matches', (req, res) => {
    const { currentUserId } = req.query;
    if (!currentUserId) {
        return res.status(400).json({ error: 'currentUserId is required' });
    }

    try {
        const query = `
      SELECT m.*,
             u1.name as user1_name, u1.avatar as user1_avatar,
             u2.name as user2_name, u2.avatar as user2_avatar,
             -- Get interaction type and message from the other user
             i.type as interaction_type,
             i.message as interaction_message
      FROM matches m
      JOIN users u1 ON m.user1_id = u1.id
      JOIN users u2 ON m.user2_id = u2.id
      LEFT JOIN interactions i ON 
          (i.from_user_id = u1.id AND i.to_user_id = u2.id AND m.user1_id = $1) OR
          (i.from_user_id = u2.id AND i.to_user_id = u1.id AND m.user2_id = $1)
      WHERE m.user1_id = $1 OR m.user2_id = $1
      ORDER BY m.timestamp DESC
    `;

        pool.query(query, [currentUserId], (err, result) => {
            if (err) {
                console.error('Error fetching matches:', err);
                return res.status(500).json({ error: 'Failed to fetch matches' });
            }

            const matches = result.rows.map(row => ({
                id: row.id.toString(),
                users: [row.user1_id.toString(), row.user2_id.toString()],
                status: row.status,
                timestamp: new Date(row.timestamp).getTime(),
                lastMessage: row.last_message,
                interactionType: row.interaction_type,
                interactionMessage: row.interaction_message,
                // Add partner info (the other user)
                partner: {
                    id: row.user1_id == currentUserId ? row.user2_id.toString() : row.user1_id.toString(),
                    name: row.user1_id == currentUserId ? row.user2_name : row.user1_name,
                    avatar: row.user1_id == currentUserId ? row.user2_avatar : row.user1_avatar
                }
            }));

            res.json(matches);
        });
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});

// PUT /api/matches/:matchId/status - Update match status (accept/reject)
app.put('/api/matches/:matchId/status', verifyToken, (req, res) => {
    const { matchId } = req.params;
    const { status } = req.body;
    const userId = req.userId;
    // Convert matchId to number for database comparisons
    const numericMatchId = parseInt(matchId);

    if (!status || !['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be either "accepted" or "rejected"' });
    }

    try {
        // Check if the match exists and the user is part of it
        const checkQuery = `
      SELECT * FROM matches 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `;

        pool.query(checkQuery, [numericMatchId, userId], (err, result) => {
            if (err) {
                console.error('Error checking match:', err);
                return res.status(500).json({ error: 'Failed to update match status' });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Match not found or user not part of this match' });
            }

            // Update match status
            const updateQuery = `
          UPDATE matches 
          SET status = $1, 
              timestamp = CURRENT_TIMESTAMP
          WHERE id = $2
        `;

            pool.query(updateQuery, [status, numericMatchId], (err) => {
                if (err) {
                    console.error('Error updating match status:', err);
                    return res.status(500).json({ error: 'Failed to update match status' });
                }

                // If accepted, update last message
                if (status === 'accepted') {
                    const updateMessageQuery = `
              UPDATE matches 
              SET last_message = 'It''s a match! Say hello.',
                  last_message_at = CURRENT_TIMESTAMP
              WHERE id = $1
            `;
                    pool.query(updateMessageQuery, [numericMatchId]);
                }

                res.json({ success: true, status });
            });
        });
    } catch (error) {
        console.error('Error updating match status:', error);
        res.status(500).json({ error: 'Failed to update match status' });
    }
});

// GET /api/matches/:matchId/interaction - Get interaction details for a match
app.get('/api/matches/:matchId/interaction', verifyToken, (req, res) => {
    const { matchId } = req.params;
    const userId = req.userId;

    try {
        // Get match details and interaction information
        const query = `
      SELECT 
          m.*,
          u1.name as user1_name, u1.avatar as user1_avatar,
          u2.name as user2_name, u2.avatar as user2_avatar,
          i.type as interaction_type,
          i.message as interaction_message,
          i.timestamp as interaction_timestamp
      FROM matches m
      JOIN users u1 ON m.user1_id = u1.id
      JOIN users u2 ON m.user2_id = u2.id
      JOIN interactions i ON 
          (i.from_user_id = u1.id AND i.to_user_id = u2.id) OR
          (i.from_user_id = u2.id AND i.to_user_id = u1.id)
      WHERE m.id = $1 AND (m.user1_id = $2 OR m.user2_id = $2)
    `;

        pool.query(query, [matchId, userId], (err, result) => {
            if (err) {
                console.error('Error fetching interaction details:', err);
                return res.status(500).json({ error: 'Failed to fetch interaction details' });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Match not found or user not part of this match' });
            }

            const row = result.rows[0];
            const interaction = {
                id: row.id.toString(),
                matchId: row.id.toString(),
                users: [row.user1_id.toString(), row.user2_id.toString()],
                status: row.status,
                timestamp: new Date(row.timestamp).getTime(),
                interactionType: row.interaction_type,
                interactionMessage: row.interaction_message,
                interactionTimestamp: new Date(row.interaction_timestamp).getTime(),
                partner: {
                    id: row.user1_id == userId ? row.user2_id.toString() : row.user1_id.toString(),
                    name: row.user1_id == userId ? row.user2_name : row.user1_name,
                    avatar: row.user1_id == userId ? row.user2_avatar : row.user1_avatar
                }
            };

            res.json(interaction);
        });
    } catch (error) {
        console.error('Error fetching interaction details:', error);
        res.status(500).json({ error: 'Failed to fetch interaction details' });
    }
});

// --- Chat API --- //

// GET /api/matches/:matchId/messages - Get messages for a match
app.get('/api/matches/:matchId/messages', verifyToken, (req, res) => {
    const { matchId } = req.params;
    const userId = req.userId;
    // Convert matchId to number for database comparisons
    const numericMatchId = parseInt(matchId);

    try {
        // Check if user is part of the match
        const checkMatchQuery = `
      SELECT * FROM matches 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `;

        pool.query(checkMatchQuery, [numericMatchId, userId], (err, result) => {
            if (err) {
                console.error('Error checking match:', err);
                return res.status(500).json({ error: 'Failed to fetch messages' });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Match not found or user not part of this match' });
            }

            // Get messages for this match (limit to last 50 messages)
            const getMessagesQuery = `
          SELECT 
              id, 
              match_id, 
              sender_id, 
              content, 
              timestamp, 
              is_read
          FROM messages 
          WHERE match_id = $1 
          ORDER BY timestamp DESC
          LIMIT 50
          OFFSET 0
        `;

            pool.query(getMessagesQuery, [numericMatchId], (err, messagesResult) => {
                if (err) {
                    console.error('Error fetching messages:', err);
                    return res.status(500).json({ error: 'Failed to fetch messages' });
                }

                // Sort messages by timestamp ascending before returning
                const messages = messagesResult.rows.map(msg => ({
                    id: msg.id.toString(),
                    matchId: msg.match_id.toString(),
                    senderId: msg.sender_id.toString(),
                    content: msg.content,
                    timestamp: new Date(msg.timestamp).getTime(),
                    isRead: msg.is_read
                })).sort((a, b) => a.timestamp - b.timestamp);

                res.json(messages);
            });
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST /api/matches/:matchId/messages - Send a message
app.post('/api/matches/:matchId/messages', verifyToken, (req, res) => {
    const { matchId } = req.params;
    const { content } = req.body;
    const userId = req.userId;
    // Convert matchId to number for database comparisons
    const numericMatchId = parseInt(matchId);

    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Message content is required' });
    }

    try {
        // Check if user is part of the match
        const checkMatchQuery = `
      SELECT * FROM matches 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `;

        pool.query(checkMatchQuery, [numericMatchId, userId], (err, result) => {
            if (err) {
                console.error('Error checking match:', err);
                return res.status(500).json({ error: 'Failed to send message' });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Match not found or user not part of this match' });
            }

            // Insert message
            const insertMessageQuery = `
          INSERT INTO messages (match_id, sender_id, content)
          VALUES ($1, $2, $3)
          RETURNING id, match_id, sender_id, content, timestamp, is_read
        `;

            pool.query(insertMessageQuery, [numericMatchId, userId, content.trim()], (err, msgResult) => {
                if (err) {
                    console.error('Error inserting message:', err);
                    return res.status(500).json({ error: 'Failed to send message' });
                }

                const newMsg = msgResult.rows[0];

                // Update match's last message
                const updateMatchQuery = `
              UPDATE matches 
              SET last_message = $1,
                  last_message_at = CURRENT_TIMESTAMP
              WHERE id = $2
            `;

                pool.query(updateMatchQuery, [content.trim(), numericMatchId]);

                const message = {
                    id: newMsg.id.toString(),
                    matchId: newMsg.match_id.toString(),
                    senderId: newMsg.sender_id.toString(),
                    content: newMsg.content,
                    timestamp: new Date(newMsg.timestamp).getTime(),
                    isRead: newMsg.is_read
                };

                res.json(message);
            });
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// PUT /api/messages/:messageId/read - Mark message as read
app.put('/api/messages/:messageId/read', verifyToken, (req, res) => {
    const { messageId } = req.params;
    const userId = req.userId;
    // Convert messageId to number for database comparisons
    const numericMessageId = parseInt(messageId);

    try {
        // Check if message exists and is for this user
        const checkMessageQuery = `
      SELECT m.* FROM messages msg
      JOIN matches m ON msg.match_id = m.id
      WHERE msg.id = $1 AND (m.user1_id = $2 OR m.user2_id = $2)
    `;

        pool.query(checkMessageQuery, [numericMessageId, userId], (err, result) => {
            if (err) {
                console.error('Error checking message:', err);
                return res.status(500).json({ error: 'Failed to mark message as read' });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Message not found or user not part of this match' });
            }

            // Mark message as read
            const updateMessageQuery = `
          UPDATE messages 
          SET is_read = true
          WHERE id = $1
        `;

            pool.query(updateMessageQuery, [numericMessageId], (err) => {
                if (err) {
                    console.error('Error marking message as read:', err);
                    return res.status(500).json({ error: 'Failed to mark message as read' });
                }

                res.json({ success: true });
            });
        });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ error: 'Failed to mark message as read' });
    }
});

// --- User API --- //

// GET /api/users/current - Get current user profile
app.get('/api/users/current', verifyToken, (req, res) => {
    const userId = req.userId;

    try {
        const query = `
      SELECT * FROM users WHERE id = $1
    `;

        pool.query(query, [userId], (err, result) => {
            if (err) {
                console.error('Error fetching current user:', err);
                return res.status(500).json({ error: 'Failed to fetch current user' });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = result.rows[0];
            // Parse JSONB fields from strings to JavaScript arrays
            const tags = typeof user.tags === 'string' ? JSON.parse(user.tags) : user.tags;
            const photos = typeof user.photos === 'string' ? JSON.parse(user.photos) : user.photos;
            
            res.json({
                id: user.id.toString(),
                email: user.email,
                name: user.name,
                age: user.age,
                avatar: user.avatar,
                gender: user.gender,
                profession: user.profession,
                height: user.height,
                zodiac: user.zodiac,
                hometown: user.hometown,
                bio: user.bio,
                looking_for: user.looking_for,
                tags: tags || [],
                photos: photos || [],
                createdAt: user.created_at,
                updatedAt: user.updated_at
            });
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: 'Failed to fetch current user' });
    }
});

// POST /api/users/profile - Update current user profile
app.post('/api/users/profile', verifyToken, (req, res) => {
    const userId = req.userId;
    const userData = req.body;

    try {
        const query = `
      UPDATE users SET
        name = $1,
        age = $2,
        avatar = $3,
        gender = $4,
        profession = $5,
        height = $6,
        zodiac = $7,
        hometown = $8,
        bio = $9,
        looking_for = $10,
        tags = $11,
        photos = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
    `;

        const values = [
            userData.name,
            userData.age,
            userData.avatar,
            userData.gender,
            userData.profession,
            userData.height,
            userData.zodiac,
            userData.hometown,
            userData.bio,
            userData.lookingFor,
            Array.isArray(userData.tags) ? userData.tags : [], // 确保tags是数组
            Array.isArray(userData.photos) ? userData.photos : [], // 确保photos是数组
            userId // Use userId from token, not from request body
        ];

        console.log('Updating user profile for user:', userId);

        pool.query(query, values, (err) => {
            if (err) {
                console.error('Error updating user profile:', err);
                return res.status(500).json({ error: 'Failed to update user profile' });
            }

            // Return updated user profile
            const getUserQuery = `
        SELECT * FROM users WHERE id = $1
      `;

            pool.query(getUserQuery, [userId], (err, result) => {
                if (err) {
                    console.error('Error fetching updated user profile:', err);
                    return res.status(500).json({ error: 'Failed to update user profile' });
                }

                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }

                const user = result.rows[0];
                res.json({
                    id: user.id.toString(),
                    email: user.email,
                    name: user.name,
                    age: user.age,
                    avatar: user.avatar,
                    gender: user.gender,
                    profession: user.profession,
                    height: user.height,
                    zodiac: user.zodiac,
                    hometown: user.hometown,
                    bio: user.bio,
                    looking_for: user.looking_for,
                    tags: user.tags || [],
                    photos: user.photos || [],
                    createdAt: user.created_at,
                    updatedAt: user.updated_at
                });
            });
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
});

// GET /api/users/activity - Get user activity stats
app.get('/api/users/activity', verifyToken, (req, res) => {
    const userId = req.userId;

    try {
        // For demo, return mock activity data
        const mockData = [
            { name: 'Mon', views: Math.floor(Math.random() * 100) },
            { name: 'Tue', views: Math.floor(Math.random() * 100) },
            { name: 'Wed', views: Math.floor(Math.random() * 100) },
            { name: 'Thu', views: Math.floor(Math.random() * 100) },
            { name: 'Fri', views: Math.floor(Math.random() * 100) },
            { name: 'Sat', views: Math.floor(Math.random() * 100) },
            { name: 'Sun', views: Math.floor(Math.random() * 100) }
        ];

        res.json(mockData);
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ error: 'Failed to get user activity' });
    }
});

// POST /api/users/avatar - Upload user avatar
app.post('/api/users/avatar', verifyToken, (req, res) => {
    const userId = req.userId;
    const { avatarData, filename } = req.body;

    try {
        if (!avatarData) {
            return res.status(400).json({ error: 'Avatar data is required' });
        }

        // Extract Base64 data
        const base64Data = avatarData.replace(/^data:image\/[^;]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique filename
        const fileExtension = filename?.split('.').pop() || 'jpg';
        const uniqueFilename = `avatar_${userId}_${Date.now()}.${fileExtension}`;
        const filePath = path.join(uploadsDir, uniqueFilename);
        
        // Save file to uploads directory
        fs.writeFile(filePath, buffer, (err) => {
            if (err) {
                console.error('Error saving avatar file:', err);
                return res.status(500).json({ error: 'Failed to save avatar file' });
            }
            
            // Generate avatar URL
            const avatarUrl = `http://localhost:3001/uploads/${uniqueFilename}`;
            
            // Update user's avatar in database
            const query = `
          UPDATE users SET avatar = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
        `;

            pool.query(query, [avatarUrl, userId], (err) => {
                if (err) {
                    console.error('Error updating avatar:', err);
                    return res.status(500).json({ error: 'Failed to update avatar' });
                }

                // Return updated user profile
                const getUserQuery = `
            SELECT * FROM users WHERE id = $1
          `;

                pool.query(getUserQuery, [userId], (err, result) => {
                    if (err) {
                        console.error('Error fetching updated user:', err);
                        return res.status(500).json({ error: 'Failed to get updated user' });
                    }

                    if (result.rows.length === 0) {
                        return res.status(404).json({ error: 'User not found' });
                    }

                    const user = result.rows[0];
                    const updatedUser = {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.name,
                        age: user.age,
                        avatar: user.avatar,
                        gender: user.gender,
                        profession: user.profession,
                        height: user.height,
                        zodiac: user.zodiac,
                        hometown: user.hometown,
                        bio: user.bio,
                        looking_for: user.looking_for,
                        tags: user.tags || [],
                        photos: user.photos || [],
                        createdAt: user.created_at,
                        updatedAt: user.updated_at
                    };

                    res.json({ user: updatedUser, avatar: user.avatar });
                });
            });
        });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// --- Admin API --- //

// GET /api/admin/users - Get all users
app.get('/api/admin/users', verifyAdminToken, (req, res) => {
    try {
        const query = `
      SELECT * FROM users 
      ORDER BY created_at DESC
    `;

        pool.query(query, [], (err, result) => {
            if (err) {
                console.error('Error fetching users:', err);
                return res.status(500).json({ error: 'Failed to fetch users' });
            }

            const users = result.rows.map(user => ({
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender,
                profession: user.profession,
                avatar: user.avatar,
                createdAt: user.created_at,
                updatedAt: user.updated_at
            }));

            res.json({ users });
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET /api/admin/users/search - Search users
app.get('/api/admin/users/search', verifyAdminToken, (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const searchQuery = `
      SELECT * FROM users 
      WHERE name ILIKE $1 OR email ILIKE $1 OR id::text ILIKE $1
      ORDER BY created_at DESC
    `;

        pool.query(searchQuery, [`%${query}%`], (err, result) => {
            if (err) {
                console.error('Error searching users:', err);
                return res.status(500).json({ error: 'Failed to search users' });
            }

            const users = result.rows.map(user => ({
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender,
                profession: user.profession,
                avatar: user.avatar,
                createdAt: user.created_at,
                updatedAt: user.updated_at
            }));

            res.json({ users });
        });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
});

// GET /api/admin/users/:id - Get user details
app.get('/api/admin/users/:id', verifyAdminToken, (req, res) => {
    try {
        const { id } = req.params;
        const numericId = parseInt(id);

        if (isNaN(numericId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const query = `
      SELECT * FROM users 
      WHERE id = $1
    `;

        pool.query(query, [numericId], (err, result) => {
            if (err) {
                console.error('Error fetching user details:', err);
                return res.status(500).json({ error: 'Failed to fetch user details' });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = result.rows[0];
            // Generate full URLs for avatar and photos
            const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
            const avatarUrl = user.avatar && !user.avatar.startsWith('http') ? `${baseUrl}${user.avatar}` : user.avatar;
            
            // Parse JSONB fields from strings to JavaScript arrays
            const tagsArray = typeof user.tags === 'string' ? JSON.parse(user.tags) : user.tags;
            const photosArray = typeof user.photos === 'string' ? JSON.parse(user.photos) : user.photos;
            
            // Process photos URLs
            const photosUrls = Array.isArray(photosArray) ? photosArray.map(photo => 
                photo && !photo.startsWith('http') ? `${baseUrl}${photo}` : photo
            ) : [];
            
            const userDetails = {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender,
                profession: user.profession,
                height: user.height,
                zodiac: user.zodiac,
                hometown: user.hometown,
                bio: user.bio,
                lookingFor: user.looking_for,
                tags: Array.isArray(tagsArray) ? tagsArray : [],
                photos: photosUrls,
                avatar: avatarUrl,
                createdAt: user.created_at,
                updatedAt: user.updated_at
            };

            res.json(userDetails);
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
});

// Serve admin static files
app.use('/admin', express.static('./public/admin'));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    pool.end((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection pool closed.');
        process.exit(0);
    });
});
