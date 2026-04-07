import { defineConfig, loadEnv } from "vite"
import uni from "@dcloudio/vite-plugin-uni"
import path from "node:path"
import UnoCSS from "unocss/vite"
// @ts-ignore
import AutoImport from "unplugin-auto-import/vite"

export default ({ command, mode }) => {
  console.log("command, mode -> ", command, mode)
  const { UNI_PLATFORM } = process.env
  console.log("UNI_PLATFORM -> ", UNI_PLATFORM)
  const env = loadEnv(mode, path.resolve(process.cwd(), "env"))
  const {
    VITE_APP_PORT,
    VITE_SERVER_BASEURL,
    VITE_DELETE_CONSOLE,
    VITE_SHOW_SOURCEMAP,
    VITE_APP_PROXY,
    VITE_APP_PROXY_PREFIX,
    VITE_APP_PUBLIC_BASE
  } = env
  console.log("环境变量 env -> ", env)

  return defineConfig({
    base: VITE_APP_PUBLIC_BASE || './',
    envDir: "./env",
    plugins: [
      uni(),
      {
        name: "fix-vite-plugin-vue",
        configResolved(config) {
          const plugin = config.plugins.find((p) => p.name === "vite:vue")
          if (plugin && plugin.api && plugin.api.options) {
            plugin.api.options.devToolsEnabled = false
          }
        }
      },
      UnoCSS(),
      // 自动导入
      AutoImport({
        imports: ["vue", "uni-app", "vue-i18n", "pinia"],
        dts: "src/types/auto-import.d.ts",
        dirs: ["src/hooks", "src/api", "src/store"],
        vueTemplate: true
      })
    ],
    define: {
      __UNI_PLATFORM__: JSON.stringify(UNI_PLATFORM),
      __VITE_APP_PROXY__: JSON.stringify(VITE_APP_PROXY)
    },
    resolve: {
      // 别名
      alias: {
        "@": path.join(process.cwd(), "./src")
      }
    },
    server: {
      host: "0.0.0.0",
      hmr: true,
      port: Number.parseInt(VITE_APP_PORT, 10),
      // 仅 H5 端生效，其他端不生效（其他端走build，不走devServer)
      proxy: JSON.parse(VITE_APP_PROXY)
        ? {
          [VITE_APP_PROXY_PREFIX]: {
            target: VITE_SERVER_BASEURL,
            changeOrigin: true,
            rewrite: (path) => path.replace(new RegExp(`^${VITE_APP_PROXY_PREFIX}`), "")
          }
        }
        : undefined
    },
    build: {
      // 方便非h5端调试
      sourcemap: VITE_SHOW_SOURCEMAP === "true", // 默认是false
      target: "es6",
      // 开发环境不用压缩
      minify: mode === "development" ? false : "terser",
      terserOptions: {
        compress: {
          drop_console: VITE_DELETE_CONSOLE === "true",
          drop_debugger: true
        }
      }
    }
  })
}
