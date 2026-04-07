/**
 * useWechatPermissions 统一的微信小程序权限管理 Hook
 * 
 * 使用示例：
 * ```js
 * import { useWechatPermissions } from '@/hooks/wechat/useWechatPermissions'
 * 
 * const { ensure } = useWechatPermissions()
 * 
 * onMounted(async () => {
 *   try {
 *     // 确保摄像头权限，如无权限会自动弹出授权面板
 *     await ensure('scope.camera')
 *     console.log('摄像头权限已授权')
 *   } catch (e) {
 *     console.error('用户拒绝摄像头权限', e)
 *   }
 * })
 * ```
 */

export const useWechatPermissions = () => {
  /** 微信权限对应中文名 */
  const PERMISSION_NAMES = {
    'scope.writePhotosAlbum': '存储权限',
    'uni.saveVideoToPhotosAlbum': '存储权限',
    'scope.camera': '摄像头权限',
    'scope.record': '录音权限',
    'scope.userLocation': '位置信息',
    'scope.address': '通讯地址权限',
    'scope.invoice': '发票权限',
    'scope.invoiceTitle': '发票抬头权限',
    'scope.werun': '微信运动权限',
  }

  /**
   * 获取权限中文名
   * @param {string} scopeName - 微信 scope
   * @returns {string}
   */
  const getName = (scopeName) => PERMISSION_NAMES[scopeName] || scopeName

  /**
   * 检查权限当前状态
   * @param {string} scopeName - 微信 scope
   * @returns {Promise<'unprompted'|'authorized'|'denied'>}
   */
  const check = (scopeName) => {
    return new Promise((resolve) => {
      if (scopeName === 'scope.userLocation') {
        const { locationEnabled } = uni.getSystemInfoSync()
        if (!locationEnabled) {
          return resolve('denied')
        }
      }
      uni.getSetting({
        success(res) {
          const status = res.authSetting[scopeName]
          if (status === undefined) return resolve('unprompted')
          resolve(status ? 'authorized' : 'denied')
        },
        fail() {
          resolve('denied')
        },
      })
    })
  }

  /**
   * 主动请求权限（会触发系统授权弹窗）
   * @param {string} scopeName
   * @returns {Promise<void>}
   */
  const request = (scopeName) => {
    return new Promise((resolve, reject) => {
      uni.authorize({
        scope: scopeName,
        success: () => resolve(),
        fail: () => reject(new Error('用户拒绝授权')),
      })
    })
  }

  /**
   * 确保权限已授权：
   * 1. 未询问过 -> 调用 request
   * 2. 已拒绝  -> 引导用户打开设置重新授权
   * 3. 已授权  -> 直接通过
   * @param {string} scopeName
   * @returns {Promise<void>}
   */
  const ensure = async (scopeName) => {
    const status = await check(scopeName)

    if (status === 'authorized') return

    if (status === 'unprompted') {
      await request(scopeName)
      return
    }

    // denied 情况，引导至设置页
    await new Promise((resolve, reject) => {
      uni.showModal({
        title: '提示',
        content: `当前功能需要${getName(scopeName)}，请在授权设置中开启`,
        confirmText: '去设置',
        success(modalRes) {
          if (modalRes.confirm) {
            uni.openSetting({
              success(settingRes) {
                if (settingRes.authSetting[scopeName]) return resolve()
                reject(new Error('授权失败'))
              },
              fail: () => reject(new Error('打开设置失败')),
            })
          } else {
            reject(new Error('用户取消'))
          }
        },
        fail: () => reject(new Error('弹窗调用失败')),
      })
    })
  }

  return {
    check,
    request,
    ensure,
  }
};
