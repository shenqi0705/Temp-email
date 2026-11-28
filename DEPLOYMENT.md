# 📚 详细部署指南

本文档提供多种部署方式的完整步骤。

## 📑 目录

1. [本地开发](#本地开发)
2. [使用 Docker](#使用-docker)
3. [云平台部署](#云平台部署)
4. [生产环境配置](#生产环境配置)
5. [常见问题](#常见问题)

---

## 🖥️ 本地开发

### 系统要求

- **Node.js**: >= 16.0.0
- **npm** 或 **yarn**
- **Git**: 用于版本控制

### 安装步骤

#### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/temp-email-server.git
cd temp-email-server
```

#### 2. 安装依赖

```bash
npm install
```

或使用 yarn：

```bash
yarn install
```

#### 3. 配置环境

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件（可选）：

```env
PORT=3000
NODE_ENV=development
DOMAIN=tempmail.local
DATABASE_PATH=./emails.db
```

#### 4. 启动开发服务器

```bash
npm run dev
```

输出应显示：

```
========================================
🚀 Temp Email Server Started
========================================
📡 Server: http://localhost:3000
📧 Domain: tempmail.local
🔧 Environment: development
💾 Database: ./emails.db
========================================
```

#### 5. 访问应用

打开浏览器访问：
```
http://localhost:3000
```

### 开发命令

| 命令 | 功能 |
|------|------|
| `npm run dev` | 启动开发服务器（带热重载） |
| `npm start` | 启动生产服务器 |

---

## 🐳 使用 Docker

### 前置要求

- **Docker**: >= 20.10.0
- **Docker Compose**: >= 1.29.0

### 方式 1：使用 Docker Compose（推荐）

#### 1. 准备 Docker Compose 文件

项目已包含 `docker-compose.yml` 文件，无需额外配置。

#### 2. 启动服务

```bash
docker-compose up -d
```

#### 3. 验证服务

```bash
# 查看日志
docker-compose logs -f

# 检查健康状态
docker-compose ps
```

输出应显示：

```
NAME                      STATUS
temp-email-server         Up 2 minutes (healthy)
```

#### 4. 访问应用

打开浏览器访问：
```
http://localhost:3000
```

#### 5. 停止服务

```bash
docker-compose down
```

#### 6. 清理数据（慎用）

```bash
# 仅停止容器
docker-compose down

# 删除数据卷
docker volume rm temp-email-server_temp-email-data
```

### 方式 2：手动构建 Docker 镜像

#### 1. 构建镜像

```bash
docker build -t temp-email-server:latest .
```

#### 2. 启动容器

```bash
docker run -d \
  --name temp-email-server \
  -p 3000:3000 \
  -e DOMAIN=tempmail.local \
  -e NODE_ENV=production \
  -v temp-email-data:/data \
  temp-email-server:latest
```

#### 3. 验证容器

```bash
docker ps
docker logs temp-email-server
```

#### 4. 访问应用

```
http://localhost:3000
```

#### 5. 停止容器

```bash
docker stop temp-email-server
docker rm temp-email-server
```

### Docker 环境变量

在 `docker-compose.yml` 中修改环境变量：

```yaml
environment:
  PORT: 3000
  DOMAIN: your-domain.com
  NODE_ENV: production
  DATABASE_PATH: /data/emails.db
```

---

## ☁️ 云平台部署

### 1. Heroku 部署

#### 前置要求

- Heroku 账户
- Heroku CLI 已安装

#### 部署步骤

```bash
# 1. 登录 Heroku
heroku login

# 2. 创建新应用
heroku create your-app-name

# 3. 设置环境变量
heroku config:set DOMAIN=your-app-name.herokuapp.com

# 4. 推送代码
git push heroku main

# 5. 查看日志
heroku logs --tail

# 6. 打开应用
heroku open
```

#### 应用 URL

```
https://your-app-name.herokuapp.com
```

---

### 2. Railway 部署

#### 前置要求

- Railway 账户
- GitHub 账户

#### 部署步骤

1. 访问 [railway.app](https://railway.app)
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择 `temp-email-server` 仓库
4. 在 Railway 仪表盘中设置环境变量：
   - `PORT` = `3000`
   - `DOMAIN` = `your-domain.railway.app`
   - `NODE_ENV` = `production`
5. 点击 "Deploy"

#### 应用 URL

```
https://your-domain.railway.app
```

---

### 3. Render 部署

#### 前置要求

- Render 账户
- GitHub 账户

#### 部署步骤

1. 访问 [render.com](https://render.com)
2. 点击 "New+" → "Web Service"
3. 连接 GitHub 仓库
4. 填写以下信息：
   - **Name**: `temp-email-server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. 点击 "Advanced" 添加环境变量：
   - `DOMAIN` = `your-app.onrender.com`
   - `NODE_ENV` = `production`
6. 点击 "Create Web Service"

#### 应用 URL

```
https://your-app.onrender.com
```

---

### 4. DigitalOcean App Platform 部署

#### 前置要求

- DigitalOcean 账户
- GitHub 账户

#### 部署步骤

1. 访问 [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. 点击 "Create App"
3. 选择 GitHub 仓库
4. 选择分支为 `main`
5. DigitalOcean 会自动检测 `package.json`
6. 在 "Environment Variables" 中添加：
   - `DOMAIN` = 你的域名
   - `NODE_ENV` = `production`
7. 点击 "Next" → "Create Resources"
8. 完成部署

---

### 5. AWS Elastic Beanstalk 部署

#### 前置要求

- AWS 账户
- AWS CLI 已安装

#### 部署步骤

```bash
# 1. 安装 Elastic Beanstalk CLI
pip install awsebcli --upgrade --user

# 2. 初始化应用
eb init -p node.js-18 temp-email-server

# 3. 创建环境
eb create production

# 4. 设置环境变量
eb setenv DOMAIN=your-domain.elasticbeanstalk.com NODE_ENV=production

# 5. 部署
eb deploy

# 6. 打开应用
eb open
```

---

## 🔐 生产环境配置

### 1. 环境变量配置

创建 `.env.production` 文件：

```env
PORT=3000
NODE_ENV=production
DOMAIN=your-domain.com
DATABASE_PATH=/data/emails.db
DEFAULT_MAILBOX_EXPIRES_IN=3600
MAX_MAILBOX_EXPIRES_IN=86400
```

### 2. HTTPS 配置

#### 使用 Nginx 反向代理

创建 `/etc/nginx/sites-available/temp-email-server` 文件：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL 证书配置（使用 Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/temp-email-server /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 获取 SSL 证书（Let's Encrypt）

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
```

### 3. 进程管理（PM2）

安装 PM2：

```bash
npm install -g pm2
```

创建 `ecosystem.config.js` 文件：

```javascript
module.exports = {
  apps: [
    {
      name: 'temp-email-server',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DOMAIN: 'your-domain.com'
      },
      max_memory_restart: '500M',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

启动应用：

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. 数据库备份

#### 自动备份脚本

创建 `backup-db.sh` 文件：

```bash
#!/bin/bash

BACKUP_DIR="/backups/temp-email-server"
DB_FILE="./emails.db"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
cp $DB_FILE $BACKUP_DIR/emails_$DATE.db

# 删除 7 天前的备份
find $BACKUP_DIR -name "emails_*.db" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/emails_$DATE.db"
```

设置定时备份（Crontab）：

```bash
# 每天 2:00 AM 执行备份
0 2 * * * /path/to/backup-db.sh
```

### 5. 监控和日志

#### 使用 PM2 监控

```bash
# 查看实时监控
pm2 monit

# 查看日志
pm2 logs temp-email-server

# 查看统计信息
pm2 show temp-email-server
```

#### 配置日志轮换

安装 logrotate：

```bash
# 创建 /etc/logrotate.d/temp-email-server 文件
cat > /etc/logrotate.d/temp-email-server << EOF
/path/to/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 nobody nobody
}
EOF
```

---

## 🆘 常见问题

### Q: 如何修改邮箱域名？

**A**: 修改 `.env` 文件中的 `DOMAIN` 变量，然后重启服务器。

```bash
# 编辑 .env 文件
DOMAIN=mail.example.com

# 重启服务
npm start
```

### Q: 如何从不同的域名访问？

**A**: 在 `.env` 中设置域名，然后在你的 DNS 中配置 A 记录指向服务器 IP。

```
mail.example.com  A  192.168.1.100
```

### Q: 生产环境数据库会丢失吗？

**A**: 数据库存储在 `/data/emails.db`（Docker 中）或项目目录，定期备份可以防止数据丢失。

### Q: 如何处理高并发请求？

**A**: 使用 PM2 的集群模式（已在上方配置中展示），或使用负载均衡器。

### Q: 如何监控服务健康状况？

**A**: 访问 `/health` 端点检查服务状态。

```bash
curl http://your-domain.com/health
```

### Q: 如何扩展 API 功能？

**A**: 修改 `server.js` 文件，添加新的路由处理器。

### Q: 是否支持 SMTP 接收真实邮件？

**A**: 当前版本不支持，可以通过集成第三方 SMTP 服务实现。

---

## 📊 性能优化建议

1. **使用 CDN** 加速静态资源
2. **启用 Gzip 压缩** 减少传输大小
3. **使用 Redis** 缓存热数据
4. **配置数据库索引** 提升查询速度
5. **使用 PM2 集群模式** 充分利用多核 CPU

---

## 🔒 安全检查清单

- [ ] 使用 HTTPS 加密传输
- [ ] 配置防火墙规则
- [ ] 定期更新依赖包
- [ ] 启用 API 认证
- [ ] 定期备份数据库
- [ ] 监控访问日志
- [ ] 配置速率限制
- [ ] 验证用户输入

---

更新时间：2024-11-22
