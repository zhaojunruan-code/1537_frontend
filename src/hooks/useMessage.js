/**
 * useToast 简易 Toast 提示
 *
 * 使用示例：
 * ```js
 * import { useToast } from '@/hooks/useMessage'
 * 
 * useToast('操作成功', 'success')
 * ```
 */
export const useToast = (msg, icon = 'none') => {
  uni.showToast({ title: msg, icon })
}
