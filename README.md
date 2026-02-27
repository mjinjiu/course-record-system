# 课时记录系统

基于 Web 的个人课程打卡与记录管理系统，支持 CRUD、数据统计、CSV 导出。

## 技术栈

- **前端**：Next.js 16 + React + Tailwind CSS v4
- **后端**：Next.js API Routes
- **数据库**：SQLite + Prisma ORM
- **部署**：Docker + GitHub Actions CI/CD

## 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/<your-username>/course-record-system.git
cd course-record-system

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，修改 ADMIN_PASSWORD 和 AUTH_SECRET

# 4. 初始化数据库
npx prisma db push

# 5. 启动开发服务器
npm run dev
```

访问 http://localhost:3000，默认密码 `admin123`。

## Docker 部署

```bash
# 构建镜像
docker build -t course-record-system .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -v course-data:/app/data \
  -e ADMIN_PASSWORD="你的密码" \
  -e AUTH_SECRET="你的密钥" \
  -e DATABASE_URL="file:/app/data/prod.db" \
  course-record-system
```

首次启动后需执行数据库迁移：

```bash
docker exec <container-id> npx prisma db push
```

## GitHub Actions CI/CD

推送到 `main` 分支时自动：

1. ✅ 安装依赖 + 构建验证
2. 🐳 构建 Docker 镜像并推送至 GitHub Container Registry (`ghcr.io`)

拉取最新镜像：

```bash
docker pull ghcr.io/<your-username>/course-record-system:latest
```

## 功能

- 🔐 简单密码登录（环境变量配置）
- 📝 课程记录 CRUD（学生姓名自动补全）
- 📅 月历视图 + 每日课程详情
- 📊 按学生/课程维度统计
- 📤 CSV 导出（中文 Excel 兼容）
- 📱 响应式设计（PC + 手机）

## License

MIT
