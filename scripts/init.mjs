// 从模板生成项目后运行一次：node scripts/init.mjs [项目名]
// 把项目名写入 package.json、index.html 和 README.md，然后删除 scripts/ 目录。
import { readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const name = process.argv[2] ?? basename(root);
const titlePattern = /<title>.*<\/title>/;

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!/^[a-z0-9][a-z0-9._-]*$/.test(name)) {
  fail(
    `项目名 "${name}" 不合法：只能包含小写字母、数字、点、下划线和连字符，且以字母或数字开头（不支持 @scope/name）。\n用法：node scripts/init.mjs <项目名>`,
  );
}

const path = (file) => resolve(root, file);

// 先完成全部读取和校验，再写入，避免改到一半失败。
const [pkgText, html, readme] = await Promise.all([
  readFile(path("package.json"), "utf8"),
  readFile(path("index.html"), "utf8"),
  readFile(path("scripts/README.project.md"), "utf8"),
]);
if (!titlePattern.test(html)) {
  fail("index.html 中没有找到 <title>，未修改任何文件。");
}
const pkg = JSON.parse(pkgText);
pkg.name = name;

await writeFile(path("package.json"), `${JSON.stringify(pkg, null, 2)}\n`);
await writeFile(path("index.html"), html.replace(titlePattern, `<title>${name}</title>`));
await writeFile(path("README.md"), readme.replaceAll("{{name}}", name));
await rm(path("scripts"), { recursive: true });

console.log(`已初始化项目 ${name}。`);
