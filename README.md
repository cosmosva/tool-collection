# 🛠️ 工具集合

一个基于 Next.js 的实用工具集合应用，包含多种日常使用的在线工具。

## ✨ 功能特色

### 🏠 首页
- 美观的工具卡片展示
- 响应式设计，支持移动端
- 悬停动画效果

### ✅ Todo List
- 添加、编辑、删除任务
- 标记任务完成状态
- 按状态筛选任务（全部/待完成/已完成）
- 本地存储，数据持久化
- 任务统计信息
- 双击编辑功能

### 🧮 计算器
- 基本四则运算（加、减、乘、除）
- 清晰的显示屏
- 操作历史显示
- 键盘式布局
- 支持小数运算

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动

### 构建生产版本
```bash
npm run build
npm start
```

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页（工具集合）
│   ├── layout.tsx         # 根布局
│   └── tools/             # 工具页面
│       ├── layout.tsx     # 工具布局
│       ├── todo/          # Todo List 工具
│       │   └── page.tsx
│       └── calculator/    # 计算器工具
│           └── page.tsx
├── components/            # React 组件
│   ├── TodoApp.tsx       # Todo 主应用
│   ├── TodoItem.tsx      # Todo 项目组件
│   ├── AddTodo.tsx       # 添加 Todo 组件
│   ├── TodoFilter.tsx    # Todo 过滤组件
│   ├── EmptyState.tsx    # 空状态组件
│   ├── Calculator.tsx    # 计算器组件
│   ├── ToolCard.tsx      # 工具卡片组件
│   └── BackButton.tsx    # 返回按钮组件
├── types/                # TypeScript 类型定义
│   └── todo.ts
└── styles/               # 样式文件
    └── globals.css
```

## 🎨 技术栈

- **框架**: Next.js 15
- **语言**: TypeScript
- **样式**: Tailwind CSS v4
- **UI**: React 19
- **代码质量**: Biome (Linting & Formatting)
- **字体**: Geist Sans

## 🔧 可用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start

# 类型检查
npm run typecheck

# 代码检查
npm run check

# 自动修复代码格式
npm run check:write

# 自动修复（包括不安全的修复）
npm run check:unsafe
```

## 📱 响应式设计

- 移动端优先设计
- 平板电脑适配
- 桌面端完整体验
- 触摸友好的交互

## 🛣️ 路由结构

- `/` - 首页（工具集合）
- `/tools/todo` - Todo List 工具
- `/tools/calculator` - 计算器工具

## 🔮 未来功能

计划添加更多实用工具：
- 单位转换器
- 颜色选择器
- 二维码生成器
- 文本工具（字数统计、格式转换等）
- 时间工具（时区转换、倒计时等）

## �� 许可证

MIT License
