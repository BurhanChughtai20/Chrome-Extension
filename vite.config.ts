import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    tsconfigPaths(),
    viteStaticCopy({
      targets: [
        { src: "public/manifest.json", dest: "." },
        { src: "src/index.css", dest: "." },
        { src: "public/icons", dest: "icons" } // make sure vite.svg is inside public/icons
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        content: resolve(__dirname, "src/App.tsx")
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === "App" ? "App.js" : "assets/[name]-[hash].js"
      }
    },
    outDir: "dist",
    emptyOutDir: true
  }
});