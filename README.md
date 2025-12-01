# AI 交友网站 (AI Dating App)

一个基于 AI 的现代交友应用，支持智能推荐匹配和实时交互。

## 📋 项目结构

```
dating-app/
├── frontend/                 # React前端
│   ├── src/
│   │   ├── components/      # UI组件
│   │   ├── pages/          # 页面组件
│   │   ├── hooks/          # 自定义hooks
│   │   ├── services/       # API服务
│   │   └── utils/          # 工具函数
│   ├── public/
│   └── package.json
├── backend/                 # Express后端
│   ├── routes/             # API路由
│   ├── models/             # 数据模型
│   ├── controllers/        # 控制器
│   ├── middleware/         # 中间件
│   ├── database/           # 数据库配置
│   └── package.json
└── README.md
```

## 🚀 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Axios** - HTTP 客户端
- **CSS3** - 样式

### 后端
- **Node.js** - 运行环境
- **Express.js** - Web 框架
- **PostgreSQL** - 数据库
- **pg (node-postgres)** - PostgreSQL 客户端

## ⚡ 快速开始

### 数据存储选择: 本地 vs 远程

#### 🏠 **推荐：本地PostgreSQL（开发/演示）**
**适合情况**: 开发、测试、演示项目、学习
**优势**: 无需网络依赖、完全控制、免费、安全
**安装**: https://www.postgresql.org/download/windows/

#### ☁️ **远程PostgreSQL（生产）**
**适合情况**: 生产环境、多人协作、云部署
**选择**: AWS RDS、Railway、Supabase、PlanetScale等服务

### 本地环境准备 (Windows)
1. 安装 Node.js (v18 或更高版本) ->
   访问: https://nodejs.org 下载并安装

2. 安装 PostgreSQL 数据库 ->
   访问: https://www.postgresql.org/download/windows/
   选择 Windows 下载版，安装默认设置

3. **运行自动设置脚本** -> 双击 `setup.bat` 文件

### 数据库设置
1. 创建 PostgreSQL 数据库:
   ```sql
   -- 安装pgAdmin后，在其中运行或使用命令行
   CREATE DATABASE dating_app;
   ```

2. 运行数据库迁移:
   ```bash
   # 使用自动脚本（推荐）
   setup.bat

   # 或手动运行
   psql -d dating_app -f backend/database/schema.sql
   psql -d dating_app -f backend/database/seed.sql
   ```

3. 配置 `.env` 文件:
   ```env
   # 本地数据库配置（推荐）
   # 使用你安装PostgreSQL时设置的端口（通常是5743）
   DB_HOST=localhost
   DB_PORT=5743
   DB_NAME=dating_app
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password

   PORT=3001  # 后端端口（避免与前端冲突）
   ```

### 安装依赖
```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../ai交友网站前端
npm install
```

### 启动服务
```bash
# 启动后端 (端口 3000)
cd backend
npm start

# 启动前端 (端口 3001，通常)
cd ai交友网站前端
npm run dev
```

访问 `http://localhost:3001` 开始使用应用。

## 📊 数据库设计

### 用户表 (users)
- id: 用户ID (自动增长)
- name: 姓名
- age: 年龄
- avatar: 头像URL
- gender: 性别
- profession: 职业
- height: 身高
- zodiac: 星座
- hometown: 家乡
- relationship_status: 关系状态
- bio: 个人简介
- looking_for: 寻找对象
- tags: 兴趣标签 (数组)
- photos: 照片URL (数组)

### 交互表 (interactions)
- id: 交互ID
- from_user_id: 发送用户ID
- to_user_id: 接收用户ID
- type: 交互类型 (LIKE/DISLIKE/SUPER_LIKE)
- timestamp: 时间戳

### 匹配表 (matches)
- id: 匹配ID
- user1_id: 用户1 ID
- user2_id: 用户2 ID
- timestamp: 匹配时间
- last_message: 最后消息

## 🔗 API 接口

### 用户相关
- `GET /api/users/recommendations?currentUserId={id}` - 获取推荐用户
- `POST /api/users/profile` - 更新/创建用户资料
- `GET /api/users/profile/:id` - 获取用户资料

### 交互相关
- `POST /api/interactions` - 记录用户交互
- `GET /api/matches?currentUserId={id}` - 获取匹配列表

## ✨ 功能特性

- 🎯 **智能推荐** - 基于用户偏好的智能匹配算法
- 💬 **实时交互** - 支持喜欢/不喜欢/超级喜欢
- 👫 **智能匹配** - 双向喜欢时自动创建匹配
- 🎨 **现代化界面** - 响应式设计，支持移动端
- 🔒 **数据同步** - API + 本地存储双重保障
- 🌟 **AI 增强** - 集成 AI 推荐功能

## 🔧 开发指南

### 项目架构
- 前后端分离架构
- RESTful API 设计
- TypeScript 类型安全
- 模块化组件设计

### 代码规范
- 使用 ESLint 和 Prettier
- 遵循 React 和 Node.js 最佳实践
- 英文命名，中文注释

## 📝 部署说明

1. 构建前端:
   ```bash
   cd ai交友网站前端
   npm run build
   ```

2. 配置生产环境数据库

3. 部署后端服务:
   ```bash
   cd backend
   npm start
   ```

4. 部署前端静态文件到 CDN 或服务器

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🎯 后续计划

- [ ] 用户认证和安全
- [ ] 实时聊天功能
- [ ] 更多 AI 推荐算法
- [ ] 移动端 App 版本
- [ ] 多语言支持

## 📞 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。

---

⭐ 如果这个项目对你有帮助，请给个 Star！
