<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0c0a09,35:271a0a,100:d97706&height=220&text=Dawnlight&fontSize=72&fontColor=fef3c7&fontAlignY=35&desc=Modern%20Lightweight%20Blog%20System&descSize=16&descAlignY=55&descColor=a68a5b&animation=fadeIn" width="100%" alt="Dawnlight Banner"/>

<br/>

**轻量 · 高性能 · 现代化 · Markdown 驱动**

<br/>

[![Node](https://img.shields.io/badge/Node.js-≥18-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?style=flat-square&logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Demo](https://img.shields.io/badge/Demo-chenguitao.com-10B981?style=flat-square&logo=vercel&logoColor=white)](https://chenguitao.com)
[![Author](https://img.shields.io/badge/Author-Perimsx-orange?style=flat-square)](https://github.com/Perimsx)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/Perimsx/Dawnlight/pulls)

<br/>

<kbd>[项目简介](#-项目简介)</kbd> · <kbd>[核心特性](#-核心特性)</kbd> · <kbd>[快速开始](#-快速开始)</kbd> · <kbd>[部署指南](#-部署指南)</kbd> · <kbd>[技术架构](#-技术架构)</kbd> · <kbd>[管理后台](#-管理后台)</kbd>

</div>

<br/>

## 项目简介

> **灵感来源**：本项目由 [纸鹿 blog-v3](https://github.com/L33Z22L11/blog-v3) 启发，感谢原作者的创意与贡献。

> **Dawnlight** — 基于 Nuxt 4 的现代化博客系统，SSR 渲染 + 文件存储，兼顾性能与体验。

<table>
<tr>
<td width="50%">

**技术选型**

- **后端** — Nuxt 4 + Nitro Server
- **前端** — Vue 3 + TypeScript
- **存储** — JSON + Markdown 文件系统
- **部署** — Vercel / Netlify / Docker

</td>
<td width="50%">

**设计理念**

- SSR 首屏渲染，SEO 友好
- 后台 SPA，交互流畅
- 玻璃拟态视觉 + 三段式主题
- 全平台响应式适配

</td>
</tr>
</table>

```
┌─────────────────────────────────────────────────────────────┐
│  前台（SSR + Vue Hydration）── Nuxt 页面路由 ──┐             │
│                                                   ├── Nitro API
│  管理后台（Client-side SPA）── 独立路由 ───────┘    │
│                                                     ├── JSON 文件存储
│  Markdown 文章 + JSON 配置 ───────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 核心特性

<table>
<tr>
<td width="33%" valign="top">

### 内容系统

- **Markdown 驱动** — GFM 语法 + 数学公式（KaTeX）+ 代码高亮（100+ 语言）
- **全文搜索** — 关键词搜索 + 高亮片段
- **精选文章** — 首页横向滚动卡片
- **归档系统** — 按年月分组，多维排序
- **标签云 + 分类** — 聚合视图 + 动画
- **阅读进度** — 顶部进度条 + 百分比
- **目录生成** — 自动 TOC，滚动高亮

</td>
<td width="33%" valign="top">

### 互动系统

- **文章评论** — QQ 头像 + 三态审核 + 防刷
- **客户端识别** — IP 归属地 + 浏览器/系统图标
- **Toast 通知** — 精美消息提示
- **友链系统** — 分组管理 + 多种卡片样式

</td>
<td width="33%" valign="top">

### 视觉设计

- **毛玻璃风格** — Glassmorphism 设计语言
- **三段式主题** — 亮色 / 暗色 / 跟随系统
- **代码主题** — 亮暗双色语法高亮
- **精细动画** — 卡片滑入 · 弹性曲线
- **响应式布局** — 桌面 / 平板 / 手机完美适配

</td>
</tr>
</table>

### 完美移动端

| 特性 | 实现 |
|:---:|:---|
| **四级断点** | 1024px（平板）/ 768px（手机）/ 375px（小屏）/ 横屏 |
| **专属组件** | 底部 Tab 栏 · 侧滑菜单 · 浮动按钮 |
| **触摸优化** | 44px 最小触摸目标 · `:active` 反馈 |
| **无障碍** | 尊重 `prefers-reduced-motion` 系统设置 |

---

## 快速开始

### 环境要求

| | 要求 |
|:---:|:---|
| ![Node](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | >= 18.0.0 |
| ![npm](https://img.shields.io/badge/-npm-CB3837?style=flat-square&logo=npm&logoColor=white) | >= 9.0.0 |
| ![OS](https://img.shields.io/badge/-System-4479A1?style=flat-square&logo=linux&logoColor=white) | Windows / Linux / macOS |

### 一键安装

```bash
# 1. 克隆项目
git clone https://github.com/Perimsx/Dawnlight.git
cd Dawnlight

# 2. 安装依赖
npm install

# 3. 启动服务
npm run dev
```

<table>
<tr>
<td><b>前台</b></td>
<td><code>http://localhost:3000</code></td>
</tr>
<tr>
<td><b>后台</b></td>
<td><code>http://localhost:3000/admin</code></td>
</tr>
</table>

### NPM 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式（热重载） |
| `npm run build` | 生产环境构建 |
| `npm run preview` | 预览生产构建 |
| `npm run generate` | 生成静态站点 |

---

## 部署指南

### 1. Vercel 部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Perimsx/Dawnlight)

<details>
<summary><b>详细步骤</b></summary>

1. Fork 本仓库到你的 GitHub 账号
2. 访问 [Vercel](https://vercel.com)
3. 点击 "New Project"
4. 导入你 Fork 的仓库
5. Vercel 会自动检测 Nuxt 项目并配置构建设置
6. 点击 "Deploy" 开始部署
7. 部署完成后，你将获得一个 `*.vercel.app` 域名

**环境变量（可选）：**

```env
NODE_ENV=production
```

</details>

### 2. Netlify 部署

<details>
<summary><b>详细步骤</b></summary>

1. Fork 本仓库到你的 GitHub 账号
2. 访问 [Netlify](https://netlify.com)
3. 点击 "Add new site" → "Import an existing project"
4. 选择你的 GitHub 仓库
5. 配置构建设置：

```yaml
Build command: npm run build
Publish directory: .output/public
```

6. 点击 "Deploy site"
7. 部署完成后，你将获得一个 `*.netlify.app` 域名

</details>

### 3. Docker 部署

<details>
<summary><b>Dockerfile 配置</b></summary>

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.output ./
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server/index.mjs"]
```

**构建并运行：**

```bash
# 构建镜像
docker build -t dawnlight .

# 运行容器
docker run -p 3000:3000 dawnlight
```

</details>

### 4. VPS 服务器部署

<details>
<summary><b>PM2 + Nginx 配置</b></summary>

**使用 PM2 进程管理：**

```bash
# 安装 PM2
npm install -g pm2

# 构建项目
npm run build

# 使用 PM2 启动
pm2 start .output/server/index.mjs --name dawnlight

# 设置开机自启
pm2 startup
pm2 save
```

**重要提醒 - 文件存储权限：**

由于项目使用文件系统存储（JSON文件），请确保运行用户对以下目录有读写权限：

```bash
# 确保 storage/data 目录存在且可写
mkdir -p storage/data
chmod 755 storage/data
chown -R www-data:www-data storage/data  # 根据实际用户调整

# 确保 content/posts 目录可读
chmod 755 content/posts
```

**Nginx 反向代理：**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**配置 HTTPS（Let's Encrypt）：**

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

</details>

### 5. 静态站点部署

<details>
<summary><b>静态托管服务</b></summary>

如果使用静态生成模式：

```bash
# 生成静态站点
npm run generate
```

将 `.output/public` 目录部署到：

- **GitHub Pages**：推送到 `gh-pages` 分支
- **Cloudflare Pages**：直接连接 GitHub 仓库
- **阿里云 OSS / 腾讯云 COS**：上传静态文件

</details>

### 部署检查清单

部署前请确认：

- [ ] 修改 `config/site.json` 中的站点信息
- [ ] 设置正确的站点 URL
- [ ] 更新作者信息和联系方式
- [ ] 检查环境变量配置
- [ ] 确保 `storage/data/` 目录可写
- [ ] 配置好 HTTPS（推荐使用 Let's Encrypt）
- [ ] 设置适当的缓存策略
- [ ] 制定数据备份计划

### 数据备份建议

由于使用文件系统存储，建议定期备份以下目录：

```bash
# 备份脚本示例
#!/bin/bash
date_str=$(date +%Y%m%d_%H%M%S)
tar -czf backup_$date_str.tar.gz \
    storage/data/ \
    content/posts/ \
    config/

# 保留最近7天的备份
find . -name "backup_*.tar.gz" -mtime +7 -delete
```

**备份内容：**
- `storage/data/` - 评论和日志数据
- `content/posts/` - 文章内容
- `config/` - 站点配置文件

---

## 技术架构

### 技术栈

<p>
<img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/Nuxt-4.x-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white"/>
<img src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white"/>
<img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Markdown-GFM-000000?style=for-the-badge&logo=markdown&logoColor=white"/>
<img src="https://img.shields.io/badge/KaTeX-Math-47A141?style=for-the-badge&logo=latex&logoColor=white"/>
<img src="https://img.shields.io/badge/Chart.js-4.x-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white"/>
</p>

| 层级 | 技术 | 说明 |
|:---:|------|------|
| 后端 | Nuxt 4 + Nitro | SSR + API 路由 |
| 前端 | Vue 3 + TypeScript | 组件化 + Composition API |
| 存储 | JSON + Markdown | 文件系统存储 |
| 渲染 | Marked.js | GFM Markdown 渲染 |
| 高亮 | Highlight.js | 100+ 语言支持 |
| 公式 | KaTeX | LaTeX 公式渲染 |
| 净化 | DOMPurify | HTML XSS 防护 |
| 图表 | Chart.js | 后台数据可视化 |

### 项目结构

<details>
<summary><b>展开完整目录树</b></summary>

```
Dawnlight/
├── [DIR]  app/                          # Nuxt 源码目录
│   ├── [DIR]  assets/                      # 静态资源
│   │   └── [DIR]  css/                     # 样式文件
│   │       ├── [CSS] style.css            # 全局样式
│   │       ├── [CSS] post-style.css       # 文章页样式
│   │       └── [CSS] admin-style.css      # 后台样式
│   ├── [DIR]  components/                  # Vue 组件
│   │   ├── [VUE] TheGlobalElements.vue    # 全局元素
│   │   ├── [VUE] TheMobileSidebar.vue     # 移动端侧边栏
│   │   ├── [VUE] TheSidebarLeft.vue       # 左侧边栏
│   │   ├── [VUE] TheSidebarRight.vue      # 右侧边栏
│   │   └── [VUE] TheThemeSwitcher.vue     # 主题切换器
│   ├── [DIR]  composables/                 # 组合式函数
│   │   ├── [TS]  usePosts.ts             # 文章逻辑
│   │   ├── [TS]  useMarkdown.ts          # Markdown 渲染
│   │   ├── [TS]  useAdmin.ts             # 后台逻辑
│   │   ├── [TS]  useAdminUI.ts           # 后台 UI
│   │   ├── [TS]  useSiteConfig.ts        # 站点配置
│   │   ├── [TS]  useClientIcons.ts       # 客户端图标
│   │   └── [TS]  useContentEnhance.ts    # 内容增强
│   ├── [DIR]  layouts/                     # 布局模板
│   │   ├── [VUE] default.vue              # 默认布局
│   │   └── [VUE] admin.vue                # 管理后台布局
│   ├── [DIR]  pages/                       # 页面路由
│   │   ├── [DIR]  admin/                   # 后台管理
│   │   │   ├── [VUE] index.vue            # 后台首页
│   │   │   ├── [VUE] login.vue            # 登录页
│   │   │   ├── [DIR]  posts/              # 文章管理
│   │   │   │   ├── [VUE] index.vue        # 文章列表
│   │   │   │   └── [VUE] edit.vue         # 文章编辑
│   │   │   ├── [VUE] comments.vue         # 评论管理
│   │   │   ├── [VUE] links.vue            # 友链管理
│   │   │   ├── [VUE] settings.vue         # 设置
│   │   │   └── [VUE] logs.vue             # 操作日志
│   │   ├── [VUE] archives.vue             # 归档页
│   │   ├── [VUE] categories.vue           # 分类页
│   │   ├── [DIR]  category/               # 分类详情
│   │   │   └── [VUE] [tag].vue            # 动态路由
│   │   ├── [VUE] index.vue                # 首页
│   │   ├── [VUE] links.vue                # 友链页
│   │   └── [DIR]  post/                   # 文章页
│   │       └── [VUE] [id].vue             # 动态路由
│   └── [VUE] app.vue                      # 根组件
├── [DIR]  server/                       # 服务端代码
│   ├── [DIR]  api/                         # API 路由
│   │   ├── [DIR]  auth/                    # 认证接口
│   │   │   ├── [TS]  login.post.ts        # 登录
│   │   │   ├── [TS]  logout.post.ts       # 登出
│   │   │   ├── [TS]  password.put.ts      # 修改密码
│   │   │   └── [TS]  verify.get.ts        # 验证登录
│   │   ├── [DIR]  posts/                   # 文章接口
│   │   │   ├── [TS]  index.get.ts         # 获取列表
│   │   │   ├── [TS]  index.post.ts        # 创建文章
│   │   │   ├── [DIR]  [id]/               # 动态路由
│   │   │   │   ├── [TS]  index.get.ts     # 获取元数据
│   │   │   │   ├── [TS]  content.get.ts   # 获取内容
│   │   │   │   ├── [TS]  index.put.ts     # 更新文章
│   │   │   │   ├── [TS]  index.delete.ts  # 删除文章
│   │   │   │   └── [TS]  toggle-featured.post.ts  # 切换精选
│   │   ├── [DIR]  comments/                # 评论接口
│   │   │   ├── [TS]  index.get.ts         # 获取所有评论
│   │   │   ├── [DIR]  [postId]/           # 动态路由
│   │   │   │   ├── [TS]  index.get.ts     # 获取文章评论
│   │   │   │   ├── [TS]  index.post.ts    # 提交评论
│   │   │   │   ├── [DIR]  [id]/           # 动态路由
│   │   │   │   │   ├── [TS]  index.put.ts     # 审核评论
│   │   │   │   │   └── [TS]  index.delete.ts  # 删除评论
│   │   │   └── [DIR]  batch/              # 批量操作
│   │   │       ├── [TS]  status.put.ts    # 批量审核
│   │   │       └── [TS]  delete.post.ts   # 批量删除
│   │   ├── [DIR]  links/                   # 友链接口
│   │   │   ├── [TS]  index.get.ts         # 获取列表
│   │   │   ├── [TS]  index.post.ts        # 添加友链
│   │   │   ├── [TS]  info.get.ts          # 获取申请说明
│   │   │   ├── [TS]  info.put.ts          # 更新申请说明
│   │   │   └── [DIR]  [name]/             # 动态路由
│   │   │       ├── [TS]  index.put.ts     # 更新友链
│   │   │       └── [TS]  index.delete.ts  # 删除友链
│   │   ├── [TS]  config.get.ts            # 获取配置
│   │   ├── [TS]  config.put.ts            # 更新配置
│   │   ├── [TS]  reset.post.ts            # 重置配置
│   │   ├── [DIR]  logs/                   # 日志接口
│   │   │   ├── [TS]  index.get.ts         # 获取日志
│   │   │   ├── [TS]  index.post.ts        # 添加日志
│   │   │   ├── [TS]  export.get.ts        # 导出日志
│   │   │   └── [TS]  clear.delete.ts      # 清空日志
│   │   ├── [TS]  stats.get.ts             # 获取统计数据
│   │   └── [DIR]  proxy/                  # 代理接口
│   │       ├── [TS]  image.get.ts         # 图片代理
│   │       └── [TS]  qq-avatar.get.ts     # QQ 头像代理
│   ├── [DIR]  middleware/                  # 中间件
│   │   └── [TS]  auth.ts                  # 认证中间件
│   └── [DIR]  utils/                       # 工具函数
│       ├── [TS]  storage.ts               # 文件存储操作
│       ├── [TS]  auth.ts                  # 认证工具
│       ├── [TS]  logs.ts                  # 日志工具
│       ├── [TS]  helpers.ts               # 辅助函数
│       ├── [TS]  clientInfo.ts            # 客户端信息
│       ├── [TS]  proxy.ts                 # 代理工具
│       └── [TS]  fs.ts                    # 文件系统工具
├── [DIR]  content/                      # 内容存储
│   └── [DIR]  posts/                       # Markdown 文章
├── [DIR]  config/                       # 配置文件
│   ├── [JSON] site.json                   # 站点配置
│   ├── [JSON] auth.json                   # 认证配置
│   ├── [JSON] default-site.json           # 默认配置
│   └── [BAK]  *.backup.*                  # 配置备份
├── [DIR]  storage/                      # 数据存储
│   ├── [DIR]  data/                        # 运行时数据
│   │   ├── [JSON] comments.json            # 评论数据
│   │   └── [JSON] logs.json                # 操作日志
│   └── [DIR]  cache/                       # 缓存文件
├── [DIR]  public/                       # 公共静态资源
│   ├── [ICO]  favicon.ico                  # 网站图标
│   ├── [DIR]  images/                      # 图片资源
│   └── [JS]   sw.js                        # Service Worker
├── [TS]    nuxt.config.ts               # Nuxt 配置
├── [JSON]  package.json                 # 项目配置
├── [TS]    tsconfig.json                # TypeScript 配置
└── [MD]    README.md                    # 项目说明
```

**图标说明：**
- `[DIR]`  目录
- `[VUE]`  Vue 组件
- `[TS]`   TypeScript 文件
- `[JSON]` JSON 配置文件
- `[CSS]`  样式文件
- `[JS]`   JavaScript 文件
- `[MD]`   Markdown 文档
- `[ICO]`  图标文件
- `[BAK]`  备份文件

</details>

### API 端点

<details>
<summary><b>展开完整 API 列表</b></summary>

```
健康检查
GET    /api/health

认证 (4)
POST   /api/auth/login                    登录
POST   /api/auth/logout                   登出
POST   /api/auth/change-password          修改密码
GET    /api/auth/client-info              获取客户端信息

文章 (8)
GET    /api/posts                         文章列表
GET    /api/posts/search                  全文搜索
GET    /api/posts/:id                     文章元数据
GET    /api/posts/:id/content             文章内容
POST   /api/posts                         创建文章 [需认证]
PUT    /api/posts/:id                     更新文章 [需认证]
DELETE /api/posts/:id                     删除文章 [需认证]
POST   /api/posts/:id/toggle-featured     切换精选 [需认证]

评论 (7)
GET    /api/comments                      所有评论 [需认证]
GET    /api/comments/:postId              文章评论（仅已通过）
POST   /api/comments/:postId             提交评论
PUT    /api/comments/:postId/:id          审核评论 [需认证]
DELETE /api/comments/:postId/:id          删除评论 [需认证]
PUT    /api/comments/batch/status         批量审核 [需认证]
POST   /api/comments/batch/delete         批量删除 [需认证]

友链 (6)
GET    /api/links                         友链列表
GET    /api/links/info                    申请说明
POST   /api/links                         添加友链 [需认证]
PUT    /api/links/:name                   更新友链 [需认证]
PUT    /api/links/info                    更新申请说明 [需认证]
DELETE /api/links/:name                   删除友链 [需认证]

站点配置 (3)
GET    /api/config                        获取配置
PUT    /api/config                        更新配置（自动备份）[需认证]
POST   /api/config/reset                  重置默认配置 [需认证]

统计 (1)
GET    /api/author/stats                  统计数据

日志 (4)
GET    /api/logs                          日志列表 [需认证]
POST    /api/logs                          添加日志 [需认证]
DELETE /api/logs                          清空日志 [需认证]
GET    /api/logs/export                   导出 CSV [需认证]

代理 (2)
GET    /api/proxy/image                   图片代理
GET    /api/proxy/qq-avatar               QQ 头像代理
```

</details>

---

## 安全机制

<table>
<tr>
<td width="50%">

### 认证与加密

| 机制 | 实现 |
|------|------|
| 密码存储 | PBKDF2 (SHA-512) |
| 时间攻击防护 | `crypto.timingSafeEqual` |
| 登录限制 | 速率限制 + 会话管理 |
| XSS 防护 | DOMPurify + CSP |
| CSRF | Origin/Referer 验证 |

</td>
<td width="50%">

### 基础设施防护

| 机制 | 实现 |
|------|------|
| CSP | Helmet 精细配置 |
| 限速 | 全局 + 写操作分开 |
| 输入验证 | 长度 / 格式校验 |
| 安全头 | X-Content-Type / X-Frame |
| 原子写入 | 临时文件 + rename |

</td>
</tr>
</table>

---

## 管理后台

<table>
<tr>
<td width="50%" valign="top">

### 控制台仪表盘
- 数据概览卡片（文章/字数/浏览）
- Chart.js 图表（趋势/标签）
- 对比分析（环比/同比）
- 实时数据刷新

### 文章管理
- 双视图（网格/列表）
- Markdown 编辑器
- 自动保存 + 字数统计

### 评论管理
- 状态筛选 + 批量审核
- QQ 头像 / IP / 归属地详情

</td>
<td width="50%" valign="top">

### 站点设置（八大模块）
1. 基础信息 — 名称/标题/口号
2. 作者信息 — 姓名/简介/头像
3. 站点信息 — 建站时间/备案/域名
4. 社交媒体 — 链接管理
5. 公告管理 — 多类型
6. 建站日志 — 日期 + 预览
7. 密码修改 — 后台直接修改
8. 配置重置 — 恢复默认

### 操作日志
- 多种操作类型
- 多维过滤 + 详情
- CSV / JSON 导出

</td>
</tr>
</table>

---

## 性能优化

<table>
<tr>
<td width="50%">

### 前端

- **API 缓存** — GET 请求缓存
- **防抖节流** — 搜索优化
- **图片懒加载** — 视口加载
- **主题持久化** — 防闪烁

</td>
<td width="50%">

### 后端

- **配置热缓存** — TTL 缓存
- **静态资源** — ETag 缓存
- **图片代理** — 浏览器缓存
- **原子写入** — 防损坏

</td>
</tr>
</table>

---

## 配置

编辑 `config/site.json` 自定义您的博客：

```json
{
  "site": {
    "name": "您的博客名称",
    "title": "您的博客标题",
    "slogan": "您的博客口号",
    "logo": "https://your-logo-url.com/logo.png",
    "favicon": "/favicon.ico"
  },
  "author": {
    "name": "您的名字",
    "bio": "您的简介",
    "email": "your@email.com",
    "avatar": "https://your-avatar-url.com/avatar.png"
  },
  "siteInfo": {
    "startTime": "2024-01-01",
    "icp": "您的备案号",
    "domain": "yourdomain.com"
  }
}
```

**存储目录说明：**

```
storage/
├── data/              # 运行时数据（需写权限）
│   ├── comments.json   # 评论数据
│   └── logs.json       # 操作日志
└── cache/             # 缓存文件（自动创建）

content/
├── posts/             # Markdown 文章（只读）
│   ├── list.json       # 文章索引
│   └── *.md            # 文章内容
└── config/            # 配置文件
```

**重要提醒：**
- `storage/data/` 目录必须可写，用于存储评论和日志
- `content/posts/` 目录建议只读，防止意外修改
- 部署时请备份 `storage/data/` 目录以防数据丢失

## 创建文章

文章以 Markdown 文件形式存储在 `content/posts/` 目录，命名规则：

```
post-{timestamp}-{slug}.md
```

示例文章结构：

```markdown
---
title: 您的文章标题
date: 2024-01-01
category: technology
tags: ["tag1", "tag2"]
featured: true
---

# 文章内容

在此处使用 Markdown 编写您的内容。
```

---

## 常见问题

<details>
<summary><b>如何修改管理员密码？</b></summary>

登录后台 → 站点设置 → 密码修改。

</details>

<details>
<summary><b>如何配置 HTTPS？</b></summary>

推荐 Nginx 反向代理 + Let's Encrypt 免费证书，参考上方[部署章节](#-部署指南)。

</details>

<details>
<summary><b>如何自定义主题色？</b></summary>

编辑 `app/assets/css/style.css` 中的 `:root`（亮色）和 `[data-theme="dark"]`（暗色）CSS 变量。

</details>

---

## 致谢

<p>
<a href="https://nuxt.com/"><img src="https://img.shields.io/badge/Nuxt-00DC82?style=flat-square&logo=nuxt.js&logoColor=white" alt="Nuxt"/></a>
<a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-4FC08D?style=flat-square&logo=vue.js&logoColor=white" alt="Vue"/></a>
<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/></a>
<a href="https://marked.js.org/"><img src="https://img.shields.io/badge/Marked.js-000?style=flat-square&logo=markdown" alt="Marked.js"/></a>
<a href="https://highlightjs.org/"><img src="https://img.shields.io/badge/Highlight.js-3C4C5A?style=flat-square" alt="Highlight.js"/></a>
<a href="https://katex.org/"><img src="https://img.shields.io/badge/KaTeX-47A141?style=flat-square" alt="KaTeX"/></a>
<a href="https://www.chartjs.org/"><img src="https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white" alt="Chart.js"/></a>
<a href="https://github.com/cure53/DOMPurify"><img src="https://img.shields.io/badge/DOMPurify-5B21B6?style=flat-square" alt="DOMPurify"/></a>
</p>

---

## 协议

MIT License

---

<div align="center">

**Made with by [Perimsx](https://github.com/Perimsx)**

Email: Perimsx@qq.com

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:d97706,35:271a0a,100:0c0a09&height=100&section=footer" width="100%" />

</div>
