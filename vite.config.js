import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({ resolvers: [ElementPlusResolver()] }),
    Components({ resolvers: [ElementPlusResolver()] }),
    // mkcert(),
  ],
  // base: "http://localhost:8000/",
  // build: {
  //   outDir: "static",
  //   assetsDir: "assets",
  // },
  assetsInclude: ["**/*.wasm"],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
    conditions: ["wasm"],
    dedupe: ["matrix-js-sdk"],
  },
  optimizeDeps: { include: ["matrix-js-sdk"] },
  // server: { https: true },
});
