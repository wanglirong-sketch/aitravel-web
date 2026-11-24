# 智游 AItravel 前端

基于 Vue3 + Vite + Pinia 开发的旅游推荐与 AI 行程规划平台前端，支持景点/美食/游玩项目检索、用户登录注册、图形验证码校验、POI 收藏、个人中心、AI 行程生成、行程查看与后台管理页面。

## 技术栈

- Vue3
- Vite
- Vue Router
- Pinia
- Axios
- CSS3

## 功能模块

### 用户模块

- 手机号密码登录
- 用户注册
- 图形验证码展示与提交
- 登录态保存与 Token 管理
- 用户资料、头像、昵称、密码修改入口
- 退出登录与登录态清理

### 旅游内容模块

- 首页轮播图展示
- 景点、美食、游玩项目分类展示
- 城市、类型、关键词筛选检索
- POI 卡片展示名称、地址、评分、标签、封面图

### 收藏模块

- 景点、美食等点位收藏
- 取消收藏
- 个人中心收藏列表展示
- 收藏数量统计

### AI 行程模块

- 根据目的地与偏好生成逐日行程
- 行程节点按日期、时间段展示
- SSE 流式接收生成进度
- 行程列表、详情查看与编辑

### 后台管理模块

- 用户列表查询
- 无效账号删除
- 轮播图新增、编辑、删除
- 轮播图启用状态管理

## 仓库地址

```text
https://github.com/wanglirong-sketch/aitravel-web
```

后端仓库：

```text
https://github.com/wanglirong-sketch/aitravel-server
```

## 目录结构

```text
src
├── api          # 接口请求封装
├── assets       # 静态资源
├── components   # 公共组件
├── router       # 路由配置
├── stores       # Pinia 状态管理
├── views        # 页面组件
└── utils        # 工具方法
```

## 本地启动

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```
