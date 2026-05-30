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

## 快速开始（Git 自动部署）

### 1. Fork 仓库

将本仓库 Fork 到你的 GitHub 账号下：

```
https://github.com/你的用户名/B2B-Wholesale-Site
```

### 2. 在 Cloudflare 创建资源

#### 创建 D1 数据库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **D1** > **Create Database**
3. 输入数据库名称：`b2b_wholesale_db`
4. 点击 **Create**

#### 创建 R2 Bucket

1. 进入 **R2** > **Create Bucket**
2. 输入 Bucket 名称：`b2b-wholesale-media`
3. 点击 **Create Bucket**

#### 配置 R2 CORS

1. 进入 **R2** > **b2b-wholesale-media** > **Settings**
2. 找到 **CORS Policy**，点击 **Edit**
3. 添加以下配置：

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

#### 初始化数据库

1. 进入 **D1** > **b2b_wholesale_db** > **Query**
2. 复制 `src/db/schema.sql` 文件内容
3. 粘贴到查询框中执行

### 3. 创建管理员账户

#### 生成密码哈希

访问在线 bcrypt 工具（如 https://bcrypt.online/）生成密码哈希，或使用本地 Node.js：

```bash
node -e "const bcrypt = require('bcryptjs'); const hash = bcrypt.hashSync('你的密码', 10); console.log(hash);"
```

#### 插入管理员数据

在 D1 查询界面执行：

```sql
INSERT INTO admins (username, password_hash, created_at) VALUES ('admin', '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', datetime('now'));
```

将 `$2b$10$...` 替换为上一步生成的哈希值。

### 4. 连接 GitHub 仓库

1. 进入 Cloudflare **Workers & Pages**
2. 点击 **Create application** > **Create Worker**
3. 输入 Worker 名称：`b2b-wholesale-site`
4. 点击 **Create**
5. 在 Worker 页面，点击 **Settings** > **Git** > **Connect GitHub**
6. 选择你 Fork 的仓库
7. 配置构建设置：
   - **Build command**: （留空）
   - **Build output directory**: （留空）
   - **Root directory**: （留空）

### 5. 配置 Worker 绑定

在 Worker 页面，点击 **Settings** > **Variables**：

#### 添加 D1 数据库绑定

| 变量名 | 值 |
|--------|-----|
| 名称 | `DB` |
| 类型 | **D1 Database** |
| 数据库 | `b2b_wholesale_db` |

#### 添加 R2 存储绑定

| 变量名 | 值 |
|--------|-----|
| 名称 | `MEDIA` |
| 类型 | **R2 Bucket** |
| Bucket | `b2b-wholesale-media` |

#### 添加环境变量（可选）

| 变量名 | 值 |
|--------|-----|
| `EMAIL_API_KEY` | Mailchannels API Key |
| `ADMIN_EMAIL` | 管理员邮箱 |
| `SITE_URL` | 你的网站域名 |

### 6. 自动部署

1. 在 GitHub 上修改代码并提交推送
2. Cloudflare 会自动触发部署
3. 等待部署完成（约 1-2 分钟）
4. 访问 Worker 提供的默认域名测试

### 7. 绑定自定义域名

1. 在 Worker 页面点击 **Triggers** > **Custom Domains**
2. 添加你的域名（如 `www.yourdomain.com`）

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

由于采用 Git 自动部署，代码更新流程如下：

```bash
# 1. 克隆仓库（如首次）
git clone https://github.com/你的用户名/B2B-Wholesale-Site.git
cd B2B-Wholesale-Site

# 2. 创建开发分支
git checkout -b feature/xxx

# 3. 修改代码后提交
git add .
git commit -m "描述你的修改"

# 4. 推送到 GitHub，自动触发部署
git push origin main
```

---

## 本地开发（可选）

如果需要在本地测试：

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# TypeScript 类型检查
npm run typecheck
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

在 Worker 设置中启用 **Cache API**：

1. **Workers & Pages** > 你的 Worker > **Settings** > **Caching**
2. 配置合适的缓存规则

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

在 Cloudflare Dashboard 查看部署状态和错误：

1. 进入 **Workers & Pages** > 你的 Worker
2. 点击 **Deployments** 查看部署历史
3. 点击具体部署查看错误日志

#### 2. 数据库连接失败

1. 确认 D1 绑定已正确配置（名称必须为 `DB`）
2. 确认数据库已初始化（执行了 schema.sql）

#### 3. 图片上传失败

1. 检查 R2 CORS 配置
2. 检查 R2 绑定名称是否正确（`MEDIA`）
3. 查看 Worker 日志排查问题

#### 4. 后台无法登录

1. 确认已在 D1 中创建管理员账户
2. 检查密码哈希是否正确
3. 在 D1 查询界面验证数据：`SELECT * FROM admins`

#### 5. 邮件发送失败

1. 确认已配置 `EMAIL_API_KEY` 环境变量
2. 检查 `ADMIN_EMAIL` 是否正确
3. 查看 Worker 日志

### 查看日志

在 Cloudflare Dashboard：
1. **Workers & Pages** > 你的 Worker
2. 点击 **Logs** > **Real-time** 查看实时日志

---

## 域名配置

### 1. 添加域名到 Cloudflare

1. 登录 Cloudflare Dashboard
2. 点击 **Add a Site**
3. 按照指引添加域名

### 2. 绑定自定义域名到 Worker

1. 进入 **Workers & Pages** > 你的 Worker
2. 点击 **Triggers** > **Custom Domains**
3. 点击 **Add Custom Domain**
4. 输入你的域名（如 `www.yourdomain.com`）
5. Cloudflare 会自动配置必要的 DNS 记录

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