# TermSpark —— 设计术语灵感剪切板

一个按周组织的手账式设计术语灵感管理工具。粘贴设计截图，AI 自动生成设计术语关键词，所有内容按周历排列和储存。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Framer Motion |
| 后端 | Node.js + Express 5 |
| 数据库 | PostgreSQL + Drizzle ORM |
| AI | oMLX (MLX) + Gemma 4（本地运行，OpenAI 兼容 API） |

## 功能概览

- **周视图手账布局** — 三行结构：周一~周三 / 周四~周五+周末 / 全宽笔记区（高度可拖拽调整）
- **宝丽来卡片** — 拍立得风格，随机装饰（和纸胶带 / 图钉 / 回形针）
- **AI 术语生成** — 上传截图后自动调用本地 oMLX 模型，生成 5-10 个设计术语关键词
- **术语标签** — 点击复制到剪贴板，悬停可删除，+N 展开完整列表
- **温暖琥珀色系** — 手写字体 (Caveat)，支持深色模式切换
- **周历导航** — 切换上/下一周，显示当前周数与日期范围

## 快速开始

### 前置依赖

- Node.js >= 22
- pnpm >= 10
- PostgreSQL >= 15
- oMLX（已加载 gemma-4-e4b-it-4bit 模型）

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
oMLX_MODEL=gemma-4-e4b-it-4bit
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

```bash
# 启动 oMLX 服务（OpenAI 兼容 API 默认监听 127.0.0.1:8000）
# 确保已加载 gemma-4-e4b-it-4bit 模型
```

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
│   │   ├── layout/          # WeekHeader, WeekGrid, DayCell, NotesRow
│   │   ├── cards/           # ImageCard (宝丽来), CardDecoration, ImageUploader
│   │   ├── terminology/     # TermTag, TermList
│   │   └── ui/              # Button, Tooltip, Dialog
│   ├── hooks/               # useWeekNavigator, useApi
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
| `GET` | `/api/images?weekStart=YYYY-MM-DD` | 获取指定周的所有图片和术语 |
| `DELETE` | `/api/images/:id` | 删除图片及关联术语 |
| `POST` | `/api/images/:id/regenerate` | 重新生成术语 |
| `DELETE` | `/api/terms/:id` | 删除单个术语 |
| `GET` | `/api/notes?weekStart=YYYY-MM-DD` | 获取周笔记 |
| `PUT` | `/api/notes` | 保存/更新周笔记 |
| `GET` | `/api/health` | 服务健康检查 |

## 配置说明

| 环境变量 | 默认值 | 说明 |
|---|---|---|
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/termspark` | PostgreSQL 连接字符串 |
| `oMLX_URL` | `http://127.0.0.1:8000/v1` | oMLX OpenAI 兼容 API 地址 |
| `oMLX_MODEL` | `gemma-4-e4b-it-4bit` | 模型名称 |
| `PORT` | `3001` | 后端服务端口 |
