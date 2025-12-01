#!/bin/bash

echo "🚀 AI Dating App 完整后端设置指南"
echo "=================================="

# 检查PostgreSQL
echo "📋 步骤1: 检查PostgreSQL是否安装"
echo "请在新的终端窗口中运行: pg_isready -h localhost -p 5432"
echo "如果返回错误，请安装PostgreSQL:"
echo "1. 下载: https://www.postgresql.org/download/windows/"
echo "2. 安装PostgreSQL 15+, 并记住postgres用户密码"
echo ""
read -p "按Enter键继续，当PostgreSQL安装就绪..."

# 创建数据库
echo ""
echo "📋 步骤2: 创建数据库"
echo "在PostgreSQL中运行 (推荐使用pgAdmin):"
echo "CREATE DATABASE dating_app;"
echo ""
echo "或者在命令行:"
echo "createdb dating_app"
echo ""
read -p "确认数据库创建完毕后，按Enter键继续..."

# 设置表结构
echo ""
echo "📋 步骤3: 设置数据库表结构"
echo "运行数据库迁移:"
psql -h localhost -d dating_app -f backend/database/schema.sql
if [ $? -ne 0 ]; then
    echo "❌ 迁移失败！请检查上一步是否正确完成"
    exit 1
fi
echo "✅ 数据库表结构设置完成"

# 插入测试数据
echo ""
echo "📋 步骤4: 插入测试数据"
psql -h localhost -d dating_app -f backend/database/seed.sql
if [ $? -ne 0 ]; then
    echo "❌ 测试数据插入失败！"
    exit 1
fi
echo "✅ 测试数据插入完成"

# 测试API
echo ""
echo "📋 步骤5: 测试API连接"
echo "后端应该在端口3001运行..."
echo ""
echo "测试API接口:"
echo "curl http://localhost:3001/api/users/recommendations?currentUserId=1"
echo ""
echo "或者在浏览器中打开:"
echo "http://localhost:3001/api/users/recommendations?currentUserId=1"
echo ""
read -p "确认后端已启动并返回数据，按Enter键继续..."

# 切换前端API模式
echo ""
echo "📋 步骤6: 切换前端到API模式"
echo "编辑 ai交友网站前端/services/db.ts 文件:"
echo "1. 更改 API_BASE_URL 为 'http://localhost:3001/api'"
echo "2. 取消注释 getRecommendations, recordInteraction, getMatches 函数中的API调用代码"
echo "3. 注释掉本地fallback代码"
echo ""

echo "🎉 设置完成！"
echo "现在访问 http://localhost:3000/ 可以体验完整功能！"
