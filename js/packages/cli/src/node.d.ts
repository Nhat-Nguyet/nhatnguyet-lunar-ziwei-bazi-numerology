// Gói không phụ thuộc @types/node: khai đúng phần node:fs mà cli.ts dùng.
declare module "node:fs" {
  export function writeFileSync(path: string, data: string): void;
}
