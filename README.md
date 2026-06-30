# WDMP 工业互联网平台 — 前端（wdmp-client）

> 基于 Vue 3 + TypeScript + Element Plus 构建的工业互联网平台前端

## 技术栈

| 组件 | 版本 |
|------|------|
| Vue | 3.x |
| TypeScript | 5.x |
| Vite | 6.4.3 |
| Element Plus | 2.x |
| Pinia | 2.x |
| Vue Router | 4.x |
| Axios | 1.x |
| ECharts | 5.x |

## 项目结构

```
src/
├── api/           # 接口层（auth/system/file/report/task/push/org）
├── router/        # 路由配置（含登录守卫）
├── store/         # Pinia 状态管理（auth/app）
├── utils/         # Axios 封装（request.ts）
└── views/
    ├── login/     # 登录页
    ├── layout/    # 主框架（侧边栏 + 顶栏）
    ├── system/    # 系统管理（user/role/menu/dept/config）
    ├── file/      # 文件管理
    ├── report/    # 报表（designer 设计 + viewer 查看）
    ├── task/      # 定时任务
    ├── push/      # 消息推送
    └── org/       # 组织架构
```

## 快速启动

### 前置条件

确保后端服务（wdmp-server）已启动并运行在 `http://localhost:8080`。

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问：`http://localhost:5173`

### 构建生产包

```bash
npm run build
```

## 默认账号

| 账号 | 密码 |
|------|------|
| admin | Admin@123 |

登录页已预填默认账号，直接点击"登录"即可。

## 功能模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 系统管理 | `/system/user` 等 | 用户/角色/菜单/部门/配置 CRUD |
| 文件管理 | `/file` | 文件上传、列表、下载、删除 |
| 报表管理 | `/report/designer` | SQL 动态报表设计与预览（支持表格/图表） |
| 定时任务 | `/task` | Quartz 任务启停/手动触发/执行日志 |
| 消息推送 | `/push` | 全体/用户/角色推送，草稿保存 |
| 组织架构 | `/org` | 组织树浏览与详情 |

## API 配置

所有接口统一调用 `http://localhost:8080/api`，配置位于 `src/utils/request.ts`。

如需修改后端地址，编辑该文件中的 `baseURL` 即可。

## 后端项目

后端项目地址：[wdmp-platform](https://github.com/Zengli19910701/wdmp-platform)
