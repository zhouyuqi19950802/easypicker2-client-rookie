# EasyPicker2 Client

> 一款在线文件收取助手 - 前端客户端

## 📖 项目简介

EasyPicker 是一个在线文件收取助手，提供自动归档功能，记录每次提交的文件信息与提交人信息，支持随时随地下载和查看收取详细情况。

### 主要功能

- 🗂️ **文件管理**: 自动归档用户提交的文件，记录详细信息
- 📋 **任务管理**: 创建和管理文件收取任务
- 👥 **用户系统**: 支持账号登录和邮箱验证码登录
- 🔐 **权限管理**: 多级权限控制（普通用户、管理员、系统管理员）
- 📱 **响应式设计**: 支持PC端和移动端访问
- 💬 **消息通知**: 实时消息推送和通知功能

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- pnpm (推荐) 或 npm

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 开发环境启动

```bash
# 启动开发服务器 (默认环境)
pnpm dev

# 启动测试环境
pnpm dev:test
```

开发服务器将在 `http://localhost:5173` 启动

### 构建生产版本

```bash
# 构建生产版本
pnpm build

# 构建测试版本
pnpm build:test
```

### 预览构建结果

```bash
pnpm serve
```

## 🔐 登录方式

系统支持两种登录方式：

### 1. 账号密码登录

- 输入账号/邮箱和密码
- 密码要求：6-16位，支持字母/数字/下划线/连字符
- 支持"记住登录信息"功能

### 2. 邮箱验证码登录

- 输入邮箱地址
- 点击"获取验证码"获取4位数字验证码
- 验证码有效期120秒
- 邮箱格式必须正确且已绑定账号

### 注册账号

如果系统开放注册，可以访问 `/register` 页面进行账号注册。

### 忘记密码

可以通过 `/reset` 页面重置密码。

## 📁 项目结构

```
src/
├── apis/              # API接口封装
├── assets/            # 静态资源
├── components/        # 公共组件
│   ├── HomeHeader/    # 首页头部组件
│   ├── HomeFooter/    # 首页底部组件
│   ├── InfosForm/     # 信息表单组件
│   ├── MessageList/   # 消息列表组件
│   └── ...
├── composables/       # Vue3 组合式函数
├── constants/         # 常量定义
├── pages/             # 页面组件
│   ├── home/          # 首页
│   ├── login/         # 登录页
│   ├── register/      # 注册页
│   ├── dashboard/     # 仪表板
│   └── task/          # 任务页面
├── router/            # 路由配置
├── store/             # Vuex状态管理
└── utils/             # 工具函数
```

## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Vuex 4
- **路由管理**: Vue Router 4
- **HTTP请求**: Axios
- **样式处理**: SCSS
- **代码规范**: ESLint

## 📋 页面路由

### 公共页面
- `/` - 首页
- `/login` - 登录页面
- `/register` - 注册页面 (需要系统开放注册)
- `/reset` - 找回密码
- `/about` - 关于页面
- `/author` - 联系作者
- `/feedback` - 建议反馈
- `/task/:key` - 文件提交页面

### 仪表板页面 (需要登录)
- `/dashboard` - 仪表板首页
- `/dashboard/files` - 文件列表管理
- `/dashboard/tasks` - 任务列表管理

### 管理员页面
- `/dashboard/manage` - 应用管理
- `/dashboard/manage/overview` - 应用概况
- `/dashboard/manage/user` - 用户列表
- `/dashboard/manage/wish` - 需求管理
- `/dashboard/manage/config` - 配置面板

### 系统管理员页面
- `/dashboard/config` - 系统管理

## 🔧 开发配置

### 环境变量

项目支持多环境配置，通过环境变量控制：

- `VITE_APP_AXIOS_BASE_URL` - API基础路径
- `VITE_APP_TITLE` - 应用标题
- `VITE_ROUTER_BASE` - 路由基础路径

### 代理配置

开发环境默认配置了API代理：

```javascript
// vite.config.mts
proxy: {
  '/api/': {
    target: 'http://127.0.0.1:3000',
    changeOrigin: true,
    rewrite: p => p.replace(/^\/api/, ''),
  },
}
```

## 📝 脚本命令

```json
{
  "dev": "vite",                    // 开发环境启动
  "dev:test": "cross-env VITE_APP_AXIOS_BASE_URL=/api-test/ vite --mode test", // 测试环境启动
  "build": "vite build",            // 生产环境构建
  "build:test": "cross-env VITE_APP_AXIOS_BASE_URL=/api-test/ vite build --mode test", // 测试环境构建
  "serve": "vite preview",          // 预览构建结果
  "lint": "eslint .",               // 代码检查
  "lint:fix": "eslint . --fix"      // 自动修复代码问题
}
```

## 🎨 主题配置

项目使用 Element Plus 组件库，支持主题定制：

- 默认语言：中文 (zh-cn)
- 组件尺寸：large
- z-index：1000

## 📱 移动端适配

项目采用响应式设计，支持移动端访问：

- 移动端导航采用汉堡菜单
- 触摸友好的交互设计
- 自适应布局

## 🔒 权限系统

### 用户角色
- **普通用户**: 可管理自己的文件和任务
- **管理员**: 可查看应用概况、管理用户和需求
- **系统管理员**: 可进行系统配置和维护

### 权限控制
- 前端路由守卫控制页面访问
- API接口权限验证
- 组件级权限显示控制


本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。
