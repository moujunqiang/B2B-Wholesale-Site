# B2B Wholesale Site

一个基于 Cloudflare Workers 的外贸 B2B 批发网站，支持产品目录、询盘管理和后台管理功能。

## 功能特性

### 前台功能
- 产品展示：首页展示推荐产品
- 产品分类：多级分类浏览
- 产品详情：完整产品信息和规格
- 询盘功能：客户可以发送询盘

### 后台管理
- 产品管理：添加、编辑、删除产品
- 分类管理：管理产品分类
- 询盘管理：查看和回复客户询盘
- 网站设置：配置站点参数
- 简单的 HTTP Basic认证

## 技术栈

- **运行时**: Cloudflare Workers
- **框架**: Hono
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare R2 (图片等静态资源)
- **验证**: HTTP Basic Authentication
- **类型校验**: Zod

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Cloudflare

确保已安装 Wrangler CLI 并登录：

```bash
npm install -g wrangler
wrangler login
```

### 3. 创建 D1 数据库

```bash
wrangler d1 create b2b_wholesale_db
```

创建成功后，将返回的 `database_id` 填入 `wrangler.toml`。

### 4. 创建 R2 bucket

```bash
wrangler r2 bucket create b2b-wholesale-media
```

### 5. 初始化数据库

```bash
npm run db:create
npm run db:push
```

### 6. 创建管理员账户

```bash
wrangler d1 execute b2b_wholesale_db --command "INSERT INTO admins (username, password_hash) VALUES ('admin', '<YOUR_HASH>');"
```

生成密码哈希：

```bash
# 使用 Node.js 脚本生成哈希
node -e "
const crypto = require('crypto');
async function hash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
  return salt + ':' + hash;
}
hash('your_password').then(h => console.log(h));
"
```

### 7. 本地开发

```bash
npm run dev
```

访问 http://localhost:8787 查看网站
访问 http://localhost:8787/admin 进入后台管理

### 8. 部署

```bash
npm run deploy
```

## 项目结构

```
├── src/
│   ├── api/              # API 路由
│   │   ├── products.ts   # 产品 API
│   │   ├── categories.ts # 分类 API
│   │   ├── inquiries.ts  # 询盘 API
│   │   ├── settings.ts   # 设置 API
│   │   ├── translations.ts # 翻译 API
│   │   └── admin.ts      # 后台 API
│   ├── db/               # 数据库相关
│   │   ├── index.ts      # 数据库操作类
│   │   └── schema.sql    # 数据库结构
│   ├── middleware/       # 中间件
│   │   └── auth.ts       # 认证中间件
│   ├── utils/            # 工具函数
│   │   └── auth.ts       # 认证工具
│   ├── types.ts          # TypeScript 类型定义
│   └── index.ts          # 主入口
├── public/
│   ├── css/              # 样式文件
│   │   ├── styles.css    # 前台样式
│   │   └── admin.css     # 后台样式
│   ├── js/               # JavaScript 文件
│   │   ├── main.js       # 前台逻辑
│   │   └── admin.js      # 后台逻辑
│   └── images/           # 静态图片
├── wrangler.toml         # Cloudflare 配置
├── package.json          # 项目配置
└── tsconfig.json         # TypeScript 配置
```

## API 文档

### 前台 API

#### 获取产品列表
```
GET /api/products?category={categoryId}&page={page}&limit={limit}
```

#### 获取单个产品
```
GET /api/products/:slug
```

#### 获取分类列表
```
GET /api/categories
```

#### 提交询盘
```
POST /api/inquiries
Content-Type: application/json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Company Name",
  "message": "I'm interested in your product..."
}
```

### 后台 API

所有后台 API 需要 HTTP Basic 认证。

#### 获取统计信息
```
GET /api/admin/stats
Authorization: Basic BASE64(username:password)
```

#### 管理产品/分类/询盘
详见 `src/api/admin.ts`

## 多语言支持

翻译数据存储在 `translations` 表中，支持动态添加新的语言。

```sql
INSERT INTO translations (locale, key, value) VALUES ('es', 'home', 'Inicio');
```

## 环境变量

生产环境请在 Cloudflare Dashboard 中配置：
- D1 Database ID
- R2 Bucket 名称

## 注意事项

1. **图片存储**: R2 bucket 用于存储产品图片，需要配置 CORS
2. **安全**: 建议在生产环境使用 HTTPS，定期更换管理员密码
3. **备份**: 定期备份 D1 数据库数据
4. **性能**: 大量产品时建议添加缓存机制

## License

MIT