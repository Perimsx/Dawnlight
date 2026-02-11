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
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

<br/>

<kbd>[特性](#-核心特性)</kbd> · <kbd>[快速开始](#-快速开始)</kbd> · <kbd>[部署](#-部署指南)</kbd> · <kbd>[配置](#-配置)</kbd>

</div>

<br/>

## 📖 简介

> 💡 **灵感来源**：[纸鹿 blog-v3](https://github.com/L33Z22L11/blog-v3)

**Dawnlight** 是基于 Nuxt 4 的现代化博客系统，采用 SSR 渲染 + 文件存储，兼顾性能与体验。

### 技术选型

| 层级 | 技术 |
|:---:|------|
| **后端** | Nuxt 4 + Nitro |
| **前端** | Vue 3 + TypeScript |
| **存储** | JSON + Markdown |
| **渲染** | Marked.js + KaTeX + Highlight.js |

---

## ✨ 核心特性

- **📝 内容系统** — Markdown 驱动、全文搜索、精选文章、归档分类、标签云、阅读进度、自动 TOC
- **💬 互动功能** — 三态审核评论、QQ 头像、IP 归属地、友链系统、Toast 通知
- **🎨 视觉设计** — 毛玻璃风格、三段式主题、代码双色高亮、精细动画、全平台响应式
- **🛡️ 安全机制** — PBKDF2 密码存储、XSS 防护、CSRF 防护、速率限制
- **⚡ 性能优化** — 前后端缓存、懒加载、原子写入、ETag 缓存

---

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18.0.0
- npm ≥ 9.0.0

### 安装运行

```bash
# 克隆项目
git clone https://github.com/Perimsx/Dawnlight.git
cd Dawnlight

# 安装依赖
npm install

# 启动开发服务
npm run dev
```

访问 `http://localhost:3000` 查看前台，`http://localhost:3000/admin` 进入管理后台。

### NPM 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式 |
| `npm run build` | 生产构建 |
| `npm run preview` | 预览构建 |
| `npm run generate` | 静态生成 |

---

## 📦 部署指南

### Vercel / Netlify（推荐）

Fork 仓库后直接导入到 [Vercel](https://vercel.com) 或 [Netlify](https://netlify.com)，平台会自动检测 Nuxt 项目并配置。

**Vercel 一键部署：**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Perimsx/Dawnlight)

### VPS 服务器

```bash
# 安装 PM2
npm install -g pm2

# 构建项目
npm run build

# 启动服务
pm2 start .output/server/index.mjs --name dawnlight
pm2 startup && pm2 save
```

**Nginx 反向代理配置：**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**HTTPS 配置（Let's Encrypt）：**

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

### Docker

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
ENV HOST=0.0.0.0 PORT=3000
EXPOSE 3000
CMD ["node", "server/index.mjs"]
```

```bash
docker build -t dawnlight .
docker run -p 3000:3000 dawnlight
```

### 部署检查清单

- [ ] 修改 `config/site.json` 站点信息
- [ ] 确保 `storage/data/` 目录可写
- [ ] 配置 HTTPS 证书
- [ ] 设置数据备份计划

---

## ⚙️ 配置

### 站点配置

编辑 `config/site.json`：

```json
{
  "site": {
    "name": "您的博客名称",
    "title": "博客标题",
    "slogan": "博客口号"
  },
  "author": {
    "name": "您的名字",
    "bio": "简介",
    "avatar": "头像URL"
  },
  "siteInfo": {
    "startTime": "2024-01-01",
    "icp": "备案号",
    "domain": "域名"
  }
}
```

### 创建文章

文章存放在 `content/posts/` 目录，命名规则：`post-{timestamp}-{slug}.md`

```markdown
---
title: 文章标题
date: 2024-01-01
category: technology
tags: ["tag1", "tag2"]
featured: true
---

# 文章内容

使用 Markdown 编写内容，支持 GFM、KaTeX 公式、代码高亮。
```

### 目录结构

```
├── app/              # 前端源码（components/pages/layouts）
├── server/           # 后端 API（middleware/utils）
├── content/posts/    # Markdown 文章
├── config/           # 配置文件
├── storage/data/     # 运行时数据（评论、日志）
└── public/           # 静态资源
```

---

## 🛡️ 安全机制

| 机制 | 实现 |
|------|------|
| 密码存储 | PBKDF2 (SHA-512) |
| XSS 防护 | DOMPurify + CSP |
| CSRF 防护 | Origin/Referer 验证 |
| 速率限制 | 全局 + 写操作分离 |
| 原子写入 | 临时文件 + rename |

---

## 🎛️ 管理后台

访问 `/admin` 进入后台管理：

- **仪表盘** — 数据概览、图表统计
- **文章管理** — 双视图、Markdown 编辑器、自动保存
- **评论管理** — 状态筛选、批量审核、IP 归属地
- **站点设置** — 8 大模块配置
- **操作日志** — 多维过滤、CSV 导出

---

## 📁 备份建议

```bash
# 定期备份重要目录
tar -czf backup_$(date +%Y%m%d).tar.gz \
    storage/data/ \
    content/posts/ \
    config/
```

---

## ❓ 常见问题

<details>
<summary><b>如何修改管理员密码？</b></summary>

登录后台 → 站点设置 → 密码修改
</details>

<details>
<summary><b>如何自定义主题色？</b></summary>

编辑 `app/assets/css/style.css` 中的 CSS 变量
</details>

<details>
<summary><b>如何重置配置？</b></summary>

登录后台 → 站点设置 → 配置重置
</details>

---

## 🙏 致谢

灵感来自 [纸鹿 blog-v3](https://github.com/L33Z22L11/blog-v3)

感谢以下开源项目：

[Nuxt](https://nuxt.com/) · [Vue](https://vuejs.org/) · [TypeScript](https://www.typescriptlang.org/) · [Marked.js](https://marked.js.org/) · [Highlight.js](https://highlightjs.org/) · [KaTeX](https://katex.org/) · [Chart.js](https://www.chartjs.org/) · [DOMPurify](https://github.com/cure53/DOMPurify)

---

## 📄 许可证

[MIT License](LICENSE)

---

<div align="center">

**Made with ❤️ by [Perimsx](https://github.com/Perimsx)**

Email: Perimsx@qq.com

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:d97706,35:271a0a,100:0c0a09&height=100&section=footer" width="100%" />

</div>
