import { defineConfig } from "vite";
import { resolve } from "path";
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/content.ts"),
      name: "ContentScript",
      fileName: () => "content.js",
      formats: ["iife"],
    },
    outDir: "dist",
    emptyOutDir: false,
  },
});