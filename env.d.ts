/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 供 vp check（oxlint 类型感知）解析 .ts 中的 .vue 导入；vue-tsc 不依赖它，但删除后 vp check 会报 TS2307。
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, unknown>;
  export default component;
}
