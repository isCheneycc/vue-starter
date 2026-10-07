# {{name}}

## 技术栈

- Vue 3 + TypeScript（`<script setup>`）
- [Vite+](https://viteplus.dev/)（`vp`）：开发服务器、构建、测试（Vitest）、lint（oxlint）、格式化（oxfmt）
- vue-router 5、Pinia 4、Tailwind CSS v4
- @vueuse/core、axios

TypeScript 锁在 6.x：`vue-tsc` 目前无法在 TypeScript 7 上运行。

## 命令

需要 Node `^22.18.0 || >=24.12.0` 和 pnpm（`devEngines` 指定了版本，不符时会自动下载）。

```sh
pnpm install
pnpm dev          # 开发服务器
pnpm build        # 类型检查 + 生产构建
pnpm check        # 格式、lint、类型检查
pnpm fix          # 自动修复格式与 lint
pnpm test         # 单元测试
```

`vp check` 本身不检查 `.vue` 文件内的类型，所以 `pnpm check` 和 `pnpm build` 都串了 `vue-tsc --build`。

## 目录

```
src/
  api/          请求封装（request.ts）
  router/       路由表
  stores/       Pinia store
  styles/       Tailwind 入口与设计令牌（@theme）
  views/        路由页
```

## 接口请求

`src/api/request.ts` 封装了 axios，导出 `get`、`post`、`put`、`del`。它们接收配置对象，返回后端的完整信封 `ApiResponse<T>`（`{ code, msg, data, success? }`）。业务模块的 `api.ts` 这样写，组件里直接调用：

```ts
import { get, put, type ApiResponse } from "@/api/request";

export interface User {
  id: number;
  name: string;
}

export function fetchUser(id: number) {
  return get<ApiResponse<User>>({ url: `/users/${id}` });
}

export function updateUser(data: User) {
  return put<ApiResponse<void>>({ url: `/users/${data.id}`, data });
}
```

失败一律以异常抛出，调用方用 `try/catch` 处理：

- `ApiError`：后端返回了信封，但 `code !== 200` 或 `success === false`（HTTP 状态码非 2xx 但响应体是信封时也是它）。带 `code`、`message`（即 `msg`）和 `response`。
- `AxiosError`：网络错误、超时、取消，或非 2xx 且响应体不是信封。
- 普通 `Error`：HTTP 2xx 但响应体不是信封结构。

成功码和信封字段集中在 `request.ts` 顶部，后端约定不同时改这一处。

## 环境变量

复制 `.env.example` 为 `.env.local` 后按需填写。

| 变量                | 说明                                 |
| ------------------- | ------------------------------------ |
| `VITE_API_BASE_URL` | 后端接口地址；留空时请求发往当前站点 |
