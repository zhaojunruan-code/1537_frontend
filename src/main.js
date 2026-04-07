import { createSSRApp } from "vue"
import App from "./App.vue"

import "virtual:uno.css"

import * as Pinia from "pinia"
import piniaPersist from "pinia-plugin-persist-uni"
import { prototypeInterceptor, requestInterceptor } from "@/interceptors"

export function createApp() {
  const app = createSSRApp(App)
  // 注册pinia持久化
  const pinia = Pinia.createPinia()
  pinia.use(piniaPersist)
  // 注册拦截器
  app.use(pinia)
  app.use(requestInterceptor)
  app.use(prototypeInterceptor)

  return {
    app,
    Pinia,
  }
}
