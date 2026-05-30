# B2B Wholesale Site

一个基于 Cloudflare Workers 的外贸 B2B 批发网站，支持产品目录、询盘管理和后台管理功能。

## 功能特性

### 前台功能
- **产品展示**：首页展示推荐产品，支持分页浏览
- **产品分类**：多级分类浏览
- **产品详情**：完整产品信息和规格
- **询盘功能**：客户可以发送询盘，自动发送邮件通知
- **SEO 优化**：动态 Meta 标签、Sitemap、Robots.txt

### 后台管理
- **产品管理**：添加、编辑、删除产品，支持图片上传
- **分类管理**：管理产品分类
- **询盘管理**：查看和回复客户询盘，状态管理
- **网站设置**：配置站点参数
- **图片上传**：基于 R2 的产品图片存储
- **HTTP Basic 认证**：安全的后台访问控制

## 技术栈

- **运行时**: Cloudflare Workers
- **框架**: Hono
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare R2 (图片等静态资源)
- **邮件**: Mailchannels API
- **验证**: HTTP Basic Authentication
- **类型校验**: Zod
- **缓存**: 内存缓存 (In-memory Cache)

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

在 Cloudflare Dashboard 中配置 R2 bucket 的 CORS：
- 进入 R2 Dashboard
- 选择 `b2b-wholesale-media` bucket
- 点击 "Settings" > "CORS"
- 添加以下配置：

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 5. 配置邮件通知（可选）

使用 Mailchannels 发送邮件通知：

1. 在 [Mailchannels](https://app.mailchannels.com/) 注册账号
2. 获取 API Key
3. 在 Cloudflare Dashboard 设置环境变量：
   - `EMAIL_API_KEY`: Mailchannels API Key
   - `ADMIN_EMAIL`: 管理员邮箱地址

### 6. 初始化数据库

```bash
npm run db:create
npm run db:push
```

### 7. 创建管理员账户

生成密码哈希：

```bash
npm run hash:admin
# 或
node scripts/generate-admin-hash.js
```

将生成的哈希值填入以下命令：

```bash
wrangler d1 execute b2b_wholesale_db --command "INSERT INTO admins (username, password_hash) VALUES ('admin', '<YOUR_HASH>');"
```

### 8. 更新 wrangler.toml

编辑 `wrangler.toml`，替换数据库 ID 占位符：

```toml
[[d1_databases]]
binding = "DB"
database_name = "b2b_wholesale_db"
database_id = "实际的 D1 数据库 ID"
```

### 9. 本地开发

```bash
npm run dev
```

访问 http://localhost:8787 查看网站
访问 http://localhost:8787/admin 进入后台管理

### 10. 部署

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
│   │   ├── admin.ts      # 后台 API
│   │   └── upload.ts     # 图片上传 API
│   ├── db/               # 数据库相关
│   │   ├── index.ts      # 数据库操作类（带缓存）
│   │   └── schema.sql    # 数据库结构
│   ├── middleware/       # 中间件
│   │   └── auth.ts       # 认证中间件
│   ├── utils/            # 工具函数
│   │   ├── auth.ts       # 认证工具
│   │   └── email.ts      # 邮件发送工具
│   ├── types.ts          # TypeScript 类型定义
│   └── index.ts          # 主入口
├── public/
│   ├── css/              # 样式文件
│   │   ├── styles.css    # 前台样式
│   │   └── admin.css     # 后台样式
│   ├── js/               # JavaScript 文件
│   │   ├── main.js       # 前台逻辑（带分页）
│   │   └── admin.js      # 后台逻辑（带图片上传）
│   └── images/           # 静态图片
├── scripts/
│   └── generate-admin-hash.js  # 密码哈希生成脚本
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

#### 图片上传
```
POST /api/upload/image
Content-Type: multipart/form-data
Authorization: Basic BASE64(username:password)

FormData:
  file: <image file>
```

响应：
```json
{
  "success": true,
  "data": {
    "url": "https://...",
    "key": "products/1234567890-abc123.jpg",
    "size": 102400,
    "type": "image/jpeg"
  }
}
```

#### 删除图片
```
DELETE /api/upload/image
Authorization: Basic BASE64(username:password)

Body:
{
  "key": "products/1234567890-abc123.jpg"
}
```

#### 获取统计信息
```
GET /api/admin/stats
Authorization: Basic BASE64(username:password)
```

## SEO 功能

### Sitemap
访问 `/sitemap.xml` 获取自动生成的站点地图。

### Robots.txt
访问 `/robots.txt` 获取 robots 配置，自动禁止爬虫访问后台。

### Meta 标签
首页的 meta 标签根据后台设置动态生成：
- 网站名称
- 网站描述
- Open Graph 标签
- Twitter Card 标签

## 缓存机制

系统内置了内存缓存，自动缓存以下数据：
- 产品列表：5 分钟
- 产品分类：10 分钟
- 网站设置：5 分钟
- 翻译数据：10 分钟

缓存会在数据更新时自动失效。

## 环境变量

在 Cloudflare Dashboard 的 Worker 设置中配置以下环境变量：

| 变量名 | 说明 | 是否必需 |
|--------|------|----------|
| `EMAIL_API_KEY` | Mailchannels API Key | 否 |
| `ADMIN_EMAIL` | 管理员邮箱 | 否 |

## 注意事项

1. **图片存储**: R2 bucket 用于存储产品图片，需要配置 CORS
2. **安全**: 建议在生产环境使用 HTTPS，定期更换管理员密码
3. **备份**: 定期备份 D1 数据库数据
4. **性能**: 内置缓存机制，支持数百个产品的高效访问
5. **邮件**: 邮件功能可选，配置 EMAIL_API_KEY 后自动启用

## 脚本命令

```bash
npm run dev          # 本地开发
npm run deploy       # 部署到 Cloudflare
npm run db:create    # 本地创建数据库
npm run db:push      # 推送数据库结构到远程
npm run typecheck    # TypeScript 类型检查
npm run hash:admin   # 生成管理员密码哈希
```

## License

MIT
