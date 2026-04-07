/**
 * useLanguage 设置当前语言并广播全局事件
 *
 * 使用示例：
 * ```js
 * import { useLanguage } from '@/hooks/useLanguage'
 * 
 * // 切换到英文
 * useLanguage('en')
 * ```
 */
export const useLanguage = (key) => {
  uni.setLocale(key);
  uni.$emit("SET-LOCAL-LANGUAGE", key)
};
