import { useUserStore } from "@/store/useUserStore"
import { objectToQueryParams, useNavigate } from "@/hooks/useNavigate"

const showErrorToast = (message = "请求错误") => {
  uni.showToast({
    icon: "none",
    title: message,
  })
}

export const http = (options) =>
  new Promise((resolve, reject) => {
    const userStore = useUserStore()

    uni.request({
      ...options,
      dataType: "json",
      // #ifndef MP-WEIXIN
      responseType: "json",
      // #endif
      success(res) {
        const { statusCode, data } = res
        if (data.code && data.code == 401) {
          useNavigate("/pages/login/index")
        } else if (statusCode >= 200 && statusCode < 300) {
          resolve(data)
        } else if (statusCode === 401) {
          userStore.clearUserInfo()
          useNavigate("/pages/login/index")
          reject(res)
        } else {
          if (!options.hideErrorToast) {
            showErrorToast(data.msg || "请求错误")
          }
          reject(res)
        }
      },
      fail(err) {
        showErrorToast("网络错误，换个网络试试")
        reject(err)
      },
    })
  })

export const httpGet = (url, data = {}) => http({ url, data, method: "GET" })

export const httpPost = (url, data) => http({ url, data, method: "POST" })

export const httpPut = (url, data) => http({ url, data, method: "PUT" })

export const httpDelete = (url, data = {}) => {
  const queryParams = objectToQueryParams(data)
  const finalUrl = queryParams ? `${url}?${queryParams}` : url
  return http({ url: finalUrl, method: "DELETE" })
}

/**
 * 分开各个请求方法， 如果有特殊需求就改对应的方法，不影响其他
 * @param option
 * @returns {Promise<unknown>}
 */
export const request = (option) => {
  let { method, url, data } = option
  if (!url.startsWith("/")) {
    url = "/" + url
  }
  url = url.replace(/\/+/g, "/")

  switch (method.toLowerCase()) {
    case "get":
      return httpGet(url, data)
    case "post":
      return httpPost(url, data)
    case "put":
      return httpPut(url, data)
    case "delete":
      return httpDelete(url, data)
    default:
      throw new Error(`不支持的请求方法: ${method}`)
  }
}
