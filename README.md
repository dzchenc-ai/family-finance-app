# 家庭理财管理系统 (Family Finance System)

### 数据都为测试数据，部署后请删除所有测试数据。
### 数据都为测试数据，部署后请删除所有测试数据。
### 数据都为测试数据，部署后请删除所有测试数据。

## 项目简介
这是一个基于 **Next.js 14** + **Prisma** + **PostgreSQL** 的家庭理财管理系统，旨在提供智能记账、资产管理和数据统计功能。

## 部署状态
[![Deploy to Server](https://github.com/mobowp/family-finance-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/mobowp/family-finance-app/actions/workflows/deploy.yml)

## 环境要求

1. **安装 Node.js** (v18.17 或更高版本)
   - 访问 [Node.js 官网](https://nodejs.org/) 下载并安装 LTS 版本。
   - 安装完成后，在终端运行 `node -v` 确认安装成功。

## 快速开始

1. **安装依赖**
   ```bash
   npm install
   ```

2. **配置数据库**
   - 默认配置为 SQLite（本地文件数据库），无需额外安装。
   - 初始化数据库：
     ```bash
     npx prisma migrate dev --name init
     ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```
   访问 `http://localhost:3000` 查看应用。

## 目录结构

页面只负责渲染，数据访问集中在 `lib/domain`，浏览器能调用的写入入口只在 `app/actions`。

- `app/`: App Router 页面。`app/actions/` 是 Server Actions（解析表单、调用领域层、`revalidate` / `redirect`）。`app/api/auth` 是 Auth.js 回调，业务数据不走 REST。
- `lib/domain/`: 记账、资产、行情、AI、统计等查询与写入。服务端页面直接调用这里，不在页面里写 Prisma。
- `lib/auth/`: 当前用户、登录校验、管理员判断。
- `lib/prisma.ts`: Prisma 客户端单例。
- `auth.ts` / `auth.config.ts` / `middleware.ts`: Auth.js 入口。`auth.config.ts` 保持无数据库依赖，供边缘中间件使用。
- `components/`: UI。`ui/` 是基础组件，其余按功能分目录（`layout`、`home`、`transactions`、`accounts`、`wealth`、`settings`、`statistics`、`auth`）。
- `prisma/`: 数据模型与 `seed.ts`。
- `scripts/`: 不参与运行的调试脚本和已停用代码。
