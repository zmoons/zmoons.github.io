// uno.config.ts
import { defineConfig } from "unocss";
import transformerDirectives from "@unocss/transformer-directives";

export default defineConfig({
  // ...
  transformers: [transformerDirectives()],
  theme: {
    // 确保暗黑模式配置正确
    darkMode: "class", // 或 'media' 根据你的使用场景
  },
  // rules: [["bg-black-dark", { "background-color": "#141414" }]],
});
