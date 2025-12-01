@echo off
echo 🚀 AI Dating App 后端设置脚本
echo ================================

REM 设置UTF-8编码
chcp 65001 >nul

REM 切换到脚本所在目录
cd /d "%~dp0"
echo 当前目录: %cd%

REM 检查是否在正确的dating-app目录
if not exist "backend\database\schema.sql" (
    echo ❌ 请确保从dating-app文件夹运行此脚本
    echo.
    echo 正确的运行方式:
    echo 1. 打开文件资源管理器
    echo 2. 导航到dating-app文件夹
    echo 3. 双击setup.bat文件
    echo.
    echo 当前目录: %cd%
    echo 需要的文件: backend\database\schema.sql
    pause
    exit /b 1
)
echo ✅ 目录检查通过

REM 检查PostgreSQL路径
echo 正在查找PostgreSQL...
set "PSQL_PATH="
if exist "E:\postgresql\bin\psql.exe" set "PSQL_PATH=E:\postgresql\bin"
if exist "C:\Program Files\PostgreSQL\18\bin\psql.exe" set "PSQL_PATH=C:\Program Files\PostgreSQL\18\bin"
if exist "C:\Program Files\PostgreSQL\17\bin\psql.exe" set "PSQL_PATH=C:\Program Files\PostgreSQL\17\bin"

if defined PSQL_PATH (
    echo ✅ 找到PostgreSQL: %PSQL_PATH%
    set "PATH=%PSQL_PATH%;%PATH%"
) else (
    echo ❌ 找不到PostgreSQL
    echo 请检查PostgreSQL是否安装在标准位置
    echo 或确保PATH环境变量包含psql.exe
    pause
    exit /b 1
)

REM 检查管理员权限
echo 正在检查权限...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ 以管理员身份运行
) else (
    echo ⚠️ 建议以管理员身份运行
    echo 按任意键继续...
    pause >nul
)

echo.
echo 📋 步骤1: 设置数据库表结构
echo 正在执行 schema.sql...
if exist "backend\database\schema.sql" (
    psql -h localhost -p 5473 -d dating_app -U postgres -f backend\database\schema.sql
    if %errorlevel% equ 0 (
        echo ✅ 表结构创建成功
    ) else (
        echo ❌ 表结构创建失败
        echo 请检查：
        echo - PostgreSQL服务是否运行
        echo - 数据库dating_app是否存在
        echo - 端口5473是否正确
        echo - 用户名和密码是否正确
        pause
        exit /b 1
    )
) else (
    echo ❌ 找不到schema.sql文件
    echo 请确保从dating-app目录运行脚本
    pause
    exit /b 1
)

echo.
echo 📋 步骤2: 插入测试数据
echo 正在执行 seed.sql...
if exist "backend\database\seed.sql" (
    psql -h localhost -p 5473 -d dating_app -U postgres -f backend\database\seed.sql
    if %errorlevel% equ 0 (
        echo ✅ 测试数据插入成功
    ) else (
        echo ❌ 测试数据插入失败
        pause
        exit /b 1
    )
) else (
    echo ❌ 找不到seed.sql文件
    pause
    exit /b 1
)

echo.
echo 🎉 设置完成！
echo.
echo 下一步操作：
echo 1. 启动后端服务器: cd backend && npm start
echo 2. 在浏览器访问: http://localhost:3000
echo.
echo 如果遇到问题，请查看README.md文件

pause
