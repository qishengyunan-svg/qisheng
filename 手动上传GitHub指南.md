# 手动上传代码到GitHub指南

由于系统中没有安装git命令行工具，您可以通过以下两种方式将代码上传到GitHub仓库：

## 方式一：GitHub网页端手动上传

### 1. 创建GitHub仓库

1. 访问 [GitHub官网](https://github.com/)
2. 登录您的GitHub账号
3. 点击右上角的 "+" 按钮，选择 "New repository"
4. 填写仓库信息：
   - **Repository name**: `dating-app`
   - **Description**: AI交友网站项目
   - **Visibility**: 选择 "Public" 或 "Private"
   - 不要勾选 "Add a README file"、"Add .gitignore" 或 "Choose a license"
5. 点击 "Create repository"

### 2. 上传项目文件

1. 在仓库创建成功后，您会看到一个空白仓库页面
2. 点击 "Upload files" 按钮
3. 点击 "Choose your files" 或直接拖拽整个 `dating-app` 文件夹到浏览器中
4. 等待文件上传完成（根据文件大小可能需要几分钟）
5. 在页面底部填写 "Commit changes" 信息：
   - **Commit message**: 输入 "Initial commit"
   - **Description**: 可选，输入项目描述
6. 点击 "Commit changes"

## 方式二：使用GitHub Desktop客户端

### 1. 下载并安装GitHub Desktop

1. 访问 [GitHub Desktop官网](https://desktop.github.com/)
2. 下载适合您系统的版本
3. 安装并登录GitHub账号

### 2. 上传项目

1. 打开GitHub Desktop
2. 点击 "File" → "Add Local Repository"
3. 点击 "Choose..." 按钮，选择 `e:\program\ai交友网站demo\dating-app` 文件夹
4. 点击 "Add Repository"
5. 在左侧选择您的项目
6. 填写 "Summary" 为 "Initial commit"
7. 点击 "Commit to main"
8. 点击 "Publish repository"
9. 在弹出的对话框中：
   - 选择 "Public" 或 "Private"
   - 点击 "Publish Repository"

## 方式三：安装Git并使用命令行

如果您希望使用命令行上传，可以重新尝试安装Git：

### 1. 手动下载Git安装包

1. 访问 [Git官网下载页面](https://git-scm.com/downloads)
2. 下载适合Windows系统的Git安装包
3. 双击安装包，按照默认选项完成安装
4. 安装完成后，重新打开命令行窗口

### 2. 使用Git命令上传代码

```bash
# 进入项目目录
cd e:\program\ai交友网站demo\dating-app

# 初始化Git仓库（如果尚未初始化）
git init

# 配置Git用户信息
git config --global user.name "Your GitHub Username"
git config --global user.email "your-email@example.com"

# 添加所有文件到暂存区
git add .

# 提交代码
git commit -m "Initial commit"

# 添加远程仓库（替换为您的GitHub仓库URL）
git remote add origin https://github.com/your-username/dating-app.git

# 推送代码到GitHub
git push -u origin main
```

## 验证上传结果

无论使用哪种方式，上传完成后，您可以：

1. 访问您的GitHub仓库页面
2. 检查文件是否完整上传
3. 确认项目结构正确

## 后续操作

上传完成后，您可以按照之前的部署指南，继续在Render平台部署您的应用。

如果您在上传过程中遇到问题，可以参考：
- [GitHub官方文档](https://docs.github.com/)
- [GitHub Desktop使用指南](https://docs.github.com/en/desktop/getting-started-with-github-desktop)

祝您上传顺利！