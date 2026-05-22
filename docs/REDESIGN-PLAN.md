# TermSpark 全面改版重构计划

> 版本：v3.0（合并终稿） | 日期：2026-05-22 | 状态：已确认
> 
> 本文档合并自 `docs/refactor-plan.md` 和 `docs/REDESIGN-PLAN.md`，为最终执行方案。

---

## 一、背景与目标

当前 TermSpark 采用「周网格」布局（3×2 日卡片网格 + 底部便签），存在以下核心问题：

| 维度 | 问题分析 |
|------|---------|
| **布局扁平** | 3×3 网格让信息缺乏时间层次感，所有天被平等对待，没有突出"今天" |
| **信息密度低** | 以「周」为原子单位，无法概览跨周内容，页面空白多 |
| **配色偏暗沉** | 琥珀/赭石色系虽温暖但不够通透，文字阅读负担大 |
| **字体层级弱** | 术语标签仅 11px，层级不分明，阅读不够清晰 |
| **交互单一** | 只有周切换，缺乏钻取/展开/收起等层次化交互 |
| **响应式弱** | 小屏体验差，仅做简单列数切换 |
| **缺乏纵向叙事** | 设计灵感天然是时间流，网格布局没有体现时间演进 |

**核心转变**：

```
周网格视图（横向铺开）  →  以今天为锚点的纵向时间轴 + 懒加载
```

**设计哲学**：
- **Apple 式通透**：毛玻璃层级系统，清晰的排版层级，充足的留白
- **手帐温度**：保留宝丽来卡片、手写字体、柔和粉彩装饰
- **时间叙事**：以今天为中心双方向滚动加载，形成设计灵感的时间线

---

## 二、信息架构

```
TermSpark
├── AppHeader（固定顶部，毛玻璃）
│   ├── Logo + 品牌标语 "设计术语灵感剪切板"
│   ├── 搜索按钮 → 打开 SearchPanel
│   ├── 快速回到今天按钮
│   └── 暗色模式切换
│
├── Timeline Feed（无限滚动主体）
│   ├── LoadMore Sentry（顶部哨兵 — 加载更早数据）
│   │
│   ├── DaySection（每日内容区块，重复）
│   │   ├── DateMarker（日期标记 + 时间轴圆点）
│   │   │   ├── 星期 + 月日（如"周四 5月22日"）
│   │   │   ├── 今天高亮（蓝色圆点 + 脉冲动画）
│   │   │   ├── 当日图片计数
│   │   │   └── 可折叠按钮（展开/收起当天）
│   │   │
│   │   ├── ImageCardStream（图片卡片流）
│   │   │   ├── 横向卡片布局（图片左 / 信息右）
│   │   │   ├── 术语标签组（可展开/收起，点击复制）
│   │   │   ├── 操作按钮（预览大图 / 删除 / 重新生成）
│   │   │   └── CardDecoration（手帐点缀元素）
│   │   │
│   │   ├── DayNote（每日内嵌便签）
│   │   │   └── 简易文本编辑框，防抖自动保存
│   │   │
│   │   └── ImageUploader（上传入口，每日底部）
│   │
│   ├── LoadMore Sentry（底部哨兵 — 加载更新数据）
│   │
│   └── 空状态/结束提示
│
├── SearchPanel（搜索浮层面板）
│   ├── 搜索输入框（自动聚焦）
│   ├── 搜索结果网格（缩略图 + 术语 + 日期）
│   └── 点击 → 滚动定位到对应卡片
│
├── FloatingActionButton（浮动上传按钮）
│   └── 快速粘贴截图入口
│
└── Dialog（图片大图预览，保留现有）
```

---

## 三、布局方案

### 3.1 桌面端（≥1024px）

```
┌──────────────────────────────────────────────────────────┐
│  AppHeader (sticky top-0, backdrop-blur-2xl)             │
│  TermSpark    设计术语灵感    [🔍] [今天 ●] [☀/🌙]       │
├────────────────┬─────────────────────────────────────────┤
│                │                                         │
│  时间轴竖线      │  ┌── 5月22日 周四 ● 今天 ──── 2张 ──┐  │
│  (固定左侧)     │  │  ┌────────┐ ┌────────┐           │  │
│                │  │  │  图片   │ │  图片   │           │  │
│  ● 今天        │  │  │  术语   │ │  术语   │           │  │
│  │             │  │  └────────┘ └────────┘           │  │
│  ○ 5/21       │  │  ┌─────────────────────────┐      │  │
│  │             │  │  │ 📝 今日笔记...           │      │  │
│  ○ 5/20       │  │  └─────────────────────────┘      │  │
│  │             │  │  ┌─────────────────────────┐      │  │
│  ○ 5/19       │  │  │ [📷 粘贴截图或拖拽上传]   │      │  │
│  │             │  │  └─────────────────────────┘      │  │
│  ○ 更早...     │  └────────────────────────────────────┘  │
│                │                                         │
│                │  ┌── 5月21日 周三 ────────── 1张 ────┐  │
│                │  │  ┌────────┐                       │  │
│                │  │  │  图片   │                       │  │
│                │  │  └────────┘                       │  │
│                │  └────────────────────────────────────┘  │
│                │                                         │
│                │  ⏎ 加载更多... (IntersectionObserver)    │
├────────────────┴─────────────────────────────────────────┤
│                                            [📷 FAB]       │
└──────────────────────────────────────────────────────────┘
```

### 3.2 移动端（< 1024px）

```
┌───────────────────────────┐
│  AppHeader (sticky)       │
├───────────────────────────┤
│                           │
│  ┌── 5月22日 周四 ● ──┐  │
│  │  ┌────────┐ ┌─────┐ │  │
│  │  │  图片   │ │ 图片 │ │  │
│  │  └────────┘ └─────┘ │  │
│  │  渐变色  抽象背景    │  │
│  │  ┌──────────────┐   │  │
│  │  │ 📝 今日笔记   │   │  │
│  │  └──────────────┘   │  │
│  │  ┌──────────────┐   │  │
│  │  │ [📷 粘贴上传] │   │  │
│  │  └──────────────┘   │  │
│  └─────────────────────┘  │
│                           │
│  ┌── 5月21日 周三 ────┐  │
│  │  ┌────────┐        │  │
│  │  │  图片   │        │  │
│  │  └────────┘        │  │
│  └─────────────────────┘  │
│                           │
│  ⏎ 加载更多...            │
│                    [📷]   │
└───────────────────────────┘
```

时间轴指示器改为内容区左侧边缘的小圆点 + 连接竖线（移动端折叠为更紧凑样式）。

---

## 四、配色方案

### 4.1 毛玻璃层级系统

| 层级 | 用途 | 背景不透明度 | 模糊度 | 饱和度增强 |
|------|------|:----------:|:-----:|:---------:|
| **Level 1** | 卡片/面板 | 0.60 | 12px | 1.20 |
| **Level 2** | 浮动面板/对话框 | 0.72 | 20px | 1.15 |
| **Level 3** | 顶部导航栏 | 0.82 | 30px | 1.10 |
| **Level 4** | FAB 浮动按钮 | 0.50 | 16px | 1.20 |

> 深色模式下各级背景不透明度提高 0.1，模糊度不变。

### 4.2 亮色模式

```css
:root {
  /* ── 背景层级 ── */
  --bg-base:        #f5f5f7;     /* 页面底色（苹果官网灰白） */
  --bg-elevated:    rgba(255,255,255,0.72);  /* 毛玻璃卡片 */
  --bg-header:      rgba(245,245,247,0.85);  /* 头部毛玻璃 */
  --bg-hover:       rgba(0,0,0,0.04);
  --bg-overlay:     rgba(0,0,0,0.0001);      /* 搜索面板蒙层 */

  /* ── 文字层级 ── */
  --text-primary:   #1d1d1f;     /* 主文字（苹果深黑） */
  --text-secondary: #6e6e73;     /* 辅助文字 */
  --text-tertiary:  #aeaeb2;     /* 占位/禁用文字 */

  /* ── 强调色 ── */
  --accent:         #0071e3;     /* 苹果蓝 */
  --accent-soft:    #2997ff;     /* 亮蓝 hover */
  --accent-orange:  #ff9f0a;     /* 苹果橙（日期亮点） */
  --accent-bg:      rgba(0,113,227,0.08);

  /* ── 边框 & 阴影 ── */
  --border:         rgba(0,0,0,0.08);
  --border-strong:  rgba(0,0,0,0.12);
  --shadow-sm:      0 1px 3px rgba(0,0,0,0.04);
  --shadow-md:      0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg:      0 8px 32px rgba(0,0,0,0.12);

  /* ── 时间轴 ── */
  --timeline-dot:         #0071e3;
  --timeline-dot-today:   #0071e3;
  --timeline-line:        rgba(60,60,67,0.12);
  --timeline-dot-shadow:  rgba(0,113,227,0.30);

  /* ── 术语标签 ── */
  --tag-bg:     rgba(0,113,227,0.08);
  --tag-text:   #0071e3;
  --tag-hover:  rgba(0,113,227,0.14);

  /* ── 便签 ── */
  --note-bg:    #fff9e6;
  --note-border: rgba(200,180,120,0.30);

  /* ── 手帐点缀（柔和粉彩） ── */
  --pastel-pink:  #ffb3c6;
  --pastel-green: #b5ead7;
  --pastel-blue:  #c7ceea;
  --pastel-yellow: #ffe5a0;
}
```

### 4.3 暗色模式

```css
.dark {
  --bg-base:        #000000;
  --bg-elevated:    rgba(28,28,30,0.78);
  --bg-header:      rgba(0,0,0,0.82);
  --bg-hover:       rgba(255,255,255,0.06);
  --bg-overlay:     rgba(0,0,0,0.6);

  --text-primary:   #f5f5f7;
  --text-secondary: #98989d;
  --text-tertiary:  #6e6e73;

  --accent:         #2997ff;
  --accent-soft:    #40a9ff;
  --accent-orange:  #ff9f0a;
  --accent-bg:      rgba(41,151,255,0.12);

  --border:         rgba(255,255,255,0.08);
  --border-strong:  rgba(255,255,255,0.12);
  --shadow-sm:      0 1px 3px rgba(0,0,0,0.3);
  --shadow-md:      0 4px 20px rgba(0,0,0,0.5);
  --shadow-lg:      0 8px 40px rgba(0,0,0,0.6);

  --timeline-dot:         #2997ff;
  --timeline-dot-today:   #2997ff;
  --timeline-line:        rgba(84,84,88,0.48);
  --timeline-dot-shadow:  rgba(41,151,255,0.35);

  --tag-bg:     rgba(41,151,255,0.14);
  --tag-text:   #6db9ff;
  --tag-hover:  rgba(41,151,255,0.22);

  --note-bg:    #2c2410;
  --note-border: rgba(120,100,60,0.25);

  --pastel-pink:  #d988a5;
  --pastel-green: #7abf9a;
  --pastel-blue:  #8ba3c7;
  --pastel-yellow: #c4a860;
}
```

---

## 五、字体排版系统

### 5.1 字体定义

```css
@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-hand: 'Caveat', cursive;
}
```

### 5.2 层级表

| 用途 | 字体族 | 字重 | 大小 | 行高 | 用例 |
|------|--------|:---:|:----:|:----:|------|
| 品牌标题 | Inter | 700 Bold | 22px | 1.3 | Header Logo |
| 日期数字 | Inter | 600 Semibold | 18px | 1.3 | "5月22日" |
| 日期星期 | Inter | 500 Medium | 13px | 1.4 | "周四" |
| 图片文件名 | Inter | 500 Medium | 13px | 1.4 | 卡片底部文件名 |
| 术语标签 | Inter | 500 Medium | 13px | 1.4 | 可复制标签 |
| 笔记正文 | Inter | 400 Regular | 15px | 1.6 | 每日便签 |
| 手写点缀 | Caveat | 500 Medium | 16px | 1.4 | 品牌/装饰 |
| 辅助文字 | Inter | 400 Regular | 12px | 1.4 | 计数/状态 |
| 时间线日期 | Inter | 600 Semibold | 13px | 1.4 | 侧边时间轴 |

---

## 六、交互与动画规范

| 交互 | 行为与动画 | 时长 | 缓动 |
|------|-----------|:----:|:----:|
| **页面加载** | 卡片从下向上依次淡入（stagger 60ms） | 400ms | ease-out |
| **滚动加载** | 卡片从边缘滑入（y: 16px → 0） | 300ms | ease-out |
| **今天锚点** | 页面加载后自动滚到"今天" + 脉冲动画圆点 | — | — |
| **日期折叠** | 点击日期头可折叠/展开当天卡片，折叠后显示计数 | 200ms | ease |
| **术语标签 hover** | scale(1.04) + 背景色加深 | 150ms | ease |
| **点击术语复制** | 弹跳缩放 + ✓ 标记（1.5s 后消失） | 200ms | spring |
| **暗色切换** | 全局颜色渐变过渡，持久化到 localStorage | 400ms | ease |
| **回到今天** | 平滑滚动 + 恢复脉冲动画 | 600ms | ease-in-out |
| **卡片 hover** | translateY(-2px) + 阴影加深 | 200ms | ease |
| **删除卡片** | scale(0.9) → 淡出 → 高度收缩 | 250ms | ease-in |
| **搜索面板** | 从顶部滑入 + 背景模糊蒙层 | 250ms | ease-out |
| **图片预览** | 缩放展开（Dialog） | 300ms | spring |
| **浮动按钮** | 滚出视口时缩小、滚回时恢复 | 200ms | ease |

---

## 七、数据层改造

### 7.1 API 接口变更

```typescript
// ════════════════════════════════════════════
// 图片接口（images.ts）
// ════════════════════════════════════════════

/* ── 时间轴分页（旧：GET /api/images?weekStart=...） ── */

// 【初始加载】以今天为中心，双向加载
// GET /api/images/timeline?around=2026-05-22&limit=14
// Response:
// {
//   items: ImageRecord[],
//   hasMorePast: boolean,
//   hasMoreFuture: boolean,
//   pastCursor: string,
//   futureCursor: string,
// }

// 【分页加载】继续向上/向下滚动
// GET /api/images/timeline?before=2026-05-18&limit=14  (加载更早)
// GET /api/images/timeline?after=2026-05-25&limit=14   (加载更新)
// Response:
// {
//   items: ImageRecord[],
//   hasMore: boolean,
//   nextCursor: string,
// }

// 【新增】全局搜索
// GET /api/images/search?q=关键词&limit=20
// Response:
// {
//   items: ImageRecord[],
//   total: number,
// }

// 【保留不变】
// POST   /api/images               — 上传图片
// DELETE /api/images/:id           — 删除图片
// POST   /api/images/:id/regenerate — 重新生成术语

/* ── 术语接口（terms.ts） ── */
// DELETE /api/terms/:id            — 不变

/* ── 便签接口（notes.ts） ── */
// 【旧】GET/PUT 按 weekStart
// 【新】GET  /api/notes?date=2026-05-22     — 获取某日便签
//       PUT  /api/notes                     — 保存便签 { date, content }
```

### 7.2 数据库变更

```sql
-- notes 表：weekStart → date
-- 迁移脚本（server/src/db/migrate.ts）

-- 1. 备份
CREATE TABLE IF NOT EXISTS notes_backup AS SELECT * FROM notes;

-- 2. 新增 date 列
ALTER TABLE notes ADD COLUMN date TEXT;

-- 3. 将现有周便签迁移到对应周的周一
UPDATE notes SET date = week_start;

-- 4. 为新表添加唯一约束（后续可删除 week_start 列）
-- ALTER TABLE notes DROP COLUMN week_start;
```

> images 表已有 `weekStart` + `dayOfWeek`，可根据两者计算出具体日期，无需额外迁移。

### 7.3 Hook 设计

```typescript
// ── useTimeline.ts ──

interface DayGroup {
  date: string;          // YYYY-MM-DD
  dayOfWeek: number;     // 0=Mon ... 6=Sun
  dayName: string;       // "周四"
  displayDate: string;   // "5月22日"
  isToday: boolean;
  images: ImageRecord[];
  note: NoteRecord | null;
}

interface UseTimelineReturn {
  days: DayGroup[];
  loading: boolean;
  loadingMore: boolean;
  hasMorePast: boolean;
  hasMoreFuture: boolean;
  loadMorePast: () => Promise<void>;
  loadMoreFuture: () => Promise<void>;
  scrollToToday: () => void;
  todayRef: RefObject<HTMLDivElement>;
  refresh: () => Promise<void>;
}

// ── useSearch.ts ──

interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: ImageRecord[];
  searching: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  search: () => Promise<void>;
}
```

---

## 八、时间轴懒加载方案

### 8.1 加载策略

```
                 加载方向（向上滚动）
                      ↑
                 ┌────────────┐
                 │ 更早数据     │ ← Intersection Observer 顶部哨兵
                 │ (past)     │
                 ├────────────┤
                 │ 5月19日 周二 │
                 │ 5月20日 周三 │
                 │ 5月21日 周四 │
   初始锚点 →    │ 5月22日 周五 ●│ ← 今天（初始加载 around=today）
                 │ 5月23日 周六 │
                 │ 5月24日 周日 │
                 ├────────────┤
                 │ 更新数据     │ ← Intersection Observer 底部哨兵
                 │ (future)   │
                 └────────────┘
                      ↓
                 加载方向（向下滚动）
```

### 8.2 实现细节

| 项目 | 方案 |
|------|------|
| **触发方式** | 两个 `<div ref={sentryRef}>` 作为顶部/底部哨兵 |
| **API** | `IntersectionObserver` with `rootMargin: '200px'`（提前触发） |
| **初始加载** | `GET /api/images/timeline?around=today&limit=14` |
| **分页大小** | 每次 14 天（约 2 周） |
| **去重** | 游标（cursor）机制，避免重复请求 |
| **加载态** | 骨架屏（skeleton cards）替代 spinner |
| **空状态** | 温馨引导文案 + 上传提示 |
| **结束态** | "已加载全部记录"或"暂无更多数据" |
| **防抖** | 同一方向连续触发时，仅执行一次加载 |

---

## 九、搜索功能设计

### 9.1 交互流程

```
1. 点击搜索图标（🔍）
2. SearchPanel 从顶部滑入（毛玻璃浮层，Level 2）
3. 输入框自动聚焦
4. 输入关键词（中/英文术语）
5. 实时搜索（debounce 300ms）→ GET /api/images/search?q=...
6. 结果以网格展示（缩略图 + 术语名 + 日期）
7. 点击结果 → 关闭面板 → 滚动到对应卡片（平滑滚动）
8. ESC / 点击外部背景 → 关闭搜索面板
```

### 9.2 UI 示意

```
┌──────────────────────────────────────────────────┐
│  🔍 [渐变色____________________] [取消]           │
├──────────────────────────────────────────────────┤
│  找到 3 个匹配结果                                 │
│                                                   │
│  ┌──────┐ ┌──────┐ ┌──────┐                     │
│  │ 缩略图│ │ 缩略图│ │ 缩略图│                     │
│  │ 渐变色│ │ 抽象  │ │ 版面  │                     │
│  │ 5/22 │ │ 5/22 │ │ 5/20 │                     │
│  └──────┘ └──────┘ └──────┘                     │
└──────────────────────────────────────────────────┘
```

---

## 十、响应式策略

| 断点 | 布局模式 | 卡片列数 | 时间轴样式 | 字号 |
|:----:|---------|:-------:|-----------|:---:|
| **≥1280px** | 双栏（时间轴 200px + 内容区） | 2-3 列 | 左侧固定竖线 + 日期标签 | 100% |
| **1024-1279px** | 双栏（时间轴 160px + 内容区） | 2 列 | 左侧固定竖线 + 日期标签 | 100% |
| **640-1023px** | 单栏居中（max-w-2xl） | 2 列 | 左侧边缘 1px 细线 + 4px 圆点 | 95% |
| **<640px** | 单栏全宽 | 1 列 | 左侧边缘细线 + 小圆点 | 90% |

---

## 十一、组件详细设计

### 11.1 新增组件

| 组件 | 职责 | 关键 Props |
|------|------|------------|
| **`AppHeader.tsx`** | 固定顶部导航栏 | `onSearch, onToday, isDark, onToggleDark` |
| **`TimelineFeed.tsx`** | 无限滚动容器，管理哨兵 + 加载 | `children, loadMorePast, loadMoreFuture, ...` |
| **`TimelineAxis.tsx`** | 左侧时间轴竖线 + 日期标记 | `days: DayGroup[]` |
| **`DaySection.tsx`** | 单日内容聚合 | `day: DayGroup, images, note, ...` |
| **`DateMarker.tsx`** | 日期标识（今天脉冲圆点） | `date, dayName, isToday, count, ...` |
| **`DayNote.tsx`** | 每日内嵌便签 | `content, onSave, saving` |
| **`SearchPanel.tsx`** | 搜索浮层面板 | `open, onClose, onResultClick` |
| **`FloatingActionButton.tsx`** | 浮动上传按钮 | `onClick, visible` |
| **`TermTag.tsx`** | 独立术语标签（从 ImageCard 提取） | `term, onDelete, onCopy` |
| **`useTimeline.ts`** | 时间轴数据管理 hook | — |
| **`useSearch.ts`** | 搜索 hook | — |

### 11.2 重构组件

| 组件 | 变更内容 |
|------|---------|
| **`ImageCard.tsx`** | 横向布局（图左/文本右），术语标签移至图片下方，简化宝丽来边框 |
| **`ImageUploader.tsx`** | 适配新卡片样式，融合到 DaySection 底部 |
| **`CardDecoration.tsx`** | 保留手帐装饰，精简为 4 种粉彩色系（移除旧和纸胶带变体） |
| **`Dialog.tsx`** | 保留图片预览，适配新配色 |
| **`Button.tsx`** | 新增 ghost/icon 变体 |
| **`Tooltip.tsx`** | 保留不变 |
| **`useApi.ts`** | 新增分页参数 + 搜索接口 |

### 11.3 删除组件

| 组件 | 替代方案 |
|------|---------|
| `WeekGrid.tsx` | 由 TimelineFeed + DaySection 替代 |
| `WeekHeader.tsx` | 由 AppHeader 替代 |
| `DayCell.tsx` | 由 DaySection 替代 |
| `NotesRow.tsx` | 由 DayNote 替代 |

---

## 十二、文件变更总览

```
新增（11 个）：
  client/src/components/layout/AppHeader.tsx
  client/src/components/layout/TimelineFeed.tsx
  client/src/components/layout/TimelineAxis.tsx
  client/src/components/layout/DaySection.tsx
  client/src/components/layout/DateMarker.tsx
  client/src/components/layout/DayNote.tsx
  client/src/components/layout/FloatingActionButton.tsx
  client/src/components/layout/SearchPanel.tsx
  client/src/components/terminology/TermTag.tsx
  client/src/hooks/useTimeline.ts
  client/src/hooks/useSearch.ts
  server/src/db/migrate.ts

删除（4 个）：
  client/src/components/layout/WeekHeader.tsx
  client/src/components/layout/WeekGrid.tsx
  client/src/components/layout/DayCell.tsx
  client/src/components/layout/NotesRow.tsx

重构（8 个）：
  client/src/App.tsx              — 替换 WeekGrid → TimelineFeed
  client/src/index.css            — 全新 CSS 变量体系
  client/src/components/cards/ImageCard.tsx
  client/src/components/cards/ImageUploader.tsx
  client/src/components/cards/CardDecoration.tsx
  client/src/components/ui/Button.tsx
  client/src/hooks/useApi.ts      — 新增分页/搜索
  server/src/routes/images.ts     — 新增分页/搜索接口
  server/src/routes/notes.ts      — weekStart → date

保留不变（2 个）：
  client/src/components/ui/Dialog.tsx
  client/src/components/ui/Tooltip.tsx
```

---

## 十三、实施步骤

### Phase 1：基础框架

- [x] 确认方案（本文档）
- [ ] 重写 `index.css`：全新 CSS 变量体系 + 4 层毛玻璃 + 排版 tokens + 时间轴样式
- [ ] 更新 `client/index.html`：meta 标签（description / theme-color / apple-mobile-web-app）
- [ ] 更新 `client/src/types/index.ts`：新增 `DayGroup` / `TimelineState` 等类型
- [ ] 新建 `AppHeader.tsx`：Logo、搜索按钮、今天按钮、暗色切换
- [ ] 重构 `App.tsx`：替换布局骨架，去除旧组件引用
- [ ] 删除旧组件：`WeekGrid` / `WeekHeader` / `DayCell` / `NotesRow`

### Phase 2：时间轴核心

- [ ] 后端新增分页接口：`GET /api/images/timeline`
- [ ] 后端新增搜索接口：`GET /api/images/search`
- [ ] 后端修改便签接口：`weekStart` → `date`
- [ ] 后端新增数据迁移脚本：`server/src/db/migrate.ts`
- [ ] 更新 `useApi.ts`：适配新接口
- [ ] 新建 `useTimeline.ts`：时间轴懒加载逻辑
- [ ] 新建 `TimelineFeed.tsx`：无限滚动容器 + IntersectionObserver
- [ ] 新建 `TimelineAxis.tsx`：时间轴竖线 + 日期标记
- [ ] 新建 `DateMarker.tsx`：日期标识 + 今天脉冲圆点
- [ ] 新建 `DaySection.tsx`：单日区块（图片 + 便签 + 上传）

### Phase 3：组件打磨

- [ ] 重构 `ImageCard.tsx`：横向布局，术语移到底部
- [ ] 重构 `ImageUploader.tsx`：适配新样式
- [ ] 重构 `CardDecoration.tsx`：精简为粉彩色系
- [ ] 新建 `DayNote.tsx`（从 NotesRow 重构）
- [ ] 新建 `TermTag.tsx`（从 ImageCard 提取）
- [ ] 新建 `FloatingActionButton.tsx`
- [ ] 新建 `SearchPanel.tsx` + `useSearch.ts`

### Phase 4：动画 & 收尾

- [ ] 页面初次加载动画（stagger 淡入）
- [ ] 滚动加载动画（卡片滑入）
- [ ] 暗色模式过渡优化
- [ ] 各断点响应式适配（4 个断点）
- [ ] 骨架屏加载态
- [ ] 空状态引导文案
- [ ] 性能优化（图片懒加载、虚拟滚动评估）
- [ ] 端到端功能测试

---

## 十四、设计参考

| 来源 | 借鉴要点 |
|------|---------|
| **苹果官网** (apple.com) | 配色系统、毛玻璃效果、排版层级、留白 |
| **Notion** | 时间轴布局、交互模式、折叠展开 |
| **GoodNotes** | 手帐风格、粉彩装饰、柔和色彩 |
| **Day One** | 日记式时间流 UI、今日锚点 |
| **Roam Research** | 无限滚动的数据加载节奏 |

---

## 十五、成功标准

- [ ] 页面加载后自动定位到"今天"日期位置
- [ ] 向上/向下滚动平滑加载更多日期，无卡顿
- [ ] 配色通透可读，深色/浅色模式均舒适
- [ ] 各断点布局完整（≥1280 / 1024 / 640 / <640）
- [ ] 卡片交互流畅（hover / 点击 / 删除 / 复制）
- [ ] 日期可折叠/展开
- [ ] 每日便签防抖自动保存无丢失
- [ ] 全局粘贴截图正常工作
- [ ] 搜索功能正常：输入 → 结果 → 跳转定位
- [ ] 浮动按钮正常显示/隐藏
- [ ] 整体加载速度无退化，无控制台报错

---

## 十六、历史数据迁移

### 16.1 notes 表

```sql
-- 步骤 1：备份
CREATE TABLE IF NOT EXISTS notes_backup AS SELECT * FROM notes;

-- 步骤 2：新增 date 列
ALTER TABLE notes ADD COLUMN date TEXT;

-- 步骤 3：将现有周便签数据迁移到对应周的周一
UPDATE notes SET date = week_start;

-- 步骤 4：确认数据无误后删除旧列
-- ALTER TABLE notes DROP COLUMN week_start;
```

### 16.2 images 表

已有 `weekStart` + `dayOfWeek` 字段，可直接计算出 `date`，无需迁移。

迁移脚本位置：`server/src/db/migrate.ts`，通过 `pnpm run db:migrate` 执行。

---

> **文档状态**：✅ 已确认，准备进入 Phase 1 实施
