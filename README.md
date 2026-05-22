# TermSpark —— 设计术语灵感剪切板

一个搜集设计灵感的时间线工具。粘贴设计截图，AI 自动生成设计术语关键词，所有内容按时间线排列。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Framer Motion |
| 后端 | Node.js + Express 5 |
| 数据库 | PostgreSQL + Drizzle ORM |
| AI | oMLX (MLX) + Gemma 4（本地运行，OpenAI 兼容 API） |

## 功能概览

- **时间线布局** — 垂直时间线展示所有设计截图，无限滚动加载，支持双向翻页
- **毛玻璃设计** — Apple 风格 frosted glass 设计系统（多级模糊层次）
- **AI 术语生成** — 上传截图后自动调用本地 oMLX 模型，生成设计术语关键词
- **术语标签** — 点击复制到剪贴板，悬停删除，hover 展开全部
- **粘贴截图** — 任意位置 Ctrl+V / Cmd+V 快速上传
- **搜索面板** — 全局搜索所有已生成的术语关键词
- **浮动操作按钮** — 快速回到今天
- **深色模式** — 完美适配 Light / Dark 模式

## 快速开始

### 前置依赖

- Node.js >= 22
- pnpm >= 10
- PostgreSQL >= 15
- oMLX（已加载 gemma-4-e4b-it-8bit 模型）

### 1. 克隆项目

```bash
git clone <repo-url> && cd termspark
```

### 2. 安装依赖

```bash
pnpm install
pnpm approve-builds  # 允许 sharp 等包的构建脚本
```

### 3. 配置环境变量

编辑 `server/.env`：

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/termspark
oMLX_URL=http://127.0.0.1:8000/v1
oMLX_MODEL=gemma-4-e4b-it-8bit
oMLX_API_KEY=your_api_key_here
PORT=3001
```

### 4. 创建数据库

```bash
createdb termspark
```

### 5. 初始化数据库表

```bash
pnpm --filter server db:push
```

### 6. 启动 oMLX

确保 oMLX 服务已启动，OpenAI 兼容 API 默认监听 `127.0.0.1:8000`，模型 `gemma-4-e4b-it-8bit` 已加载。

### 7. 启动开发环境

```bash
pnpm dev            # 前端 :5173 + 后端 :3001 同时启动
```

或分别启动：

```bash
pnpm dev:client     # 仅前端 → http://localhost:5173
pnpm dev:server     # 仅后端 → http://localhost:3001
```

## 项目结构

```
termspark/
├── client/src/
│   ├── components/
│   │   ├── layout/          # AppHeader, TimelineFeed, DaySection, DayNote, SearchPanel, FloatingActionButton
│   │   ├── cards/           # ImageCard, CardDecoration, ImageUploader
│   │   ├── terminology/     # TermTag
│   │   └── ui/              # Button, Dialog, Tooltip
│   ├── hooks/               # useTimeline（时间线数据加载）
│   ├── types/               # TypeScript 类型定义
│   └── lib/                 # 工具函数
├── server/src/
│   ├── routes/              # images, terms, notes API
│   ├── services/ai.ts       # oMLX OpenAI 兼容 API 集成
│   └── db/                  # Drizzle ORM schema & 连接
└── pnpm-workspace.yaml
```

## API 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/api/images` | 上传图片，自动触发 AI 生成术语 |
| `GET` | `/api/images/timeline` | 时间线分页查询（双光标） |
| `GET` | `/api/images/search?q=keyword` | 全局搜索术语关键词 |
| `GET` | `/api/images?weekStart=YYYY-MM-DD` | 按周查询图片和术语 |
| `DELETE` | `/api/images/:id` | 删除图片及关联术语 |
| `POST` | `/api/images/:id/regenerate` | 重新生成术语 |
| `DELETE` | `/api/terms/:id` | 删除单个术语 |
| `GET` | `/api/notes?date=YYYY-MM-DD` | 获取某天笔记 |
| `PUT` | `/api/notes` | 保存/更新笔记 |
| `GET` | `/api/health` | 服务健康检查 |

## 配置说明

| 环境变量 | 默认值 | 说明 |
|---|---|---|
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/termspark` | PostgreSQL 连接字符串 |
| `oMLX_URL` | `http://127.0.0.1:8000/v1` | oMLX OpenAI 兼容 API 地址 |
| `oMLX_MODEL` | `gemma-4-e4b-it-8bit` | 模型名称 |
| `oMLX_API_KEY` | — | oMLX API 密钥 |
| `UPLOADS_DIR` | `./uploads` | 上传文件存储路径 |
| `PORT` | `3001` | 后端服务端口 |
