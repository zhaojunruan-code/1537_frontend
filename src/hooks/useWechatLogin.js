import { getWechatMobile, wechatLogin } from '@/api/common';
/**
 * useWechatLogin 微信静默登录 Hook
 *
 * 使用示例：
 * ```js
 * import { useWechatLogin } from '@/hooks/useWechatLogin'
 *
 * const res = await useWechatLogin({ nick_name: '小明', avatar_url: '...' })
 * console.log('登录成功，token:', res.data.token)
 * ```
 *
 * useWechatMobileLogin 微信手机号登录 Hook
 * ```js
 * import { useWechatMobileLogin } from '@/hooks/useWechatLogin'
 *
 * // 在 <button open-type="getPhoneNumber"> 事件里
 * const onGetPhoneNumber = async (e) => {
 *   const { encryptedData, iv } = e.detail
 *   try {
 *     const res = await useWechatMobileLogin({ encryptedData, iv })
 *     console.log('手机号登录成功：', res)
 *   } catch (err) {
 *     console.error('登录失败', err)
 *   }
 * }
 * ```
 */
/**
 * 微信静默登录，可选传入头像和昵称
 * @param params
 */
export const useWechatLogin = (params) =>
  new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: function ({ code }) {
        wechatLogin({ ...params, code }).then((res) => {
          if (res.code === 200) {
            resolve(res);
          } else {
            reject(res);
          }
        });
      },
    });
  });

/**
 * 微信手机号登录
 * @param params  @getphonenumber 给的参数
 */
export const useWechatMobileLogin = (params) =>
  new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: function ({ code }) {
        getWechatMobile({ ...params, code }).then((res) => {
          if (res.code === 200) {
            resolve(res);
          } else {
            reject(res);
          }
        });
      },
    });
  });
