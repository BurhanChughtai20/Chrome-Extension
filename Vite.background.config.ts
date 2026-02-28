import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/background.ts"),
      name: "Background",
      fileName: () => "background.js",
      formats: ["es"],
    },
    outDir: "dist",
    emptyOutDir: false,
  },
});