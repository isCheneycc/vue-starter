# vue-starter

Vue 3 工程模板：只有工程化配置、一个欢迎页和 axios 请求封装，不含业务页面。

## 生成项目

```sh
vp create github:isCheneycc/vue-starter -- my-app
cd my-app
node scripts/init.mjs
```

- `vp create` 会拷贝模板、执行 `git init`（不提交）、安装依赖并格式化；交互模式下还会询问是否加 git 钩子、编辑器配置和 AGENTS 文件。它不会改项目名。
- `vp create` 会把 `pnpm-workspace.yaml` 里的 `vite-plus` 版本改成你本机 `vp` 的版本，其余依赖仍按 `pnpm-lock.yaml` 安装。想连 `vite-plus` 也保持模板里的版本，用下面的 `degit` 或 `git clone` 方式。
- `node scripts/init.mjs [项目名]` 把项目名写入 `package.json`、`index.html` 的标题和 `README.md`，然后删除 `scripts/` 目录。不传项目名时使用项目目录名。不支持 `@scope/name` 形式。
- 模板仓库需要是公开的；私有仓库请改用 `pnpm dlx degit --mode=git isCheneycc/vue-starter my-app`，再进入目录执行 `vp install` 和 `node scripts/init.mjs`。

也可以从本地模板目录生成：

```sh
git clone <模板目录的路径> my-app
cd my-app
rm -rf .git
vp install
node scripts/init.mjs
```

## 包含什么

| 类别   | 内容                                                                       |
| ------ | -------------------------------------------------------------------------- |
| 框架   | Vue 3.5、vue-router 5（一个欢迎页路由）、Pinia 4（已注册，`stores/` 留空） |
| 工具链 | Vite+ 1.1（vite 8、Vitest 5、oxlint、oxfmt）、TypeScript 6、vue-tsc        |
| 样式   | Tailwind CSS v4，`src/styles/main.css` 里有一个空的 `@theme`               |
| 请求   | `src/api/request.ts`：`get` / `post` / `put` / `del`，附单元测试           |
| 工具库 | @vueuse/core、axios                                                        |

生成后的项目说明见 `scripts/README.project.md`，初始化时它会成为新项目的 `README.md`。

## 维护模板

依赖版本由 `pnpm-lock.yaml` 锁定。升级时在模板目录执行：

```sh
vp update
pnpm check && pnpm test && pnpm build
```

- `vite-plus` 的版本写在 `pnpm-workspace.yaml` 里，需要手动改：`catalog` 的两行，以及 `minimumReleaseAgeExclude` 列表里的版本号。
- TypeScript 保持 `~6.0`，在 `vue-tsc` 支持 TypeScript 7 之前不要升。
