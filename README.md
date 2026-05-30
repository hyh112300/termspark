# TermSpark —— 设计术语灵感剪切板

一个 AI 驱动的设计灵感收集工具。粘贴设计截图，AI 自动识别并生成设计术语关键词，所有内容按时间线排列。

## 技术栈

| 层     | 技术                                                             |
| ------ | ---------------------------------------------------------------- |
| 前端   | React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Framer Motion |
| 后端   | Node.js + Express 5                                              |
| 数据库 | PostgreSQL + Drizzle ORM                                         |
| AI     | OpenCode（MiMo-V2.5，OpenAI 兼容 API）或 oMLX（可配置）          |
| 认证   | JWT + bcrypt（登录/注册 + 角色权限）                             |

## 功能概览

- **时间线布局** — 垂直时间线展示所有设计截图，最新在前，支持双向翻页（过去/未来）
- **卡片翻转** — macOS 风格三色圆点按钮，悬停翻转卡片，背面提供预览和重新生成操作
- **AI 术语生成** — 上传截图后自动调用 AI 模型，生成 5-10 个中文设计术语关键词
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
- **用户认证** — 支持登录/注册（邀请码），JWT 鉴权，数据隔离
- **角色权限** — 管理员可上传图片，普通用户"功能暂未开放"

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
cp .env.example .env
```

编辑 `.env`：

```env
PORT=3001
UPLOADS_DIR=./uploads
DATABASE_URL=postgres://postgres:postgres@localhost:5432/termspark
JWT_SECRET=<随机字符串，运行 openssl rand -hex 32 生成>
OPCODE_API_KEY=sk-your-opencode-api-key
OPCODE_BASE_URL=https://opencode.ai/zen/go/v1
OPCODE_MODEL=mimo-v2.5
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me-please
```

**配置化 AI 服务**：

- **OpenCode**：使用默认配置，支持 MiMo-V2.5 等模型
- **oMLX**：修改 `.env` 中的配置：
  ```env
  OPCODE_BASE_URL=http://localhost:1234/v1  # oMLX 地址
  OPCODE_MODEL=qwen2.5-vl-72b              # oMLX 模型
  OPCODE_API_KEY=your-omlx-key             # oMLX 密钥（如有）
  ```

### 4. 创建数据库

```bash
createdb termspark
```

### 5. 初始化数据库表

```bash
pnpm --filter server db:push
```

### 6. 创建管理员账号

```bash
cd server && pnpm db:seed
```

根据 `.env` 中的 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 创建初始管理员（角色 `admin`）。

### 7. 启动

```bash
# 后端
cd server && pnpm dev

# 前端（新终端）
cd client && pnpm dev
```

打开 `http://localhost:5173`，未登录时会弹出登录弹窗。

## 认证与权限

- **登录/注册** — 支持用户注册（需邀请码，参见 `.env.example`）和登录，JWT 有效期 30 天
- **角色系统** — `admin`（管理员）和 `user`（普通用户）
- **上传限制** — 仅管理员可上传图片和重新生成术语，普通用户看到"功能暂未开放"提示
- **数据隔离** — 每个用户只能看到自己的图片、术语和笔记

## API 端点

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
│   │   ├── auth/            # LoginPage（登录/注册弹窗）
│   │   ├── layout/          # AppHeader, TimelineFeed, DaySection, DateMarker,
│   │   │                    # SearchPanel（Spotlight 弹窗）, FloatingActionButton,
│   │   │                    # ImagePreview（全屏预览）
│   │   ├── cards/           # ImageCard（含卡片翻转）, ImageUploader
│   │   └── ui/              # Dialog, LoadingOverlay（全局咖啡杯动画）
│   ├── contexts/            # AuthContext（认证状态管理）
│   ├── hooks/               # useTimeline（时间线数据加载与操作）
│   ├── types/               # TypeScript 类型定义
│   └── lib/                 # 工具函数
├── server/src/
│   ├── routes/              # auth（登录/注册）, images（上传/时间线/搜索/删除）,
│   │                        # terms, notes
│   ├── middleware/           # auth（JWT 验证）, admin（管理员权限）
│   ├── services/ai.ts       # 多 Provider AI 集成（OpenCode / oMLX）
│   └── db/                  # Drizzle ORM schema, seed（初始化管理员）
└── pnpm-workspace.yaml
```

## API 接口

| 方法     | 路径                                             | 说明                           |
| -------- | ------------------------------------------------ | ------------------------------ |
| 方法     | 路径                                             | 说明                           |
| -------- | ------------------------------------------------ | ------------------------------ |
| `POST`   | `/api/auth/register`                             | 用户注册（需邀请码）           |
| `POST`   | `/api/auth/login`                                | 用户登录，返回 JWT             |
| `GET`    | `/api/auth/me`                                   | 获取当前用户信息               |
| `POST`   | `/api/images`                                    | 上传图片，自动触发 AI 生成术语 |
| `GET`    | `/api/images/timeline?around=YYYY-MM-DD&limit=N` | 时间线初始加载（以某天为中心） |
| `GET`    | `/api/images/timeline?before=WEEK_START&limit=N` | 加载更早的时间线（分页）       |
| `GET`    | `/api/images/timeline?after=WEEK_START&limit=N`  | 加载更晚的时间线（分页）       |
| `GET`    | `/api/images/search?q=keyword`                   | 全局搜索术语关键词             |
| `DELETE` | `/api/images/:id`                                | 删除图片及关联术语             |
| `POST`   | `/api/images/:id/regenerate`                     | 重新生成术语                   |
| `DELETE` | `/api/terms/:id`                                 | 删除单个术语                   |
| `GET`    | `/api/notes?date=YYYY-MM-DD`                     | 获取某天笔记                   |
| `PUT`    | `/api/notes`                                     | 保存/更新笔记                  |
| `GET`    | `/api/health`                                    | 服务健康检查                   |

## 配置说明

| 环境变量          | 默认值                                                  | 说明                             |
| ----------------- | ------------------------------------------------------- | -------------------------------- |
| `PORT`            | `3001`                                                  | 后端服务端口                     |
| `UPLOADS_DIR`     | `./uploads`                                             | 上传文件存储路径                 |
| `DATABASE_URL`    | `postgres://postgres:postgres@localhost:5432/termspark` | PostgreSQL 连接字符串            |
| `JWT_SECRET`      | —                                                       | JWT 签名密钥（必填）             |
| `INVITE_CODE`     | （参见 `.env.example`）                                 | 注册邀请码                       |
| `AI_PROVIDER`     | `opencode`                                              | AI 服务商（`opencode` / `omlx`） |
| `OPCODE_API_KEY`  | —                                                       | OpenCode API 密钥                |
| `OPCODE_BASE_URL` | `https://opencode.ai/zen/go/v1`                         | OpenCode API 地址                |
| `OPCODE_MODEL`    | `mimo-v2.5`                                             | OpenCode 模型名称                |
| `OMLX_URL`        | `http://localhost:11434/v1`                             | oMLX API 地址                    |
| `OMLX_MODEL`      | `llava`                                                 | oMLX 模型名称                    |
| `OMLX_API_KEY`    | —                                                       | oMLX API 密钥                    |
| `ADMIN_USERNAME`  | `admin`                                                 | 初始管理员用户名（seed 用）      |
| `ADMIN_PASSWORD`  | `change-me-please`                                      | 初始管理员密码（seed 用）        |
