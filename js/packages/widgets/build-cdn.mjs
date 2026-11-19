// Dựng MỘT tệp ESM tự chứa cho CDN: dist/nn-widgets.js gồm năm thành phần và
// lõi @nhatnguyet/am-lich, không cần bước dựng nào ở phía người dùng.
//
//   <script type="module" src="https://cdn.jsdelivr.net/npm/@nhatnguyet/widgets/dist/nn-widgets.js"></script>
//
// Chạy sau tsc (npm run build). ESBUILD_MODULE trỏ tới một bản esbuild có sẵn
// khi chưa cài phụ thuộc dev.

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";

const goc = dirname(fileURLToPath(import.meta.url));
const ten = process.env.ESBUILD_MODULE;
const esbuild = await import(ten ? pathToFileURL(join(ten, "lib/main.js")).href : "esbuild");
const pk = JSON.parse(readFileSync(join(goc, "package.json"), "utf8"));

await esbuild.build({
  entryPoints: [join(goc, "src/index.ts")],
  outfile: join(goc, "dist/nn-widgets.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2020"],
  minify: true,
  legalComments: "none",
  // Đọc thẳng mã nguồn TypeScript của các gói @nhatnguyet trong không gian làm
  // việc (điều kiện "source"), để tệp CDN luôn khớp mã đang kiểm.
  conditions: ["source"],
  banner: {
    js: `/*! ${pk.name} ${pk.version} | MIT | Nhat Nguyet (https://nhatnguyet.org) | https://github.com/Nhat-Nguyet/nhatnguyet */`,
  },
});
console.log("dist/nn-widgets.js");
