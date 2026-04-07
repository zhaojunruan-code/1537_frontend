import { useRouteCacheStore } from "@/store/useRouteCacheStore";

/**
 * useNavigate 导航工具 Hook
 *
 * 使用示例：
 * ```js
 * import { useNavigate, useSwitchTab, useRedirectTo } from '@/hooks/useNavigate'
 * 
 * // 普通页面跳转并携带参数
 * useNavigate('/pages/detail/index', { id: 10086, keyword: 'hello' })
 * 
 * // 切换 TabBar 并缓存查询参数
 * useSwitchTab('/pages/home/index', { tab: 'recommend' })
 * 
 * // 关闭当前页后跳转
 * useRedirectTo('/pages/login/index')
 * ```
 */

/**
 * 将对象转换为查询参数字符串
 * @param params 要转换的对象
 * @returns string
 */
export const objectToQueryParams = (params) => {
  const encode = typeof window !== "undefined" ? encodeURIComponent : (v) => v;

  return Object.keys(params)
    .map((key) => {
      const value = params[key];

      if (Array.isArray(value)) {
        // 处理数组
        return value
          .map((val) => `${encode(key)}[]=${encode(val)}`)
          .join("&");
      } else if (typeof value === "object" && value !== null) {
        // 处理嵌套对象
        return Object.keys(value)
          .map((subKey) => `${encode(key)}.${encode(subKey)}=${encode(value[subKey])}`)
          .join("&");
      } else {
        // 处理普通键值对
        return `${encode(key)}=${encode(value)}`;
      }
    })
    .filter((part) => part.length > 0)
    .join("&");
};

/**
 * 导航到指定路径并附带查询参数
 * @param path 导航的路径
 * @param params 查询参数对象
 */
export const useNavigate = (path, params = {}) => {
  const queryString = objectToQueryParams(params);
  const url = queryString ? `${path}?${queryString}` : path;
  return uni.navigateTo({ url });
};

export const useSwitchTab = (path, params = {}) => {
  const { onSaveRouteCache } = useRouteCacheStore();
  onSaveRouteCache({
    key: path,
    data: params
  });
  return uni.switchTab({
    url: path, fail: error => {
      console.log(error);
    }
  });
};

export const useRedirectTo = (path, params = {}) => {
  const queryString = objectToQueryParams(params);
  const url = queryString ? `${path}?${queryString}` : path;
  return uni.redirectTo({ url });
};
