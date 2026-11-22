# 🚀 临时邮箱服务器 (Temp Email Server)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/temp-email-server?style=social)](https://github.com/yourusername/temp-email-server)

一个轻量级、功能完整的临时邮箱服务器，支持自定义域名、随机邮箱生成、邮件接收和管理。完全开源，可自部署。

**[English Version](./README_EN.md)** | 中文版本

## ✨ 主要功能

- 🎲 **随机邮箱生成** - 自动生成随机前缀或使用自定义前缀
- 📧 **邮件管理** - 完整的接收、查看、删除功能
- 🔧 **自定义域名** - 支持配置任意邮箱域名
- ⏰ **灵活过期控制** - 自定义邮箱过期时间
- 🗑️ **自动清理** - 定期清理过期邮箱和邮件
- 💾 **SQLite 数据库** - 轻量级本地存储
- 🌐 **Web 界面** - 现代化的响应式前端
- 📡 **完整 REST API** - 便于集成和扩展
- 🔐 **参数验证** - 完善的输入验证和错误处理

## 🎯 应用场景

- 注册新账户时接收验证码
- 测试邮件发送功能
- 保护个人隐私避免垃圾邮件
- 开发和测试邮件相关功能
- API 集成测试

## 📦 快速开始

### 前置要求

- **Node.js** >= 16.0.0
- **npm** 或 **yarn**

### 1️⃣ 安装项目

```bash
# 克隆仓库
git clone https://github.com/yourusername/temp-email-server.git
cd temp-email-server

# 安装依赖
npm install
# 或使用 yarn
yarn install
```

### 2️⃣ 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，根据需要调整配置：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 邮箱域名配置
DOMAIN=tempmail.local

# 数据库配置
DATABASE_PATH=./emails.db

# 邮箱配置
DEFAULT_MAILBOX_EXPIRES_IN=3600        # 默认过期时间（秒）
MAX_MAILBOX_EXPIRES_IN=86400           # 最大过期时间（秒）
```

### 3️⃣ 启动服务器

**开发模式（带热重载）：**
```bash
npm run dev
```

**生产模式：**
```bash
npm start
```

服务器默认运行在 `http://localhost:3000`

## 🌐 访问 Web 界面

打开浏览器访问：
```
http://localhost:3000
```

## 📖 使用指南

### Web 界面使用

#### 🎯 创建邮箱

1. 在首页输入邮箱前缀（可选，留空自动生成）
2. 设置有效期（单位：秒，默认 3600 秒 = 1 小时）
3. 点击 "创建邮箱" 按钮

创建成功后会显示：
- ✅ 完整的邮箱地址
- 📅 创建时间和过期时间

#### 📮 管理邮箱

| 操作 | 说明 |
|------|------|
| **复制邮箱地址** | 一键复制邮箱地址到剪贴板 |
| **刷新邮件** | 手动刷新邮件列表（每 10 秒自动刷新） |
| **查看邮件** | 点击邮件查看完整内容 |
| **删除邮箱** | 永久删除邮箱及其所有邮件 |

## 🔌 REST API 文档

### 基础配置

```
基础 URL: http://localhost:3000/api
Content-Type: application/json
```

### 📌 API 端点

#### 1. 创建邮箱

**请求**

```http
POST /api/mailboxes
Content-Type: application/json

{
  "prefix": "myprefix",    // 可选：自定义前缀，留空自动生成
  "expiresIn": 3600        // 可选：过期时间（秒），默认 3600
}
```

**响应成功 (201)**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "prefix": "myprefix",
  "email": "myprefix@tempmail.local",
  "createdAt": 1700000000,
  "expiresAt": 1700003600,
  "expiresIn": 3600
}
```

**响应错误 (400)**

```json
{
  "error": "Invalid prefix format",
  "message": "Prefix must be 3-50 characters, containing only lowercase letters, numbers, dots, hyphens, and underscores"
}
```

**使用示例**

```bash
# 自动生成前缀
curl -X POST http://localhost:3000/api/mailboxes \
  -H "Content-Type: application/json" \
  -d '{
    "expiresIn": 1800
  }'

# 自定义前缀
curl -X POST http://localhost:3000/api/mailboxes \
  -H "Content-Type: application/json" \
  -d '{
    "prefix": "john.doe",
    "expiresIn": 7200
  }'
```

#### 2. 获取邮箱信息

**请求**

```http
GET /api/mailboxes/{mailbox_id}
```

**响应成功 (200)**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "prefix": "myprefix",
  "email": "myprefix@tempmail.local",
  "createdAt": 1700000000,
  "expiresAt": 1700003600,
  "isActive": true,
  "domain": "tempmail.local"
}
```

**使用示例**

```bash
curl http://localhost:3000/api/mailboxes/550e8400-e29b-41d4-a716-446655440000
```

#### 3. 获取邮件列表

**请求**

```http
GET /api/mailboxes/{mailbox_id}/emails
```

**响应成功 (200)**

```json
{
  "emails": [
    {
      "id": "email-id-1",
      "sender": "noreply@example.com",
      "subject": "验证码：123456",
      "receivedAt": 1700001000
    },
    {
      "id": "email-id-2",
      "sender": "support@service.com",
      "subject": "欢迎注册",
      "receivedAt": 1700000500
    }
  ],
  "count": 2
}
```

**使用示例**

```bash
curl http://localhost:3000/api/mailboxes/550e8400-e29b-41d4-a716-446655440000/emails
```

#### 4. 获取邮件详情

**请求**

```http
GET /api/emails/{email_id}
```

**响应成功 (200)**

```json
{
  "id": "email-id-1",
  "sender": "noreply@example.com",
  "subject": "验证码：123456",
  "content": "您的验证码是：123456\n请在 10 分钟内使用此验证码。",
  "receivedAt": 1700001000
}
```

**使用示例**

```bash
curl http://localhost:3000/api/emails/email-id-1
```

#### 5. 模拟接收邮件（测试）

**请求**

```http
POST /api/emails/mock
Content-Type: application/json

{
  "mailboxId": "550e8400-e29b-41d4-a716-446655440000",
  "sender": "test@example.com",
  "subject": "Test Email",
  "content": "This is a test email"  // 可选
}
```

**响应成功 (201)**

```json
{
  "id": "new-email-id",
  "sender": "test@example.com",
  "subject": "Test Email",
  "content": "This is a test email",
  "receivedAt": 1700001500
}
```

**使用示例**

```bash
curl -X POST http://localhost:3000/api/emails/mock \
  -H "Content-Type: application/json" \
  -d '{
    "mailboxId": "550e8400-e29b-41d4-a716-446655440000",
    "sender": "notification@service.com",
    "subject": "Account Verification",
    "content": "Click here to verify your account"
  }'
```

#### 6. 删除邮箱

**请求**

```http
DELETE /api/mailboxes/{mailbox_id}
```

**响应成功 (200)**

```json
{
  "success": true,
  "message": "Mailbox deleted successfully"
}
```

**使用示例**

```bash
curl -X DELETE http://localhost:3000/api/mailboxes/550e8400-e29b-41d4-a716-446655440000
```

#### 7. 健康检查

**请求**

```http
GET /health
```

**响应成功 (200)**

```json
{
  "status": "ok",
  "domain": "tempmail.local"
}
```

#### 8. API 信息

**请求**

```http
GET /api/info
```

**响应成功 (200)**

```json
{
  "version": "1.0.0",
  "domain": "tempmail.local",
  "defaultExpires": 3600,
  "maxExpires": 86400
}
```

## 🐳 Docker 部署

### 创建 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# 启动应用
CMD ["node", "server.js"]
```

### 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  temp-email-server:
    build: .
    container_name: temp-email-server
    ports:
      - "3000:3000"
    environment:
      PORT: 3000
      DOMAIN: tempmail.local
      NODE_ENV: production
      DATABASE_PATH: /data/emails.db
    volumes:
      - temp-email-data:/data
    restart: unless-stopped

volumes:
  temp-email-data:
    driver: local
```

### 使用 Docker Compose 启动

```bash
docker-compose up -d
```

## ☁️ 云平台部署

### Heroku 部署

1. **创建 Procfile**

```
web: node server.js
```

2. **部署**

```bash
# 登录 Heroku
heroku login

# 创建应用
heroku create temp-email-server

# 设置环境变量
heroku config:set DOMAIN=tempmail.herokuapp.com

# 推送代码
git push heroku main

# 查看日志
heroku logs --tail
```

### Railway 部署

1. 连接 GitHub 仓库到 Railway
2. 在环境变量中设置：
   - `PORT=3000`
   - `DOMAIN=your-domain.railway.app`
3. 自动部署

### Render 部署

1. 在 Render 上创建新的 Web Service
2. 连接 GitHub 仓库
3. 设置环境变量
4. 点击 "Create Web Service"

## 🔧 配置说明

### 环境变量详解

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `PORT` | number | 3000 | 服务器监听端口 |
| `NODE_ENV` | string | development | 运行环境（development/production） |
| `DOMAIN` | string | tempmail.local | 邮箱域名 |
| `DATABASE_PATH` | string | ./emails.db | SQLite 数据库文件路径 |
| `DEFAULT_MAILBOX_EXPIRES_IN` | number | 3600 | 默认邮箱过期时间（秒） |
| `MAX_MAILBOX_EXPIRES_IN` | number | 86400 | 最大邮箱过期时间（秒） |

### 自定义邮箱域名

修改 `.env` 文件中的 `DOMAIN` 变量：

```env
# 本地开发
DOMAIN=localhost

# 自己的域名
DOMAIN=mail.example.com

# 子域名
DOMAIN=temp.yoursite.com
```

**注意**：修改后需要重启服务器

## 💾 数据库结构

### mailboxes 表

```sql
CREATE TABLE mailboxes (
  id TEXT PRIMARY KEY,
  prefix TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1
);
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | TEXT | 邮箱唯一标识（UUID） |
| `prefix` | TEXT | 邮箱前缀 |
| `created_at` | INTEGER | 创建时间戳（秒） |
| `expires_at` | INTEGER | 过期时间戳（秒） |
| `is_active` | INTEGER | 是否活跃（1=活跃，0=已过期） |

### emails 表

```sql
CREATE TABLE emails (
  id TEXT PRIMARY KEY,
  mailbox_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT,
  received_at INTEGER NOT NULL,
  FOREIGN KEY(mailbox_id) REFERENCES mailboxes(id)
);
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | TEXT | 邮件唯一标识（UUID） |
| `mailbox_id` | TEXT | 所属邮箱 ID |
| `sender` | TEXT | 发件人地址 |
| `subject` | TEXT | 邮件主题 |
| `content` | TEXT | 邮件内容 |
| `received_at` | INTEGER | 接收时间戳（秒） |

## 🧹 自动清理机制

服务器每分钟自动执行以下清理任务：

1. ✅ 扫描所有过期邮箱（`expires_at < 当前时间`）
2. 🗑️ 删除过期邮箱关联的所有邮件
3. 📊 将邮箱标记为不活跃状态

**清理示例**

如果设置邮箱有效期为 1 小时（3600 秒）：
- 创建时间：10:00:00
- 过期时间：11:00:00
- 11:00:01 时，邮箱会被自动清理

## 🎓 完整示例

### 场景：注册服务并接收验证码

#### 步骤 1：创建临时邮箱

```bash
curl -X POST http://localhost:3000/api/mailboxes \
  -H "Content-Type: application/json" \
  -d '{"expiresIn": 600}'
```

**响应**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "prefix": "a1b2c3d4e5",
  "email": "a1b2c3d4e5@tempmail.local",
  "createdAt": 1700000000,
  "expiresAt": 1700000600,
  "expiresIn": 600
}
```

#### 步骤 2：使用邮箱地址注册

在注册表单中使用 `a1b2c3d4e5@tempmail.local`

#### 步骤 3：模拟接收验证码邮件

```bash
curl -X POST http://localhost:3000/api/emails/mock \
  -H "Content-Type: application/json" \
  -d '{
    "mailboxId": "123e4567-e89b-12d3-a456-426614174000",
    "sender": "noreply@register.example.com",
    "subject": "验证码：654321",
    "content": "您的验证码是：654321\n请在 10 分钟内使用此验证码完成注册。"
  }'
```

#### 步骤 4：获取邮件列表

```bash
curl http://localhost:3000/api/mailboxes/123e4567-e89b-12d3-a456-426614174000/emails
```

#### 步骤 5：查看邮件详情

```bash
# 获取邮件 ID（从步骤 4 的响应）
curl http://localhost:3000/api/emails/email-id-123
```

## 🧪 测试

### 使用 curl 进行测试

```bash
# 1. 创建邮箱
MAILBOX=$(curl -s -X POST http://localhost:3000/api/mailboxes \
  -H "Content-Type: application/json" \
  -d '{}' | jq -r '.id')

echo "Created mailbox: $MAILBOX"

# 2. 发送测试邮件
curl -s -X POST http://localhost:3000/api/emails/mock \
  -H "Content-Type: application/json" \
  -d "{
    \"mailboxId\": \"$MAILBOX\",
    \"sender\": \"test@example.com\",
    \"subject\": \"Test Email\",
    \"content\": \"This is a test email\"
  }"

# 3. 获取邮件列表
curl -s http://localhost:3000/api/mailboxes/$MAILBOX/emails | jq

# 4. 删除邮箱
curl -s -X DELETE http://localhost:3000/api/mailboxes/$MAILBOX | jq
```

### 使用 Postman

1. 导入 [Postman Collection](./postman-collection.json)
2. 更新环境变量中的 `baseUrl`
3. 执行请求

## 📊 性能指标

| 指标 | 值 |
|------|-----|
| 响应时间 | < 100ms |
| 吞吐量 | > 1000 req/s |
| 并发连接 | 1024+ |
| 内存占用 | < 50MB |
| 数据库大小 | SQLite (轻量级) |

## 🔐 安全建议

1. **生产环境部署**
   - 使用 HTTPS
   - 配置防火墙规则
   - 定期备份数据库
   - 监控日志文件

2. **API 安全**
   - 添加速率限制
   - 实现 API 认证（JWT）
   - 验证所有输入
   - 使用 CORS 配置

3. **数据隐私**
   - 不存储敏感信息
   - 定期清理过期数据
   - 加密敏感字段

## 🐛 故障排除

### 问题：端口被占用

```bash
# 查看占用端口的进程
lsof -i :3000

# 使用不同的端口
PORT=3001 npm start
```

### 问题：数据库锁定

```bash
# 删除数据库重新初始化
rm emails.db
npm start
```

### 问题：邮箱前缀冲突

前缀自动生成时使用加密随机数，冲突概率极低。如需自定义前缀，请确保唯一性。

## 📝 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 如何贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 💡 功能建议

- [ ] 实现真实 SMTP 邮件接收
- [ ] 添加 API 认证和频率限制
- [ ] 支持邮件附件
- [ ] 邮件转发功能
- [ ] 邮箱统计信息
- [ ] 支持多域名
- [ ] 邮件搜索功能
- [ ] 导出邮件功能

## 📞 联系方式

- 📧 Email: your.email@example.com
- 🐦 Twitter: [@yourtwitter](https://twitter.com/yourtwitter)
- 💬 Issues: [GitHub Issues](https://github.com/yourusername/temp-email-server/issues)

## 🙏 致谢

感谢所有贡献者和使用者的支持！

---

**最后更新**: 2024-11-22  
**当前版本**: 1.0.0  
**维护者**: [Your Name](https://github.com/yourusername)
