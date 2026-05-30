# B2B Wholesale Site

一个基于 Cloudflare Workers 的外贸 B2B 批发网站，支持产品目录、询盘管理、幻灯片管理、SEO 优化和完整的后台管理功能。

## 功能特性

### 前台功能
- **首页幻灯片** - 轮播展示，支持后台管理
- **产品展示** - 首页展示推荐产品，支持分页浏览
- **产品分类** - 多级分类浏览
- **产品详情** - 完整产品信息和规格
- **解决方案** - 行业解决方案展示
- **客户案例** - 成功案例展示
- **新闻博客** - 公司动态和行业资讯
- **询盘功能** - 客户可以发送询盘，自动发送邮件通知
- **悬浮客服** - Email、电话、WhatsApp 快速联系
- **Get a Quote 弹出框** - 快速询价弹窗
- **SEO 优化** - JSON-LD、Sitemap、Robots.txt、Meta 标签
- **LLMs.txt** - AI 爬虫友好的站点内容文档

### 后台管理
- **幻灯片管理** - 首页轮播图管理
- **产品管理** - 添加、编辑、删除产品，支持图片上传
- **分类管理** - 管理产品分类
- **解决方案管理** - 行业解决方案 CRUD
- **案例管理** - 客户案例 CRUD
- **新闻管理** - 博客文章 CRUD
- **页面管理** - 自定义页面（如 About、Contact）
- **询盘管理** - 查看和回复客户询盘，状态管理
- **Leads 管理** - 收集 Get a Quote 弹窗的潜在客户
- **SEO 配置** - JSON-LD 结构化数据配置
- **Robots 配置** - 可配置的 robots.txt 规则
- **网站设置** - 站点名称、描述、Logo、联系方式等
- **弹窗设置** - Get a Quote 弹窗配置
- **社交媒体** - 社交媒体链接管理
- **图片上传** - 基于 R2 的产品图片存储
- **HTTP Basic 认证** - 安全的后台访问控制

### 技术栈

| 技术 | 用途 |
|------|------|
| **运行时** | Cloudflare Workers (Edge Computing) |
| **框架** | Hono (轻量 Web 框架) |
| **数据库** | Cloudflare D1 (SQLite, 全球分布式) |
| **存储** | Cloudflare R2 (对象存储，无流量费) |
| **邮件** | Mailchannels API (事务邮件) |
| **验证** | HTTP Basic Authentication |
| **类型校验** | Zod |
| **前端** | Tailwind CSS + jQuery + Iconify + Font Awesome |
| **缓存** | 内存缓存 (In-memory Cache) |

## 快速开始

### 1. 准备工作

#### 安装 Node.js
确保已安装 Node.js 18.x 或更高版本：

```bash
node --version
# 应该显示 v18.x.x 或更高
```

#### 安装 Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

登录后，Wrangler 会打开浏览器让你授权 Cloudflare 账号。

### 2. 创建 Cloudflare 资源

#### 创建 D1 数据库

```bash
wrangler d1 create b2b_wholesale_db
```

创建成功后，会返回类似以下的输出：

```
✅ Successfully created DB 'b2b_wholesale_db' (database_id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
```

**记录下 `database_id`**，后续需要填入 `wrangler.toml`。

#### 创建 R2 Bucket

```bash
wrangler r2 bucket create b2b-wholesale-media
```

#### 配置 R2 CORS

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **R2** > **b2b-wholesale-media**
3. 点击 **Settings** > **CORS Policy**
4. 点击 **Edit CORS Policy**
5. 添加以下配置：

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

> **注意**：生产环境建议将 `AllowedOrigins` 替换为你的实际域名。

#### 创建 D1 数据库并初始化

```bash
# 本地开发环境创建数据库
npm run db:create
```

### 3. 配置项目

#### 更新 wrangler.toml

编辑 `wrangler.toml`，填入数据库 ID：

```toml
name = "b2b-wholesale-site"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "b2b_wholesale_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 填入你的 database_id

[[r2_buckets]]
binding = "MEDIA"
bucket_name = "b2b-wholesale-media"
```

#### 环境变量（可选）

在 Cloudflare Dashboard 的 Worker 设置中添加：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `EMAIL_API_KEY` | Mailchannels API Key | `pk_xxxxx` |
| `ADMIN_EMAIL` | 管理员接收邮件邮箱 | `admin@example.com` |
| `SITE_URL` | 网站 URL（用于邮件链接） | `https://yourdomain.com` |

> **获取 Mailchannels API Key**：
> 1. 访问 [Mailchannels](https://app.mailchannels.com/)
> 2. 注册账号并验证邮箱
> 3. 创建 API Key

### 4. 初始化数据库

```bash
# 推送数据库结构到本地
npm run db:create

# 部署到远程（首次部署前必须执行）
npm run db:push
```

### 5. 创建管理员账户

#### 生成密码哈希

```bash
npm run hash:admin
```

按提示输入密码，会输出类似：

```
Password hash: $2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 插入管理员数据

```bash
# 本地
wrangler d1 execute b2b_wholesale_db --local --command "INSERT INTO admins (username, password_hash, created_at) VALUES ('admin', '\$2b\$10\$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', datetime('now'));"

# 远程（需要先部署）
wrangler d1 execute b2b_wholesale_db --remote --command "INSERT INTO admins (username, password_hash, created_at) VALUES ('admin', '\$2b\$10\$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', datetime('now'));"
```

### 6. 本地开发

```bash
npm run dev
```

- 前台：http://localhost:8787/
- 后台：http://localhost:8787/admin
- API 测试：http://localhost:8787/api/products

### 7. 部署上线

```bash
npm run deploy
```

首次部署可能需要几分钟，之后每次部署大约 10-30 秒。

---

## 详细使用指南

### 1. 访问后台管理

1. 打开浏览器访问 `/admin`（如 `https://yourdomain.com/admin`）
2. 输入管理员用户名和密码
3. 登录后可管理所有内容

### 2. 基础设置

进入 **Settings** 页面配置：

- **Site Name**：网站名称
- **Site Title**：网站标题（SEO）
- **Site Description**：网站描述（SEO）
- **Site Keywords**：网站关键词（SEO）
- **Logo URL**：网站 Logo 图片地址
- **Popup Settings**：Get a Quote 弹窗设置
  - 是否启用弹窗
  - 延迟显示时间（秒）
  - 弹窗标题和描述

### 3. 社交媒体和联系方式

在 **Settings** 页面底部：

- **Social Links**：添加 Facebook、TikTok、YouTube、Instagram、LinkedIn、X 等社交媒体链接
- **Contact Info**：添加 Email、电话、WhatsApp 等联系方式

### 4. 管理幻灯片

1. 进入 **Slides** 页面
2. 点击 **Add Slide** 添加新幻灯片
3. 填写以下内容：
   - **Title**：幻灯片主标题
   - **Subtitle**：副标题
   - **Description**：描述文字
   - **Image URL**：背景图片地址（建议尺寸 1920x600）
   - **Link URL**：点击跳转链接（可选）
   - **Link Text**：按钮文字
   - **Sort Order**：排序（数字越小越靠前）
   - **Status**：是否启用

### 5. 管理产品

1. 进入 **Products** 页面
2. 点击 **Add Product** 添加产品
3. 填写产品信息：
   - **Name**：产品名称
   - **Slug**：URL 友好的别名（如 `wire-harness-assembly`）
   - **Category**：选择分类
   - **Short Description**：简短描述（列表页显示）
   - **Description**：完整描述（详情页显示，支持 HTML）
   - **Price**：价格
   - **MOQ**：最小起订量
   - **Images**：产品图片（先上传到 R2，获取 URL）
   - **Featured**：是否推荐到首页
   - **Status**：是否发布

### 6. 上传图片

1. 进入任意支持图片的内容管理页面
2. 点击图片上传按钮
3. 选择本地图片文件
4. 图片会自动上传到 R2 并返回 URL
5. 复制 URL 填入对应字段

### 7. 管理分类

1. 进入 **Categories** 页面
2. 添加产品分类：
   - **Name**：分类名称
   - **Slug**：URL 别名
   - **Parent**：父分类（可选，支持多级）
   - **Description**：分类描述
   - **Sort Order**：排序

### 8. 管理解决方案和案例

与产品管理类似：

- **Solutions**：行业解决方案
- **Cases**：客户成功案例
- **News**：博客新闻

### 9. 查看询盘和 Leads

- **Inquiries**：客户通过联系表单发送的询盘
- **Leads**：客户通过 Get a Quote 弹窗提交的潜在客户信息

### 10. SEO 配置

#### JSON-LD 配置

进入 **SEO & JSON-LD** 页面，可以添加结构化数据：

- **Organization**：组织信息
- **Website**：网站信息
- **Product**：产品信息
- **BreadcrumbList**：面包屑导航

#### Robots.txt 配置

进入 **Robots.txt** 页面，可以配置爬虫规则：

- 按用户代理（User-Agent）分组
- 设置 Allow/Disallow 规则
- 支持 Sitemap 声明

---

## 项目结构

```
B2B-Wholesale-Site/
├── src/
│   ├── api/                    # API 路由
│   │   ├── products.ts         # 产品 API
│   │   ├── categories.ts       # 分类 API
│   │   ├── inquiries.ts        # 询盘 API
│   │   ├── settings.ts         # 设置 API
│   │   ├── translations.ts     # 翻译 API
│   │   ├── admin.ts            # 后台统计 API
│   │   ├── upload.ts           # 图片上传 API
│   │   ├── pages.ts            # 页面 API
│   │   ├── solutions.ts        # 解决方案 API
│   │   ├── cases.ts            # 案例 API
│   │   ├── news.ts             # 新闻 API
│   │   ├── leads.ts            # Leads API
│   │   ├── slides.ts           # 幻灯片 API
│   │   ├── jsonld.ts           # JSON-LD API
│   │   └── robots.ts           # Robots API
│   ├── db/                     # 数据库相关
│   │   ├── index.ts            # 数据库操作类（带缓存）
│   │   └── schema.sql          # 数据库结构
│   ├── middleware/             # 中间件
│   │   └── auth.ts             # 认证中间件
│   ├── utils/                  # 工具函数
│   │   ├── auth.ts             # 认证工具
│   │   └── email.ts            # 邮件发送工具
│   ├── types.ts                # TypeScript 类型定义
│   └── index.ts                # 主入口（前台+后台 HTML）
├── public/
│   ├── css/                    # 样式文件
│   │   ├── styles.css          # 前台样式（Tailwind 补充）
│   │   └── admin.css           # 后台样式
│   ├── js/                     # JavaScript 文件
│   │   ├── main.js             # 前台逻辑（jQuery）
│   │   └── admin.js            # 后台逻辑（jQuery）
│   └── images/                 # 静态图片（如占位图）
├── scripts/
│   └── generate-admin-hash.js  # 密码哈希生成脚本
├── wrangler.toml               # Cloudflare 配置
├── package.json                # 项目配置
└── tsconfig.json               # TypeScript 配置
```

---

## 常用命令

```bash
# 本地开发（热重载）
npm run dev

# 部署到 Cloudflare
npm run deploy

# 本地创建 D1 数据库
npm run db:create

# 推送数据库到远程
npm run db:push

# TypeScript 类型检查
npm run typecheck

# 生成管理员密码哈希
npm run hash:admin
```

---

## SEO 功能详解

### 自动生成的文件

| 路径 | 说明 |
|------|------|
| `/sitemap.xml` | 站点地图，包含所有产品、分类、页面等 |
| `/robots.txt` | 爬虫规则，可后台配置 |
| `/LLMs.txt` | AI 爬虫友好的站点内容摘要 |

### JSON-LD 结构化数据

系统在首页自动注入以下 JSON-LD：

- **Organization**：组织信息
- **WebSite**：网站信息
- **BreadcrumbList**：面包屑导航

可在后台 **SEO & JSON-LD** 页面自定义配置。

### Meta 标签

- `<title>`：动态生成
- `<meta name="description">`：后台设置
- `<meta name="keywords">`：后台设置
- Open Graph 标签
- Twitter Card 标签

---

## 缓存机制

系统内置内存缓存，自动缓存以下数据：

| 数据类型 | 缓存时间 |
|----------|----------|
| 产品列表 | 5 分钟 |
| 产品详情 | 10 分钟 |
| 分类列表 | 10 分钟 |
| 网站设置 | 5 分钟 |
| 翻译数据 | 10 分钟 |
| 幻灯片 | 5 分钟 |

缓存会在数据更新时自动失效。

---

## 性能优化建议

### 1. 启用 Cloudflare 缓存

在 `wrangler.toml` 中配置：

```toml
[[routes]]
pattern = "/*"
```

### 2. 压缩图片

上传前压缩图片，建议：
- 产品图片：不超过 200KB
- 幻灯片背景：不超过 500KB
- 使用 WebP 格式

### 3. 合理使用 CDN

- 静态资源使用 R2 + Cloudflare CDN
- 图片使用 Cloudflare Images（可选）

---

## 故障排除

### 常见问题

#### 1. 部署失败

```bash
# 检查 wrangler.toml 配置
wrangler deployments list

# 查看详细错误
npm run deploy -- --verbose
```

#### 2. 数据库连接失败

确保 `wrangler.toml` 中的 `database_id` 正确，且已执行 `npm run db:push`。

#### 3. 图片上传失败

1. 检查 R2 CORS 配置
2. 检查 R2 bucket 名称是否正确
3. 查看 Cloudflare Dashboard 的 R2 日志

#### 4. 后台无法登录

1. 确认已创建管理员账户
2. 检查密码哈希是否正确生成
3. 尝试重新插入管理员数据

#### 5. 邮件发送失败

1. 确认已配置 `EMAIL_API_KEY` 环境变量
2. 检查 `ADMIN_EMAIL` 是否正确
3. 查看 Cloudflare Workers 日志

### 查看日志

```bash
# 查看实时日志
wrangler tail
```

---

## 域名配置

### 1. 添加域名到 Cloudflare

1. 登录 Cloudflare Dashboard
2. 点击 **Add a Site**
3. 按照指引添加域名

### 2. 配置 DNS 记录

添加 CNAME 记录指向你的 Worker：

| 类型 | 名称 | 内容 | 代理状态 |
|------|------|------|----------|
| CNAME | @ | your-worker.subdomain.workers.dev | Proxied |

### 3. 部署自定义域名

```bash
wrangler routes update
```

或在 `wrangler.toml` 中配置：

```toml
[[routes]]
pattern = "yourdomain.com"
```

---

## 安全建议

1. **限制 R2 CORS**：生产环境将 `AllowedOrigins` 改为实际域名
2. **定期更换密码**：定期更新管理员密码
3. **启用 HTTPS**：Cloudflare 自动提供免费 HTTPS
4. **限制后台访问**：可通过 IP 白名单进一步限制

---

## 技术支持

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Hono 框架文档](https://hono.dev/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)

---

## 更新日志

### v1.1.0
- 新增首页幻灯片功能
- 新增 Get a Quote 弹出框
- 新增 JSON-LD 结构化数据
- 新增 LLMs.txt
- 新增可配置的 Robots.txt
- 迁移到 Tailwind CSS + jQuery + Iconify
- 新增 Leads 管理

### v1.0.0
- 初始版本
- 产品、分类、询盘管理
- 基础 SEO 功能

---

## License

MIT