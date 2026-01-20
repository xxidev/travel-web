# 智能旅行规划网站

本地化旅行行程推荐系统，根据目的地、时间和预算生成定制化的旅行计划。

## 功能特点

- 根据目的地、时间和预算智能生成行程
- 自动计算预算分配（住宿、餐饮、交通等）
- 根据预算等级推荐不同档次的服务
- 提供详细的每日活动安排
- 实用旅行贴士
- 响应式设计，支持移动端访问
- 无需API密钥，开箱即用

## 技术栈

- **后端**: Node.js + Express
- **前端**: TypeScript + HTML + CSS
- **构建工具**: TypeScript Compiler

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务器

```bash
npm start
```

开发模式（支持热重载）：

```bash
npm run dev
```

仅编译TypeScript：

```bash
npm run build
```

监听TypeScript文件变化：

```bash
npm run watch
```

### 3. 访问网站

在浏览器中打开：`http://localhost:3000`

## 使用方法

1. 在表单中输入旅行信息：
   - 目的地（例如：东京、巴黎、成都）
   - 开始和结束日期
   - 预算（人民币）
   - 旅行偏好（可选）

2. 点击"生成行程计划"按钮

3. 系统将生成个性化的旅行行程，包括：
   - 预算分配建议
   - 每日详细行程
   - 住宿和餐饮推荐
   - 实用旅行贴士

## 项目结构

```
travel/
├── index.js              # Express服务器和行程生成逻辑
├── package.json          # 项目配置和依赖
├── tsconfig.json         # TypeScript配置
├── README.md             # 项目说明文档
├── src/                  # TypeScript源代码
│   └── app.ts            # 前端应用逻辑
└── public/               # 静态文件目录
    ├── index.html        # 主页面
    ├── styles.css        # 样式文件
    └── app.js            # 编译后的JavaScript（自动生成）
```

## 预算等级说明

系统会根据日均预算自动调整推荐等级：

- **< ¥300/天**: 经济型 - 青年旅舍、小吃、公共交通
- **¥300-600/天**: 舒适型 - 三星酒店、特色餐厅、偶尔打车
- **> ¥600/天**: 高档型 - 四五星酒店、高档餐厅、专车出行

## 开发说明

- 前端使用TypeScript编写，提供类型安全
- 修改 `src/app.ts` 后需运行 `npm run build` 重新编译
- 使用 `npm run watch` 可自动监听文件变化并编译

## 许可证

Private
