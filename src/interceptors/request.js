import qs from "qs"
import { useUserStore } from "@/store/useUserStore"

const useProxy = import.meta.env.VITE_APP_PROXY == "true"

// 请求基准地址
const baseUrl = useProxy ? "" : import.meta.env.VITE_SERVER_BASEURL

// 拦截器配置
const httpInterceptor = {
  // 拦截前触发
  invoke(options) {
    // 接口请求支持通过 query 参数配置 queryString
    if (options.query) {
      const queryStr = qs.stringify(options.query)
      if (options.url.includes("?")) {
        options.url += `&${queryStr}`
      } else {
        options.url += `?${queryStr}`
      }
    }
    // 非 http 开头需拼接地址
    if (!options.url.startsWith("http")) {
      // 确保 URL 以 '/' 开头
      if (!options.url.startsWith("/")) {
        options.url = "/" + options.url
      }

      // 替换掉多余的 '/'
      options.url = options.url.replace(/\/+/g, "/")

      // 拼接 baseUrl，确保 baseUrl 与 url 之间只有一个 '/'
      const fullUrl = baseUrl.replace(/\/+$/, "") + options.url

      // 针对不同平台处理 URL 拼接
      // #ifdef H5
      if (!useProxy) {
        options.url = fullUrl
      }
      // #endif

      // 非H5平台正常拼接 fullUrl
      // #ifndef H5
      options.url = fullUrl
      // #endif

      // TIPS: 如果需要对接多个后端服务，也可以在这里处理，拼接成所需要的地址
    }

    options.timeout = 10000
    // 3. 添加 token 请求头标识
    const userStore = useUserStore()

    let token = userStore.getToken

    options.header = {
      ...options.header,
    }

    // 尝试其他方式获取token, 冗余降级处理
    if (!token) {
      token = userStore?.userInfo?.token
    }

    if (token) {
      options.header.token = token
    }
  },
}

export const requestInterceptor = {
  install() {
    // 拦截 request 请求
    uni.addInterceptor("request", httpInterceptor)
    // 拦截 uploadFile 文件上传
    uni.addInterceptor("uploadFile", httpInterceptor)
  },
}
