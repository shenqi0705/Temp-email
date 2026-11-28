import express from 'express';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'tempmail.local';
const DATABASE_PATH = process.env.DATABASE_PATH || join(__dirname, 'emails.db');
const NODE_ENV = process.env.NODE_ENV || 'development';

// 初始化数据库
const db = new sqlite3.Database(DATABASE_PATH);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS mailboxes (
    id TEXT PRIMARY KEY,
    prefix TEXT UNIQUE NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS emails (
    id TEXT PRIMARY KEY,
    mailbox_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT,
    received_at INTEGER NOT NULL,
    FOREIGN KEY(mailbox_id) REFERENCES mailboxes(id)
  )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_mailbox_expires ON mailboxes(expires_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_emails_mailbox ON emails(mailbox_id)`);
});

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 请求日志中间件
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// 生成随机前缀
function generatePrefix(length = 10) {
  return randomBytes(length)
    .toString('hex')
    .substring(0, length)
    .toLowerCase();
}

// 验证前缀格式
function isValidPrefix(prefix) {
  if (!prefix || typeof prefix !== 'string') return false;
  if (prefix.length < 3 || prefix.length > 50) return false;
  if (!/^[a-z0-9._-]+$/.test(prefix)) return false;
  return true;
}

// 创建新邮箱
app.post('/api/mailboxes', (req, res) => {
  try {
    let prefix = req.body.prefix || generatePrefix();
    const expiresIn = req.body.expiresIn || parseInt(process.env.DEFAULT_MAILBOX_EXPIRES_IN) || 3600;
    const maxExpires = parseInt(process.env.MAX_MAILBOX_EXPIRES_IN) || 86400;

    // 验证前缀
    if (!isValidPrefix(prefix)) {
      return res.status(400).json({
        error: 'Invalid prefix format',
        message: 'Prefix must be 3-50 characters, containing only lowercase letters, numbers, dots, hyphens, and underscores'
      });
    }

    // 验证过期时间
    if (expiresIn < 60 || expiresIn > maxExpires) {
      return res.status(400).json({
        error: 'Invalid expiresIn',
        message: `expiresIn must be between 60 and ${maxExpires} seconds`
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const id = uuidv4();

    db.run(
      'INSERT INTO mailboxes (id, prefix, created_at, expires_at) VALUES (?, ?, ?, ?)',
      [id, prefix, now, now + expiresIn],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({
              error: 'Prefix already exists',
              message: 'This prefix is already in use. Please try another one.'
            });
          }
          return res.status(500).json({
            error: 'Failed to create mailbox',
            details: err.message
          });
        }

        res.status(201).json({
          id,
          prefix,
          email: `${prefix}@${DOMAIN}`,
          createdAt: now,
          expiresAt: now + expiresIn,
          expiresIn
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
});

// 获取邮箱信息
app.get('/api/mailboxes/:id', (req, res) => {
  db.get(
    'SELECT * FROM mailboxes WHERE id = ?',
    [req.params.id],
    (err, mailbox) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!mailbox) {
        return res.status(404).json({ error: 'Mailbox not found' });
      }

      res.json({
        id: mailbox.id,
        prefix: mailbox.prefix,
        email: `${mailbox.prefix}@${DOMAIN}`,
        createdAt: mailbox.created_at,
        expiresAt: mailbox.expires_at,
        isActive: mailbox.is_active === 1,
        domain: DOMAIN
      });
    }
  );
});

// 获取邮箱中的所有邮件
app.get('/api/mailboxes/:id/emails', (req, res) => {
  db.all(
    'SELECT * FROM emails WHERE mailbox_id = ? ORDER BY received_at DESC LIMIT 100',
    [req.params.id],
    (err, emails) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        emails: (emails || []).map(email => ({
          id: email.id,
          sender: email.sender,
          subject: email.subject,
          receivedAt: email.received_at
        })),
        count: emails ? emails.length : 0
      });
    }
  );
});

// 获取单个邮件详情
app.get('/api/emails/:id', (req, res) => {
  db.get(
    'SELECT * FROM emails WHERE id = ?',
    [req.params.id],
    (err, email) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }

      res.json({
        id: email.id,
        sender: email.sender,
        subject: email.subject,
        content: email.content || '',
        receivedAt: email.received_at
      });
    }
  );
});

// 模拟接收邮件（用于测试）
app.post('/api/emails/mock', (req, res) => {
  try {
    const { mailboxId, sender, subject, content } = req.body;

    if (!mailboxId || !sender || !subject) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'mailboxId, sender, and subject are required'
      });
    }

    db.get('SELECT id FROM mailboxes WHERE id = ? AND is_active = 1', [mailboxId], (err, mailbox) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!mailbox) {
        return res.status(404).json({ error: 'Mailbox not found or expired' });
      }

      const id = uuidv4();
      const receivedAt = Math.floor(Date.now() / 1000);

      db.run(
        'INSERT INTO emails (id, mailbox_id, sender, subject, content, received_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, mailboxId, sender, subject, content || '', receivedAt],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to save email' });
          }

          res.status(201).json({
            id,
            sender,
            subject,
            content: content || '',
            receivedAt
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
});

// 删除邮箱
app.delete('/api/mailboxes/:id', (req, res) => {
  db.run('DELETE FROM mailboxes WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Mailbox not found' });
    }

    db.run('DELETE FROM emails WHERE mailbox_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Mailbox deleted successfully' });
  });
});

// 清理过期邮箱（定期运行）
function cleanupExpiredMailboxes() {
  const now = Math.floor(Date.now() / 1000);
  
  db.all(
    'SELECT id FROM mailboxes WHERE expires_at < ? AND is_active = 1',
    [now],
    (err, mailboxes) => {
      if (err) {
        console.error('Cleanup error:', err);
        return;
      }

      if (!mailboxes || mailboxes.length === 0) return;

      mailboxes.forEach(mailbox => {
        db.run('DELETE FROM emails WHERE mailbox_id = ?', [mailbox.id]);
        db.run('UPDATE mailboxes SET is_active = 0 WHERE id = ?', [mailbox.id]);
      });

      if (NODE_ENV === 'development') {
        console.log(`Cleaned up ${mailboxes.length} expired mailboxes`);
      }
    }
  );
}

const cleanupInterval = setInterval(cleanupExpiredMailboxes, 60000);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', domain: DOMAIN });
});

// API 信息
app.get('/api/info', (req, res) => {
  res.json({
    version: '1.0.0',
    domain: DOMAIN,
    defaultExpires: parseInt(process.env.DEFAULT_MAILBOX_EXPIRES_IN) || 3600,
    maxExpires: parseInt(process.env.MAX_MAILBOX_EXPIRES_IN) || 86400
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 Temp Email Server Started`);
  console.log(`========================================`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📧 Domain: ${DOMAIN}`);
  console.log(`🔧 Environment: ${NODE_ENV}`);
  console.log(`💾 Database: ${DATABASE_PATH}`);
  console.log(`========================================\n`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n📍 SIGTERM received, shutting down gracefully...');
  clearInterval(cleanupInterval);
  server.close(() => {
    console.log('✅ Server closed');
    db.close((err) => {
      if (err) console.error(err);
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
});

export default app;
