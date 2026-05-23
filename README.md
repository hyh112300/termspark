# TermSpark —— 设计术语灵感剪切板

一个 AI 驱动的设计灵感收集工具。粘贴设计截图，AI 自动识别并生成设计术语关键词，所有内容按时间线排列。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Framer Motion |
| 后端 | Node.js + Express 5 |
| 数据库 | PostgreSQL + Drizzle ORM |
| AI | oMLX（OpenAI 兼容 API，可接入任何 OpenAI 兼容的 LLM 服务） |

## 功能概览

- **时间线布局** — 垂直时间线展示所有设计截图，最新在前，支持双向翻页（过去/未来）
- **卡片翻转** — macOS 风格三色圆点按钮，悬停翻转卡片，背面提供预览和重新生成操作
- **AI 术语生成** — 上传截图后自动调用本地 LLM，生成 5-10 个中文设计术语关键词
- **术语标签** — 点击复制到剪贴板，悬停显示删除按钮，hover 展开全部
- **粘贴截图** — 任意位置 Ctrl+V / Cmd+V 快速上传
- **毛玻璃设计** — Apple 风格 frosted glass 设计系统（多级模糊层次）
- **Spotlight 搜索面板** — 全局搜索所有已生成的术语关键词，支持键盘导航
- **每日笔记** — 每个日期节点可保存笔记，支持富文本
- **图片预览** — 点击卡片弹出全屏预览
- **全局加载遮罩** — AI 生成/重新生成时显示咖啡杯动画
- **Dialog 弹窗** — 统一的确认弹窗组件（删除确认等）
- **Back to Top** — 滚动后出现浮动按钮，快速回到顶部
- **深色模式** — 完美适配 Light / Dark 模式，自动跟随系统

## 快速开始

### 前置依赖

- Node.js >= 22
- pnpm >= 10
- PostgreSQL >= 15
- 任何 OpenAI 兼容的 LLM 推理服务（如 oMLX、Ollama、vLLM 等）

### 1. 克隆项目

```bash
git clone https://github.com/hyh112300/termspark.git && cd termspark
```

### 2. 安装依赖

```bash
pnpm install
pnpm approve-builds  # 允许 sharp 等包的构建脚本
```

### 3. 配置环境变量

```bash
cp server/.env.example server/.env
```

编辑 `server/.env`：

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/termspark
oMLX_URL=http://127.0.0.1:8000/v1
oMLX_MODEL=gemma-4-e4b-it-8bit
oMLX_API_KEY=your_api_key_here
PORT=3001
UPLOADS_DIR=./uploads
```

### 4. 创建数据库

```bash
createdb termspark
```

### 5. 初始化数据库表

```bash
pnpm --filter server db:push
```

### 6. 启动 LLM 服务

确保你选择的 LLM 推理服务已启动，OpenAI 兼容 API 地址与 `oMLX_URL` 配置一致，模型已加载。

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
│   │   ├── layout/          # AppHeader, TimelineFeed, DaySection, DateMarker,
│   │   │                    # SearchPanel（Spotlight 弹窗）, FloatingActionButton,
│   │   │                    # ImagePreview（全屏预览）
│   │   ├── cards/           # ImageCard（含卡片翻转）, ImageUploader
│   │   └── ui/              # Dialog, LoadingOverlay（全局咖啡杯动画）
│   ├── hooks/               # useTimeline（时间线数据加载与操作）
│   ├── types/               # TypeScript 类型定义
│   └── lib/                 # 工具函数
├── server/src/
│   ├── routes/              # images（上传/时间线/搜索/删除）, terms, notes
│   ├── services/ai.ts       # OpenAI 兼容 API 集成（模型无关）
│   └── db/                  # Drizzle ORM schema & 连接
└── pnpm-workspace.yaml
```

## API 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/api/images` | 上传图片，自动触发 AI 生成术语 |
| `GET` | `/api/images/timeline?around=YYYY-MM-DD&limit=N` | 时间线初始加载（以某天为中心） |
| `GET` | `/api/images/timeline?before=WEEK_START&limit=N` | 加载更早的时间线（分页） |
| `GET` | `/api/images/timeline?after=WEEK_START&limit=N` | 加载更晚的时间线（分页） |
| `GET` | `/api/images/search?q=keyword` | 全局搜索术语关键词 |
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
| `oMLX_URL` | `http://127.0.0.1:8000/v1` | OpenAI 兼容 API 地址 |
| `oMLX_MODEL` | `gemma-4-e4b-it-8bit` | 模型名称 |
| `oMLX_API_KEY` | — | oMLX API 密钥 |
| `UPLOADS_DIR` | `./uploads` | 上传文件存储路径 |
| `PORT` | `3001` | 后端服务端口 |
