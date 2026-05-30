# TermSpark 上云 — 身份认证与 API 迁移方案

## TL;DR

为 TermSpark 添加 JWT 登录/登出 + 全局鉴权中间件，前端登录页参考 `demo/login.html` 的 flip-card 风格但融入现有设计体系，同时将 AI 图片识别服务从 oMLX 切换到 OpenCode（MiMo-V2.5），API Key 通过环境变量注入。

---

## Phase A：基础依赖与配置

### Step A1 — 安装后端依赖并添加新环境变量

**File: `server/package.json`**

- 添加依赖: `bcryptjs`（密码哈希）、`jsonwebtoken`（JWT）、`@types/bcryptjs`、`@types/jsonwebtoken`（dev）

**File: `.env`（根目录，已加入 `.gitignore`）**

- 新增: `JWT_SECRET=<随机字符串>`（签发 JWT 用）
- 新增: `OPCODE_API_KEY=<opencode-go-subscription-key>`（OpenCode API 密钥）
- 新增: `OPCODE_BASE_URL=https://opencode.ai/zen/go/v1`（OpenCode 端点）
- 新增: `OPCODE_MODEL=minimax-m2.5`（OpenCode 上对应的 MiMo-V2.5 模型 ID）
- 新增: `ADMIN_USERNAME` / `ADMIN_PASSWORD`（seed 脚本创建初始管理员用）
- 移除: `oMLX_URL`, `oMLX_MODEL`, `oMLX_API_KEY`（不再使用）

**File: `.env.example`（新增，可提交的模板）**

- 作为参考模板提交到仓库
- 包含所有环境变量的占位符和注释说明
- 新开发者只需 `cp .env.example .env` 并按需修改

**File: `server/src/config.ts`**

- 读取上述新环境变量，导出 `jwtSecret`, `opencodeApiKey`, `opencodeBaseUrl`, `opencodeModel`
- 保留向后兼容的 `uploadsDir`, `port`, `databaseUrl`

> `.env` 已在 `.gitignore` 中（`node_modules/`, `dist/`, `.env` 等），确保本地密钥不会误提交。

### Step A2 — 数据库添加 users 表

**File: `server/src/db/schema.ts`**

- 新增 `users` 表:
  - `id`: serial primary key
  - `username`: text not null unique
  - `passwordHash`: text not null
  - `role`: text not null default `'user'`（`admin` = 管理员，`user` = 普通用户）
  - `createdAt`: timestamp default now

**数据隔离**

- `images` 表和 `notes` 表均新增 `userId` 字段，外键关联 `users.id`（级联删除）
- 所有查询按 `userId` 过滤，确保用户只能看到自己的数据

**Migration**

- 运行 `pnpm --filter server db:generate` 生成迁移文件
- 提供一条 seed 命令或脚本创建初始管理员（密码用 bcrypt 哈希，`role = 'admin'`）

---

## Phase B：后端认证机制（与 Phase C 并行）

### Step B1 — JWT 中间件

**File: `server/src/middleware/auth.ts`（新增）**

- 从 `Authorization: Bearer <token>` 提取并验证 JWT
- 验证失败返回 `401 { error: 'Unauthorized' }`
- 成功后 `req.user` 附加用户信息（`id`, `username`, `role`）

**File: `server/src/middleware/admin.ts`（新增）**

- 管理员守卫中间件，检查 `req.user.role === 'admin'`
- 非管理员返回 `403 { error: 'Forbidden: admin only' }`
- 仅用于保护上传图片 (`POST /api/images`) 和重新生成术语 (`POST /api/images/:id/regenerate`)

### Step B2 — 认证路由

**File: `server/src/routes/auth.ts`（新增）**

- `POST /api/auth/login`：接收 `{ username, password }`，查询 users 表，bcrypt 对比密码，成功后签发 JWT（有效期 30 天，包含 `role`），返回 `{ token, user: { id, username, role } }`
- `POST /api/auth/register`：接收 `{ username, password }`，校验用户名唯一性，bcrypt 哈希密码后插入 users 表（`role = 'user'`），签发 JWT 返回（同登录格式）
- 两个路由均不需鉴权

### Step B3 — 保护所有 API 路由

**File: `server/src/index.ts`**

- 导入 auth router 并注册 `app.use('/api/auth', authRouter)`
- 导入 auth middleware + adminOnly middleware
- 在所有 `/api/images`, `/api/terms`, `/api/notes` 之前挂载 auth middleware（排除 `/api/auth/login` 和 `/api/auth/register`）
- **管理员专属路由**：`POST /api/images`（上传）和 `POST /api/images/:id/regenerate`（重新生成）额外挂载 `adminOnly` 中间件
- 所有数据查询路由（timeline、search、delete 等）按当前用户的 `userId` 过滤

### Step B4 — 更新 AI 服务为 OpenCode

**File: `server/src/services/ai.ts`**

- 将 API URL 从 `${config.omlxUrl}/chat/completions` 改为 `${config.opencodeBaseUrl}/chat/completions`
- 将 Authorization 改为 `Bearer ${config.opencodeApiKey}`
- 将 model 从 `config.omlxModel` 改为 `config.opencodeModel`（即 `minimax-m2.5`）
- API 格式与 OpenAI 兼容，请求/响应结构无需改变

---

## Phase C：前端认证层（与 Phase B 并行）

### Step C1 — Auth Context

**File: `client/src/contexts/AuthContext.tsx`（新增）**

- 提供 `user`, `token`, `role`, `isAdmin`, `login()`, `register()`, `logout()`, `isAuthenticated` 状态
- 初始化时从 localStorage 恢复 token
- `login(username, password)` 调用 `POST /api/auth/login`
- `register(username, password)` 调用 `POST /api/auth/register`
- `logout()` 清除 token 并跳转 `/login`
- `isAdmin` 由 `role === 'admin'` 计算得出

### Step C2 — 受保护路由 / 路由配置

**File: `client/src/main.tsx`**

- 用 `BrowserRouter` 包裹 `<App />` 或直接在 App 中使用路由（react-router-dom v7 已安装）

**File: `client/src/App.tsx`**

- 重构为路由结构：
  - `/login` → LoginPage（公开）
  - `/` → AppInner（受保护）
- 未认证访问 `/` 时重定向到 `/login`

### Step C3 — LoginPage 组件

**File: `client/src/components/auth/LoginPage.tsx`（新增）**

- 参考 `demo/login.html` 的 flip-card 设计，但：
  - **保留注册切换**：flip 卡片一面是登录表单，一面是注册表单（仅需用户名 + 密码）
  - 用现有设计令牌（`--card`, `--foreground`, `--border`, `--primary`, `--font-hand` 等）替换硬编码颜色
  - 输入框和按钮保持参考的阴影/边框风格，但颜色使用系统变量
  - 居中布局（继承 `.wrapper` 的 `min-height: 100vh` + flex 居中）
  - 登录/注册失败显示 toast 错误消息
- 登录成功后跳转 `/`
- 注册成功后自动登录并跳转 `/`

### Step C4 — API 调用注入 Token + 上传权限控制

**File: `client/src/hooks/useTimeline.ts`**

- `apiFetch()` 和 `uploadImage()` 中从 AuthContext 获取 token，添加到 `Authorization` header
- 若收到 401 响应，自动调用 `logout()` 跳转登录
- `uploadImage()` 若收到 403 响应，提示"仅管理员可上传"

**File: `client/src/components/layout/SearchPanel.tsx`**

- `fetch('/api/images/search?...')` 改为带 token 的调用（通过 context 或工具函数）

**File: `client/src/App.tsx`（或组件内）**

- 通过 `useAuth()` 获取 `isAdmin`
- 仅当 `isAdmin === true` 时显示 `ImageUploader` 上传组件
- 非管理员用户看不到上传入口

### Step C5 — AppHeader 添加用户菜单

**File: `client/src/components/layout/AppHeader.tsx`**

- 新增 props: `user`, `onLogout`
- 在搜索/主题按钮右侧显示用户头像/用户名
- 管理员用户在用户名旁显示「管理员」标识
- 点击后下拉菜单：显示用户名、角色标识、「退出登录」按钮

---

## Phase D：种子数据与部署

### Step D1 — 创建初始管理员脚本

**File: `server/src/db/seed.ts`（新增）**

- 脚本通过环境变量读取初始管理员用户名和密码（`ADMIN_USERNAME`, `ADMIN_PASSWORD`）
- bcrypt 哈希密码后插入 users 表（`role = 'admin'`）
- 仅首次运行有效（检查是否已存在）

### Step D2 — 提供部署迁移指南

更新 `README.md` 或新增部署文档，包含：

- 数据库迁移命令
- seed 初始用户命令
- JWT_SECRET 生成建议
- OpenCode Go 订阅 API Key 获取方式

---

## 相关文件清单

| 文件                                           | 操作 | 说明                                             |
| ---------------------------------------------- | ---- | ------------------------------------------------ |
| `server/package.json`                          | 修改 | 添加 bcryptjs, jsonwebtoken                      |
| `server/src/config.ts`                         | 修改 | 新增 OPCODE/JWT 环境变量读取                     |
| `server/src/db/schema.ts`                      | 修改 | 新增 users 表（含 role）、images/notes 加 userId |
| `server/src/middleware/auth.ts`                | 新增 | JWT 鉴权中间件                                   |
| `server/src/middleware/admin.ts`               | 新增 | 管理员守卫中间件                                 |
| `server/src/routes/auth.ts`                    | 新增 | 登录 + 注册路由                                  |
| `server/src/routes/images.ts`                  | 修改 | 上传/重新生成加 adminOnly，查询加 userId 过滤    |
| `server/src/routes/notes.ts`                   | 修改 | 查询/保存加 userId 过滤                          |
| `server/src/routes/terms.ts`                   | 修改 | 同上（经由 images 级联）                         |
| `server/src/index.ts`                          | 修改 | 注册 auth 路由、全局鉴权 + 管理员中间件          |
| `server/src/services/ai.ts`                    | 修改 | 切换为 OpenCode 端点 + MiMo-V2.5                 |
| `server/src/db/seed.ts`                        | 新增 | 创建初始管理员（role=admin）的种子脚本           |
| `client/src/contexts/AuthContext.tsx`          | 新增 | 认证上下文（含 role/isAdmin）                    |
| `client/src/components/auth/LoginPage.tsx`     | 新增 | 登录页（flip-card 风格，含注册切换）             |
| `client/src/main.tsx`                          | 修改 | 添加 BrowserRouter + AuthProvider                |
| `client/src/App.tsx`                           | 修改 | 路由重构、受保护路由、上传权限控制               |
| `client/src/hooks/useTimeline.ts`              | 修改 | API 调用添加 Authorization header                |
| `client/src/components/layout/AppHeader.tsx`   | 修改 | 添加用户菜单/登出/管理员标识                     |
| `client/src/components/layout/SearchPanel.tsx` | 修改 | 搜索 API 添加 token                              |
| `client/src/index.css`                         | 修改 | 添加登录页 CSS（使用现有设计令牌）               |
| `.env`                                         | 修改 | 更新环境变量                                     |
| `README.md`                                    | 修改 | 添加部署/迁移/种子指南                           |

---

## 验证步骤

1. **启动后端** → 检查控制台无错误，数据库迁移成功
2. **运行种子脚本** → 在 users 表中创建初始管理员（role=admin）
3. **访问 `/login`** → 显示 flip-card 风格登录页，可切换登录/注册
4. **输入错误密码** → 提示验证失败
5. **正确登录** → 跳转到主页，token 存储在 localStorage
6. **注册新用户** → 切换到注册表单，输入用户名+密码，注册成功后自动登录
7. **新用户登录** → 看到时间轴（无数据），看不到上传组件
8. **管理员登录** → 看到时间轴 + 上传组件
9. **管理员上传图片** → 触发 AI 识别（OpenCode MiMo-V2.5）
10. **刷新页面** → token 从 localStorage 恢复，自动登录
11. **直接访问 `/api/images/timeline`（无 token）** → 返回 401
12. **普通用户调用 `POST /api/images`（上传）** → 返回 403
13. **登出** → 清除 token，跳转 /login
14. **图片识别** → 确认使用 OpenCode 端点，检查服务端日志

---

---

## 补充：与 GitHub Actions 自动发版的集成

### 问题

项目配置了 GitHub 自动发版（CI/CD），但 API Key（`OPCODE_API_KEY`、`JWT_SECRET`、`DATABASE_URL` 等）不能写到代码或 `.env` 文件中提交到仓库。

### 方案：GitHub Secrets + 部署环境变量注入

#### 1. 在 GitHub 仓库配置 Secrets

进入 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**，添加以下 Repository secrets：

| Secret 名称      | 说明                                                          |
| ---------------- | ------------------------------------------------------------- |
| `OPCODE_API_KEY` | OpenCode Go 订阅的 API Key                                    |
| `JWT_SECRET`     | 用于签发 JWT 的随机字符串（可用 `openssl rand -hex 32` 生成） |
| `DATABASE_URL`   | PostgreSQL 连接字符串                                         |
| `ADMIN_USERNAME` | 初始管理员用户名（用于 seed）                                 |
| `ADMIN_PASSWORD` | 初始管理员密码（用于 seed）                                   |

> `UPLOADS_DIR` 和 `PORT` 等非敏感配置可以直接写在 GitHub Actions 的 `env` 中或直接在 `config.ts` 里设默认值，无需走 Secrets。

#### 2. 在 GitHub Actions 工作流中注入环境变量

假设有一个 `.github/workflows/deploy.yml`，通过 `${{ secrets.XXX }}` 引用：

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Deploy
        run: |
          # 将环境变量注入到部署目标（如 .env 文件或直接传给 Docker/SSH）
          echo "OPCODE_API_KEY=${{ secrets.OPCODE_API_KEY }}" >> .env
          echo "JWT_SECRET=${{ secrets.JWT_SECRET }}" >> .env
          echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" >> .env
          echo "ADMIN_USERNAME=${{ secrets.ADMIN_USERNAME }}" >> .env
          echo "ADMIN_PASSWORD=${{ secrets.ADMIN_PASSWORD }}" >> .env
          # 非敏感配置可直接硬编码
          echo "PORT=3001" >> .env
          echo "UPLOADS_DIR=./uploads" >> .env
          echo "OPCODE_BASE_URL=https://opencode.ai/zen/go/v1" >> .env
          echo "OPCODE_MODEL=minimax-m2.5" >> .env
      # ... 后续部署步骤（scp / docker / ssh 等）
```

#### 3. 部署到服务器后的持久化

如果部署方式是将构建产物推送到服务器，建议在服务器上维护一份真实的 `.env` 文件，**一次配置、长期有效**：

```bash
# 服务器上首次配置
cat > /opt/termspark/.env << 'EOF'
PORT=3001
DATABASE_URL=postgres://...
JWT_SECRET=<固定值>
OPCODE_API_KEY=<固定值>
OPCODE_BASE_URL=https://opencode.ai/zen/go/v1
OPCODE_MODEL=minimax-m2.5
UPLOADS_DIR=./uploads
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<密码>
EOF
```

CI/CD 推送新代码时**不再覆盖** `.env`（避免将 GitHub Secrets 重新写入，防止密钥轮换导致不一致），而是通过 `rsync --ignore-existing` 或单独管理。

> **最佳实践提示**：如果将来需要轮换密钥，直接在服务器 `.env` 中修改，同时在 GitHub Secrets 中同步更新，两者保持一致即可。

---

## 排除/未来考虑

- **本次不实现**：OAuth/SSO、API rate limiting、用户角色管理、多用户隔离数据
- **图片静态文件保护**：当前上传的图片通过 `/uploads` 静态服务，未受 JWT 保护。可选择通过受鉴权的 `/api/uploads` 路由代理，或保持现状（图片不含敏感信息）
